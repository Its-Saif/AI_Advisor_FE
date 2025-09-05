import React from "react";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { MessageCircle, Grid3X3 } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#007AFF",
        tabBarInactiveTintColor: "#667085",
        animation: "shift",
        tabBarStyle: Platform.select({
          ios: { position: "absolute" },
          default: {
            backgroundColor: "#fff",
            borderTopColor: "#E5E7EB",
            borderTopWidth: 1,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="conversation"
        options={{
          title: "Chat",
          tabBarIcon: ({ color }) => <MessageCircle color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="catalog_tab"
        options={{
          title: "Catalog",
          tabBarIcon: ({ color }) => <Grid3X3 color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}

