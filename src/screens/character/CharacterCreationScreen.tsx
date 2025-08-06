import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useGameStore } from "../../store/gameStore";
import { Character, SportCategory, CharacterStats } from "../../types";

const sportCategories = [
  {
    type: SportCategory.BASKETBALL,
    name: "Basketball",
    description: "Explosive power and agility, perfect for interval training",
    icon: "basketball",
    color: "#f97316",
    bonusStats: { agility: 4, strength: 3, endurance: 3 },
  },
  {
    type: SportCategory.SOCCER,
    name: "Fußball",
    description: "Ausdauer und Koordination, ideal für Cardio-Training",
    icon: "football",
    color: "#22c55e",
    bonusStats: { endurance: 5, agility: 3, strength: 2 },
  },
  {
    type: SportCategory.RUNNER,
    name: "Läufer",
    description: "Ausdauer-Spezialist, perfekt für Langstrecken-Cardio",
    icon: "walk",
    color: "#3b82f6",
    bonusStats: { endurance: 6, agility: 2, intelligence: 2 },
  },
  {
    type: SportCategory.CYCLIST,
    name: "Radfahrer",
    description: "Beinpower und Ausdauer, ideal für Kraft-Ausdauer",
    icon: "bicycle",
    color: "#eab308",
    bonusStats: { endurance: 4, strength: 4, intelligence: 2 },
  },
  {
    type: SportCategory.SWIMMER,
    name: "Schwimmer",
    description: "Ganzkörper-Athlet, perfekt für ausgewogenes Training",
    icon: "water",
    color: "#06b6d4",
    bonusStats: { strength: 3, endurance: 4, agility: 3 },
  },
  {
    type: SportCategory.GYM,
    name: "Kraftsportler",
    description: "Maximale Kraft und Muskelmasse, ideal für Gewichtstraining",
    icon: "barbell",
    color: "#ef4444",
    bonusStats: { strength: 6, endurance: 2, intelligence: 2 },
  },
  {
    type: SportCategory.TENNIS,
    name: "Tennis",
    description: "Schnelligkeit und Präzision, perfekt für reaktive Bewegungen",
    icon: "tennisball",
    color: "#a855f7",
    bonusStats: { agility: 5, intelligence: 3, strength: 2 },
  },
  {
    type: SportCategory.YOGA,
    name: "Yoga",
    description: "Flexibilität und mentale Stärke, ideal für Mindfulness",
    icon: "flower",
    color: "#84cc16",
    bonusStats: { intelligence: 5, agility: 3, endurance: 2 },
  },
];

export default function CharacterCreationScreen() {
  const [characterName, setCharacterName] = useState("");
  const [selectedSport, setSelectedSport] = useState<SportCategory | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const { user, setCharacter, setLoading: setGlobalLoading } = useGameStore();

  const createCharacter = async () => {
    if (!characterName.trim()) {
      Alert.alert("Error", "Please enter a character name");
      return;
    }

    if (!selectedSport) {
      Alert.alert("Error", "Bitte wähle eine Sportkategorie aus");
      return;
    }

    if (!user) {
      Alert.alert("Error", "User not found");
      return;
    }

    setLoading(true);
    setGlobalLoading(true);

    try {
      const sportData = sportCategories.find((s) => s.type === selectedSport)!;
      const baseStats: CharacterStats = {
        health: 100,
        maxHealth: 100,
        mana: 50,
        maxMana: 50,
        strength: 10,
        agility: 10,
        endurance: 10,
        intelligence: 10,
      };

      // Apply sport bonuses
      const finalStats = {
        ...baseStats,
        ...Object.keys(sportData.bonusStats).reduce((acc, key) => {
          const statKey = key as keyof CharacterStats;
          if (
            typeof baseStats[statKey] === "number" &&
            typeof sportData.bonusStats[statKey] === "number"
          ) {
            acc[statKey] =
              (baseStats[statKey] as number) +
              (sportData.bonusStats[statKey] as number);
          }
          return acc;
        }, {} as Partial<CharacterStats>),
      };

      const newCharacter: Character = {
        id: Date.now().toString(),
        userId: user.id,
        name: characterName.trim(),
        level: 1,
        experience: 0,
        experienceToNext: 100,
        sportCategory: selectedSport,
        stats: finalStats as CharacterStats,
        equipment: {
          accessories: [],
        },
        cosmetics: [],
        avatar: {
          skinTone: "#fdbcb4",
          hairStyle: "short",
          hairColor: "#8b4513",
          eyeColor: "#4b5563",
          outfit: "starter",
        },
        createdAt: new Date(),
        lastActive: new Date(),
      };

      setCharacter(newCharacter);
      Alert.alert("Success", `Welcome to FitQuest, ${characterName}!`);
    } catch (error) {
      Alert.alert("Error", "Failed to create character. Please try again.");
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#0f0f23", "#1a1a2e", "#16213e"]}
        style={styles.gradient}
      >
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Create Your Hero</Text>
              <Text style={styles.subtitle}>
                Choose your path in the world of FitQuest
              </Text>
            </View>

            {/* Character Name */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Character Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your hero's name"
                placeholderTextColor="#9ca3af"
                value={characterName}
                onChangeText={setCharacterName}
                maxLength={20}
              />
            </View>

            {/* Sport Category Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Wähle deine Sportkategorie
              </Text>
              <View style={styles.sportGrid}>
                {sportCategories.map((sportData) => (
                  <TouchableOpacity
                    key={sportData.type}
                    style={[
                      styles.sportCard,
                      selectedSport === sportData.type &&
                        styles.sportCardSelected,
                      { borderColor: sportData.color },
                    ]}
                    onPress={() => setSelectedSport(sportData.type)}
                  >
                    <View
                      style={[
                        styles.sportIcon,
                        { backgroundColor: sportData.color },
                      ]}
                    >
                      <Ionicons
                        name={sportData.icon as any}
                        size={32}
                        color="#fff"
                      />
                    </View>
                    <Text style={styles.sportName}>{sportData.name}</Text>
                    <Text style={styles.sportDescription}>
                      {sportData.description}
                    </Text>

                    {/* Bonus Stats */}
                    <View style={styles.bonusStats}>
                      {Object.entries(sportData.bonusStats).map(
                        ([stat, bonus]) => (
                          <Text key={stat} style={styles.bonusStat}>
                            +{bonus} {stat}
                          </Text>
                        )
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Ready Player Me Button */}
            <TouchableOpacity
              style={styles.rpmButton}
              onPress={() => navigation.navigate("ReadyPlayerMe" as any)}
            >
              <LinearGradient
                colors={["#8b5cf6", "#ec4899"]}
                style={styles.rpmButtonGradient}
              >
                <Ionicons name="person-add" size={24} color="#fff" />
                <Text style={styles.rpmButtonText}>Create 3D Avatar</Text>
                <Text style={styles.rpmButtonSubtext}>Ready Player Me</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Create Button */}
            <TouchableOpacity
              style={[
                styles.createButton,
                (!characterName.trim() || !selectedSport || loading) &&
                  styles.createButtonDisabled,
              ]}
              onPress={createCharacter}
              disabled={!characterName.trim() || !selectedSport || loading}
            >
              <Text style={styles.createButtonText}>
                {loading ? "Creating Hero..." : "Begin Your Quest"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
    marginTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#e5e7eb",
    textAlign: "center",
    marginTop: 8,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  sportGrid: {
    gap: 12,
  },
  sportCard: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
  },
  sportCardSelected: {
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    borderColor: "#00d4ff",
    shadowColor: "#00d4ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sportIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 8,
  },
  sportName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 4,
  },
  sportDescription: {
    fontSize: 14,
    color: "#e5e7eb",
    textAlign: "center",
    marginBottom: 8,
  },
  bonusStats: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  bonusStat: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "600",
  },
  rpmButton: {
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  rpmButtonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 4,
  },
  rpmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  rpmButtonSubtext: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 12,
    fontWeight: "600",
  },
  createButton: {
    backgroundColor: "rgba(0, 212, 255, 0.8)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.3)",
    shadowColor: "#00d4ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
