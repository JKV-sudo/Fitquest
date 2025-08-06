import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useGameStore } from "../../store/gameStore";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

interface ReadyPlayerMeEvent {
  source: string;
  eventName: string;
  data: {
    id?: string;
    url?: string;
    userId?: string;
  };
}

export default function ReadyPlayerMeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);
  const navigation = useNavigation();

  const { updateCharacter, character } = useGameStore();

  // Ready Player Me Configuration
  const rpmConfig = {
    clearCache: true,
    bodyType: "fullbody",
    quickStart: false,
    language: "en",
    background: {
      color: "#0f0f23",
    },
  };

  // Build Ready Player Me URL with configuration
  const buildRPMUrl = () => {
    // Use the demo subdomain that supports full-body avatars
    const baseUrl = "https://demo.readyplayer.me/avatar";
    const params = new URLSearchParams({
      clearCache: rpmConfig.clearCache.toString(),
      bodyType: rpmConfig.bodyType, // This should be 'fullbody'
      quickStart: rpmConfig.quickStart.toString(),
      language: rpmConfig.language,
      // Add specific parameters for full-body creation
      frameApi: "true",
      source: "fitquest",
    });

    return `${baseUrl}?${params.toString()}`;
  };

  // Handle messages from Ready Player Me WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const message: ReadyPlayerMeEvent = JSON.parse(event.nativeEvent.data);

      console.log("RPM Event:", message);

      switch (message.eventName) {
        case "v1.frame.ready":
          setIsLoading(false);
          break;

        case "v1.user.set":
          if (message.data.userId) {
            setUserId(message.data.userId);
            console.log("User ID set:", message.data.userId);
          }
          break;

        case "v1.avatar.exported":
          if (message.data.url) {
            setAvatarUrl(message.data.url);
            handleAvatarCreated(message.data.url);
          }
          break;

        default:
          console.log("Unhandled RPM event:", message.eventName);
      }
    } catch (error) {
      console.error("Error parsing WebView message:", error);
    }
  };

  // Handle successful avatar creation
  const handleAvatarCreated = (url: string) => {
    Alert.alert(
      "🎉 Avatar Created!",
      "Your awesome 3D avatar is ready! Would you like to use it for your FitQuest character?",
      [
        {
          text: "Preview First",
          style: "default",
          onPress: () => setShowPreview(true),
        },
        {
          text: "Use Avatar",
          style: "default",
          onPress: () => saveAvatarToCharacter(url),
        },
      ]
    );
  };

  // Save avatar to character profile
  const saveAvatarToCharacter = (url: string) => {
    if (character) {
      updateCharacter({
        ...character,
        avatarUrl: url,
        userId: userId || character.userId || undefined,
      });

      Alert.alert(
        "✅ Success!",
        "Your 3D avatar has been saved to your character profile!",
        [
          {
            text: "Continue",
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }
  };

  // Handle WebView errors
  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error("WebView error:", nativeEvent);
    Alert.alert(
      "Connection Error",
      "Failed to load Ready Player Me. Please check your internet connection.",
      [
        {
          text: "Retry",
          onPress: () => webViewRef.current?.reload(),
        },
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#0f0f23", "#1a1a2e", "#16213e"]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#00d4ff" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Create Your Avatar</Text>
            <Text style={styles.headerSubtitle}>
              Design your 3D character with Ready Player Me
            </Text>
          </View>

          <TouchableOpacity style={styles.helpButton}>
            <Ionicons name="help-circle-outline" size={24} color="#8b5cf6" />
          </TouchableOpacity>
        </View>

        {/* Loading Overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <LinearGradient
              colors={["rgba(0, 212, 255, 0.1)", "rgba(139, 92, 246, 0.1)"]}
              style={styles.loadingCard}
            >
              <Ionicons name="person-add" size={48} color="#00d4ff" />
              <Text style={styles.loadingText}>Loading Avatar Creator...</Text>
              <Text style={styles.loadingSubtext}>
                Preparing your 3D character editor
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Ready Player Me WebView */}
        <WebView
          ref={webViewRef}
          source={{ uri: buildRPMUrl() }}
          style={[styles.webview, { opacity: isLoading ? 0 : 1 }]}
          onMessage={handleWebViewMessage}
          onError={handleWebViewError}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          allowsInlineMediaPlayback={true}
          allowsFullscreenVideo={false}
          bounces={false}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />

        {/* Status Bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusItem}>
            <Ionicons name="person" size={16} color="#00d4ff" />
            <Text style={styles.statusText}>
              {userId ? "User Connected" : "Connecting..."}
            </Text>
          </View>

          <View style={styles.statusItem}>
            <Ionicons name="cloud" size={16} color="#10b981" />
            <Text style={styles.statusText}>Ready Player Me</Text>
          </View>

          {avatarUrl && (
            <TouchableOpacity
              style={styles.statusItem}
              onPress={() => setShowPreview(true)}
            >
              <Ionicons name="eye" size={16} color="#8b5cf6" />
              <Text style={styles.statusText}>Preview</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Preview Modal */}
        <Modal
          visible={showPreview}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowPreview(false)}
        >
          <View style={styles.modalOverlay}>
            <LinearGradient
              colors={["#0f0f23", "#1a1a2e"]}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Avatar Preview</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowPreview(false)}
                >
                  <Ionicons name="close" size={24} color="#00d4ff" />
                </TouchableOpacity>
              </View>

              {avatarUrl && (
                <WebView
                  source={{
                    uri: `https://models.readyplayer.me/${avatarUrl
                      .split("/")
                      .pop()
                      ?.replace(
                        ".glb",
                        ""
                      )}?scene=fullbody-portrait-v1&quality=medium&background=transparent&camera=portrait`,
                  }}
                  style={styles.previewWebView}
                />
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowPreview(false)}
                >
                  <Text style={styles.modalButtonText}>Keep Editing</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.primaryButton]}
                  onPress={() => {
                    setShowPreview(false);
                    if (avatarUrl) saveAvatarToCharacter(avatarUrl);
                  }}
                >
                  <Text style={styles.primaryButtonText}>Use This Avatar</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f23",
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSubtitle: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 2,
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingOverlay: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    backgroundColor: "rgba(15, 15, 35, 0.9)",
  },
  loadingCard: {
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    margin: 20,
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
  },
  loadingSubtext: {
    color: "#9ca3af",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  webview: {
    flex: 1,
    backgroundColor: "#0f0f23",
  },
  statusBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.9,
    height: height * 0.8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 212, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  previewWebView: {
    flex: 1,
    backgroundColor: "#0f0f23",
  },
  modalActions: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  primaryButton: {
    backgroundColor: "rgba(0, 212, 255, 0.8)",
    borderColor: "rgba(0, 212, 255, 0.3)",
  },
  modalButtonText: {
    color: "#9ca3af",
    fontSize: 16,
    fontWeight: "600",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
