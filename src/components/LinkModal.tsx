import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Category } from "../types";
import Button from "./Button";

interface LinkModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (url: string, categoryId: number) => void;
  categories: Category[];
  initialUrl?: string;
  initialCategoryId?: number;
}

const LinkModal: React.FC<LinkModalProps> = memo(
  ({
    visible,
    onClose,
    onSave,
    categories,
    initialUrl = "",
    initialCategoryId,
  }) => {
    const { isDark } = useTheme();
    const [url, setUrl] = useState(initialUrl);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
      initialCategoryId || null,
    );
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [urlError, setUrlError] = useState("");
    const [isUrlFocused, setIsUrlFocused] = useState(false);

    useEffect(() => {
      if (visible) {
        setUrl(initialUrl);
        setSelectedCategoryId(
          initialCategoryId ||
            (categories.length > 0 ? categories[0].id : null),
        );
        setUrlError("");
      }
    }, [visible, initialUrl, initialCategoryId, categories]);

    const handleSave = useCallback(() => {
      const trimmedUrl = url.trim();
      if (!trimmedUrl) {
        setUrlError("URL is required");
        return;
      }

      // Basic URL validation
      let processedUrl = trimmedUrl;
      if (
        !trimmedUrl.startsWith("http://") &&
        !trimmedUrl.startsWith("https://")
      ) {
        processedUrl = "https://" + trimmedUrl;
      }

      if (!selectedCategoryId) {
        return;
      }

      onSave(processedUrl, selectedCategoryId);
      onClose();
    }, [url, selectedCategoryId, onSave, onClose]);

    const handleClose = useCallback(() => {
      setUrl(initialUrl);
      setSelectedCategoryId(
        initialCategoryId || (categories.length > 0 ? categories[0].id : null),
      );
      setUrlError("");
      onClose();
    }, [initialUrl, initialCategoryId, categories, onClose]);

    const selectedCategory = categories.find(
      (c) => c.id === selectedCategoryId,
    );

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
                className={`rounded-3xl p-6 max-h-min overflow-hidden ${
                  isDark ? "bg-neutral-900" : "bg-white"
                }`}
              >
                {/* Header */}
                <View className="flex-row justify-between items-center mb-4">
                  <Text
                    className={`text-md font-semibold ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {initialUrl ? "Edit Link" : "Add Link"}
                  </Text>
                  <TouchableOpacity onPress={handleClose}>
                    <Ionicons
                      name="close"
                      size={24}
                      color={isDark ? "#6b7280" : "#6b7280"}
                    />
                  </TouchableOpacity>
                </View>

                {/* URL Input */}
                <Text
                  className={`text-sm font-medium mb-2 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  URL
                </Text>
                <TextInput
                  className={`border rounded-xl px-4 py-3 text-base mb-1 ${
                    isDark
                      ? "bg-neutral-800 text-white"
                      : "bg-gray-50 text-gray-800"
                  } ${
                    urlError
                      ? "border-red-500"
                      : isUrlFocused
                        ? "border-primary"
                        : isDark
                          ? "border-neutral-700"
                          : "border-gray-200"
                  }`}
                  value={url}
                  onChangeText={(text) => {
                    setUrl(text);
                    if (urlError) setUrlError("");
                  }}
                  placeholder="https://example.com"
                  placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                  keyboardType="url"
                  onFocus={() => setIsUrlFocused(true)}
                  onBlur={() => setIsUrlFocused(false)}
                />

                {urlError ? (
                  <Text className="text-red-500 text-sm mb-4">{urlError}</Text>
                ) : (
                  <View className="h-5 mb-4" />
                )}

                {/* Category Picker */}
                <Text
                  className={`text-sm font-medium mb-2 ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Category
                </Text>
                <TouchableOpacity
                  className={`border rounded-xl px-4 py-3 flex-row justify-between items-center mb-4 ${
                    isDark
                      ? "border-neutral-700 bg-neutral-800"
                      : "border-gray-200 bg-gray-50"
                  }`}
                  onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                  <Text
                    className={`text-base ${
                      isDark ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {selectedCategory?.name || "Select category"}
                  </Text>
                  <Ionicons
                    name={showCategoryPicker ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={isDark ? "#6b7280" : "#6b7280"}
                  />
                </TouchableOpacity>

                {/* Category List */}
                {showCategoryPicker && (
                  <View
                    className={`rounded-xl mb-4 max-h-40 border ${
                      isDark
                        ? "bg-neutral-800 border-neutral-700"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <ScrollView>
                      {categories.map((category) => (
                        <TouchableOpacity
                          key={category.id}
                          className={`px-4 py-3 border-b ${
                            isDark ? "border-neutral-700" : "border-gray-200"
                          } ${
                            category.id === selectedCategoryId
                              ? "bg-primary/10"
                              : ""
                          }`}
                          onPress={() => {
                            setSelectedCategoryId(category.id);
                            setShowCategoryPicker(false);
                          }}
                        >
                          <Text
                            className={`text-base ${
                              category.id === selectedCategoryId
                                ? "text-primary font-medium"
                                : isDark
                                  ? "text-white"
                                  : "text-gray-800"
                            }`}
                          >
                            {category.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
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

                  <Button title="Save" onPress={handleSave} />
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  },
);

LinkModal.displayName = "LinkModal";

export default LinkModal;
