import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  getAllCategories,
  getCategoryWithParent,
  getSubcategories,
} from "../db/categoryQueries";
import { getLinksByCategory, searchLinks } from "../db/linkService";
import { Category, CategoryWithCount, Link as LinkType } from "../types";

interface ParentCategoryInfo {
  parentId: number | null;
  parentName: string | null;
}

interface UseLinksDataReturn {
  links: LinkType[];
  subcategories: CategoryWithCount[];
  categories: Category[];
  parentCategoryInfo: ParentCategoryInfo;
  refreshing: boolean;
  loadLinks: () => Promise<void>;
  loadSubcategories: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadParentCategoryInfo: () => Promise<void>;
  loadAll: () => Promise<void>;
  handleRefresh: () => Promise<void>;
  setRefreshing: (value: boolean) => void;
}

export const useLinksData = (
  catId: number,
  searchQuery: string,
): UseLinksDataReturn => {
  const [links, setLinks] = useState<LinkType[]>([]);
  const [subcategories, setSubcategories] = useState<CategoryWithCount[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [parentCategoryInfo, setParentCategoryInfo] =
    useState<ParentCategoryInfo>({
      parentId: null,
      parentName: null,
    });
  const [refreshing, setRefreshing] = useState(false);

  const loadLinks = useCallback(async () => {
    try {
      const data = searchQuery.trim()
        ? await searchLinks(catId, searchQuery)
        : await getLinksByCategory(catId);
      setLinks(data);
    } catch (error) {
      console.error("Error loading links:", error);
    }
  }, [catId, searchQuery]);

  const loadSubcategories = useCallback(async () => {
    try {
      const data = await getSubcategories(catId);
      setSubcategories(data);
    } catch (error) {
      console.error("Error loading subcategories:", error);
    }
  }, [catId]);

  const loadCategories = useCallback(async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }, []);

  const loadParentCategoryInfo = useCallback(async () => {
    if (!catId) return;
    try {
      const data = await getCategoryWithParent(catId);
      if (data) {
        setParentCategoryInfo({
          parentId: data.parentId,
          parentName: data.parentName,
        });
      }
    } catch (error) {
      console.error("Error loading parent category info:", error);
    }
  }, [catId]);

  const loadAll = useCallback(async () => {
    await Promise.all([
      loadLinks(),
      loadSubcategories(),
      loadCategories(),
      loadParentCategoryInfo(),
    ]);
  }, [loadLinks, loadSubcategories, loadCategories, loadParentCategoryInfo]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLinks();
    await loadSubcategories();
    setRefreshing(false);
  }, [loadLinks, loadSubcategories]);

  // Load data on focus
  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll]),
  );

  return {
    links,
    subcategories,
    categories,
    parentCategoryInfo,
    refreshing,
    loadLinks,
    loadSubcategories,
    loadCategories,
    loadParentCategoryInfo,
    loadAll,
    handleRefresh,
    setRefreshing,
  };
};
