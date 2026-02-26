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
import CategoryItem from "../components/CategoryItem";
import CustomModal from "../components/CustomModal";
import SearchBar from "../components/SearchBar";
import { useTheme } from "../context/ThemeContext";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  searchCategories,
  updateCategory,
} from "../db/categoryService";
import { CategoryWithCount } from "../types";

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
        : await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
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
    const timeoutId = setTimeout(() => {
      loadCategories();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, loadCategories]);

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
        await loadCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    },
    [loadCategories],
  );

  const handleSaveCategory = useCallback(
    async (name: string) => {
      try {
        if (editingCategory) {
          await updateCategory(editingCategory.id, { name });
        } else {
          await createCategory({ name });
        }
        setEditingCategory(null);
        await loadCategories();
      } catch (error) {
        console.error("Error saving category:", error);
      }
    },
    [editingCategory, loadCategories],
  );

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setEditingCategory(null);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: CategoryWithCount }) => (
      <View className="mb-4">
        <CategoryItem
          category={item}
          onPress={() => handleCategoryPress(item)}
          onEdit={() => handleEditCategory(item)}
          onDelete={() => handleDeleteCategory(item)}
        />
      </View>
    ),
    [handleCategoryPress, handleEditCategory, handleDeleteCategory],
  );

  const keyExtractor = useCallback(
    (item: CategoryWithCount) => item.id.toString(),
    [],
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
        {searchQuery ? "No categories found" : "No categories yet"}
      </Text>
      <Text className={`mt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
        {searchQuery ? "Try a different search" : "Tap + to add a category"}
      </Text>
    </View>
  );

  return (
    <View className={`flex-1 ${isDark ? "bg-baseBlack" : "bg-gray-50"}`}>
      {/* Search Bar */}
      {/* <View className="px-5 py-4 pb-2">
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search categories..."
        />
      </View> */}

      {/* Categories List */}
      <FlatList
        data={categories}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ padding: 20, paddingTop: 8, flexGrow: 1 }}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#C0301E"
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full justify-center items-center shadow-lg"
        onPress={() => setModalVisible(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Add/Edit Category Modal */}
      <CustomModal
        visible={modalVisible}
        onClose={handleCloseModal}
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
