/* eslint-disable react/no-unescaped-entities */
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { MessageCircle, Sparkles } from "lucide-react-native";
import { HomeScreenUsp } from "./Components/HomeScreenUsp";
import { StatusBar } from "expo-status-bar";

export default function Index() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#000000" translucent={false} />
      <ImageBackground
        source={require("../assets/images/StoreBG.webp")}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image
                source={require("../assets/images/without-bg-logo_1.webp")}
                style={styles.logo}
              />
            </View>

            <View style={styles.headerContainer}>
              <Text style={styles.title}>Epik Assistant</Text>
              <Text style={styles.subtitle}>
                Your intelligent shopping assistant. Just tell us what you need,
                and we'll recommend the perfect products for you.
              </Text>
            </View>

            <View style={styles.uspContainer}>
              <HomeScreenUsp
                icon={<MessageCircle color={"#FFD700"} size={25} />}
                text={"AI personalized recommendations"}
              />
              <HomeScreenUsp
                icon={
                  <Image
                    source={require("../assets/images/without-bg-logo_1.webp")}
                    style={styles.uspIcon}
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

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => router.push("/conversation" as any)}
              style={styles.getStartedButton}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
            <Text style={styles.footerText}>
              Start your personalized shopping experience
            </Text>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  overlay: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  safeArea: {
    width: "100%",
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 30,
  },
  logoContainer: {
    width: 140,
    height: 140,
    backgroundColor: "#01296b",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  logo: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  headerContainer: {
    gap: 10,
    marginTop: 30,
    alignItems: "center",
    display: "flex",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    color: "white",
    textAlign: "center",
    fontSize: 36,
    fontWeight: "bold",
  },
  subtitle: {
    color: "white",
    width: "80%",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: "80%",
  },
  uspContainer: {
    gap: 20,
    marginTop: 30,
  },
  uspIcon: {
    width: 25,
    height: 25,
  },
  footer: {
    width: "100%",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
  },
  getStartedButton: {
    backgroundColor: "#007AFF",
    width: "90%",
    paddingVertical: 15,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "semibold",
  },
  footerText: {
    color: "#64748B",
    fontSize: 10,
    fontWeight: "semibold",
  },
});
