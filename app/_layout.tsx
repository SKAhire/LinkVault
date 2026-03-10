import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StatusBar, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import "../global.css";
import { DataProvider } from "../src/context/DataContext";
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

  const bgColor = isDark ? "#000000" : "#f9fafb";
  const headerColor = isDark ? "#000000" : "#ffffff";
  const textColor = isDark ? "#ffffff" : "#1f2937";

  useEffect(() => {
    if (sharedUrl) {
      console.log(
        "[AppLayout] Share intent URL received, navigating to LinksScreen:",
        sharedUrl,
      );

      router.push({
        pathname: "/links",
        params: {
          categoryId: "1",
          categoryName: "All Links",
          prefilledUrl: sharedUrl,
        },
      });

      consumeSharedUrl();
    }
  }, [sharedUrl, router, consumeSharedUrl]);

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={bgColor}
      />

      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: headerColor,
          },
          headerTitleStyle: {
            color: textColor,
            fontWeight: "600",
          },
          headerTintColor: textColor,
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: bgColor,
          },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="links" options={{ headerShown: true }} />
      </Stack>
    </View>
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
        console.error("[APP] Failed to initialize database:", error);
      } finally {
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

  return (
    <ThemeProvider>
      <ShareIntentProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <DataProvider>
            <AppLayout />
            <Toast config={toastConfig} />
          </DataProvider>
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
