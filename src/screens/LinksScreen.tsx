import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActionSheetIOS,
  Alert,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CategoryFolderCard from "../components/CategoryFolderCard";
import CustomModal from "../components/CustomModal";
import LinkCard from "../components/LinkCard";
import LinkModal from "../components/LinkModal";
import { useTheme } from "../context/ThemeContext";
import {
  createSubcategory,
  deleteCategory,
  getAllCategories,
  getSubcategories,
  renameCategory,
} from "../db/categoryService";
import {
  createLink,
  deleteLink,
  getLinksByCategory,
  searchLinks,
  updateLink,
} from "../db/linkService";
import { Category, CategoryWithCount, Link as LinkType } from "../types";
import { toast } from "../utils/toast";

const LinksScreen: React.FC<{ prefilledUrl?: string }> = ({ prefilledUrl }) => {
  const { categoryId, categoryName, parentId } = useLocalSearchParams<{
    categoryId: string;
    categoryName: string;
    parentId?: string;
  }>();
  const router = useRouter();
  const { isDark } = useTheme();

  const [links, setLinks] = useState<LinkType[]>([]);
  const [subcategories, setSubcategories] = useState<CategoryWithCount[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [linkModalVisible, setLinkModalVisible] = useState(false);
  const [subcategoryModalVisible, setSubcategoryModalVisible] = useState(false);
  const [addOptionModalVisible, setAddOptionModalVisible] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkType | null>(null);
  const [editingSubcategory, setEditingSubcategory] =
    useState<CategoryWithCount | null>(null);

  // Determine if this category can have subcategories (only root categories)
  const canAddSubcategory =
    parentId === undefined || parentId === null || parentId === "";

  // Handle prefilled URL from share intent
  useEffect(() => {
    if (prefilledUrl) {
      console.log("[LinksScreen] Received prefilled URL:", prefilledUrl);
      setLinkModalVisible(true);
    }
  }, [prefilledUrl]);

  const catId = parseInt(categoryId || "0", 10);
  const parentCatId = parentId ? parseInt(parentId, 10) : null;

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

  useFocusEffect(
    useCallback(() => {
      loadLinks();
      loadSubcategories();
      loadCategories();
    }, [loadLinks, loadSubcategories, loadCategories]),
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadLinks();
    await loadSubcategories();
    setRefreshing(false);
  }, [loadLinks, loadSubcategories]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadLinks();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, loadLinks]);

  const handleEditLink = useCallback((link: LinkType) => {
    setEditingLink(link);
    setLinkModalVisible(true);
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
          toast.success("Link updated");
        } else {
          await createLink({ url, categoryId });
          toast.success("Link saved");
        }
        setEditingLink(null);
        await loadLinks();
      } catch (error) {
        console.error("Error saving link:", error);
        toast.error("Failed to save link");
      }
    },
    [editingLink, loadLinks],
  );

  const handleCloseLinkModal = useCallback(() => {
    setLinkModalVisible(false);
    setEditingLink(null);
  }, []);

  // Handle FAB press - show options to add link or subcategory
  const handleAddPress = useCallback(() => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [
            "Cancel",
            "Add Link",
            canAddSubcategory ? "Add Subcategory" : "",
          ],
          cancelButtonIndex: 0,
          title: "Add to " + categoryName,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            setLinkModalVisible(true);
          } else if (buttonIndex === 2 && canAddSubcategory) {
            setSubcategoryModalVisible(true);
          }
        },
      );
    } else {
      // Android - use Alert with buttons
      const buttons: Array<{
        text: string;
        style?: "cancel" | "destructive";
        onPress?: () => void;
      }> = [
        { text: "Cancel", style: "cancel" },
        { text: "Add Link", onPress: () => setLinkModalVisible(true) },
      ];

      if (canAddSubcategory) {
        buttons.push({
          text: "Add Subcategory",
          onPress: () => setSubcategoryModalVisible(true),
        });
      }

      Alert.alert("Add to " + categoryName, "Choose an option", buttons, {
        cancelable: true,
      });
    }
  }, [categoryName, canAddSubcategory]);

  // Handle saving a subcategory (both create and update)
  const handleSaveSubcategory = useCallback(
    async (name: string) => {
      try {
        if (editingSubcategory) {
          await renameCategory(editingSubcategory.id, name);
          toast.success("Subcategory renamed");
          setEditingSubcategory(null);
        } else {
          await createSubcategory(catId, name);
          toast.success("Subcategory created");
        }
        await loadSubcategories();
      } catch (error: any) {
        console.error("Error saving subcategory:", error);
        toast.error(error.message || "Failed to save subcategory");
      }
    },
    [catId, loadSubcategories, editingSubcategory],
  );

  // Handle subcategory press - navigate to its links
  const handleSubcategoryPress = useCallback(
    (subcategory: CategoryWithCount) => {
      router.push({
        pathname: "/links",
        params: {
          categoryId: subcategory.id.toString(),
          categoryName: subcategory.name,
          parentId: catId.toString(),
        },
      });
    },
    [router, catId],
  );

  // Handle edit subcategory
  const handleEditSubcategory = useCallback(
    (subcategory: CategoryWithCount) => {
      setEditingSubcategory(subcategory);
      setSubcategoryModalVisible(true);
    },
    [],
  );

  // Handle delete subcategory
  const handleDeleteSubcategory = useCallback(
    async (subcategory: CategoryWithCount) => {
      try {
        await deleteCategory(subcategory.id);
        toast.success("Subcategory deleted");
        await loadSubcategories();
      } catch (error: any) {
        console.error("Error deleting subcategory:", error);
        toast.error(error.message || "Failed to delete subcategory");
      }
    },
    [loadSubcategories],
  );

  // Combined list for rendering - subcategories first, then links
  const hasSubcategories = subcategories.length > 0;
  const hasLinks = links.length > 0;

  // Empty state - show only when both sections are empty
  const showEmptyState = !hasSubcategories && !hasLinks;

  const renderSubcategoryGrid = () => (
    <View className="px-4 mt-4">
      <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        Subcategories
      </Text>
      <View
        className="flex-row flex-wrap"
        style={{
          paddingHorizontal: 6,
          paddingTop: 12,
          justifyContent: "flex-start",
        }}
      >
        {subcategories.map((subcategory) => (
          <CategoryFolderCard
            key={subcategory.id}
            id={subcategory.id.toString()}
            name={subcategory.name}
            linkCount={subcategory.linkCount}
            isDeletable={subcategory.isDeletable}
            onPress={() => handleSubcategoryPress(subcategory)}
            onEdit={() => handleEditSubcategory(subcategory)}
            onDelete={() => handleDeleteSubcategory(subcategory)}
          />
        ))}
      </View>
    </View>
  );

  const renderLinksList = () => (
    <View className="mt-4 px-4">
      <Text className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
        Links
      </Text>
      {links.map((link) => (
        <View key={link.id} className="mb-4">
          <LinkCard
            link={link}
            onEdit={() => handleEditLink(link)}
            onDelete={() => handleDeleteLink(link)}
          />
        </View>
      ))}
    </View>
  );

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
      {/* Search Bar - Always visible at top */}
      <View className={`px-4 py-3 ${isDark ? "bg-baseBlack" : "bg-gray-50"}`}>
        <View
          className={`flex-row items-center rounded-lg px-3 py-2 ${isDark ? "bg-gray-800" : "bg-white"}`}
        >
          <Ionicons
            name="search"
            size={20}
            color={isDark ? "#6b7280" : "#9ca3af"}
          />
          <TextInput
            className={`flex-1 ml-2 ${isDark ? "text-white" : "text-gray-900"}`}
            placeholder="Search links..."
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={isDark ? "#6b7280" : "#9ca3af"}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ScrollView with Subcategories Grid and Links List */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#C0301E"
          />
        }
      >
        {/* Subcategories Section - 3 Column Grid */}
        {hasSubcategories && renderSubcategoryGrid()}

        {/* Links Section - Vertical List */}
        {hasLinks && renderLinksList()}

        {/* Empty State */}
        {showEmptyState && ListEmptyComponent()}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-primary rounded-full justify-center items-center shadow-lg"
        onPress={handleAddPress}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Add/Edit Link Modal */}
      <LinkModal
        visible={linkModalVisible}
        onClose={handleCloseLinkModal}
        onSave={handleSaveLink}
        categories={categories}
        initialUrl={editingLink?.url || prefilledUrl}
        initialCategoryId={editingLink?.categoryId || catId}
      />

      {/* Add/Edit Subcategory Modal */}
      <CustomModal
        visible={subcategoryModalVisible}
        onClose={() => {
          setSubcategoryModalVisible(false);
          setEditingSubcategory(null);
        }}
        title={editingSubcategory ? "Edit Subcategory" : "Add Subcategory"}
        onSave={handleSaveSubcategory}
        placeholder="Subcategory name"
        saveButtonText={editingSubcategory ? "Update" : "Create"}
        initialValue={editingSubcategory?.name || ""}
      />
    </View>
  );
};

export default LinksScreen;
