import { Category, CategoryInput, CategoryWithCount } from "../types";
import { getDatabase } from "./database";

export const getAllCategories = async (): Promise<CategoryWithCount[]> => {
  console.log("[CategoryService] getAllCategories called");
  const database = await getDatabase();
  console.log("[CategoryService] Got database connection");

  const categories = await database.getAllAsync<CategoryWithCount>(
    `SELECT c.*, COUNT(l.id) as linkCount 
     FROM categories c 
     LEFT JOIN links l ON c.id = l.categoryId 
     GROUP BY c.id 
     ORDER BY c.isDeletable ASC, c.createdAt ASC`,
  );

  console.log("[CategoryService] Categories query result:", categories.length);
  return categories;
};

export const getCategoryById = async (id: number): Promise<Category | null> => {
  const database = await getDatabase();

  const category = await database.getFirstAsync<Category>(
    "SELECT * FROM categories WHERE id = ?",
    [id],
  );

  return category || null;
};

export const createCategory = async (
  input: CategoryInput,
): Promise<Category> => {
  console.log("[CategoryService] createCategory called:", input.name);
  const database = await getDatabase();
  const now = new Date().toISOString();

  const result = await database.runAsync(
    "INSERT INTO categories (name, isDeletable, createdAt) VALUES (?, ?, ?)",
    [input.name, 1, now],
  );

  console.log(
    "[CategoryService] Created category with id:",
    result.lastInsertRowId,
  );
  return {
    id: result.lastInsertRowId,
    name: input.name,
    isDeletable: true,
    createdAt: now,
  };
};

export const updateCategory = async (
  id: number,
  input: CategoryInput,
): Promise<void> => {
  const database = await getDatabase();

  await database.runAsync("UPDATE categories SET name = ? WHERE id = ?", [
    input.name,
    id,
  ]);
};

export const deleteCategory = async (id: number): Promise<void> => {
  const database = await getDatabase();

  // Delete all links in this category first
  await database.runAsync("DELETE FROM links WHERE categoryId = ?", [id]);

  // Then delete the category
  await database.runAsync("DELETE FROM categories WHERE id = ?", [id]);
};

export const getCategoryLinkCount = async (id: number): Promise<number> => {
  const database = await getDatabase();

  const result = await database.getFirstAsync<{ count: number }>(
    "SELECT COUNT(*) as count FROM links WHERE categoryId = ?",
    [id],
  );

  return result?.count || 0;
};

export const searchCategories = async (
  query: string,
): Promise<CategoryWithCount[]> => {
  const database = await getDatabase();

  const categories = await database.getAllAsync<CategoryWithCount>(
    `SELECT c.*, COUNT(l.id) as linkCount 
     FROM categories c 
     LEFT JOIN links l ON c.id = l.categoryId 
     WHERE c.name LIKE ? 
     GROUP BY c.id 
     ORDER BY c.isDeletable ASC, c.createdAt ASC`,
    [`%${query}%`],
  );

  return categories;
};
