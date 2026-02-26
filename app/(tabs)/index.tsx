import { ScrollView, StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView className="bg-black flex-1 pt-6">
      <StatusBar barStyle="light-content" backgroundColor="#030014" />

      <ScrollView
        className="flex-1 px-2"
        contentContainerStyle={{ paddingBottom: 32 }} // ensures scroll works with spacing at bottom
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-2 mb-6">
          <Text className="text-neon-orange font-geistBold text-2xl mb-1">
            Finite Life ⏳
          </Text>
          <Text className="text-neon-soft font-geist text-sm">
            Your time is limited. Make each week count.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
