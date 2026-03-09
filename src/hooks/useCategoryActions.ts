import { useRouter } from "expo-router";
import { useCallback } from "react";
import {
  createSubcategory,
  deleteCategory,
  renameCategory,
} from "../db/categoryMutations";
import { createLink, deleteLink, updateLink } from "../db/linkService";
import { CategoryWithCount, Link as LinkType } from "../types";
import { toast } from "../utils/toast";

interface UseCategoryActionsProps {
  categoryId: number;
  categoryName: string;
  loadLinks: () => Promise<void>;
  loadSubcategories: () => Promise<void>;
}

interface UseCategoryActionsReturn {
  // Link actions
  handleSaveLink: (
    url: string,
    categoryId: number,
    editingLink?: LinkType | null,
  ) => Promise<void>;
  handleDeleteLink: (link: LinkType) => Promise<void>;
  handleEditLink: (link: LinkType) => LinkType;

  // Subcategory actions
  handleSaveSubcategory: (
    name: string,
    editingSubcategory?: CategoryWithCount | null,
  ) => Promise<void>;
  handleDeleteSubcategory: (subcategory: CategoryWithCount) => Promise<void>;
  handleEditSubcategory: (subcategory: CategoryWithCount) => CategoryWithCount;
  handleSubcategoryPress: (subcategory: CategoryWithCount) => void;
}

export const useCategoryActions = ({
  categoryId,
  categoryName,
  loadLinks,
  loadSubcategories,
}: UseCategoryActionsProps): UseCategoryActionsReturn => {
  const router = useRouter();

  // Link actions
  const handleSaveLink = useCallback(
    async (
      url: string,
      categoryIdParam: number,
      editingLink: LinkType | null = null,
    ) => {
      try {
        if (editingLink) {
          await updateLink(editingLink.id, {
            url,
            categoryId: categoryIdParam,
          });
          toast.success("Link updated in " + categoryName);
        } else {
          await createLink({ url, categoryId: categoryIdParam });
          toast.success("Link added to " + categoryName);
        }
        await loadLinks();
      } catch (error) {
        console.error("Error saving link:", error);
        toast.error("Failed to save link to " + categoryName);
      }
    },
    [loadLinks, categoryName],
  );

  const handleDeleteLink = useCallback(
    async (link: LinkType) => {
      try {
        await deleteLink(link.id);
        toast.success("Link deleted from " + categoryName);
        await loadLinks();
      } catch (error) {
        console.error("Error deleting link:", error);
        toast.error("Failed to delete link from " + categoryName);
      }
    },
    [loadLinks, categoryName],
  );

  const handleEditLink = useCallback((link: LinkType): LinkType => {
    return link;
  }, []);

  // Subcategory actions
  const handleSaveSubcategory = useCallback(
    async (
      name: string,
      editingSubcategory: CategoryWithCount | null = null,
    ) => {
      try {
        if (editingSubcategory) {
          await renameCategory(editingSubcategory.id, name);
          toast.success("Subcategory renamed to '" + name + "'");
        } else {
          await createSubcategory(categoryId, name);
          toast.success("Subcategory '" + name + "' added to " + categoryName);
        }
        await loadSubcategories();
      } catch (error: any) {
        console.error("Error saving subcategory:", error);
        toast.error(
          error.message || "Failed to save subcategory to " + categoryName,
        );
      }
    },
    [categoryId, loadSubcategories, categoryName],
  );

  const handleDeleteSubcategory = useCallback(
    async (subcategory: CategoryWithCount) => {
      try {
        await deleteCategory(subcategory.id);
        toast.success(
          "Subcategory '" + subcategory.name + "' deleted from " + categoryName,
        );
        await loadSubcategories();
      } catch (error: any) {
        console.error("Error deleting subcategory:", error);
        toast.error(
          error.message ||
            "Failed to delete subcategory '" + subcategory.name + "'",
        );
      }
    },
    [loadSubcategories, categoryName],
  );

  const handleEditSubcategory = useCallback(
    (subcategory: CategoryWithCount): CategoryWithCount => {
      return subcategory;
    },
    [],
  );

  const handleSubcategoryPress = useCallback(
    (subcategory: CategoryWithCount) => {
      router.push({
        pathname: "/links",
        params: {
          categoryId: subcategory.id.toString(),
          categoryName: subcategory.name,
          parentId: categoryId.toString(),
        },
      });
    },
    [router, categoryId],
  );

  return {
    handleSaveLink,
    handleDeleteLink,
    handleEditLink,
    handleSaveSubcategory,
    handleDeleteSubcategory,
    handleEditSubcategory,
    handleSubcategoryPress,
  };
};
