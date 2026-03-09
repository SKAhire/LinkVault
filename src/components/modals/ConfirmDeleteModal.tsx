import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import AppModal from "../ui/AppModal";

interface ConfirmDeleteModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  visible,
  title = "Delete Item",
  message,
  onConfirm,
  onCancel,
}) => {
  const { isDark } = useTheme();

  const handleConfirm = () => {
    onConfirm();
    onCancel();
  };

  return (
    <AppModal
      visible={visible}
      title={title}
      description={message}
      onClose={onCancel}
      actions={
        <>
          <TouchableOpacity
            className={`px-4 py-2.5 rounded-xl ${
              isDark ? "bg-neutral-800" : "bg-gray-100"
            }`}
            onPress={onCancel}
          >
            <Text
              className={`font-medium text-base ${
                isDark ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="px-4 py-2.5 rounded-xl bg-red-500"
            onPress={handleConfirm}
          >
            <Text className="text-white font-semibold text-base">Delete</Text>
          </TouchableOpacity>
        </>
      }
    />
  );
};

export default ConfirmDeleteModal;
