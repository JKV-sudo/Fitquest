import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useGameStore } from "../../store/gameStore";
import { FitnessData } from "../../types";

export default function HomeScreen() {
  const {
    character,
    user,
    todaysFitnessData,
    activeQuests,
    updateFitnessData,
    addExperience,
  } = useGameStore();

  const [refreshing, setRefreshing] = useState(false);

  // Initialize today's fitness data
  useEffect(() => {
    if (!todaysFitnessData) {
      const today: FitnessData = {
        steps: 0,
        calories: 0,
        activeMinutes: 0,
        workouts: [],
        date: new Date(),
      };
      updateFitnessData(today);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Fetch real fitness data from health APIs
    // Simulate fetching data
    setTimeout(() => {
      const mockData: FitnessData = {
        steps: Math.floor(Math.random() * 5000) + 2000,
        calories: Math.floor(Math.random() * 300) + 100,
        activeMinutes: Math.floor(Math.random() * 60) + 15,
        workouts: [],
        date: new Date(),
      };
      updateFitnessData(mockData);
      setRefreshing(false);
    }, 1000);
  };

  if (!character || !user) {
    return null;
  }

  const experiencePercentage =
    (character.experience / character.experienceToNext) * 100;
  const healthPercentage =
    (character.stats.health / character.stats.maxHealth) * 100;
  const manaPercentage = (character.stats.mana / character.stats.maxMana) * 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Character Status Card */}
        <LinearGradient
          colors={["rgba(0, 212, 255, 0.1)", "rgba(139, 92, 246, 0.1)"]}
          style={styles.characterCard}
        >
          <View style={styles.characterHeader}>
            <View style={styles.characterInfo}>
              <Text style={styles.characterName}>{character.name}</Text>
              <Text style={styles.characterClass}>
                Level {character.level} {character.sportCategory}
              </Text>
            </View>
            <View style={styles.characterAvatar}>
              <Ionicons name="person" size={40} color="#ffd700" />
            </View>
          </View>

          {/* Stats Bars */}
          <View style={styles.statsContainer}>
            {/* Health */}
            <View style={styles.statBar}>
              <View style={styles.statHeader}>
                <Ionicons name="heart" size={16} color="#ef4444" />
                <Text style={styles.statLabel}>
                  Health: {character.stats.health}/{character.stats.maxHealth}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${healthPercentage}%`,
                      backgroundColor: "#ef4444",
                    },
                  ]}
                />
              </View>
            </View>

            {/* Mana */}
            <View style={styles.statBar}>
              <View style={styles.statHeader}>
                <Ionicons name="flash" size={16} color="#3b82f6" />
                <Text style={styles.statLabel}>
                  Mana: {character.stats.mana}/{character.stats.maxMana}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${manaPercentage}%`,
                      backgroundColor: "#3b82f6",
                    },
                  ]}
                />
              </View>
            </View>

            {/* Experience */}
            <View style={styles.statBar}>
              <View style={styles.statHeader}>
                <Ionicons name="star" size={16} color="#10b981" />
                <Text style={styles.statLabel}>
                  XP: {character.experience}/{character.experienceToNext}
                </Text>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${experiencePercentage}%`,
                      backgroundColor: "#10b981",
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Today's Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Adventure</Text>
          <View style={styles.activityGrid}>
            <View style={styles.activityCard}>
              <Ionicons name="walk" size={32} color="#3b82f6" />
              <Text style={styles.activityValue}>
                {todaysFitnessData?.steps.toLocaleString() || "0"}
              </Text>
              <Text style={styles.activityLabel}>Steps</Text>
            </View>

            <View style={styles.activityCard}>
              <Ionicons name="flame" size={32} color="#ef4444" />
              <Text style={styles.activityValue}>
                {todaysFitnessData?.calories || "0"}
              </Text>
              <Text style={styles.activityLabel}>Calories</Text>
            </View>

            <View style={styles.activityCard}>
              <Ionicons name="time" size={32} color="#10b981" />
              <Text style={styles.activityValue}>
                {todaysFitnessData?.activeMinutes || "0"}
              </Text>
              <Text style={styles.activityLabel}>Active Min</Text>
            </View>
          </View>
        </View>

        {/* Active Quests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Quests</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {activeQuests.length > 0 ? (
            activeQuests.slice(0, 3).map((quest, index) => (
              <View key={quest.id} style={styles.questCard}>
                <View style={styles.questHeader}>
                  <Text style={styles.questTitle}>{quest.title}</Text>
                  <Text style={styles.questProgress}>
                    {quest.progress}/{quest.maxProgress}
                  </Text>
                </View>
                <Text style={styles.questDescription}>{quest.description}</Text>
                <View style={styles.questProgressBar}>
                  <View
                    style={[
                      styles.questProgressFill,
                      {
                        width: `${(quest.progress / quest.maxProgress) * 100}%`,
                      },
                    ]}
                  />
                </View>
              </View>
            ))
          ) : (
            <View style={styles.noQuestsCard}>
              <Ionicons name="list" size={48} color="#6b7280" />
              <Text style={styles.noQuestsText}>No active quests</Text>
              <Text style={styles.noQuestsSubtext}>
                Complete your daily activities to unlock new adventures!
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="add" size={24} color="#3b82f6" />
              <Text style={styles.actionText}>Log Workout</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="trophy" size={24} color="#ffd700" />
              <Text style={styles.actionText}>View Achievements</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="people" size={24} color="#10b981" />
              <Text style={styles.actionText}>Guild Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard}>
              <Ionicons name="settings" size={24} color="#6b7280" />
              <Text style={styles.actionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f23",
  },
  scrollView: {
    flex: 1,
  },
  characterCard: {
    margin: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(10px)",
  },
  characterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  characterClass: {
    fontSize: 16,
    color: "#e5e7eb",
    textTransform: "capitalize",
  },
  characterAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsContainer: {
    gap: 12,
  },
  statBar: {
    gap: 4,
  },
  statHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statLabel: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "600",
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
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
  },
  seeAllText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600",
  },
  activityGrid: {
    flexDirection: "row",
    gap: 12,
  },
  activityCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  activityValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  activityLabel: {
    fontSize: 12,
    color: "#9ca3af",
  },
  questCard: {
    backgroundColor: "#1f2937",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  questHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    flex: 1,
  },
  questProgress: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "600",
  },
  questDescription: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 8,
  },
  questProgressBar: {
    height: 6,
    backgroundColor: "#374151",
    borderRadius: 3,
    overflow: "hidden",
  },
  questProgressFill: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: 3,
  },
  noQuestsCard: {
    backgroundColor: "#1f2937",
    padding: 32,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  noQuestsText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#9ca3af",
  },
  noQuestsSubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#1f2937",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    color: "#e5e7eb",
    textAlign: "center",
  },
});
