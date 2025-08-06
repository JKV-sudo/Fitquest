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

export default function SocialScreen() {
  const [selectedTab, setSelectedTab] = useState<
    "guild" | "friends" | "leaderboard"
  >("guild");

  const tabs = [
    { id: "guild", label: "Guild", icon: "people" },
    { id: "friends", label: "Friends", icon: "person-add" },
    { id: "leaderboard", label: "Rankings", icon: "trophy" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Social</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="chatbubble" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, selectedTab === tab.id && styles.activeTab]}
            onPress={() => setSelectedTab(tab.id as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={selectedTab === tab.id ? "#fff" : "#9ca3af"}
            />
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === "guild" && (
          <View style={styles.content}>
            <View style={styles.emptyState}>
              <Ionicons name="people" size={64} color="#6b7280" />
              <Text style={styles.emptyText}>No Guild Yet</Text>
              <Text style={styles.emptySubtext}>
                Join or create a guild to team up with other fitness
                adventurers!
              </Text>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Find Guild</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {selectedTab === "friends" && (
          <View style={styles.content}>
            <View style={styles.emptyState}>
              <Ionicons name="person-add" size={64} color="#6b7280" />
              <Text style={styles.emptyText}>No Friends Yet</Text>
              <Text style={styles.emptySubtext}>
                Add friends to compete and motivate each other!
              </Text>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Add Friends</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {selectedTab === "leaderboard" && (
          <View style={styles.content}>
            <View style={styles.leaderboardHeader}>
              <Text style={styles.leaderboardTitle}>Global Rankings</Text>
              <Text style={styles.leaderboardSubtitle}>This Week</Text>
            </View>

            <View style={styles.emptyState}>
              <Ionicons name="trophy" size={64} color="#6b7280" />
              <Text style={styles.emptyText}>Leaderboard Coming Soon</Text>
              <Text style={styles.emptySubtext}>
                Compete with players worldwide for the top spots!
              </Text>
            </View>
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
  headerButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#1f2937",
    borderRadius: 8,
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
  content: {
    padding: 16,
  },
  leaderboardHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  leaderboardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  leaderboardSubtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
  emptyState: {
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
    lineHeight: 20,
  },
  actionButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
