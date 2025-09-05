import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="advisor"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="catalog"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
