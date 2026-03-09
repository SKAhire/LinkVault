import { Ionicons } from "@expo/vector-icons";
import React, { ReactNode } from "react";
import {
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useTheme } from "../../context/ThemeContext";

interface AppModalProps {
  visible: boolean;
  title: string;
  description?: string;
  children?: ReactNode;
  onClose: () => void;
  actions?: ReactNode;
}

const AppModal: React.FC<AppModalProps> = ({
  visible,
  title,
  description,
  children,
  onClose,
  actions,
}) => {
  const { isDark } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View className="flex-1 bg-black/40 justify-center items-center p-4">
          <TouchableWithoutFeedback>
            <View
              className={`w-[90%] max-w-md rounded-2xl px-5 py-4 shadow-lg ${
                isDark ? "bg-neutral-900" : "bg-white"
              }`}
            >
              {/* Header */}
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1 mr-4">
                  <Text
                    className={`text-lg font-semibold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {title}
                  </Text>
                  {description && (
                    <Text
                      className={`mt-1 text-sm ${
                        isDark ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {description}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name="close"
                    size={22}
                    color={isDark ? "#6b7280" : "#6b7280"}
                  />
                </TouchableOpacity>
              </View>

              {/* Content */}
              {children && <View className="mb-4">{children}</View>}

              {/* Actions */}
              {actions && (
                <View className="flex-row justify-end gap-3 mt-1">
                  {actions}
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AppModal;
