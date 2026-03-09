import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { memo, useCallback } from "react";
import {
  ActionSheetIOS,
  Alert,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

interface CategoryFolderCardProps {
  id: string;
  name: string;
  linkCount: number;
  isDeletable?: boolean;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onDeletePrevented?: () => void;
}

const CategoryFolderCard: React.FC<CategoryFolderCardProps> = memo(
  ({
    name,
    linkCount,
    isDeletable = true,
    onPress,
    onEdit,
    onDelete,
    onDeletePrevented,
  }) => {
    const { isDark } = useTheme();

    const handleLongPress = useCallback(async () => {
      // Trigger haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Build options based on deletable status
      const options: string[] = ["Cancel", "Rename"];
      let destructiveButtonIndex: number | undefined;

      if (isDeletable) {
        options.push("Delete");
        destructiveButtonIndex = 2;
      }

      // Show action sheet based on platform
      if (Platform.OS === "ios") {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options,
            destructiveButtonIndex,
            cancelButtonIndex: 0,
            title: name,
          },
          (buttonIndex) => {
            if (buttonIndex === 1) {
              // Rename
              onEdit();
            } else if (buttonIndex === 2 && isDeletable) {
              // Delete
              Alert.alert(
                "Delete Category",
                `Are you sure you want to delete "${name}"?`,
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: onDelete },
                ],
              );
            }
          },
        );
      } else {
        // Android - use Alert with buttons
        const buttons: {
          text: string;
          style?: "cancel" | "destructive";
          onPress?: () => void;
        }[] = [
          { text: "Cancel", style: "cancel" },
          { text: "Rename", onPress: onEdit },
        ];

        if (isDeletable) {
          buttons.push({
            text: "Delete",
            style: "destructive",
            onPress: () => {
              Alert.alert(
                "Delete Category",
                `Are you sure you want to delete "${name}"?`,
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: onDelete },
                ],
              );
            },
          });
        }

        Alert.alert(name, "Choose an action", buttons, { cancelable: true });
      }
    }, [name, onEdit, onDelete, isDeletable]);

    return (
      <TouchableOpacity
        className="w-[30%] mx-1 my-2 py-3 rounded-xl items-center justify-center bg-transparent"
        style={{
          minHeight: 140,
          ...(isDark
            ? {
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
              }
            : {}),
        }}
        onPress={onPress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
        delayLongPress={500}
      >
        {/* Folder Icon - Large size 56-60 */}
        <View className="mb-1">
          <MaterialIcons
            name="folder"
            size={80}
            color={isDark ? "#fbbf24" : "#f59e0b"}
          />
        </View>

        {/* Category Name - smaller and medium weight */}
        <Text
          className={`text-xs font-medium text-center mb-0.5 ${isDark ? "text-white" : "text-gray-800"}`}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {name}
        </Text>

        {/* Link Count - smaller and muted grey */}
        <Text
          className={`text-[10px] text-center ${isDark ? "text-gray-400" : "text-gray-400"}`}
        >
          {String(linkCount)} {linkCount === 1 ? "link" : "links"}
        </Text>
      </TouchableOpacity>
    );
  },
);

CategoryFolderCard.displayName = "CategoryFolderCard";

export default CategoryFolderCard;
