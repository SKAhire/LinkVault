import { Category, CategoryWithCount, CategoryWithParent } from "../types";
import { getDatabase } from "./database";

// Get all categories with link counts
export const getAllCategories = async (): Promise<CategoryWithCount[]> => {
  const database = await getDatabase();
  const categories = await database.getAllAsync<CategoryWithCount>(
    `SELECT c.*, 
            COALESCE(
              (SELECT COUNT(l.id) FROM links l WHERE l.categoryId = c.id),
              0
            ) + COALESCE(
              (SELECT COUNT(l2.id) FROM links l2 
               JOIN categories sub ON l2.categoryId = sub.id 
               WHERE sub.parent_id = c.id),
              0
            ) as linkCount 
     FROM categories c 
     ORDER BY c.parent_id IS NULL DESC, c.isDeletable ASC, c.createdAt ASC`,
  );
  return categories.map((cat: any) => ({
    ...cat,
    parentId: cat.parentId ?? cat.parent_id ?? null,
    linkCount: typeof cat.linkCount === "number" ? cat.linkCount : 0,
    isDeletable: Boolean(cat.isDeletable),
  }));
};

// Get root categories
export const getRootCategories = async (): Promise<CategoryWithCount[]> => {
  const database = await getDatabase();
  const categories = await database.getAllAsync<CategoryWithCount>(
    `SELECT c.*, 
            COALESCE(
              (SELECT COUNT(l.id) FROM links l WHERE l.categoryId = c.id),
              0
            ) + COALESCE(
              (SELECT COUNT(l2.id) FROM links l2 
               JOIN categories sub ON l2.categoryId = sub.id 
               WHERE sub.parent_id = c.id),
              0
            ) as linkCount 
     FROM categories c 
     WHERE c.parent_id IS NULL
     ORDER BY c.isDeletable ASC, c.createdAt ASC`,
  );
  return categories.map((cat: any) => ({
    ...cat,
    parentId: cat.parentId ?? cat.parent_id ?? null,
    linkCount: typeof cat.linkCount === "number" ? cat.linkCount : 0,
    isDeletable: Boolean(cat.isDeletable),
  }));
};

// Get subcategories for a parent
export const getSubcategories = async (
  parentId: number,
): Promise<CategoryWithCount[]> => {
  const database = await getDatabase();
  const categories = await database.getAllAsync<CategoryWithCount>(
    `SELECT c.*, COUNT(l.id) as linkCount 
     FROM categories c 
     LEFT JOIN links l ON c.id = l.categoryId 
     WHERE c.parent_id = ?
     GROUP BY c.id 
     ORDER BY c.name ASC`,
    [parentId],
  );
  return categories.map((cat: any) => ({
    ...cat,
    parentId: cat.parentId ?? cat.parent_id ?? null,
    linkCount: typeof cat.linkCount === "number" ? cat.linkCount : 0,
    isDeletable: Boolean(cat.isDeletable),
  }));
};

// Get category by ID
export const getCategoryById = async (id: number): Promise<Category | null> => {
  const database = await getDatabase();
  const category = await database.getFirstAsync<Category>(
    "SELECT * FROM categories WHERE id = ?",
    [id],
  );
  return category || null;
};

// Get category link count
export const getCategoryLinkCount = async (id: number): Promise<number> => {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ count: number }>(
    `SELECT 
      COALESCE(
        (SELECT COUNT(*) FROM links WHERE categoryId = ?),
        0
      ) + COALESCE(
        (SELECT COUNT(l2.id) FROM links l2 
         JOIN categories sub ON l2.categoryId = sub.id 
         WHERE sub.parent_id = ?),
        0
      ) as count`,
    [id, id],
  );
  return result?.count || 0;
};

// Search categories
export const searchCategories = async (
  query: string,
): Promise<CategoryWithCount[]> => {
  const database = await getDatabase();
  const categories = await database.getAllAsync<CategoryWithCount>(
    `SELECT c.*, 
            COALESCE(
              (SELECT COUNT(l.id) FROM links l WHERE l.categoryId = c.id),
              0
            ) + COALESCE(
              (SELECT COUNT(l2.id) FROM links l2 
               JOIN categories sub ON l2.categoryId = sub.id 
               WHERE sub.parent_id = c.id),
              0
            ) as linkCount 
     FROM categories c 
     WHERE c.name LIKE ? AND c.parent_id IS NULL
     ORDER BY c.isDeletable ASC, c.createdAt ASC`,
    [`%${query}%`],
  );
  return categories.map((cat) => ({
    ...cat,
    linkCount: typeof cat.linkCount === "number" ? cat.linkCount : 0,
    isDeletable: Boolean(cat.isDeletable),
  }));
};

// Get category with parent
export const getCategoryWithParent = async (
  categoryId: number,
): Promise<CategoryWithParent | null> => {
  const database = await getDatabase();
  const category = await database.getFirstAsync<{
    id: number;
    name: string;
    parent_id: number | null;
    parent_name: string | null;
  }>(
    `SELECT c.id, c.name, c.parent_id, p.name as parent_name
     FROM categories c
     LEFT JOIN categories p ON c.parent_id = p.id
     WHERE c.id = ?`,
    [categoryId],
  );
  if (!category) return null;
  return {
    id: category.id,
    name: category.name,
    parentId: category.parent_id,
    parentName: category.parent_name,
  };
};
