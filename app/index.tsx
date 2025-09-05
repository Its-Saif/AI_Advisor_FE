import {
  Text,
  View,
  TouchableOpacity,
  Image,
  ImageBackground,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MessageCircle, Sparkles } from "lucide-react-native";
import { HomeScreenUsp } from "./Components/HomeScreenUsp";
import { StatusBar } from "expo-status-bar";

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
          backgroundColor: "#ffffff",
        }}
        resizeMode="cover"
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
            <View
              style={{
                width: 140,
                height: 140,
                backgroundColor: "#01296b",
                borderRadius: 16,
                borderWidth: 2,
                borderColor: "#E5E7EB",
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
              onPress={() => router.push("/conversation" as any)}
              style={{
                backgroundColor: "#007AFF",
                width: "90%",
                paddingVertical: 15,
                justifyContent: "center",
                alignItems: "center",
                borderRadius: 10,
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 18,
                  fontWeight: "semibold",
                }}
              >
                Get Started
              </Text>
            </TouchableOpacity>
            <Text
              style={{
                color: "#64748B",
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
