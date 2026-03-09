import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/ThemeContext";
import AppModal from "../ui/AppModal";

interface ActionOption {
  label: string;
  icon: string;
  onPress: () => void;
  destructive?: boolean;
}

interface ActionModalProps {
  visible: boolean;
  title: string;
  options: ActionOption[];
  onCancel: () => void;
}

const ActionModal: React.FC<ActionModalProps> = ({
  visible,
  title,
  options,
  onCancel,
}) => {
  const { isDark } = useTheme();

  return (
    <AppModal
      visible={visible}
      title={title}
      onClose={onCancel}
      actions={
        <View className="w-full">
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-row items-center py-3 px-2 rounded-xl mb-2 ${
                isDark ? "bg-neutral-800" : "bg-gray-100"
              } ${option.destructive ? "bg-red-500/10" : ""}`}
              onPress={() => {
                option.onPress();
                onCancel();
              }}
            >
              <Ionicons
                name={option.icon as any}
                size={20}
                color={
                  option.destructive
                    ? "#ef4444"
                    : isDark
                      ? "#fbbf24"
                      : "#f59e0b"
                }
                style={{ marginRight: 12 }}
              />
              <Text
                className={`text-base font-medium ${
                  option.destructive
                    ? "text-red-500"
                    : isDark
                      ? "text-white"
                      : "text-gray-800"
                }`}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            className={`py-3 px-2 rounded-xl mt-2 ${
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

export default ActionModal;
