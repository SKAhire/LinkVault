import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { memo, useCallback, useState } from "react";
import { Alert, Linking, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Link } from "../types";
import { shortenUrl } from "../utils/shortenUrl";
import ConfirmDeleteModal from "./modals/ConfirmDeleteModal";

interface LinkCardProps {
  link: Link;
  onEdit: () => void;
  onDelete: () => void;
  onLongPress?: () => void;
}

const LinkCard: React.FC<LinkCardProps> = memo(
  ({ link, onEdit, onDelete, onLongPress }) => {
    const { isDark } = useTheme();
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

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

    const handleLongPress = useCallback(async () => {
      // Trigger haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Call the onLongPress callback to show action options modal
      if (onLongPress) {
        onLongPress();
      }
    }, [onLongPress]);

    const handleDelete = useCallback(() => {
      setDeleteModalVisible(true);
    }, []);

    const handleDeleteConfirm = useCallback(() => {
      onDelete();
      setDeleteModalVisible(false);
    }, [onDelete]);

    const shortenedUrl = shortenUrl(link.url, 40);

    return (
      <>
        <TouchableOpacity
          onPress={handleOpenLink}
          onLongPress={handleLongPress}
          activeOpacity={0.7}
          delayLongPress={500}
          className="rounded-2xl shadow-md overflow-hidden"
        >
          <View className={`${isDark ? "bg-neutral-900" : "bg-white"}`}>
            {/* Placeholder image - Clickable to open link */}
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

            {/* Content */}
            <View className="p-4">
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
            </View>
          </View>
        </TouchableOpacity>

        {/* Delete Confirmation Modal */}
        <ConfirmDeleteModal
          visible={deleteModalVisible}
          title="Delete Link"
          message={`Are you sure you want to delete this link? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteModalVisible(false)}
        />
      </>
    );
  },
);

LinkCard.displayName = "LinkCard";

export default LinkCard;
