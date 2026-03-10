import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActionSheetIOS,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Breadcrumbs from "../components/Breadcrumbs";
import CategoryFolderCard from "../components/CategoryFolderCard";
import CustomModal from "../components/CustomModal";
import LinkCard from "../components/LinkCard";
import LinkModal from "../components/LinkModal";
import ActionModal from "../components/modals/ActionModal";
import ActionOptionsModal from "../components/modals/ActionOptionsModal";
import ConfirmDeleteModal from "../components/modals/ConfirmDeleteModal";
import { useData } from "../context/DataContext";
import { useTheme } from "../context/ThemeContext";
import { useModalState } from "../hooks/useModalState";
import { CategoryWithCount, Link as LinkType } from "../types";
import { toast } from "../utils/toast";

const LinksScreen: React.FC<{ prefilledUrl?: string }> = ({ prefilledUrl }) => {
  const { categoryId, categoryName, parentId } = useLocalSearchParams<{
    categoryId: string;
    categoryName: string;
    parentId?: string;
  }>();
  const router = useRouter();
  const { isDark } = useTheme();

  const catId = parseInt(categoryId || "0", 10);
  const parentCatId = parentId ? parseInt(parentId, 10) : null;
  const [searchQuery, setSearchQuery] = useState("");

  // Use DataContext
  const {
    state,
    loadLinks,
    createLink,
    updateLink,
    deleteLink,
    loadSubcategories,
    createSubcategory,
    deleteCategory,
    renameCategory,
  } = useData();

  // Get links and subcategories from context state
  const links = state.links[catId] || [];
  const subcategories = state.subcategories[catId] || [];
  const { categories } = state;

  const [refreshing, setRefreshing] = useState(false);

  // Determine if this category can have subcategories (only root categories)
  const canAddSubcategory =
    parentId === undefined || parentId === null || parentId === "";

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        loadLinks(catId, searchQuery),
        loadSubcategories(catId),
      ]);
    };
    loadData();
  }, [catId, loadLinks, loadSubcategories]);

  // Search debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadLinks(catId, searchQuery);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, catId, loadLinks]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      loadLinks(catId, searchQuery),
      loadSubcategories(catId),
    ]);
    setRefreshing(false);
  }, [catId, searchQuery, loadLinks, loadSubcategories]);

  // Link actions
  const handleSaveLink = useCallback(
    async (
      url: string,
      categoryIdParam: number,
      editingLink: LinkType | null = null,
    ) => {
      try {
        if (editingLink) {
          await updateLink(editingLink.id, url, categoryIdParam);
          toast.success("Link updated in " + categoryName);
          // Reload links to get updated data
          await loadLinks(catId, searchQuery);
        } else {
          await createLink(url, categoryIdParam);
          toast.success("Link added to " + categoryName);
        }
        await loadLinks(catId, searchQuery);
      } catch (error) {
        console.error("Error saving link:", error);
        toast.error("Failed to save link to " + categoryName);
      }
    },
    [categoryName, catId, searchQuery, createLink, updateLink, loadLinks],
  );

  const handleDeleteLink = useCallback(
    async (link: LinkType) => {
      try {
        await deleteLink(link.id, catId);
        toast.success("Link deleted from " + categoryName);
      } catch (error) {
        console.error("Error deleting link:", error);
        toast.error("Failed to delete link from " + categoryName);
      }
    },
    [categoryName, catId, deleteLink],
  );

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
          await createSubcategory(catId, name);
          toast.success("Subcategory '" + name + "' added to " + categoryName);
        }
        await loadSubcategories(catId);
      } catch (error: any) {
        console.error("Error saving subcategory:", error);
        toast.error(
          error.message || "Failed to save subcategory to " + categoryName,
        );
      }
    },
    [catId, categoryName, createSubcategory, renameCategory, loadSubcategories],
  );

  const handleDeleteSubcategory = useCallback(
    async (subcategory: CategoryWithCount) => {
      try {
        await deleteCategory(subcategory.id);
        toast.success(
          "Subcategory '" + subcategory.name + "' deleted from " + categoryName,
        );
        await loadSubcategories(catId);
      } catch (error: any) {
        console.error("Error deleting subcategory:", error);
        toast.error(
          error.message ||
            "Failed to delete subcategory '" + subcategory.name + "'",
        );
      }
    },
    [categoryName, catId, deleteCategory, loadSubcategories],
  );

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

  // Modal state
  const {
    linkModalVisible,
    editingLink,
    setLinkModalVisible,
    setEditingLink,
    closeLinkModal,
    subcategoryModalVisible,
    editingSubcategory,
    setSubcategoryModalVisible,
    setEditingSubcategory,
    closeSubcategoryModal,
    addOptionModalVisible,
    setAddOptionModalVisible,
    actionModalVisible,
    setActionModalVisible,
    selectedItem,
    setSelectedItem,
    closeActionModal,
    deleteModalVisible,
    setDeleteModalVisible,
    closeDeleteModal,
  } = useModalState();

  // Handle prefilled URL from share intent
  useEffect(() => {
    if (prefilledUrl) {
      console.log("[LinksScreen] Received prefilled URL:", prefilledUrl);
      setLinkModalVisible(true);
    }
  }, [prefilledUrl, setLinkModalVisible]);

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
      // Android - use ActionModal instead of Alert
      setAddOptionModalVisible(true);
    }
  }, [
    categoryName,
    canAddSubcategory,
    setLinkModalVisible,
    setSubcategoryModalVisible,
    setAddOptionModalVisible,
  ]);

  // Handle edit subcategory
  const onEditSubcategory = useCallback(
    (subcategory: CategoryWithCount) => {
      setEditingSubcategory(subcategory);
      setSubcategoryModalVisible(true);
    },
    [setEditingSubcategory, setSubcategoryModalVisible],
  );

  // Handle delete subcategory
  const onDeleteSubcategory = useCallback(
    async (subcategory: CategoryWithCount) => {
      await handleDeleteSubcategory(subcategory);
    },
    [handleDeleteSubcategory],
  );

  // Handle long press on subcategory - show action options
  const handleSubcategoryLongPress = useCallback(
    (subcategory: CategoryWithCount) => {
      setSelectedItem({ type: "subcategory", item: subcategory });
      setActionModalVisible(true);
    },
    [setSelectedItem, setActionModalVisible],
  );

  // Handle long press on link - show action options
  const handleLinkLongPress = useCallback(
    (link: LinkType) => {
      setSelectedItem({ type: "link", item: link });
      setActionModalVisible(true);
    },
    [setSelectedItem, setActionModalVisible],
  );

  // Handle edit from action modal
  const handleEditFromAction = useCallback(() => {
    if (selectedItem?.type === "subcategory") {
      setActionModalVisible(false);
      setTimeout(() => {
        onEditSubcategory(selectedItem.item as CategoryWithCount);
      }, 100);
    } else if (selectedItem?.type === "link") {
      setActionModalVisible(false);
      setTimeout(() => {
        setEditingLink(selectedItem.item as LinkType);
        setLinkModalVisible(true);
      }, 100);
    }
  }, [
    selectedItem,
    onEditSubcategory,
    setActionModalVisible,
    setEditingLink,
    setLinkModalVisible,
  ]);

  // Handle delete from action modal
  const handleDeleteFromAction = useCallback(() => {
    if (selectedItem?.type === "subcategory") {
      setActionModalVisible(false);
      setTimeout(() => {
        setDeleteModalVisible(true);
      }, 100);
    } else if (selectedItem?.type === "link") {
      setActionModalVisible(false);
      setTimeout(() => {
        setDeleteModalVisible(true);
      }, 100);
    }
  }, [selectedItem, setActionModalVisible, setDeleteModalVisible]);

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(async () => {
    if (selectedItem?.type === "subcategory") {
      await handleDeleteSubcategory(selectedItem.item as CategoryWithCount);
    } else if (selectedItem?.type === "link") {
      await handleDeleteLink(selectedItem.item as LinkType);
    }
    setDeleteModalVisible(false);
    setSelectedItem(null);
  }, [
    selectedItem,
    handleDeleteSubcategory,
    handleDeleteLink,
    setDeleteModalVisible,
    setSelectedItem,
  ]);

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
            onLongPress={() => handleSubcategoryLongPress(subcategory)}
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
            onEdit={() => {
              setEditingLink(link);
              setLinkModalVisible(true);
            }}
            onDelete={() => handleDeleteLink(link)}
            onLongPress={() => handleLinkLongPress(link)}
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

  // Get parent category info from context
  const parentCategoryInfo = {
    parentId: parentCatId,
    parentName: null, // Could be loaded if needed
  };

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

      {/* Breadcrumbs Navigation */}
      {categoryId && categoryName && (
        <Breadcrumbs
          categoryId={catId}
          categoryName={categoryName}
          parentId={parentCategoryInfo.parentId}
          parentName={parentCategoryInfo.parentName}
        />
      )}

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
        onClose={closeLinkModal}
        onSave={(url, categoryIdParam) =>
          handleSaveLink(url, categoryIdParam, editingLink)
        }
        categories={categories}
        initialUrl={editingLink?.url || prefilledUrl}
        initialCategoryId={editingLink?.categoryId || catId}
      />

      {/* Add/Edit Subcategory Modal */}
      <CustomModal
        visible={subcategoryModalVisible}
        onClose={closeSubcategoryModal}
        onSave={(name) => handleSaveSubcategory(name, editingSubcategory)}
        title={editingSubcategory ? "Edit Subcategory" : "Add Subcategory"}
        placeholder="Subcategory name"
        saveButtonText={editingSubcategory ? "Update" : "Create"}
        initialValue={editingSubcategory?.name || ""}
      />

      {/* Add Options Modal */}
      <ActionModal
        visible={addOptionModalVisible}
        title={`Add to ${categoryName}`}
        options={[
          {
            label: "Add Link",
            icon: "link",
            onPress: () => setLinkModalVisible(true),
          },
          ...(canAddSubcategory
            ? [
                {
                  label: "Add Subcategory",
                  icon: "folder-open",
                  onPress: () => setSubcategoryModalVisible(true),
                },
              ]
            : []),
        ]}
        onCancel={() => setAddOptionModalVisible(false)}
      />

      {/* Action Options Modal */}
      <ActionOptionsModal
        visible={actionModalVisible}
        title={
          selectedItem?.type === "subcategory"
            ? (selectedItem.item as CategoryWithCount).name
            : "Link"
        }
        onEdit={handleEditFromAction}
        onDelete={handleDeleteFromAction}
        onCancel={closeActionModal}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        visible={deleteModalVisible}
        title={
          selectedItem?.type === "subcategory"
            ? "Delete Subcategory"
            : "Delete Link"
        }
        message={
          selectedItem?.type === "subcategory"
            ? `Are you sure you want to delete "${(selectedItem?.item as CategoryWithCount)?.name}"? All links in this category will also be deleted.`
            : `Are you sure you want to delete this link? This action cannot be undone.`
        }
        onConfirm={handleDeleteConfirm}
        onCancel={closeDeleteModal}
      />
    </View>
  );
};

export default LinksScreen;
