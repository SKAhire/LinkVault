import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LinkCard from "../components/LinkCard";
import LinkModal from "../components/LinkModal";
import SearchBar from "../components/SearchBar";
import { useTheme } from "../context/ThemeContext";
import { getAllCategories } from "../db/categoryService";
import {
  createLink,
  deleteLink,
  getLinksByCategory,
  searchLinks,
  updateLink,
} from "../db/linkService";
import { Category, Link as LinkType } from "../types";

const LinksScreen: React.FC = () => {
  const { categoryId, categoryName } = useLocalSearchParams<{
    categoryId: string;
    categoryName: string;
  }>();
  const router = useRouter();
  const { isDark } = useTheme();

  const [links, setLinks] = useState<LinkType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);

  const catId = parseInt(categoryId || "0", 10);

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

  const loadCategories = useCallback(async () => {
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadLinks();
      loadCategories();
    }, [loadLinks, loadCategories]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLinks();
    setRefreshing(false);
  }, [loadLinks]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadLinks();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, loadLinks]);

  const handleEditLink = useCallback((link: LinkType) => {
    setEditingLink(link);
    setModalVisible(true);
  }, []);

  const handleDeleteLink = useCallback(
    async (link: LinkType) => {
      try {
        await deleteLink(link.id);
        await loadLinks();
      } catch (error) {
        console.error("Error deleting link:", error);
      }
    },
    [loadLinks],
  );

  const handleSaveLink = useCallback(
    async (url: string, categoryId: number) => {
      try {
        if (editingLink) {
          await updateLink(editingLink.id, { url, categoryId });
        } else {
          await createLink({ url, categoryId });
        }
        setEditingLink(null);
        await loadLinks();
      } catch (error) {
        console.error("Error saving link:", error);
      }
    },
    [editingLink, loadLinks],
  );

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setEditingLink(null);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: LinkType }) => (
      <View className="mb-4">
        <LinkCard
          link={item}
          onEdit={() => handleEditLink(item)}
          onDelete={() => handleDeleteLink(item)}
        />
      </View>
    ),
    [handleEditLink, handleDeleteLink],
  );

  const keyExtractor = useCallback((item: LinkType) => item.id.toString(), []);

  const ListEmptyComponent = () => (
    <View className="flex-1 justify-center items-center py-10">
      <Ionicons
        name="link-outline"
        size={64}
        color={isDark ? "#6b7280" : "#9ca3af"}
      />
      <Text
        className={`mt-4 text-lg ${isDark ? "text-gray-400" : "text-gray-500"}`}
      >
        {searchQuery ? "No links found" : "No links yet"}
      </Text>
      <Text className={`mt-2 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
        {searchQuery ? "Try a different search" : "Tap + to add a link"}
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
          placeholder="Search links..."
        />
      </View> */}

      {/* Links List */}
      <FlatList
        data={links}
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

      {/* Add/Edit Link Modal */}
      <LinkModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onSave={handleSaveLink}
        categories={categories}
        initialUrl={editingLink?.url}
        initialCategoryId={editingLink?.categoryId || catId}
      />
    </View>
  );
};

export default LinksScreen;
