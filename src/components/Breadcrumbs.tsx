import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../context/ThemeContext";

interface BreadcrumbsProps {
  categoryId: number;
  categoryName: string;
  parentId: number | null;
  parentName: string | null;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  categoryId,
  categoryName,
  parentId,
  parentName,
}) => {
  const router = useRouter();
  const { isDark } = useTheme();

  // Handle home breadcrumb click - navigate to main categories screen
  const handleHomePress = () => {
    router.push("/");
  };

  // Handle parent category breadcrumb click
  const handleParentPress = () => {
    if (parentId !== null) {
      router.push({
        pathname: "/links",
        params: {
          categoryId: parentId.toString(),
          categoryName: parentName || "",
        },
      });
    }
  };

  // Determine if we have a parent (show Home > Parent > Current)
  // or just root category (show Home > Current)
  const hasParent = parentId !== null && parentName !== null;

  return (
    <View className="flex-row flex-wrap items-center px-4 pt-2 pb-1">
      {/* Home breadcrumb - always clickable */}
      <TouchableOpacity onPress={handleHomePress} activeOpacity={0.7}>
        <Text className="text-sm text-gray-500">Home</Text>
      </TouchableOpacity>

      {/* Separator */}
      <Text className="mx-2 text-gray-400">{">"}</Text>

      {/* Parent category breadcrumb - clickable if exists */}
      {hasParent ? (
        <>
          <TouchableOpacity onPress={handleParentPress} activeOpacity={0.7}>
            <Text className="text-sm text-gray-500">{parentName}</Text>
          </TouchableOpacity>

          {/* Separator */}
          <Text className="mx-2 text-gray-400">{">"}</Text>
        </>
      ) : null}

      {/* Current category - not clickable (shows as bold) */}
      <Text
        className={`text-sm font-semibold ${isDark ? "text-white" : "text-foreground"}`}
      >
        {categoryName}
      </Text>
    </View>
  );
};

export default Breadcrumbs;
