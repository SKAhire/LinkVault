import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
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
import { useTheme } from "../context/ThemeContext";

import {
  createCategory,
  deleteCategory,
  getRootCategories,
  renameCategory,
  searchCategories,
} from "../db/categoryService";

import { CategoryWithCount } from "../types";
import { toast } from "../utils/toast";

const HomeScreen: React.FC = () => {
  const router = useRouter();
  const { isDark } = useTheme();

  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] =
    useState<CategoryWithCount | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const data = searchQuery.trim()
        ? await searchCategories(searchQuery)
        : await getRootCategories();

      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  }, [searchQuery]);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCategories();
    setRefreshing(false);
  }, [loadCategories]);

  useEffect(() => {
    const t = setTimeout(loadCategories, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

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
        toast.success("Category deleted");
        loadCategories();
      } catch (error: any) {
        console.error("Error deleting category:", error);
        toast.error(error.message || "Failed to delete category");
      }
    },
    [loadCategories],
  );

  const handleSaveCategory = useCallback(
    async (name: string) => {
      try {
        if (editingCategory) {
          await renameCategory(editingCategory.id, name);
          toast.success("Category renamed");
        } else {
          await createCategory({ name });
          toast.success("Category created");
        }

        setEditingCategory(null);
        loadCategories();
      } catch (error: any) {
        console.error("Error saving category:", error);
        toast.error(error.message || "Failed to save category");
      }
    },
    [editingCategory, loadCategories],
  );

  const renderItem = ({ item }: { item: CategoryWithCount }) => (
    <CategoryFolderCard
      id={item.id.toString()}
      name={item.name}
      linkCount={item.linkCount}
      isDeletable={item.isDeletable}
      onPress={() => handleCategoryPress(item)}
      onEdit={() => handleEditCategory(item)}
      onDelete={() => handleDeleteCategory(item)}
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
    </View>
  );
};

export default HomeScreen;
