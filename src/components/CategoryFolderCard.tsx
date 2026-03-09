import { MaterialIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { memo, useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface CategoryFolderCardProps {
  id: string;
  name: string;
  linkCount: number;
  isDeletable?: boolean;
  onPress: () => void;
  onLongPress?: () => void;
}

const CategoryFolderCard: React.FC<CategoryFolderCardProps> = memo(
  ({ name, linkCount, isDeletable = true, onPress, onLongPress }) => {
    const { isDark } = useTheme();

    const handleLongPress = useCallback(async () => {
      // Trigger haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Call the onLongPress callback to show action options modal
      if (onLongPress) {
        onLongPress();
      }
    }, [onLongPress]);

    return (
      <>
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
      </>
    );
  },
);

CategoryFolderCard.displayName = "CategoryFolderCard";

export default CategoryFolderCard;
