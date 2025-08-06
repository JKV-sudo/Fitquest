import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGameStore } from "../../store/gameStore";

export default function SettingsScreen() {
  const { user, setUser, setCharacter } = useGameStore();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          setUser(null);
          setCharacter(null);
        },
      },
    ]);
  };

  const settingsGroups = [
    {
      title: "Account",
      items: [
        { icon: "person", label: "Profile", onPress: () => {} },
        { icon: "notifications", label: "Notifications", onPress: () => {} },
        { icon: "shield-checkmark", label: "Privacy", onPress: () => {} },
      ],
    },
    {
      title: "Game",
      items: [
        { icon: "fitness", label: "Fitness Goals", onPress: () => {} },
        { icon: "trophy", label: "Achievements", onPress: () => {} },
        { icon: "stats-chart", label: "Progress Stats", onPress: () => {} },
      ],
    },
    {
      title: "App",
      items: [
        { icon: "help-circle", label: "Help & Support", onPress: () => {} },
        { icon: "document-text", label: "Terms of Service", onPress: () => {} },
        { icon: "lock-closed", label: "Privacy Policy", onPress: () => {} },
        { icon: "information-circle", label: "About", onPress: () => {} },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={32} color="#3b82f6" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.username}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity style={styles.editProfileButton}>
            <Ionicons name="create" size={20} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        {/* Settings Groups */}
        {settingsGroups.map((group, groupIndex) => (
          <View key={group.title} style={styles.settingsGroup}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupItems}>
              {group.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.settingsItem,
                    itemIndex === group.items.length - 1 && styles.lastItem,
                  ]}
                  onPress={item.onPress}
                >
                  <View style={styles.itemLeft}>
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color="#9ca3af"
                    />
                    <Text style={styles.itemLabel}>{item.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#6b7280" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <View style={styles.settingsGroup}>
          <View style={styles.groupItems}>
            <TouchableOpacity style={styles.logoutItem} onPress={handleLogout}>
              <View style={styles.itemLeft}>
                <Ionicons name="log-out" size={20} color="#ef4444" />
                <Text style={styles.logoutLabel}>Logout</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>FitQuest v1.0.0</Text>
          <Text style={styles.versionSubtext}>Build 001</Text>
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f2937",
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  userAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: "#9ca3af",
  },
  editProfileButton: {
    padding: 8,
  },
  settingsGroup: {
    marginBottom: 24,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#e5e7eb",
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  groupItems: {
    backgroundColor: "#1f2937",
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  settingsItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#374151",
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  itemLabel: {
    fontSize: 16,
    color: "#e5e7eb",
  },
  logoutItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  logoutLabel: {
    fontSize: 16,
    color: "#ef4444",
    fontWeight: "600",
  },
  versionContainer: {
    alignItems: "center",
    paddingVertical: 24,
    paddingBottom: 40,
  },
  versionText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
  versionSubtext: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 2,
  },
});
