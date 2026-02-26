import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StatusBar, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "../global.css";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { initDatabase } from "../src/db/database";

function AppLayout() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={isDark ? "#000000" : "#f9fafb"}
      />
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: isDark ? "#000000" : "#ffffff",
          },
          headerTitleStyle: {
            color: isDark ? "#ffffff" : "#1f2937",
            fontWeight: "600",
          },
          headerTintColor: isDark ? "#ffffff" : "#1f2937",
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: isDark ? "#000000" : "#f9fafb",
          },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="links" options={{ headerShown: true }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "GeistMono-Regular": require("../assets/fonts/Geist_Mono/static/GeistMono-Regular.ttf"),
    "GeistMono-Bold": require("../assets/fonts/Geist_Mono/static/GeistMono-Bold.ttf"),
  });

  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDatabase();
        setIsDbReady(true);
      } catch (error) {
        console.error("Failed to initialize database:", error);
        setIsDbReady(true);
      }
    };

    setupDatabase();
  }, []);

  if (!fontsLoaded || !isDbReady) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-baseBlack">
        <ActivityIndicator size="large" color="#C0301E" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppLayout />
      </GestureHandlerRootView>
    </ThemeProvider>
  );
}
