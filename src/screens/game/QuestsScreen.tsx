import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGameStore } from "../../store/gameStore";
import { QuestType, QuestDifficulty } from "../../types";

const mockQuests = [
  {
    id: "1",
    title: "Daily Walker",
    description: "Take 8,000 steps today",
    type: QuestType.DAILY,
    difficulty: QuestDifficulty.EASY,
    requirements: [{ type: "steps" as const, amount: 8000 }],
    rewards: [{ type: "experience" as const, amount: 50 }],
    progress: 3200,
    maxProgress: 8000,
    isCompleted: false,
  },
  {
    id: "2",
    title: "Calorie Crusher",
    description: "Burn 300 calories through exercise",
    type: QuestType.DAILY,
    difficulty: QuestDifficulty.MEDIUM,
    requirements: [{ type: "calories" as const, amount: 300 }],
    rewards: [{ type: "experience" as const, amount: 75 }],
    progress: 150,
    maxProgress: 300,
    isCompleted: false,
  },
  {
    id: "3",
    title: "Weekly Warrior",
    description: "Complete 5 workouts this week",
    type: QuestType.WEEKLY,
    difficulty: QuestDifficulty.HARD,
    requirements: [{ type: "workout" as const, amount: 5 }],
    rewards: [{ type: "experience" as const, amount: 200 }],
    progress: 2,
    maxProgress: 5,
    isCompleted: false,
  },
];

export default function QuestsScreen() {
  const [selectedTab, setSelectedTab] = useState<"active" | "completed">(
    "active"
  );
  const { activeQuests, completedQuests } = useGameStore();

  const tabs = [
    { id: "active", label: "Active", count: mockQuests.length },
    { id: "completed", label: "Completed", count: 0 },
  ];

  const getDifficultyColor = (difficulty: QuestDifficulty) => {
    switch (difficulty) {
      case QuestDifficulty.EASY:
        return "#10b981";
      case QuestDifficulty.MEDIUM:
        return "#f59e0b";
      case QuestDifficulty.HARD:
        return "#ef4444";
      case QuestDifficulty.EXTREME:
        return "#8b5cf6";
      default:
        return "#6b7280";
    }
  };

  const getTypeIcon = (type: QuestType) => {
    switch (type) {
      case QuestType.DAILY:
        return "today";
      case QuestType.WEEKLY:
        return "calendar";
      case QuestType.MONTHLY:
        return "calendar-outline";
      case QuestType.SPECIAL:
        return "star";
      case QuestType.STORY:
        return "book";
      default:
        return "list";
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quests</Text>
        <TouchableOpacity style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, selectedTab === tab.id && styles.activeTab]}
            onPress={() => setSelectedTab(tab.id as "active" | "completed")}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quest List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === "active" ? (
          <View style={styles.questList}>
            {mockQuests.map((quest) => (
              <View key={quest.id} style={styles.questCard}>
                <View style={styles.questHeader}>
                  <View style={styles.questTitleRow}>
                    <Ionicons
                      name={getTypeIcon(quest.type) as any}
                      size={20}
                      color="#3b82f6"
                    />
                    <Text style={styles.questTitle}>{quest.title}</Text>
                  </View>
                  <View
                    style={[
                      styles.difficultyBadge,
                      { backgroundColor: getDifficultyColor(quest.difficulty) },
                    ]}
                  >
                    <Text style={styles.difficultyText}>
                      {quest.difficulty.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.questDescription}>{quest.description}</Text>

                {/* Progress */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressText}>
                      Progress: {quest.progress.toLocaleString()} /{" "}
                      {quest.maxProgress.toLocaleString()}
                    </Text>
                    <Text style={styles.progressPercentage}>
                      {Math.round((quest.progress / quest.maxProgress) * 100)}%
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${
                            (quest.progress / quest.maxProgress) * 100
                          }%`,
                        },
                      ]}
                    />
                  </View>
                </View>

                {/* Rewards */}
                <View style={styles.rewardsContainer}>
                  <Text style={styles.rewardsLabel}>Rewards:</Text>
                  <View style={styles.rewardsList}>
                    {quest.rewards.map((reward, index) => (
                      <View key={index} style={styles.reward}>
                        <Ionicons name="star" size={16} color="#ffd700" />
                        <Text style={styles.rewardText}>
                          {reward.amount} {reward.type.toUpperCase()}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    quest.progress >= quest.maxProgress &&
                      styles.completeButton,
                  ]}
                >
                  <Text style={styles.actionButtonText}>
                    {quest.progress >= quest.maxProgress
                      ? "Claim Reward"
                      : "Track Progress"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="trophy" size={64} color="#6b7280" />
            <Text style={styles.emptyText}>No completed quests yet</Text>
            <Text style={styles.emptySubtext}>
              Complete your active quests to see them here!
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111827",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  refreshButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#1f2937",
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#3b82f6",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9ca3af",
  },
  activeTabText: {
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  questList: {
    padding: 16,
    gap: 16,
  },
  questCard: {
    backgroundColor: "#1f2937",
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  questHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  questTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  questTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#fff",
  },
  questDescription: {
    fontSize: 14,
    color: "#9ca3af",
    lineHeight: 20,
  },
  progressContainer: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontSize: 14,
    color: "#e5e7eb",
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#10b981",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#374151",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#10b981",
    borderRadius: 4,
  },
  rewardsContainer: {
    gap: 8,
  },
  rewardsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  rewardsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  reward: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#374151",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffd700",
  },
  actionButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  completeButton: {
    backgroundColor: "#10b981",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#9ca3af",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
  },
});
