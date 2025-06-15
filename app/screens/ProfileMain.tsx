import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ProgressBar } from "react-native-paper";
import UpdateProfilePage from './UpdateProfilePage';
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { BottomNav } from "../../components/BottomNav";

const BASE_URL = "http://172.20.10.4:5000";
const POPUP_KEY = "hasSeenProfileReminder";

const TABS = ["About", "Photos", "Preferences"];

const ProfilePage = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("About");
  const [showProfileReminder, setShowProfileReminder] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchUserProfile = async () => {
        setLoading(true);
        try {
          const token = await AsyncStorage.getItem("jwtToken");
          if (!token) {
            Alert.alert("Error", "Session expired. Please log in again.");
            navigation.reset({ index: 0, routes: [{ name: "Login" }] });
            return;
          }
  
          const response = await fetch(`${BASE_URL}/api/profile`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
  
          if (!response.ok) throw new Error("Failed to fetch user profile");
          const { data } = await response.json();
          setUserData(data);
  
          // ✅ Show popup ONCE per session for incomplete profiles
          if (data.profileComplete < 100) {
            const sessionPopupKey = "popup_shown_this_session";
            const alreadyShown = await AsyncStorage.getItem(sessionPopupKey);
            if (!alreadyShown) {
              setShowProfileReminder(true);
              await AsyncStorage.setItem(sessionPopupKey, "true");
              console.log("🔔 Profile popup shown for this session.");
            } else {
              console.log("⏭️ Popup already shown this session.");
            }
          }
  
        } catch (error) {
          Alert.alert("Error", "Failed to load profile data.");
        } finally {
          setLoading(false);
        }
      };
  
      fetchUserProfile();
    }, [navigation])
  );
  
  

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("jwtToken");
      navigation.navigate("Login");
    } catch {
      Alert.alert("Error", "Logout failed.");
    }
  };

  const extraFields = [
    { label: "Pronouns", value: userData?.pronouns },
    { label: "Sexuality", value: userData?.sexuality },
    { label: "Education", value: userData?.educationLevel },
    { label: "Job", value: userData?.jobTitle },
    {
      label: "Location",
      value:
        userData?.location?.latitude && userData?.location?.longitude
          ? `Lat: ${userData.location.latitude}, Lng: ${userData.location.longitude}`
          : null,
    },
    { label: "Hometown", value: userData?.homeTown },
    { label: "Drinking", value: userData?.drinking },
    { label: "Smoking", value: userData?.smoking },
    { label: "Intentions", value: userData?.datingIntentions },
    { label: "Zodiac", value: userData?.zodiacSign },
    { label: "Religion", value: userData?.religion },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Photos":
        return userData.photos?.length > 0 ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Profile Photos</Text>
            <View style={styles.photoGrid}>
              {userData.photos.map((photo, index) => (
                <Image key={index} source={{ uri: photo }} style={styles.gridImage} />
              ))}
            </View>
          </View>
        ) : null;
      case "Preferences":
        return (
          <>
            {userData.interests?.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Interests</Text>
                <Text style={styles.detailText}>{userData.interests.join(", ")}</Text>
              </View>
            )}
            {userData.values?.length > 0 && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>Values</Text>
                <Text style={styles.detailText}>{userData.values.join(", ")}</Text>
              </View>
            )}
          </>
        );
      case "About":
      default:
        return (
          <>
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Basic Info</Text>
              <Text style={styles.detailText}><Text style={styles.detailLabel}>Phone:</Text> {userData.phoneNumber}</Text>
              <Text style={styles.detailText}><Text style={styles.detailLabel}>Date of Birth:</Text> {userData.dateOfBirth}</Text>
              <Text style={styles.detailText}><Text style={styles.detailLabel}>Gender:</Text> {userData.gender}</Text>
              <Text style={styles.detailText}><Text style={styles.detailLabel}>Height:</Text> {userData.height}</Text>
            </View>
            {extraFields.filter((f) => f.value).length > 0 && (
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>More Info</Text>
                {extraFields.map(
                  (f, i) =>
                    f.value && (
                      <Text key={i} style={styles.detailText}>
                        <Text style={styles.detailLabel}>{f.label}:</Text> {f.value}
                      </Text>
                    )
                )}
              </View>
            )}
          </>
        );
    }
  };

  if (loading || !userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ✅ Popup Modal is rendered here to be ABOVE everything */}
      <Modal visible={showProfileReminder} transparent animationType="fade">
        <View style={styles.popupOverlay}>
          <View style={styles.popupCard}>
            <TouchableOpacity style={styles.popupClose} onPress={() => setShowProfileReminder(false)}>
              <Icon name="x" size={20} color="#333" />
            </TouchableOpacity>
            <Text style={styles.popupText}>
              Your profile is incomplete. Add more info to get better matches!
            </Text>
            <TouchableOpacity
              style={styles.popupButton}
              onPress={() => {
                setShowProfileReminder(false);
                navigation.navigate("UpdateProfilePage", { userData });
              }}
            >
              <Text style={styles.popupButtonText}>Complete Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
            <Icon name="settings" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.cardProfile}>
          <Image
            source={{
              uri: userData.photos?.[0] || "https://via.placeholder.com/100",
            }}
            style={styles.profileImage}
          />
          <Text style={styles.userName}>{userData.name || "No name provided"}</Text>
          <ProgressBar progress={userData.profileComplete / 100} color="#10b981" style={styles.progressBar} />
          <Text style={styles.profilePercentageText}>
            {`${Math.round(userData.profileComplete)}% Complete`}
          </Text>
        </View>

        <View style={styles.tabBar}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {renderTabContent()}

        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={() => navigation.navigate("UpdateProfilePage", { userData })}
        >
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomNavWrapper}><BottomNav /></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  scrollViewContent: { paddingBottom: 100 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 20, backgroundColor: "#fff", elevation: 2 },
  title: { fontSize: 30, fontWeight: "bold", color: "#111827" },
  cardProfile: { backgroundColor: "#fff", margin: 16, padding: 20, borderRadius: 16, alignItems: "center", elevation: 4 },
  profileImage: { width: 90, height: 90, borderRadius: 45, marginBottom: 12 },
  userName: { fontSize: 24, fontWeight: "bold", color: "#1f2937" },
  progressBar: { height: 6, borderRadius: 3, width: "80%", marginTop: 8 },
  profilePercentageText: { fontSize: 14, color: "#10b981", marginTop: 4 },
  card: { margin: 16, backgroundColor: "#fff", borderRadius: 16, padding: 16, elevation: 3 },
  sectionTitle: { fontSize: 20, fontWeight: "600", marginBottom: 8, color: "#374151" },
  detailText: { fontSize: 16, marginVertical: 2, color: "#111827" },
  detailLabel: { fontWeight: "bold" },
  photoGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start", gap: 8 },
  gridImage: { width: 100, height: 100, borderRadius: 12, margin: 4 },
  editProfileButton: { margin: 16, backgroundColor: "#e11d48", padding: 14, borderRadius: 10, alignItems: "center" },
  editProfileText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  logoutButton: { margin: 16, backgroundColor: "#111827", padding: 14, borderRadius: 10, alignItems: "center" },
  logoutText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  bottomNavWrapper: { position: "absolute", bottom: 0, left: 0, right: 0 },
  tabBar: { flexDirection: "row", justifyContent: "space-around", marginHorizontal: 16, marginVertical: 10, backgroundColor: "#fff", borderRadius: 12, padding: 8, elevation: 2 },
  tabItem: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 8 },
  tabItemActive: { backgroundColor: "#e0f2f1" },
  tabText: { fontSize: 16, color: "#4b5563" },
  tabTextActive: { color: "#0f766e", fontWeight: "bold" },

  // Popup styles
  popupOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  popupCard: {
    backgroundColor: "#fff",
    width: "100%",
    maxWidth: 320,
    padding: 24,
    borderRadius: 16,
    elevation: 12,
    alignItems: "center",
    position: "relative",
  },
  popupText: {
    fontSize: 16,
    color: "#1f2937",
    marginBottom: 16,
    textAlign: "center",
  },
  popupButton: {
    backgroundColor: "#e11d48",
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
  },
  popupButtonText: { color: "#fff", fontWeight: "bold" },
  popupClose: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
  },
});

export default ProfilePage;