import React from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

interface AvatarDisplayProps {
  avatarUrl?: string;
  style?: any;
  size?: "small" | "medium" | "large";
  onEdit?: () => void;
  showEditButton?: boolean;
}

export default function AvatarDisplay({
  avatarUrl,
  style,
  size = "medium",
  onEdit,
  showEditButton = false,
}: AvatarDisplayProps) {
  const getSize = () => {
    switch (size) {
      case "small":
        return { width: 80, height: 80 };
      case "medium":
        return { width: 120, height: 120 };
      case "large":
        return { width: 200, height: 200 };
      default:
        return { width: 120, height: 120 };
    }
  };

  const containerSize = getSize();

  // Extract avatar ID from URL
  const getAvatarId = (url: string) => {
    const parts = url.split("/");
    return parts[parts.length - 1]?.replace(".glb", "") || "";
  };

  // Build Ready Player Me preview URL
  const getPreviewUrl = (url: string) => {
    const avatarId = getAvatarId(url);
    // Use fullbody scene to show the complete character
    return `https://models.readyplayer.me/${avatarId}?scene=fullbody-portrait-v1&quality=medium&background=transparent&camera=portrait`;
  };

  if (!avatarUrl) {
    return (
      <View style={[styles.container, containerSize, style]}>
        <LinearGradient
          colors={["rgba(255, 255, 255, 0.05)", "rgba(255, 255, 255, 0.02)"]}
          style={styles.placeholder}
        >
          <Ionicons
            name="person"
            size={containerSize.width * 0.4}
            color="#6b7280"
          />
          <Text style={styles.placeholderText}>No Avatar</Text>
          {showEditButton && onEdit && (
            <TouchableOpacity style={styles.editButton} onPress={onEdit}>
              <Ionicons name="add" size={20} color="#00d4ff" />
            </TouchableOpacity>
          )}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.container, containerSize, style]}>
      <View style={styles.avatarContainer}>
        <WebView
          source={{ uri: getPreviewUrl(avatarUrl) }}
          style={styles.webview}
          scrollEnabled={false}
          bounces={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          allowsInlineMediaPlayback={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <Ionicons name="refresh" size={24} color="#00d4ff" />
              <Text style={styles.loadingText}>Loading Avatar...</Text>
            </View>
          )}
        />

        {/* Avatar Border/Frame */}
        <View style={styles.avatarBorder} />

        {/* Edit Button */}
        {showEditButton && onEdit && (
          <TouchableOpacity style={styles.editButton} onPress={onEdit}>
            <LinearGradient
              colors={["#8b5cf6", "#ec4899"]}
              style={styles.editButtonGradient}
            >
              <Ionicons name="create" size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#1a1a2e",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  placeholderText: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  avatarContainer: {
    flex: 1,
    position: "relative",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
  avatarBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(0, 212, 255, 0.3)",
    pointerEvents: "none",
  },
  editButton: {
    position: "absolute",
    bottom: 8,
    right: 8,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  editButtonGradient: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a1a2e",
    gap: 8,
  },
  loadingText: {
    color: "#9ca3af",
    fontSize: 12,
    textAlign: "center",
  },
});
