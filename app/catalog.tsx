import { Text, View, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Catalog() {
  return (
    <SafeAreaView>

   
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
      }}
    >
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Catalog Screen</Text>
      
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: 'white' }}>Go Back</Text>
      </TouchableOpacity>
    </View>
     </SafeAreaView>
  );
}