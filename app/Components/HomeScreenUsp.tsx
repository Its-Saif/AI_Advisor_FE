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
    <View style={styles.container}>
      <BlurView intensity={100} tint="dark" style={styles.blurView} />
      <View style={styles.contentContainer}>
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "85%",
    borderRadius: 8,
    borderWidth: 0.5,
    borderColor: "#FFD700",
    overflow: "hidden",
  },
  blurView: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "rgba(11,41,107,0.3)",
  },
  contentContainer: {
    backgroundColor: "rgba(11,41,107,0.3)",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconContainer: {
    width: "15%",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 14,
    textAlign: "center",
    width: "85%",
  },
});
