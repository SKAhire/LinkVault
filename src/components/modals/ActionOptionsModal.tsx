import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import AppModal from "../ui/AppModal";

interface ActionOptionsModalProps {
  visible: boolean;
  title: string;
  onEdit: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

const ActionOptionsModal: React.FC<ActionOptionsModalProps> = ({
  visible,
  title,
  onEdit,
  onDelete,
  onCancel,
}) => {
  const { isDark } = useTheme();

  const handleEdit = () => {
    onCancel();
    onEdit();
  };

  const handleDelete = () => {
    // Don't call onCancel here - let the parent handle the full flow
    // The parent will close this modal and show the delete confirmation
    onDelete();
  };

  return (
    <AppModal
      visible={visible}
      title={title}
      onClose={onCancel}
      actions={
        <View className="w-full gap-2 mt-1">
          {/* Edit Option */}
          <TouchableOpacity
            className={`flex-row items-center py-3 px-2 rounded-xl ${
              isDark ? "bg-neutral-800" : "bg-gray-100"
            }`}
            onPress={handleEdit}
          >
            <Ionicons
              name="pencil"
              size={20}
              color={isDark ? "#fbbf24" : "#f59e0b"}
              style={{ marginRight: 12 }}
            />
            <Text
              className={`text-base font-medium ${
                isDark ? "text-white" : "text-gray-800"
              }`}
            >
              Edit
            </Text>
          </TouchableOpacity>

          {/* Delete Option */}
          <TouchableOpacity
            className="flex-row items-center py-3 px-2 rounded-xl bg-red-500/10"
            onPress={handleDelete}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color="#ef4444"
              style={{ marginRight: 12 }}
            />
            <Text className="text-base font-medium text-red-500">Delete</Text>
          </TouchableOpacity>

          {/* Cancel Option */}
          <TouchableOpacity
            className={`py-3 px-2 rounded-xl mt-1 ${
              isDark ? "bg-neutral-800" : "bg-gray-100"
            }`}
            onPress={onCancel}
          >
            <Text
              className={`text-base font-medium text-center ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      }
    />
  );
};

export default ActionOptionsModal;
