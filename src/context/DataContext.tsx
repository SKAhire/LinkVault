import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from "react";
import {
  createCategory as dbCreateCategory,
  createSubcategory as dbCreateSubcategory,
  deleteCategory as dbDeleteCategory,
  renameCategory as dbRenameCategory,
} from "../db/categoryMutations";
import {
  getAllCategories,
  getRootCategories,
  getSubcategories,
} from "../db/categoryQueries";
import {
  createLink as dbCreateLink,
  deleteLink as dbDeleteLink,
  updateLink as dbUpdateLink,
  getLinksByCategory,
  searchLinks,
} from "../db/linkService";
import { CategoryWithCount, Link as LinkType } from "../types";

// State type
interface AppState {
  categories: CategoryWithCount[];
  rootCategories: CategoryWithCount[];
  links: Record<number, LinkType[]>; // categoryId -> links
  subcategories: Record<number, CategoryWithCount[]>; // parentId -> subcategories
  isLoading: boolean;
}

// Action types
type AppAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_CATEGORIES"; payload: CategoryWithCount[] }
  | { type: "SET_ROOT_CATEGORIES"; payload: CategoryWithCount[] }
  | { type: "SET_LINKS"; payload: { categoryId: number; links: LinkType[] } }
  | { type: "ADD_LINK"; payload: { categoryId: number; link: LinkType } }
  | {
      type: "UPDATE_LINK";
      payload: {
        categoryId: number;
        linkId: number;
        url: string;
        domain: string;
      };
    }
  | { type: "DELETE_LINK"; payload: { categoryId: number; linkId: number } }
  | { type: "MOVE_LINK"; payload: { fromCategoryId: number; toCategoryId: number; linkId: number; url: string; domain: string } }
  | { type: "SET_SUBCATEGORIES";
      payload: { parentId: number; subcategories: CategoryWithCount[] };
    }
  | { type: "ADD_CATEGORY"; payload: CategoryWithCount }
  | {
      type: "ADD_SUBCATEGORY";
      payload: { parentId: number; subcategory: CategoryWithCount };
    }
  | { type: "UPDATE_CATEGORY"; payload: { id: number; name: string } }
  | { type: "DELETE_CATEGORY"; payload: number }
  | { type: "DELETE_SUBCATEGORY"; payload: { parentId: number; id: number } };

// Initial state
const initialState: AppState = {
  categories: [],
  rootCategories: [],
  links: {},
  subcategories: {},
  isLoading: true,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_CATEGORIES":
      return { ...state, categories: action.payload };
    case "SET_ROOT_CATEGORIES":
      return { ...state, rootCategories: action.payload };
    case "SET_LINKS":
      return {
        ...state,
        links: {
          ...state.links,
          [action.payload.categoryId]: action.payload.links,
        },
      };
    case "ADD_LINK":
      return {
        ...state,
        links: {
          ...state.links,
          [action.payload.categoryId]: [
            action.payload.link,
            ...(state.links[action.payload.categoryId] || []),
          ],
        },
      };
    case "UPDATE_LINK": {
      const categoryLinks = state.links[action.payload.categoryId] || [];
      return {
        ...state,
        links: {
          ...state.links,
          [action.payload.categoryId]: categoryLinks.map((link) =>
            link.id === action.payload.linkId
              ? {
                  ...link,
                  url: action.payload.url,
                  domain: action.payload.domain,
                }
              : link,
          ),
        },
      };
    }
    case "DELETE_LINK": {
      const categoryLinks = state.links[action.payload.categoryId] || [];
      return {
        ...state,
        links: {
          ...state.links,
          [action.payload.categoryId]: categoryLinks.filter(
            (link) => link.id !== action.payload.linkId,
          ),
        },
      };
    }
    case "MOVE_LINK": {
      // Remove from old category
      const oldLinks = state.links[action.payload.fromCategoryId] || [];
      const updatedLink = oldLinks.find(l => l.id === action.payload.linkId);
      if (!updatedLink) return state;
      
      const newLink = { ...updatedLink, url: action.payload.url, domain: action.payload.domain, categoryId: action.payload.toCategoryId };
      
      return {
        ...state,
        links: {
          ...state.links,
          [action.payload.fromCategoryId]: oldLinks.filter(l => l.id !== action.payload.linkId),
          [action.payload.toCategoryId]: [
            ...(state.links[action.payload.toCategoryId] || []),
            newLink,
          ],
        },
      };
    }
    case "SET_SUBCATEGORIES":
      return {
        ...state,
        subcategories: {
          ...state.subcategories,
          [action.payload.parentId]: action.payload.subcategories,
        },
      };
    case "ADD_CATEGORY":
      return {
        ...state,
        categories: [...state.categories, action.payload],
        rootCategories: [...state.rootCategories, action.payload],
      };
    case "ADD_SUBCATEGORY": {
      const existingSubs = state.subcategories[action.payload.parentId] || [];
      return {
        ...state,
        subcategories: {
          ...state.subcategories,
          [action.payload.parentId]: [
            ...existingSubs,
            action.payload.subcategory,
          ],
        },
        categories: [...state.categories, action.payload.subcategory],
      };
    }
    case "UPDATE_CATEGORY":
      return {
        ...state,
        categories: state.categories.map((cat) =>
          cat.id === action.payload.id
            ? { ...cat, name: action.payload.name }
            : cat,
        ),
        rootCategories: state.rootCategories.map((cat) =>
          cat.id === action.payload.id
            ? { ...cat, name: action.payload.name }
            : cat,
        ),
      };
    case "DELETE_CATEGORY":
      return {
        ...state,
        categories: state.categories.filter((cat) => cat.id !== action.payload),
        rootCategories: state.rootCategories.filter(
          (cat) => cat.id !== action.payload,
        ),
      };
    case "DELETE_SUBCATEGORY": {
      const existingSubs = state.subcategories[action.payload.parentId] || [];
      return {
        ...state,
        subcategories: {
          ...state.subcategories,
          [action.payload.parentId]: existingSubs.filter(
            (sub) => sub.id !== action.payload.id,
          ),
        },
        categories: state.categories.filter(
          (cat) => cat.id !== action.payload.id,
        ),
      };
    }
    default:
      return state;
  }
}

// Context type
interface DataContextType {
  state: AppState;
  // Category actions
  loadCategories: () => Promise<void>;
  loadRootCategories: () => Promise<void>;
  createCategory: (name: string) => Promise<CategoryWithCount>;
  createSubcategory: (
    parentId: number,
    name: string,
  ) => Promise<CategoryWithCount>;
  renameCategory: (id: number, name: string) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  // Link actions
  loadLinks: (categoryId: number, searchQuery?: string) => Promise<void>;
  createLink: (url: string, categoryId: number) => Promise<LinkType>;
  updateLink: (id: number, url: string, categoryId: number) => Promise<void>;
  deleteLink: (id: number, categoryId: number) => Promise<void>;
  // Subcategory actions
  loadSubcategories: (parentId: number) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider component
interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load all categories
  const loadCategories = useCallback(async () => {
    try {
      const categories = await getAllCategories();
      dispatch({ type: "SET_CATEGORIES", payload: categories });
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }, []);

  // Load root categories
  const loadRootCategories = useCallback(async () => {
    try {
      const categories = await getRootCategories();
      dispatch({ type: "SET_ROOT_CATEGORIES", payload: categories });
    } catch (error) {
      console.error("Error loading root categories:", error);
    }
  }, []);

  // Create category
  const createCategoryAction = useCallback(
    async (name: string): Promise<CategoryWithCount> => {
      const category = await dbCreateCategory({ name });
      const newCategory: CategoryWithCount = {
        ...category,
        linkCount: 0,
        parentId: null,
      };
      dispatch({ type: "ADD_CATEGORY", payload: newCategory });
      return newCategory;
    },
    [],
  );

  // Create subcategory
  const createSubcategoryAction = useCallback(
    async (parentId: number, name: string): Promise<CategoryWithCount> => {
      const subcategory = await dbCreateSubcategory(parentId, name);
      const newSubcategory: CategoryWithCount = {
        ...subcategory,
        linkCount: 0,
        parentId: parentId,
      };
      dispatch({
        type: "ADD_SUBCATEGORY",
        payload: { parentId, subcategory: newSubcategory },
      });
      return newSubcategory;
    },
    [],
  );

  // Rename category
  const renameCategoryAction = useCallback(
    async (id: number, name: string): Promise<void> => {
      await dbRenameCategory(id, name);
      dispatch({ type: "UPDATE_CATEGORY", payload: { id, name } });
    },
    [],
  );

  // Delete category
  const deleteCategoryAction = useCallback(
    async (id: number): Promise<void> => {
      await dbDeleteCategory(id);
      dispatch({ type: "DELETE_CATEGORY", payload: id });
    },
    [],
  );

  // Load links for a category
  const loadLinks = useCallback(
    async (categoryId: number, searchQuery?: string): Promise<void> => {
      try {
        const links = searchQuery?.trim()
          ? await searchLinks(categoryId, searchQuery)
          : await getLinksByCategory(categoryId);
        dispatch({ type: "SET_LINKS", payload: { categoryId, links } });
      } catch (error) {
        console.error("Error loading links:", error);
      }
    },
    [],
  );

  // Create link
  const createLinkAction = useCallback(
    async (url: string, categoryId: number): Promise<LinkType> => {
      const link = await dbCreateLink({ url, categoryId });
      dispatch({
        type: "ADD_LINK",
        payload: { categoryId, link },
      });
      return link;
    },
    [],
  );

  // Update link
  const updateLinkAction = useCallback(
    async (id: number, url: string, categoryId: number): Promise<void> => {
      // Extract domain from URL
      const domain = url.replace(/^https?:\/\//, "").split("/")[0];
      await dbUpdateLink(id, { url, categoryId });
      dispatch({
        type: "UPDATE_LINK",
        payload: { categoryId, linkId: id, url, domain },
      });
    },
    [],
  );

  // Delete link
  const deleteLinkAction = useCallback(
    async (id: number, categoryId: number): Promise<void> => {
      await dbDeleteLink(id);
      dispatch({
        type: "DELETE_LINK",
        payload: { categoryId, linkId: id },
      });
    },
    [],
  );

  // Load subcategories
  const loadSubcategories = useCallback(
    async (parentId: number): Promise<void> => {
      try {
        const subcategories = await getSubcategories(parentId);
        dispatch({
          type: "SET_SUBCATEGORIES",
          payload: { parentId, subcategories },
        });
      } catch (error) {
        console.error("Error loading subcategories:", error);
      }
    },
    [],
  );

  // Initial data load
  useEffect(() => {
    const initData = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      await Promise.all([loadCategories(), loadRootCategories()]);
      dispatch({ type: "SET_LOADING", payload: false });
    };
    initData();
  }, [loadCategories, loadRootCategories]);

  const value: DataContextType = {
    state,
    loadCategories,
    loadRootCategories,
    createCategory: createCategoryAction,
    createSubcategory: createSubcategoryAction,
    renameCategory: renameCategoryAction,
    deleteCategory: deleteCategoryAction,
    loadLinks,
    createLink: createLinkAction,
    updateLink: updateLinkAction,
    deleteLink: deleteLinkAction,
    loadSubcategories,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Custom hook to use the data context
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
