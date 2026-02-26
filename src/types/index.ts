// Category type
export interface Category {
  id: number;
  name: string;
  isDeletable: boolean;
  createdAt: string;
}

// Link type
export interface Link {
  id: number;
  url: string;
  domain: string;
  categoryId: number;
  createdAt: string;
  updatedAt: string;
}

// Category with link count
export interface CategoryWithCount extends Category {
  linkCount: number;
}

// Link input for creating/updating
export interface LinkInput {
  url: string;
  categoryId: number;
}

// Category input for creating/updating
export interface CategoryInput {
  name: string;
}

// Theme type
export type ThemeMode = "light" | "dark" | "system";

// Navigation types
export type RootTabParamList = {
  Home: undefined;
  Settings: undefined;
};

export type HomeStackParamList = {
  Categories: undefined;
  Links: { categoryId: number; categoryName: string };
};

// Button variants
export type ButtonVariant = "primary" | "secondary" | "danger";
