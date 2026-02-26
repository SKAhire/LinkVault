import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import Button from "./Button";

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  onSave: (value: string) => void;
  initialValue?: string;
  placeholder?: string;
  saveButtonText?: string;
}

const CustomModal: React.FC<CustomModalProps> = memo(
  ({
    visible,
    onClose,
    title,
    onSave,
    initialValue = "",
    placeholder = "Enter value...",
    saveButtonText = "Save",
  }) => {
    const { isDark } = useTheme();
    const [value, setValue] = useState(initialValue);
    const [error, setError] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
      if (visible) {
        setValue(initialValue);
        setError("");
      }
    }, [visible, initialValue]);

    const handleSave = useCallback(() => {
      const trimmedValue = value.trim();
      if (!trimmedValue) {
        setError("This field is required");
        return;
      }
      onSave(trimmedValue);
      onClose();
    }, [value, onSave, onClose]);

    const handleClose = useCallback(() => {
      setValue(initialValue);
      setError("");
      onClose();
    }, [initialValue, onClose]);

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 bg-black/50 justify-center items-center p-4">
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              className="w-full max-w-md"
            >
              <View
                className={`rounded-3xl p-6 ${
                  isDark ? "bg-neutral-900" : "bg-white"
                }`}
              >
                {/* Header */}
                <View className="flex-row justify-between items-center mb-4">
                  <Text
                    className={`text-lg font-semibold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {title}
                  </Text>
                  <TouchableOpacity onPress={handleClose}>
                    <Ionicons
                      name="close"
                      size={24}
                      color={isDark ? "#6b7280" : "#6b7280"}
                    />
                  </TouchableOpacity>
                </View>

                {/* Input */}
                <TextInput
                  className={`border rounded-xl px-4 py-3 text-base mb-1 ${
                    isDark
                      ? "bg-neutral-800 text-white"
                      : "bg-gray-50 text-gray-800"
                  } ${
                    error
                      ? "border-red-500"
                      : isFocused
                        ? "border-primary"
                        : isDark
                          ? "border-neutral-700"
                          : "border-gray-200"
                  }`}
                  value={value}
                  onChangeText={(text) => {
                    setValue(text);
                    if (error) setError("");
                  }}
                  placeholder={placeholder}
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />

                {error ? (
                  <Text className="text-red-500 text-sm mb-4">{error}</Text>
                ) : (
                  <View className="h-5 mb-4" />
                )}

                {/* Buttons */}
                <View className="flex-row justify-end space-x-3">
                  <TouchableOpacity className="px-4 py-2" onPress={handleClose}>
                    <Text
                      className={
                        isDark
                          ? "text-gray-400 font-medium"
                          : "text-gray-600 font-medium"
                      }
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <Button title={saveButtonText} onPress={handleSave} />
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  },
);

CustomModal.displayName = "CustomModal";

export default CustomModal;
