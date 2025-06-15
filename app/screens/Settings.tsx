import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { Switch } from "react-native";
import Icon from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [userLocation, setUserLocation] = useState(null);

  // ✅ Request Location Permission
  const requestLocationPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Enable location in settings to use this feature."
      );
      return;
    }
    getCurrentLocation();
  };

  // ✅ Fetch Current Location
  const getCurrentLocation = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      setUserLocation({ latitude, longitude });
      setLocationEnabled(true);

      // ✅ Store location in backend
      const token = await AsyncStorage.getItem("jwtToken");
      await fetch("http://172.20.10.4:5000/api/user/update-location", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ latitude, longitude }),
      });
    } catch (error) {
      Alert.alert("Error", "Failed to get location.");
      console.error("Location error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Text style={styles.headerButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={() => Alert.alert("Settings saved!")}>
          <Text style={styles.headerButton}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* ✅ Location Toggle */}
        <View style={styles.card}>
          <View style={styles.cardRow}>
            <Text style={styles.cardText}>Enable Location</Text>
            <Switch
              value={locationEnabled}
              onValueChange={(value) => {
                if (value) {
                  requestLocationPermission();
                } else {
                  setLocationEnabled(false);
                  setUserLocation(null);
                }
              }}
            />
          </View>
          <Text style={styles.subText}>
            Enable location to appear in search results near you.
          </Text>
        </View>

        {/* Other Settings */}
        {[
          { title: "Video autoplay settings", route: "Video Autoplay" },
          { title: "Notification settings", route: "NotificationSettings" },
          { title: "Security and Privacy", route: "SecuritySettings" },
          { title: "Contact and FAQ", route: "Contact FAQ" },
        ].map((setting, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() =>
              setting.route && navigation.navigate(setting.route)
            }
          >
            <View style={styles.cardRow}>
              <Text style={styles.cardText}>{setting.title}</Text>
              <Icon name="chevron-right" size={20} color="#999" />
            </View>
          </TouchableOpacity>
        ))}

        {/* Delete Account */}
        <TouchableOpacity
          onPress={() =>
            Alert.alert("Delete Account", "Are you sure?", [
              { text: "Cancel", style: "cancel" },
              { text: "Delete", style: "destructive" },
            ])
          }
          style={[styles.card, styles.deleteButton]}
        >
          <Text style={styles.deleteText}>Delete account</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerBar}></View>
          <Text style={styles.footerText}>Version 5.392.0</Text>
          <Text style={styles.footerText}>Created with love.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerButton: { fontSize: 16, color: "#007aff" },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  scrollViewContent: { paddingBottom: 80 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardText: { fontSize: 16, fontWeight: "500" },
  subText: { fontSize: 14, color: "#666", marginTop: 8 },
  deleteButton: { justifyContent: "center", alignItems: "center" },
  deleteText: { color: "#e53935", fontWeight: "bold", fontSize: 16 },
  footer: { alignItems: "center", marginTop: 16, paddingVertical: 16 },
  footerBar: {
    width: 40,
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
    marginBottom: 8,
  },
  footerText: { color: "#999", fontSize: 12 },
});
