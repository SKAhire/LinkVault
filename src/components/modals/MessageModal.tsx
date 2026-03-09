import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import Button from "../Button";
import AppModal from "../ui/AppModal";

interface MessageModalProps {
  visible: boolean;
  title: string;
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

const MessageModal: React.FC<MessageModalProps> = ({
  visible,
  title,
  message,
  type = "info",
  onClose,
}) => {
  const { isDark } = useTheme();

  const getIcon = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "alert-circle";
      default:
        return "information-circle";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "#22c55e";
      case "error":
        return "#ef4444";
      default:
        return isDark ? "#fbbf24" : "#f59e0b";
    }
  };

  return (
    <AppModal
      visible={visible}
      title={title}
      onClose={onClose}
      actions={<Button title="OK" onPress={onClose} />}
    >
      <View className="flex-row items-start mt-2">
        <Ionicons
          name={getIcon() as any}
          size={24}
          color={getIconColor()}
          style={{ marginRight: 12, marginTop: 2 }}
        />
        <Text
          className={`flex-1 text-base ${
            isDark ? "text-gray-300" : "text-gray-600"
          }`}
        >
          {message}
        </Text>
      </View>
    </AppModal>
  );
};

export default MessageModal;
