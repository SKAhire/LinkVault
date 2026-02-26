import { useLocalSearchParams, useNavigation } from "expo-router";
import { useEffect } from "react";
import { useTheme } from "../src/context/ThemeContext";
import LinksScreen from "../src/screens/LinksScreen";

export default function Links() {
  const { categoryName } = useLocalSearchParams<{ categoryName?: string }>();
  const navigation = useNavigation();
  const { isDark } = useTheme();

  useEffect(() => {
    if (categoryName) {
      navigation.setOptions({
        title: categoryName,
        headerStyle: {
          backgroundColor: isDark ? "#000000" : "#ffffff",
        },
        headerTitleStyle: {
          color: isDark ? "#ffffff" : "#1f2937",
          fontWeight: "600",
        },
        headerTintColor: isDark ? "#ffffff" : "#1f2937",
        headerShadowVisible: false,
      });
    }
  }, [categoryName, navigation, isDark]);

  return <LinksScreen />;
}
