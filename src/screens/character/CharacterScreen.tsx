import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useGameStore } from "../../store/gameStore";
import AvatarDisplay from "../../components/AvatarDisplay";

export default function CharacterScreen() {
  const { character } = useGameStore();
  const navigation = useNavigation();

  if (!character) {
    return null;
  }

  const stats = [
    {
      name: "Strength",
      value: character.stats.strength,
      icon: "fitness",
      color: "#ef4444",
    },
    {
      name: "Agility",
      value: character.stats.agility,
      icon: "flash",
      color: "#10b981",
    },
    {
      name: "Endurance",
      value: character.stats.endurance,
      icon: "heart",
      color: "#f59e0b",
    },
    {
      name: "Intelligence",
      value: character.stats.intelligence,
      icon: "library",
      color: "#3b82f6",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Character Header */}
        <LinearGradient
          colors={["#1e3a8a", "#3b82f6"]}
          style={styles.headerCard}
        >
          <View style={styles.avatarContainer}>
            <AvatarDisplay
              avatarUrl={character.avatarUrl}
              size="large"
              showEditButton={true}
              onEdit={() => navigation.navigate("ReadyPlayerMe" as any)}
              style={styles.avatarDisplay}
            />
          </View>

          <Text style={styles.characterName}>{character.name}</Text>
          <Text style={styles.characterInfo}>
            Level {character.level} {character.sportCategory}
          </Text>
          <Text style={styles.experienceText}>
            {character.experience} / {character.experienceToNext} XP
          </Text>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Attributes</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <View key={stat.name} style={styles.statCard}>
                <Ionicons
                  name={stat.icon as any}
                  size={24}
                  color={stat.color}
                />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statName}>{stat.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Equipment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipment</Text>
          <View style={styles.equipmentContainer}>
            <View style={styles.equipmentSlot}>
              <Ionicons name="flash" size={32} color="#6b7280" />
              <Text style={styles.equipmentLabel}>Weapon</Text>
            </View>
            <View style={styles.equipmentSlot}>
              <Ionicons name="shield" size={32} color="#6b7280" />
              <Text style={styles.equipmentLabel}>Armor</Text>
            </View>
            <View style={styles.equipmentSlot}>
              <Ionicons name="diamond" size={32} color="#6b7280" />
              <Text style={styles.equipmentLabel}>Accessory</Text>
            </View>
          </View>
        </View>

        {/* Achievements Preview */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Achievements</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.comingSoon}>Coming Soon</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  scrollView: {
    flex: 1,
  },
  headerCard: {
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
    alignItems: "center",
  },
  avatarDisplay: {
    shadowColor: "#00d4ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  characterName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  characterInfo: {
    fontSize: 16,
    color: "#e5e7eb",
    textTransform: "capitalize",
    marginBottom: 8,
  },
  experienceText: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "600",
  },
  section: {
    margin: 16,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  seeAllText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#1f2937",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  statName: {
    fontSize: 12,
    color: "#9ca3af",
  },
  equipmentContainer: {
    flexDirection: "row",
    gap: 12,
  },
  equipmentSlot: {
    flex: 1,
    backgroundColor: "#1f2937",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
    borderWidth: 2,
    borderColor: "#374151",
    borderStyle: "dashed",
  },
  equipmentLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
  comingSoon: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    fontStyle: "italic",
    padding: 32,
  },
});
