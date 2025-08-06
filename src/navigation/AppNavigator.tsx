import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { useGameStore } from "../store/gameStore";
import { RootStackParamList, MainTabParamList } from "../types";

// Screens
import AuthScreen from "../screens/auth/AuthScreen";
import MapScreen from "../screens/game/MapScreen";
import HomeScreen from "../screens/game/HomeScreen";
import CharacterScreen from "../screens/character/CharacterScreen";
import QuestsScreen from "../screens/game/QuestsScreen";
import SocialScreen from "../screens/social/SocialScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import CharacterCreationScreen from "../screens/character/CharacterCreationScreen";
import ReadyPlayerMeScreen from "../screens/character/ReadyPlayerMeScreen";

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Home") {
            iconName = focused ? "map" : "map-outline";
          } else if (route.name === "Dashboard") {
            iconName = focused ? "speedometer" : "speedometer-outline";
          } else if (route.name === "Character") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "Quests") {
            iconName = focused ? "list" : "list-outline";
          } else if (route.name === "Social") {
            iconName = focused ? "people" : "people-outline";
          } else {
            iconName = "map-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#00d4ff",
        tabBarInactiveTintColor: "#6b7280",
        tabBarStyle: {
          backgroundColor: "#0f0f23",
          borderTopColor: "rgba(255, 255, 255, 0.1)",
          borderTopWidth: 1,
          paddingBottom: 10,
          paddingTop: 10,
          height: 85,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerStyle: {
          backgroundColor: "#0f0f23",
          borderBottomColor: "rgba(255, 255, 255, 0.1)",
          borderBottomWidth: 1,
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
          color: "#00d4ff",
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={HomeScreen}
        options={{ title: "Dashboard" }}
      />
      <Tab.Screen
        name="Character"
        component={CharacterScreen}
        options={{ title: "Character" }}
      />
      <Tab.Screen
        name="Home"
        component={MapScreen}
        options={{ title: "Map" }}
      />
      <Tab.Screen
        name="Quests"
        component={QuestsScreen}
        options={{ title: "Quests" }}
      />
      <Tab.Screen
        name="Social"
        component={SocialScreen}
        options={{ title: "Guild" }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, character } = useGameStore();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: "#111827" },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : !character ? (
          <>
            <Stack.Screen
              name="CharacterCreation"
              component={CharacterCreationScreen}
            />
            <Stack.Screen
              name="ReadyPlayerMe"
              component={ReadyPlayerMeScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="ReadyPlayerMe"
              component={ReadyPlayerMeScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
