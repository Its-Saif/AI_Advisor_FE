import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowBigLeft, ArrowLeft, ShoppingCart } from "lucide-react-native";
import { router } from "expo-router";

const Header = () => {
  const insets = useSafeAreaInsets();
  const { top } = insets;
  return (
    <View
      style={{
        // height: 80,
        // flex: 1,
        width: "100%",
        backgroundColor: "#1e293b",
        paddingTop: top + 10,
        paddingBottom: 20,
        flexDirection: "row",
        // justifyContent: "space-around",
      }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          width: "10%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ArrowLeft color={"#FFD700"} size={24} />
      </TouchableOpacity>
      <View
        style={{
          width: "80%",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "white",
            fontSize: 20,
            fontWeight: "bold",
            width: "100%",
            textAlign: "center",
            flex: 1,
          }}
        >
          Advisor
        </Text>
      </View>
      <View
        style={{
          width: "10%",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ShoppingCart
          color={"#FFD700"}
          size={24}
          style={{
            padding: 10,
            marginRight: 10,
            justifyContent: "center",
            alignItems: "center",
          }}
        />
      </View>
    </View>
  );
};

const advisor = () => {
  return (
    <View style={{}}>
      <Header />
      <Text>advisor</Text>
    </View>
  );
};

export default advisor;

const styles = StyleSheet.create({});
