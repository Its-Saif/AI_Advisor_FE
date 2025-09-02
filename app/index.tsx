import { Text, View, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { ImageBackground } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { withDecay } from "react-native-reanimated";
import { MessageCircle, Sparkles } from "lucide-react-native";
import { HomeScreenUsp } from "./Components/HomeScreenUsp";
import { StatusBar } from "expo-status-bar";
import { BlurView } from "expo-blur";

export default function Index() {
  return (
    <View
      style={{
        height: "100%",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <StatusBar style="light" backgroundColor="#000000" translucent={false} />
      <ImageBackground
        source={require("../assets/images/StoreBG.webp")}
        style={{
          height: "100%",
          width: "100%",
          justifyContent: "center",
          alignItems: "center",
        }}
        contentFit="cover"
      >
        <View
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        />
        <SafeAreaView style={{ width: "100%", flex: 1 }}>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              gap: 30,
            }}
          >
            {/*

            <TouchableOpacity
              onPress={() => router.push("/catalog")}
              style={{
                backgroundColor: "#007AFF",
                padding: 15,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "white" }}>Go to Catalog</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/advisor")}
              style={{
                backgroundColor: "#007AFF",
                padding: 15,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: "white" }}>Go to Advisor</Text>
            </TouchableOpacity> */}
            {/* Logo */}
            <View
              style={{
                width: 120,
                height: 120,
                backgroundColor: "#01296B",
                borderRadius: 6,
                borderWidth: 4,
                borderColor: "rgba(255, 255, 255, 0.3)",
              }}
            >
              <Image
                source={require("../assets/images/without-bg-logo_1.webp")}
                style={{ width: "100%", height: "100%", resizeMode: "contain" }}
              />
            </View>
            {/* header and subheading */}
            <View
              style={{
                gap: 10,
                marginTop: 30,
                alignItems: "center",
                display: "flex",
                justifyContent: "center",
                // width: "90%",
                padding: 20,
              }}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontSize: 36,
                  fontWeight: "bold",
                }}
              >
                Epik Assistant
              </Text>
              <Text
                style={{
                  color: "white",
                  width: "80%",
                  textAlign: "center",
                  lineHeight: 22, // Add line height for better readability
                  fontSize: 14,
                  // paddingHorizontal: 20, // Add horizontal padding to force wrapping
                  maxWidth: "80%",
                }}
              >
                Your intelligent shopping assistant. Just tell us what you need,
                and we'll recommend the perfect products for you.
              </Text>
            </View>
            {/* usps */}
            <View style={{ gap: 20, marginTop: 30 }}>
              <HomeScreenUsp
                icon={<MessageCircle color={"#FFD700"} size={25} />}
                text={"AI personalized recommendations"}
              />
              <HomeScreenUsp
                icon={
                  <Image
                    source={require("../assets/images/without-bg-logo_1.webp")}
                    style={{ width: 25, height: 25 }}
                    resizeMode="contain"
                  />
                }
                text={"Browse curated product collections"}
              />
              <HomeScreenUsp
                icon={<Sparkles color={"#FFD700"} size={25} />}
                text={"Discover products tailored just for you"}
              />
            </View>
          </View>
          {/* footer button */}
          <View
            style={{
              width: "100%",
              padding: 20,
              justifyContent: "center",
              alignItems: "center",
              gap: 20,
            }}
          >
            <TouchableOpacity
              onPress={() => router.push("/advisor")}
              style={{
                backgroundColor: "#FFD700",
                width: "90%",
                paddingVertical: 15,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  color: "#01296B",
                  fontSize: 18,
                  fontWeight: "semibold",
                }}
              >
                Get Started
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                color: "white",
                fontSize: 10,
                fontWeight: "semibold",
              }}
            >
              Start your personalized shopping experience
            </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
