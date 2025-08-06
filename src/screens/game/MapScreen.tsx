import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Animated,
} from "react-native";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useGameStore } from "../../store/gameStore";

// Cool custom map styles
const mapStyles = [
  {
    elementType: "geometry",
    stylers: [{ color: "#0a0a0a" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#ffffff" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#000000" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#00d4ff" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#1a1a2e" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#16213e" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#2a2a4a" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#00d4ff" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#8b5cf6" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#001122" }],
  },
];

interface UserLocation {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export default function MapScreen() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapType, setMapType] = useState<"standard" | "satellite" | "hybrid">(
    "standard"
  );
  const [showUserLocation, setShowUserLocation] = useState(true);
  const mapRef = useRef<MapView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const { character, todaysFitnessData, addExperience } = useGameStore();

  useEffect(() => {
    getCurrentLocation();
    startPulseAnimation();
  }, []);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to show your position on the map."
        );
        setLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const userLocation: UserLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setLocation(userLocation);
      setLoading(false);
    } catch (error) {
      console.error("Error getting location:", error);
      Alert.alert("Error", "Could not get your current location.");
      setLoading(false);
    }
  };

  const centerOnUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion(location, 1000);
    }
  };

  const toggleMapType = () => {
    const types: Array<"standard" | "satellite" | "hybrid"> = [
      "standard",
      "satellite",
      "hybrid",
    ];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  const getMapTypeIcon = () => {
    switch (mapType) {
      case "standard":
        return "map";
      case "satellite":
        return "satellite";
      case "hybrid":
        return "layers";
      default:
        return "map";
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <LinearGradient
            colors={["rgba(0, 212, 255, 0.1)", "rgba(139, 92, 246, 0.1)"]}
            style={styles.loadingCard}
          >
            <Ionicons name="location" size={48} color="#00d4ff" />
            <Text style={styles.loadingText}>Finding your location...</Text>
          </LinearGradient>
        </View>
      </SafeAreaView>
    );
  }

  if (!location) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="location-off" size={64} color="#ef4444" />
          <Text style={styles.errorText}>Location not available</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={getCurrentLocation}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={mapStyles}
        mapType={mapType}
        initialRegion={location}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        showsBuildings={true}
        showsTraffic={false}
        followsUserLocation={false}
        zoomEnabled={true}
        scrollEnabled={true}
        rotateEnabled={true}
        pitchEnabled={true}
      >
        {/* Custom User Marker with Pulse */}
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          title={character?.name || "You"}
          description={`Level ${character?.level || 1} ${
            character?.sportCategory || "Athlete"
          }`}
        >
          <Animated.View
            style={[
              styles.markerContainer,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <LinearGradient
              colors={["#00d4ff", "#8b5cf6"]}
              style={styles.marker}
            >
              <Ionicons name="person" size={20} color="#fff" />
            </LinearGradient>
          </Animated.View>
        </Marker>

        {/* Activity Circle */}
        <Circle
          center={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          radius={500} // 500 meters
          strokeColor="rgba(0, 212, 255, 0.5)"
          fillColor="rgba(0, 212, 255, 0.1)"
          strokeWidth={2}
        />
      </MapView>

      {/* Top Stats Overlay */}
      <View style={styles.topOverlay}>
        <LinearGradient
          colors={["rgba(0, 212, 255, 0.1)", "rgba(139, 92, 246, 0.1)"]}
          style={styles.statsCard}
        >
          <View style={styles.statItem}>
            <Ionicons name="walk" size={16} color="#00d4ff" />
            <Text style={styles.statValue}>
              {todaysFitnessData?.steps.toLocaleString() || "0"}
            </Text>
            <Text style={styles.statLabel}>Steps</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="flame" size={16} color="#ef4444" />
            <Text style={styles.statValue}>
              {todaysFitnessData?.calories || "0"}
            </Text>
            <Text style={styles.statLabel}>Cal</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time" size={16} color="#10b981" />
            <Text style={styles.statValue}>
              {todaysFitnessData?.activeMinutes || "0"}
            </Text>
            <Text style={styles.statLabel}>Min</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        {/* Center on User */}
        <TouchableOpacity style={styles.controlButton} onPress={centerOnUser}>
          <Ionicons name="locate" size={24} color="#00d4ff" />
        </TouchableOpacity>

        {/* Toggle Map Type */}
        <TouchableOpacity style={styles.controlButton} onPress={toggleMapType}>
          <Ionicons name={getMapTypeIcon() as any} size={24} color="#8b5cf6" />
        </TouchableOpacity>

        {/* Toggle User Location */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => setShowUserLocation(!showUserLocation)}
        >
          <Ionicons
            name={showUserLocation ? "eye" : "eye-off"}
            size={24}
            color={showUserLocation ? "#10b981" : "#6b7280"}
          />
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.actionText}>Check-in</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="camera" size={20} color="#fff" />
          <Text style={styles.actionText}>Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="navigate" size={20} color="#fff" />
          <Text style={styles.actionText}>Route</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f23",
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingCard: {
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 16,
    fontWeight: "600",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "rgba(0, 212, 255, 0.8)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.3)",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#00d4ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
  topOverlay: {
    position: "absolute",
    top: 20,
    left: 16,
    right: 16,
    zIndex: 1,
  },
  statsCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  statLabel: {
    color: "#9ca3af",
    fontSize: 12,
  },
  controlsContainer: {
    position: "absolute",
    right: 16,
    top: 100,
    gap: 12,
    zIndex: 1,
  },
  controlButton: {
    width: 48,
    height: 48,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  quickActions: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    zIndex: 1,
  },
  actionButton: {
    backgroundColor: "rgba(0, 212, 255, 0.8)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    minWidth: 80,
    borderWidth: 1,
    borderColor: "rgba(0, 212, 255, 0.3)",
    shadowColor: "#00d4ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
});
