import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { ActivityIndicator, StatusBar, View } from "react-native";
import "../global.css";

function AppStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#000000" },
        animation: "fade",
      }}
    >
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "GeistMono-Regular": require("../assets/fonts/Geist_Mono/static/GeistMono-Regular.ttf"),
    "GeistMono-Bold": require("../assets/fonts/Geist_Mono/static/GeistMono-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#FF5F1F" />
      </View>
    );
  }

  return (
    <>
      <StatusBar hidden={true} />
      <AppStack />
    </>
  );
}
