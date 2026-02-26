import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback } from "react";
import { Alert, Linking, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Link } from "../types";
import { shortenUrl } from "../utils/shortenUrl";

interface LinkCardProps {
  link: Link;
  onEdit: () => void;
  onDelete: () => void;
}

const LinkCard: React.FC<LinkCardProps> = memo(({ link, onEdit, onDelete }) => {
  const { isDark } = useTheme();

  const handleOpenLink = useCallback(async () => {
    try {
      const supported = await Linking.canOpenURL(link.url);
      if (supported) {
        await Linking.openURL(link.url);
      } else {
        Alert.alert("Error", `Cannot open URL: ${link.url}`);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to open link");
    }
  }, [link.url]);

  const handleDelete = useCallback(() => {
    Alert.alert("Delete Link", `Are you sure you want to delete this link?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onDelete },
    ]);
  }, [onDelete]);

  const shortenedUrl = shortenUrl(link.url, 40);

  return (
    <View
      className={`rounded-2xl shadow-md overflow-hidden ${
        isDark ? "bg-neutral-900" : "bg-white"
      }`}
    >
      {/* Placeholder image - Clickable to open link */}
      <TouchableOpacity onPress={handleOpenLink}>
        <View
          className={`h-32 justify-center items-center ${
            isDark ? "bg-neutral-800" : "bg-gray-200"
          }`}
        >
          <Ionicons
            name="link"
            size={40}
            color={isDark ? "#6b7280" : "#9ca3af"}
          />
        </View>
      </TouchableOpacity>

      {/* Content */}
      <View className="p-4">
        <TouchableOpacity onPress={handleOpenLink}>
          <Text
            className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
            numberOfLines={1}
          >
            {link.domain}
          </Text>
          <View className="flex-row items-center mt-1">
            <Text
              className={`text-base font-medium flex-1 ${
                isDark ? "text-white" : "text-gray-800"
              }`}
              numberOfLines={2}
            >
              {shortenedUrl}
            </Text>
            <Ionicons
              name="open-outline"
              size={16}
              color={isDark ? "#6b7280" : "#9ca3af"}
              className="ml-2"
            />
          </View>
        </TouchableOpacity>

        {/* Actions */}
        <View className="flex-row justify-end mt-3">
          <TouchableOpacity
            className="p-2"
            onPress={onEdit}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="pencil"
              size={18}
              color={isDark ? "#9ca3af" : "#6b7280"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="p-2 ml-2"
            onPress={handleDelete}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="trash-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

LinkCard.displayName = "LinkCard";

export default LinkCard;
