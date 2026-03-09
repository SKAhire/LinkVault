import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StatusBar, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import "../global.css";
import { ThemeProvider, useTheme } from "../src/context/ThemeContext";
import { initDatabase } from "../src/db/database";
import {
  ShareIntentProvider,
  useSharedLink,
} from "../src/share/ShareIntentProvider";
import { toastConfig } from "../src/utils/toast";

/**
 * Inner layout component that has access to router
 * Handles navigation when share intent URL is received
 */

function AppLayout() {
  const { isDark } = useTheme();
  const router = useRouter();
  const { sharedUrl, consumeSharedUrl } = useSharedLink();

  // Handle navigation when share intent URL is received
  useEffect(() => {
    if (sharedUrl) {
      console.log(
        "[AppLayout] Share intent URL received, navigating to LinksScreen:",
        sharedUrl,
      );

      // Navigate to LinksScreen with the prefilled URL
      router.push({
        pathname: "/links",
        params: {
          categoryId: "1", // Default category ID - can be customized
          categoryName: "All Links",
          prefilledUrl: sharedUrl,
        },
      });

      // Consume the URL so it doesn't trigger again
      consumeSharedUrl();
    }
  }, [sharedUrl, router, consumeSharedUrl]);

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
        console.log("[APP] Initializing database...");
        await initDatabase();
        console.log("[APP] Database initialized successfully!");
      } catch (error) {
        // Log the error but don't block the app — screens handle empty states.
        console.error("[APP] Failed to initialize database:", error);
      } finally {
        // Always unblock the app. If DB failed, screens will show empty state.
        setIsDbReady(true);
      }
    };

    setupDatabase();
  }, []);

  if (!fontsLoaded || !isDbReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#C0301E" />
      </View>
    );
  }

  // ThemeProvider wraps AppLayout because AppLayout calls useTheme().
  // ThemeProvider no longer blocks render (removed isLoading null return),
  // so this tree will always mount correctly.
  return (
    <ThemeProvider>
      <ShareIntentProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppLayout />
          <Toast config={toastConfig} />
        </GestureHandlerRootView>
      </ShareIntentProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
});
