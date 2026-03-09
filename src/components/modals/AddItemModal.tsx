import React, { useEffect, useState } from "react";
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
import { useTheme } from "../../context/ThemeContext";
import Button from "../Button";

interface AddItemModalProps {
  visible: boolean;
  title: string;
  placeholder?: string;
  onSubmit: (value: string) => void;
  onCancel: () => void;
  submitButtonText?: string;
}

const AddItemModal: React.FC<AddItemModalProps> = ({
  visible,
  title,
  placeholder = "Enter value...",
  onSubmit,
  onCancel,
  submitButtonText = "Save",
}) => {
  const { isDark } = useTheme();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (visible) {
      setValue("");
      setError("");
    }
  }, [visible]);

  const handleSubmit = () => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      setError("This field is required");
      return;
    }
    onSubmit(trimmedValue);
    onCancel();
  };

  const handleCancel = () => {
    setValue("");
    setError("");
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1 bg-black/40 justify-center items-center p-4">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="w-full max-w-md"
          >
            <TouchableWithoutFeedback>
              <View
                className={`w-full rounded-2xl px-5 py-4 shadow-lg ${
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
                  <TouchableOpacity onPress={handleCancel}>
                    <Text
                      className={
                        isDark
                          ? "text-gray-400 text-xl"
                          : "text-gray-500 text-xl"
                      }
                    >
                      ✕
                    </Text>
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
                  <Text className="text-red-500 text-sm mb-2">{error}</Text>
                ) : (
                  <View className="h-5 mb-2" />
                )}

                {/* Buttons */}
                <View className="flex-row justify-end gap-3 mt-1">
                  <TouchableOpacity
                    className={`px-4 py-2.5 rounded-xl ${
                      isDark ? "bg-neutral-800" : "bg-gray-100"
                    }`}
                    onPress={handleCancel}
                  >
                    <Text
                      className={`font-medium text-base ${
                        isDark ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <Button title={submitButtonText} onPress={handleSubmit} />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AddItemModal;
