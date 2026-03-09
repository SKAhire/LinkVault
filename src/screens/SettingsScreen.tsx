import { Ionicons } from "@expo/vector-icons";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Button from "../components/Button";
import MessageModal from "../components/modals/MessageModal";
import { useTheme } from "../context/ThemeContext";
import { getAllCategories } from "../db/categoryService";
import { getAllLinks } from "../db/linkService";
import { ThemeMode } from "../types";

const THEME_OPTIONS: {
  value: ThemeMode;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: "light", label: "Light", icon: "sunny" },
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "system", label: "System", icon: "phone-portrait" },
];

const SettingsScreen: React.FC = () => {
  const { theme, setTheme, isDark } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [messageModalVisible, setMessageModalVisible] = useState(false);
  const [messageModalConfig, setMessageModalConfig] = useState<{
    title: string;
    message: string;
    type: "success" | "error" | "info";
  }>({ title: "", message: "", type: "info" });

  const handleThemeChange = useCallback(
    (newTheme: ThemeMode) => {
      setTheme(newTheme);
    },
    [setTheme],
  );

  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      // Fetch all data
      const categories = await getAllCategories();
      const links = await getAllLinks();

      // Create export data
      const exportData = {
        exportedAt: new Date().toISOString(),
        categories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          createdAt: c.createdAt,
          linkCount: "linkCount" in c ? (c as any).linkCount : 0,
        })),
        links: links.map((l) => ({
          id: l.id,
          url: l.url,
          domain: l.domain,
          categoryId: l.categoryId,
          createdAt: l.createdAt,
          updatedAt: l.updatedAt,
        })),
      };

      // Convert to JSON
      const jsonString = JSON.stringify(exportData, null, 2);

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `linkvault-export-${timestamp}.json`;

      // Create file in cache directory
      const file = new File(Paths.cache, filename);
      await file.write(jsonString);

      // Share the file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, {
          mimeType: "application/json",
          dialogTitle: "Export LinkVault Data",
        });
        setMessageModalConfig({
          title: "Success",
          message: `Data exported successfully`,
          type: "success",
        });
        setMessageModalVisible(true);
      } else {
        setMessageModalConfig({
          title: "Success",
          message: `Data exported to ${filename}`,
          type: "success",
        });
        setMessageModalVisible(true);
      }
    } catch (error) {
      console.error("Export error:", error);
      setMessageModalConfig({
        title: "Error",
        message: "Failed to export data. Please try again.",
        type: "error",
      });
      setMessageModalVisible(true);
    } finally {
      setIsExporting(false);
    }
  }, []);

  return (
    <ScrollView className={`flex-1 ${isDark ? "bg-baseBlack" : "bg-gray-50"}`}>
      <View className="p-5">
        {/* Theme Section */}
        <View className="mb-8">
          <Text
            className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}
          >
            Theme
          </Text>

          {/* Segmented Control Style */}
          <View
            className={`flex-row rounded-xl p-1 ${
              isDark ? "bg-neutral-900" : "bg-gray-200"
            }`}
          >
            {THEME_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.value}
                className={`flex-1 items-center py-3 rounded-lg ${
                  theme === option.value ? "bg-primary" : ""
                }`}
                onPress={() => handleThemeChange(option.value)}
              >
                <Ionicons
                  name={option.icon}
                  size={20}
                  color={
                    theme === option.value
                      ? "#ffffff"
                      : isDark
                        ? "#9ca3af"
                        : "#6b7280"
                  }
                />
                <Text
                  className={`mt-1 text-sm font-medium ${
                    theme === option.value
                      ? "text-white"
                      : isDark
                        ? "text-gray-400"
                        : "text-gray-600"
                  }`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Export Section */}
        <View className="mb-8">
          <Text
            className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-gray-800"}`}
          >
            Data
          </Text>

          <View
            className={`rounded-2xl p-4 shadow-md ${
              isDark ? "bg-neutral-900" : "bg-white"
            }`}
          >
            <Button
              title={isExporting ? "Exporting..." : "Export Data"}
              onPress={handleExport}
              loading={isExporting}
              disabled={isExporting}
              className="w-full"
            />

            <Text
              className={`text-sm text-center mt-3 ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Export all categories and links as JSON
            </Text>
          </View>
        </View>

        {/* App Info */}
        <View className="items-center mt-8 py-6">
          <Text
            className={`text-base font-semibold ${isDark ? "text-white" : "text-gray-800"}`}
          >
            LinkVault
          </Text>
          <Text
            className={`text-sm mt-2 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            Version 1.0.0
          </Text>
          <Text
            className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}
          >
            Save and organize your links offline
          </Text>
        </View>
      </View>

      {/* Message Modal */}
      <MessageModal
        visible={messageModalVisible}
        title={messageModalConfig.title}
        message={messageModalConfig.message}
        type={messageModalConfig.type}
        onClose={() => setMessageModalVisible(false)}
      />
    </ScrollView>
  );
};

export default SettingsScreen;
