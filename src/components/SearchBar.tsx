import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = memo(
  ({ value, onChangeText, placeholder = "Search..." }) => {
    const { isDark } = useTheme();
    const [isFocused, setIsFocused] = useState(false);

    const handleClear = useCallback(() => {
      onChangeText("");
    }, [onChangeText]);

    return (
      <View
        className={`flex-row items-center rounded-full px-4 py-3 ${
          isDark ? "bg-neutral-800" : "bg-gray-100"
        } ${isFocused ? "ring-2 ring-primary ring-offset-2" : ""}`}
      >
        <Ionicons
          name="search"
          size={20}
          color={isDark ? "#6b7280" : "#9ca3af"}
          className="mr-3"
        />
        <TextInput
          className={`flex-1 text-base ${
            isDark ? "text-white" : "text-gray-800"
          }`}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={handleClear} className="ml-2">
            <Ionicons
              name="close-circle"
              size={20}
              color={isDark ? "#6b7280" : "#9ca3af"}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

SearchBar.displayName = "SearchBar";

export default SearchBar;
