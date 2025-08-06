import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useGameStore } from "../../store/gameStore";
import { getFirebaseStatus } from "../../utils/firebaseTest";

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState<{
    configured: boolean;
    canRead: boolean;
    canWrite: boolean;
    projectId: string;
  } | null>(null);

  const {
    setUser,
    setLoading: setGlobalLoading,
    signIn,
    signUp,
    error: authError,
  } = useGameStore();

  // Test Firebase connection on mount
  useEffect(() => {
    const testFirebase = async () => {
      const status = await getFirebaseStatus();
      setFirebaseStatus(status);

      if (!status.configured) {
        console.log("⚠️ Firebase not configured");
      } else if (!status.canRead || !status.canWrite) {
        console.log("⚠️ Firebase permissions issue - check Firestore rules");
      } else {
        console.log("✅ Firebase ready!");
      }
    };

    testFirebase();
  }, []);

  const handleAuth = async () => {
    if (!email || !password || (isSignUp && !username)) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    setGlobalLoading(true);

    try {
      let success = false;

      if (isSignUp) {
        // For registration, using Runner as default sport category
        success = await signUp(email, password, username, "Runner");
      } else {
        success = await signIn(email, password);
      }

      if (success) {
        Alert.alert("Success", `Welcome to FitQuest!`);
      } else {
        Alert.alert(
          "Error",
          authError || "Authentication failed. Please try again."
        );
      }
    } catch (error) {
      Alert.alert("Error", "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  const handleDevBypass = () => {
    const devUser = {
      id: "dev-user-123",
      email: "dev@fitquest.com",
      username: "DevTester",
      createdAt: new Date(),
      lastLogin: new Date(),
    };
    setUser(devUser);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#0f0f23", "#1a1a2e", "#16213e"]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo/Header */}
          <View style={styles.header}>
            <Ionicons name="fitness" size={64} color="#00d4ff" />
            <Text style={styles.title}>FitQuest</Text>
            <Text style={styles.subtitle}>
              Your Epic Fitness Adventure Begins
            </Text>

            {/* Firebase Status Indicator */}
            {firebaseStatus && (
              <View style={styles.firebaseStatus}>
                <Ionicons
                  name={
                    firebaseStatus.canRead && firebaseStatus.canWrite
                      ? "checkmark-circle"
                      : firebaseStatus.configured
                      ? "warning"
                      : "close-circle"
                  }
                  size={16}
                  color={
                    firebaseStatus.canRead && firebaseStatus.canWrite
                      ? "#10b981"
                      : firebaseStatus.configured
                      ? "#f59e0b"
                      : "#ef4444"
                  }
                />
                <Text
                  style={[
                    styles.firebaseStatusText,
                    {
                      color:
                        firebaseStatus.canRead && firebaseStatus.canWrite
                          ? "#10b981"
                          : firebaseStatus.configured
                          ? "#f59e0b"
                          : "#ef4444",
                    },
                  ]}
                >
                  {firebaseStatus.canRead && firebaseStatus.canWrite
                    ? "Firebase Ready"
                    : firebaseStatus.configured
                    ? "Check Firestore Rules"
                    : "Firebase Not Configured"}
                </Text>
              </View>
            )}
          </View>

          {/* Auth Form */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {isSignUp && (
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#9ca3af"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleAuth}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading
                  ? "Loading..."
                  : isSignUp
                  ? "Create Account"
                  : "Sign In"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.switchText}>
                {isSignUp
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>

            {/* Dev Bypass Button */}
            <TouchableOpacity
              style={styles.devButton}
              onPress={handleDevBypass}
            >
              <Text style={styles.devButtonText}>
                🚀 Dev Bypass - Skip Login
              </Text>
            </TouchableOpacity>
          </View>

          {/* Features Preview */}
          <View style={styles.features}>
            <View style={styles.feature}>
              <Ionicons name="trophy" size={24} color="#ffd700" />
              <Text style={styles.featureText}>Level Up Your Fitness</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="people" size={24} color="#10b981" />
              <Text style={styles.featureText}>Join Guilds & Compete</Text>
            </View>
            <View style={styles.feature}>
              <Ionicons name="gift" size={24} color="#f59e0b" />
              <Text style={styles.featureText}>Earn Rewards & Gear</Text>
            </View>
          </View>
        </View>
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
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#e5e7eb",
    textAlign: "center",
    marginTop: 8,
  },
  form: {
    marginBottom: 40,
  },
  input: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    backdropFilter: "blur(10px)",
  },
  button: {
    backgroundColor: "rgba(0, 212, 255, 0.8)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.3)",
    shadowColor: "#00d4ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  switchButton: {
    marginTop: 16,
    alignItems: "center",
  },
  switchText: {
    color: "#e5e7eb",
    fontSize: 14,
  },
  devButton: {
    backgroundColor: "rgba(16, 185, 129, 0.8)",
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  firebaseStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    gap: 6,
  },
  firebaseStatusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  devButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  features: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  feature: {
    alignItems: "center",
    flex: 1,
  },
  featureText: {
    color: "#e5e7eb",
    fontSize: 12,
    textAlign: "center",
    marginTop: 4,
  },
});
