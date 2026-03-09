/**
 * Category Service - Main Entry Point
 *
 * This file re-exports all category-related functions from separate modules
 * for backward compatibility. New code should import directly from:
 * - categoryQueries.ts (for read operations)
 * - categoryMutations.ts (for write operations)
 */

// Re-export all query functions
export {
  getAllCategories,
  getCategoryById,
  getCategoryLinkCount,
  getCategoryWithParent,
  getRootCategories,
  getSubcategories,
  searchCategories,
} from "./categoryQueries";

// Re-export all mutation functions
export {
  createCategory,
  createSubcategory,
  deleteCategory,
  renameCategory,
  updateCategory,
} from "./categoryMutations";
