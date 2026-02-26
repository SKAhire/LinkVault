import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTheme } from "../../src/context/ThemeContext";

const _Layout = () => {
  const { isDark, resolvedTheme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: true,
        headerStyle: {
          backgroundColor: isDark ? "#000000" : "#ffffff",
        },
        headerTitleStyle: {
          color: isDark ? "#ffffff" : "#1f2937",
          fontWeight: "600",
          fontSize: 20,
        },
        headerShadowVisible: false,
        headerTintColor: isDark ? "#ffffff" : "#1f2937",
        tabBarStyle: {
          backgroundColor: isDark ? "#000000" : "#ffffff",
          borderTopWidth: 1,
          borderTopColor: isDark ? "#1A1A1A" : "#e5e7eb",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#C0301E",
        tabBarInactiveTintColor: isDark ? "#6b7280" : "#9ca3af",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "LinkVault",
          headerTitle: "LinkVault",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          headerTitle: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
};

export default _Layout;
