import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Text, View } from "react-native";

const icons = {
  home: "home-outline",
  events: "calendar-outline",
};

const TabIcon = ({ focused, icon, title }: any) => {
  if (focused) {
    return (
      <View className="flex-row flex-1 mt-4 justify-center items-center rounded-full overflow-hidden gap-x-1 bg-neon-orange min-h-16 min-w-[112px]">
        <Ionicons name={icon} size={24} color="#000000" />
        <Text className="text-black-soft text-base font-geistBold">
          {title}
        </Text>
      </View>
    );
  } else {
    return (
      <View className="justify-center items-center mt-4 rounded-full min-h-16">
        <Ionicons name={icon} size={24} color="#FF5F1F" />
      </View>
    );
  }
};

const _Layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarLabelStyle: {
          fontFamily: "GeistMono-Regular",
          fontSize: 12,
        },
        headerTitleStyle: {
          fontFamily: "GeistMono-Regular",
        },
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: "#1A1A1A",
          borderRadius: 50,
          marginHorizontal: 32,
          marginBottom: 30,
          height: 56,
          position: "absolute",
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "#1A1A1A",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.home} title="Home" />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Events",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={icons.events} title="Events" />
          ),
        }}
      />
    </Tabs>
  );
};

export default _Layout;
