import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { CategoryWithCount } from "../types";
import ConfirmDeleteModal from "./modals/ConfirmDeleteModal";

interface CategoryItemProps {
  category: CategoryWithCount;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const CategoryItem: React.FC<CategoryItemProps> = memo(
  ({ category, onPress, onEdit, onDelete }) => {
    const { isDark } = useTheme();
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const isEditable = category.isDeletable !== false;

    const handleDelete = useCallback(() => {
      setDeleteModalVisible(true);
    }, []);

    const handleDeleteConfirm = useCallback(() => {
      onDelete();
      setDeleteModalVisible(false);
    }, [onDelete]);

    return (
      <>
        <TouchableOpacity
          className={`flex-row items-center justify-between rounded-2xl p-4 shadow-md ${
            isDark ? "bg-neutral-900" : "bg-white"
          }`}
          onPress={onPress}
          activeOpacity={0.7}
        >
          <View className="flex-1">
            <Text
              className={`text-base font-semibold ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              {category.name}
            </Text>
            <Text
              className={`text-sm mt-1 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {String(category.linkCount)}{" "}
              {category.linkCount === 1 ? "link" : "links"}
            </Text>
          </View>

          <View className="flex-row items-center">
            {isEditable && (
              <>
                <TouchableOpacity
                  className="p-2"
                  onPress={onEdit}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="pencil"
                    size={20}
                    color={isDark ? "#9ca3af" : "#6b7280"}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  className="p-2 ml-1"
                  onPress={handleDelete}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </>
            )}

            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? "#6b7280" : "#9ca3af"}
              className="ml-2"
            />
          </View>
        </TouchableOpacity>

        {/* Delete Confirmation Modal */}
        <ConfirmDeleteModal
          visible={deleteModalVisible}
          title="Delete Category"
          message={`Are you sure you want to delete "${category.name}"? All links in this category will also be deleted.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModalVisible(false)}
        />
      </>
    );
  },
);

CategoryItem.displayName = "CategoryItem";

export default CategoryItem;
