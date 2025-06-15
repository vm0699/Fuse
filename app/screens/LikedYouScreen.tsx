// ✅ Updated LikedYouScreen with extended fields & emojis
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BottomNav } from "../../components/BottomNav";
import { Heart, X } from "lucide-react-native";

const BASE_URL = "http://172.20.10.4:5000";

const extraFields = [
  { key: "college", emoji: "🎓" },
  { key: "work", emoji: "💼" },
  { key: "drinking", emoji: "🍷" },
  { key: "religion", emoji: "🛐" },
  { key: "zodiacSign", emoji: "♒" },
  { key: "ethnicity", emoji: "🌍" },
  { key: "politics", emoji: "🏛️" },
  { key: "smoking", emoji: "🚬" },
  { key: "languages", emoji: "🗣️" },
  { key: "pets", emoji: "🐶" },
];

export default function LikedYouScreen() {
  const [likedUsers, setLikedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compliment, setCompliment] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const fetchLikedUsers = async () => {
      try {
        const token = await AsyncStorage.getItem("jwtToken");
        if (!token) return Alert.alert("Error", "No token found");

        const response = await fetch(`${BASE_URL}/api/likes/likedyou`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (data.success) {
          setLikedUsers(data.users || []);
        } else {
          Alert.alert("Error", data.message || "Failed to fetch");
        }
      } catch (error) {
        console.error("❌ Error fetching liked users:", error);
        Alert.alert("Error", "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchLikedUsers();
  }, []);

  const handleSendCompliment = async () => {
    if (!selectedUser || !compliment.trim()) return;
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      const response = await fetch(`${BASE_URL}/api/chat/send-compliment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ swipedUserId: selectedUser, compliment }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to send compliment");

      Alert.alert("Success", "Compliment sent. Chat request created.");
      setModalVisible(false);
      setCompliment("");
    } catch (error) {
      console.error("❌ Compliment Error:", error);
      Alert.alert("Error", "Failed to send compliment");
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#ff5864" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Liked Your Profile!</Text>
        <Text style={styles.subheader}>
          {likedUsers.length > 0
            ? `${likedUsers.length} people have liked your profile`
            : "Here's who liked you recently"}
        </Text>

        {likedUsers.length === 0 ? (
          <Text style={styles.noLikesText}>No one has liked you yet 😔</Text>
        ) : (
          likedUsers.map((profile) => (
            <View key={profile._id} style={styles.profileContainer}>
              <Text style={styles.name}>{profile.name}</Text>

              {profile.photos?.map((photo, i) => (
                <View key={i} style={styles.mediaBlock}>
                  <Image source={{ uri: photo }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.overlayHeart}
                    onPress={() => {
                      setSelectedUser(profile._id);
                      setModalVisible(true);
                    }}
                  >
                    <Heart size={20} color="#f0a0a0" />
                  </TouchableOpacity>

                  {i === 0 && (
                    <View style={styles.detailsBox}>
                      <Text style={styles.infoText}>🎂 {profile.dateOfBirth}</Text>
                      <Text style={styles.infoText}>👤 {profile.gender}</Text>
                      <Text style={styles.infoText}>📋 {profile.height}</Text>

                      <View style={styles.bubbleContainer}>
                        {profile.interests?.map((item, index) => (
                          <View key={index} style={styles.bubble}>
                            <Text style={styles.bubbleText}>💡 {item}</Text>
                          </View>
                        ))}
                      </View>

                      <View style={styles.bubbleContainer}>
                        {profile.values?.map((item, index) => (
                          <View key={index} style={[styles.bubble, { backgroundColor: "#d4edda" }]}>
                            <Text style={styles.bubbleText}>💬 {item}</Text>
                          </View>
                        ))}
                      </View>

                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                        {extraFields.map(({ key, emoji }, idx) =>
                          profile[key] ? (
                            <View key={idx} style={[styles.bubble, { backgroundColor: "#e0f7fa" }]}>
                              <Text style={styles.bubbleText}>{emoji} {profile[key]}</Text>
                            </View>
                          ) : null
                        )}
                      </ScrollView>
                    </View>
                  )}

                  {profile.prompts?.[i] && (
                    <View style={styles.promptCard}>
                      <Text style={styles.promptTitle}>{profile.prompts[i].question}</Text>
                      <Text style={styles.promptAnswer}>{profile.prompts[i].answer}</Text>
                      <TouchableOpacity
                        style={styles.overlayHeartPrompt}
                        onPress={() => {
                          setSelectedUser(profile._id);
                          setModalVisible(true);
                        }}
                      >
                        <Heart size={20} color="#f0a0a0" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <X size={30} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Send a Compliment</Text>
            <TextInput
              placeholder="Type compliment..."
              style={styles.input}
              value={compliment}
              onChangeText={setCompliment}
            />
            <TouchableOpacity style={styles.heartButton} onPress={handleSendCompliment}>
              <Heart size={30} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContainer: { paddingBottom: 100 },
  header: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginTop: 50 },
  subheader: { fontSize: 16, color: "#666", textAlign: "center", marginBottom: 10 },
  noLikesText: { fontSize: 16, color: "#999", textAlign: "center", marginTop: 50 },
  profileContainer: { marginBottom: 40, paddingHorizontal: 16 },
  name: { fontSize: 24, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  mediaBlock: { marginBottom: 20 },
  image: { width: "100%", height: 400, borderRadius: 12 },
  overlayHeart: { position: "absolute", top: 10, right: 10, backgroundColor: "white", padding: 6, borderRadius: 50, elevation: 3 },
  overlayHeartPrompt: { position: "absolute", top: 10, right: 10, backgroundColor: "white", padding: 6, borderRadius: 50, elevation: 3 },
  detailsBox: { marginTop: 10, padding: 10, borderWidth: 1, borderColor: "#ddd", borderRadius: 10 },
  infoText: { fontSize: 16, marginVertical: 4 },
  bubbleContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  bubble: { backgroundColor: "#ffe5ec", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, margin: 4 },
  bubbleText: { fontSize: 14 },
  promptCard: { backgroundColor: "#fff", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#eee", marginTop: 10, position: 'relative' },
  promptTitle: { fontSize: 18, color: "#333", fontWeight: "500", marginBottom: 15 },
  promptAnswer: { fontSize: 28, fontWeight: "900", fontFamily: "serif", lineHeight: 34 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginBottom: 10 },
  heartButton: { backgroundColor: "#ff5864", padding: 15, borderRadius: 50, alignSelf: "center", marginTop: 10 },
});
