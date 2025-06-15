import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  Animated,
  ScrollView,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { X, Heart, ArrowLeft, SlidersHorizontal } from "lucide-react-native";
import { BottomNav } from "../../components/BottomNav";
import { useNavigation } from "@react-navigation/native";

const BASE_URL = "http://172.20.10.4:5000";

export default function SwipeView() {
  const navigation = useNavigation();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [compliment, setCompliment] = useState("");
  const [isComplimentPopupOpen, setIsComplimentPopupOpen] = useState(false);
  const swipeAnimation = new Animated.Value(0);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) {
        console.error("❌ No auth token found!");
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/api/profile/filteredProfiles`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to fetch profiles");

      setProfiles(result.profiles);
    } catch (error) {
      console.error("❌ Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendSwipeAction = async (swipedUserId, action) => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) return;

      await fetch(`${BASE_URL}/api/profile/swipe`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ swipedUserId, action }),
      });
    } catch (error) {
      console.error("❌ Swipe Action Error:", error);
    }
  };

  const handleSwipe = async (direction) => {
    if (!profiles.length) return;
    const swipedUserId = profiles[currentProfileIndex]?._id;

    Animated.timing(swipeAnimation, {
      toValue: direction === "right" ? 300 : -300,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      swipeAnimation.setValue(0);
      if (direction === "right") {
        setIsComplimentPopupOpen(true);
      } else {
        sendSwipeAction(swipedUserId, "dislike");
        setCurrentProfileIndex((prev) => (prev + 1) % profiles.length);
      }
    });
  };

  const handleSendCompliment = async () => {
    const swipedUserId = profiles[currentProfileIndex]?._id;
    if (!swipedUserId) return;

    if (!compliment.trim()) {
      sendSwipeAction(swipedUserId, "like");
      setIsComplimentPopupOpen(false);
      setCurrentProfileIndex((prev) => (prev + 1) % profiles.length);
      return;
    }

    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) return;

      const response = await fetch(`${BASE_URL}/api/chat/send-compliment`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ swipedUserId, compliment }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Compliment failed");

      Alert.alert("Success", "Compliment sent! Chat request created.");
      setIsComplimentPopupOpen(false);
      setCompliment("");

      navigation.navigate("ChatScreen", {
        receiverId: swipedUserId,
        receiverUsername: profiles[currentProfileIndex].name,
        chatId: result.chatId,
        twilioChatChannelSid: result.chatChannelSid,
      });

      sendSwipeAction(swipedUserId, "like");
      setCurrentProfileIndex((prev) => (prev + 1) % profiles.length);
    } catch (error) {
      console.error("❌ Compliment Error:", error);
      Alert.alert("Error", "Failed to send compliment.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#ff5864" />
      </View>
    );
  }

  const profile = profiles[currentProfileIndex];

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
    { key: "pets", emoji: "🐶" }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>FUSE</Text>
        <View style={styles.topIcons}>
          <TouchableOpacity>
            <ArrowLeft size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 16 }} onPress={() => navigation.navigate("FilterScreen")}>
            <SlidersHorizontal size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.header}><Text style={styles.name}>{profile?.name}</Text></View>

      <ScrollView style={styles.scroll}>
        {profile.photos.map((photo, i) => (
          <View key={i} style={styles.mediaBlock}>
            <Image source={{ uri: photo }} style={styles.image} />
            <TouchableOpacity
              style={styles.overlayHeart}
              onPress={() => handleSwipe("right")}
            >
              <Heart size={20} color="#f0a0a0" />
            </TouchableOpacity>

            {i === 0 && (
              <View style={styles.detailsBox}>
                <Text style={styles.infoText}>🎂 {profile.dateOfBirth}</Text>
                <Text style={styles.infoText}>👤 {profile.gender}</Text>
                <Text style={styles.infoText}>📏 {profile.height}</Text>
                <View style={styles.bubbleContainer}>
                  {profile.interests?.map((item, index) => (
                    <View key={index} style={styles.bubble}>
                      <Text style={styles.bubbleText}>{item}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.bubbleContainer}>
                  {profile.values?.map((item, index) => (
                    <View key={index} style={[styles.bubble, { backgroundColor: "#d4edda" }]}> 
                      <Text style={styles.bubbleText}>{item}</Text>
                    </View>
                  ))}
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                  {extraFields.map(({ key, emoji }, idx) => (
                    profile[key] ? (
                      <View key={idx} style={[styles.bubble, { backgroundColor: "#e0f7fa" }]}> 
                        <Text style={styles.bubbleText}>{emoji} {profile[key]}</Text>
                      </View>
                    ) : null
                  ))}
                </ScrollView>
              </View>
            )}

            {profile.prompts[i] && (
              <View style={styles.promptCard}>
                <Text style={styles.promptTitle}>{profile.prompts[i].question}</Text>
                <Text style={styles.promptAnswer}>{profile.prompts[i].answer}</Text>
                <TouchableOpacity
                  style={styles.overlayHeartPrompt}
                  onPress={() => handleSwipe("right")}
                >
                  <Heart size={20} color="#f0a0a0" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <Modal visible={isComplimentPopupOpen} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setIsComplimentPopupOpen(false)}>
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

      <TouchableOpacity style={styles.floatingCrossButton} onPress={() => handleSwipe("left")}>
        <X size={32} color="red" />
      </TouchableOpacity>

      <BottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  topBar1: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 10 },
  brand: { fontSize: 22, fontWeight: "bold", letterSpacing: 1 },
  topIcons: { flexDirection: "row", alignItems: "center" },
  header: { padding: 16, alignItems: "center", borderBottomWidth: 1, borderColor: "#eee" },
  name: { fontSize: 24, fontWeight: "bold" },
  scroll: { flex: 1, padding: 16 },
  mediaBlock: { marginBottom: 20 },
  image: { width: "100%", height: 400, borderRadius: 12 },
  overlayHeart: { position: "absolute", top: 10, right: 10, backgroundColor: "white", padding: 6, borderRadius: 50, elevation: 3 },
  overlayHeartPrompt: { position: "absolute", top: 10, right: 10, backgroundColor: "white", padding: 6, borderRadius: 50, elevation: 3 },
  promptCard: { backgroundColor: "#fff", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: "#eee", marginTop: 10, position: 'relative' },
  promptTitle: { fontSize: 18, color: "#333", fontWeight: "500", marginBottom: 15 },
  promptAnswer: { fontSize: 28, fontWeight: "900", fontFamily: "serif", lineHeight: 34 },
  detailsBox: { marginTop: 10, padding: 10, borderWidth: 1, borderColor: "#ddd", borderRadius: 10 },
  infoText: { fontSize: 16, marginVertical: 4 },
  bubbleContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  bubble: { backgroundColor: "#ffe5ec", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, margin: 4 },
  bubbleText: { fontSize: 14 },
  heartButton: { backgroundColor: "#ff5864", padding: 15, borderRadius: 50, alignSelf: "center", marginTop: 10 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%" },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginBottom: 10 },
  floatingCrossButton: { position: "absolute", bottom: 80, left: 20, backgroundColor: "white", borderRadius: 50, padding: 12, elevation: 4 },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    backgroundColor: "#fff",
    zIndex: 1,
  },
});
