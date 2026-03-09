import { Category, CategoryInput, CategoryWithCount } from "../types";
import { getDatabase } from "./database";

export const getAllCategories = async (): Promise<CategoryWithCount[]> => {
  console.log("[CategoryService] getAllCategories called");
  try {
    const database = await getDatabase();
    console.log("[CategoryService] Got database connection");

    // Count links from the category AND its subcategories (for non-root categories)
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

    // Map parent_id from database to parentId for TypeScript
    // Ensure linkCount is always a number (default to 0 if undefined)
    const safeCategories = categories.map((cat: any) => ({
      ...cat,
      parentId: cat.parentId ?? cat.parent_id ?? null,
      linkCount: typeof cat.linkCount === "number" ? cat.linkCount : 0,
      isDeletable: Boolean(cat.isDeletable),
    }));

    console.log(
      "[CategoryService] Categories query result:",
      safeCategories.length,
    );
    return safeCategories;
  } catch (error) {
    console.error("[CategoryService] getAllCategories error:", error);
    throw error;
  }
};

// Get only root categories (no parent_id)
export const getRootCategories = async (): Promise<CategoryWithCount[]> => {
  console.log("[CategoryService] getRootCategories called");
  try {
    const database = await getDatabase();

    // Count links from the category AND its subcategories
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

    // Map parent_id from database to parentId for TypeScript
    const safeCategories = categories.map((cat: any) => ({
      ...cat,
      parentId: cat.parentId ?? cat.parent_id ?? null,
      linkCount: typeof cat.linkCount === "number" ? cat.linkCount : 0,
      isDeletable: Boolean(cat.isDeletable),
    }));

    console.log(
      "[CategoryService] Root categories query result:",
      safeCategories.length,
    );
    return safeCategories;
  } catch (error) {
    console.error("[CategoryService] getRootCategories error:", error);
    throw error;
  }
};

// Get subcategories for a specific parent category
export const getSubcategories = async (
  parentId: number,
): Promise<CategoryWithCount[]> => {
  console.log(
    "[CategoryService] getSubcategories called for parentId:",
    parentId,
  );
  try {
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

    // Map parent_id from database to parentId for TypeScript
    const safeCategories = categories.map((cat: any) => ({
      ...cat,
      parentId: cat.parentId ?? cat.parent_id ?? null,
      linkCount: typeof cat.linkCount === "number" ? cat.linkCount : 0,
      isDeletable: Boolean(cat.isDeletable),
    }));

    console.log(
      "[CategoryService] Subcategories query result:",
      safeCategories.length,
    );
    return safeCategories;
  } catch (error) {
    console.error("[CategoryService] getSubcategories error:", error);
    throw error;
  }
};

export const getCategoryById = async (id: number): Promise<Category | null> => {
  try {
    const database = await getDatabase();

    const category = await database.getFirstAsync<Category>(
      "SELECT * FROM categories WHERE id = ?",
      [id],
    );

    return category || null;
  } catch (error) {
    console.error("[CategoryService] getCategoryById error:", error);
    throw error;
  }
};

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

export const getCategoryLinkCount = async (id: number): Promise<number> => {
  try {
    const database = await getDatabase();

    // Count links from the category AND its subcategories
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
  } catch (error) {
    console.error("[CategoryService] getCategoryLinkCount error:", error);
    throw error;
  }
};

export const searchCategories = async (
  query: string,
): Promise<CategoryWithCount[]> => {
  try {
    const database = await getDatabase();

    // Count links from the category AND its subcategories
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

    // Ensure linkCount is always a number (default to 0 if undefined)
    return categories.map((cat) => ({
      ...cat,
      linkCount: typeof cat.linkCount === "number" ? cat.linkCount : 0,
      isDeletable: Boolean(cat.isDeletable),
    }));
  } catch (error) {
    console.error("[CategoryService] searchCategories error:", error);
    throw error;
  }
};
