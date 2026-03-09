import { Category, CategoryInput } from "../types";
import { getDatabase } from "./database";

/**
 * Mutation functions for category operations
 * These are write operations that modify the database
 */

// Create a new root category
export const createCategory = async (
  input: CategoryInput,
): Promise<Category> => {
  console.log("[CategoryService] createCategory called:", input.name);
  try {
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
  } catch (error) {
    console.error("[CategoryService] createCategory error:", error);
    throw error;
  }
};

// Create a subcategory under a parent category (only one level allowed)
export const createSubcategory = async (
  parentId: number,
  name: string,
): Promise<Category> => {
  console.log(
    "[CategoryService] createSubcategory called:",
    name,
    "parentId:",
    parentId,
  );
  try {
    const database = await getDatabase();

    // Check if parent category exists
    const parentCategory = await database.getFirstAsync<Category>(
      "SELECT * FROM categories WHERE id = ?",
      [parentId],
    );

    if (!parentCategory) {
      throw new Error("Parent category not found");
    }

    // Check if parent is already a subcategory (prevent two levels of nesting)
    // @ts-ignore - parentId might exist in the query result
    if (
      parentCategory.parentId !== null &&
      parentCategory.parentId !== undefined
    ) {
      throw new Error(
        "Cannot create subcategories under another subcategory. Only one level of nesting is allowed.",
      );
    }

    const now = new Date().toISOString();

    const result = await database.runAsync(
      "INSERT INTO categories (name, parent_id, isDeletable, createdAt) VALUES (?, ?, ?, ?)",
      [name, parentId, 1, now],
    );

    console.log(
      "[CategoryService] Created subcategory with id:",
      result.lastInsertRowId,
    );
    return {
      id: result.lastInsertRowId,
      name,
      parentId,
      isDeletable: true,
      createdAt: now,
    };
  } catch (error) {
    console.error("[CategoryService] createSubcategory error:", error);
    throw error;
  }
};

// Update a category's name
export const updateCategory = async (
  id: number,
  input: CategoryInput,
): Promise<void> => {
  try {
    const database = await getDatabase();

    await database.runAsync("UPDATE categories SET name = ? WHERE id = ?", [
      input.name,
      id,
    ]);
  } catch (error) {
    console.error("[CategoryService] updateCategory error:", error);
    throw error;
  }
};

// Delete a category (only if it has no links and no subcategories)
export const deleteCategory = async (id: number): Promise<void> => {
  try {
    const database = await getDatabase();

    // Get the category to check isDeletable flag
    const category = await database.getFirstAsync<{
      id: number;
      isDeletable: number;
    }>("SELECT id, isDeletable FROM categories WHERE id = ?", [id]);

    if (!category) {
      throw new Error("Category not found");
    }

    // Rule 1: Check if category is deletable
    if (!category.isDeletable) {
      throw new Error("This category cannot be deleted");
    }

    // Check for links in this category
    const linkResult = await database.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM links WHERE categoryId = ?",
      [id],
    );
    const linkCount = linkResult?.count || 0;

    // Rule 2: If category contains links, prevent deletion
    if (linkCount > 0) {
      throw new Error("Category contains links");
    }

    // Check for subcategories
    const subcatResult = await database.getFirstAsync<{ count: number }>(
      "SELECT COUNT(*) as count FROM categories WHERE parent_id = ?",
      [id],
    );
    const subcatCount = subcatResult?.count || 0;

    // Rule 3: If category contains subcategories, prevent deletion
    if (subcatCount > 0) {
      throw new Error("Category contains subcategories");
    }

    // Rule 4: Only allow deletion if empty (no links, no subcategories)
    // Delete the category
    await database.runAsync("DELETE FROM categories WHERE id = ?", [id]);
  } catch (error: any) {
    console.error("[CategoryService] deleteCategory error:", error);
    throw error;
  }
};

// Rename a category (works for both root categories and subcategories)
export const renameCategory = async (
  categoryId: number,
  newName: string,
): Promise<void> => {
  console.log("[CategoryService] renameCategory called:", categoryId, newName);
  try {
    const database = await getDatabase();

    await database.runAsync("UPDATE categories SET name = ? WHERE id = ?", [
      newName,
      categoryId,
    ]);

    console.log("[CategoryService] Category renamed successfully");
  } catch (error) {
    console.error("[CategoryService] renameCategory error:", error);
    throw error;
  }
};
