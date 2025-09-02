import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { BlurView } from "expo-blur";

export const HomeScreenUsp = ({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) => {
  return (
    <View
      style={{
        width: "85%",
        borderRadius: 8,
        borderWidth: 0.5,
        borderColor: "#FFD700",
        overflow: "hidden",
      }}
    >
      <BlurView
        intensity={100}
        tint="dark"
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          top: 0,
          left: 0,
          backgroundColor: "rgba(11,41,107,0.3)",
        }}
      />
      <View
        style={{
          backgroundColor: "rgba(11,41,107,0.3)",
          padding: 10,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View
          style={{
            width: "15%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {icon}
        </View>
        <Text
          style={{
            color: "white",
            fontSize: 14,
            textAlign: "center",
            width: "85%",
          }}
        >
          {text}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({});
