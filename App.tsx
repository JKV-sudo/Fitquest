import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { useGameStore } from "./src/store/gameStore";

export default function App() {
  const { initializeAuth } = useGameStore();

  useEffect(() => {
    // Initialize Firebase auth on app start
    initializeAuth();
  }, []);

  return (
    <>
      <AppNavigator />
      <StatusBar style="light" backgroundColor="#111827" />
    </>
  );
}
