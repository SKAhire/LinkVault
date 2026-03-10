import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import CategoryFolderCard from "../components/CategoryFolderCard";
import CustomModal from "../components/CustomModal";
import ActionOptionsModal from "../components/modals/ActionOptionsModal";
import ConfirmDeleteModal from "../components/modals/ConfirmDeleteModal";
import { useData } from "../context/DataContext";
import { useTheme } from "../context/ThemeContext";

import { CategoryWithCount } from "../types";
import { toast } from "../utils/toast";

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { isDark } = useTheme();
  const {
    state,
    createCategory,
    renameCategory,
    deleteCategory,
    loadRootCategories,
  } = useData();

  const { rootCategories: categories } = state;
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryWithCount | null>(null);

  // Action options modal state
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryWithCount | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      // Load root categories from context - state is updated automatically
      await loadRootCategories();
    } catch (error) {
      console.error(error);
    }
  }, [loadRootCategories]);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  }, [loadCategories]);

  const handleCategoryPress = useCallback(
    (category: CategoryWithCount) => {
      router.push({
        pathname: "/links",
        params: {
          categoryId: category.id.toString(),
          categoryName: category.name,
        },
      });
    },
    [router],
  );

  const handleEditCategory = useCallback((category: CategoryWithCount) => {
    setEditingCategory(category);
    setModalVisible(true);
  }, []);

  const handleDeleteCategory = useCallback(
    async (category: CategoryWithCount) => {
      try {
        await deleteCategory(category.id);
        toast.success("Category '" + category.name + "' deleted");
      } catch (error: any) {
        console.error("Error deleting category:", error);
        toast.error(
          error.message || "Failed to delete category '" + category.name + "'",
        );
      }
    },
    [deleteCategory],
  );

  const handleSaveCategory = useCallback(
    async (name: string) => {
      try {
        if (editingCategory) {
          await renameCategory(editingCategory.id, name);
          toast.success("Category renamed to '" + name + "'");
        } else {
          await createCategory(name);
          toast.success("Category '" + name + "' created");
        }

        setEditingCategory(null);
      } catch (error: any) {
        console.error("Error saving category:", error);
        toast.error(error.message || "Failed to save category '" + name + "'");
      }
    },
    [editingCategory, createCategory, renameCategory],
  );

  // Handle long press on category - show action options
  const handleCategoryLongPress = useCallback((category: CategoryWithCount) => {
    setSelectedCategory(category);
    setActionModalVisible(true);
  }, []);

  // Handle edit from action modal
  const handleEditFromAction = useCallback(() => {
    if (selectedCategory) {
      setActionModalVisible(false);
      handleEditCategory(selectedCategory);
    }
  }, [selectedCategory, handleEditCategory]);

  // Handle delete from action modal
  const handleDeleteFromAction = useCallback(() => {
    if (selectedCategory) {
      setActionModalVisible(false);
      // Delay opening delete modal slightly to allow action modal to close first
      setTimeout(() => {
        setDeleteModalVisible(true);
      }, 100);
    }
  }, [selectedCategory]);

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(async () => {
    if (selectedCategory) {
      await handleDeleteCategory(selectedCategory);
    }
    setDeleteModalVisible(false);
    setSelectedCategory(null);
  }, [selectedCategory, handleDeleteCategory]);

  const renderItem = ({ item }: { item: CategoryWithCount }) => (
    <CategoryFolderCard
      id={item.id.toString()}
      name={item.name}
      linkCount={item.linkCount}
      isDeletable={item.isDeletable}
      onPress={() => handleCategoryPress(item)}
      onLongPress={() => handleCategoryLongPress(item)}
    />
  );

  const ListEmptyComponent = () => (
    <View className="flex-1 justify-center items-center py-10">
      <Ionicons
        name="folder-open-outline"
        size={64}
        color={isDark ? "#6b7280" : "#9ca3af"}
      />
      <Text
        className={`mt-4 text-lg ${isDark ? "text-gray-400" : "text-gray-500"}`}
      >
        No categories yet
      </Text>
    </View>
  );

  return (
    <View className={`flex-1 ${isDark ? "bg-baseBlack" : "bg-gray-50"}`}>
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        contentContainerStyle={{
          paddingHorizontal: 6,
          paddingTop: 12,
        }}
        columnWrapperStyle={{
          justifyContent: "flex-start",
        }}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full justify-center items-center shadow-lg"
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      <CustomModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? "Edit Category" : "Add Category"}
        onSave={handleSaveCategory}
        initialValue={editingCategory?.name || ""}
        placeholder="Category name"
        saveButtonText={editingCategory ? "Update" : "Create"}
      />

      {/* Action Options Modal */}
      <ActionOptionsModal
        visible={actionModalVisible}
        title={selectedCategory?.name || ""}
        onEdit={handleEditFromAction}
        onDelete={handleDeleteFromAction}
        onCancel={() => {
          setActionModalVisible(false);
          setSelectedCategory(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        visible={deleteModalVisible}
        title="Delete Category"
        message={`Are you sure you want to delete "${selectedCategory?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedCategory(null);
        }}
      />
    </View>
  );
};

export default HomeScreen;
