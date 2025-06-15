import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BottomNav } from "../../components/BottomNav";
import { useProfile } from "../../ProfileContext";

const BASE_URL = "http://172.20.10.4:5000";

export default function ChatListScreen({ navigation }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setHasPendingChats } = useProfile();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        console.log("🔍 Fetching chat list...");
        const token = await AsyncStorage.getItem("jwtToken");
        if (!token) {
          console.error("❌ No JWT token found!");
          setLoading(false);
          return;
        }

        const response = await fetch(`${BASE_URL}/api/chat/list`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const { chats } = await response.json();
          console.log("✅ Loaded chats:", chats);

          if (!chats || chats.length === 0) {
            console.log("ℹ️ No chats available.");
          }

          setChats(chats);

          const myId = await AsyncStorage.getItem("userId");
          const pending = chats.filter(
            (chat) => chat.status === "pending" && chat.actualReceiverId === myId
          );
          const hasPending = pending.length > 0;
          setHasPendingChats(hasPending);
          await AsyncStorage.setItem("hasPendingChats", JSON.stringify(hasPending));
        } else {
          console.error("❌ Failed to fetch chat list:", response.status);
        }
      } catch (error) {
        console.error("❌ Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChats();
  }, []);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => {
            if (!item.user || !item.user.name) {
              console.warn("⚠️ User data missing for chat:", item);
              return null;
            }

            const profilePic = item.user.photos?.[0]
              ? `${BASE_URL}/uploads/${item.user.photos[0]}`
              : null;

            return (
              <TouchableOpacity
                onPress={() => {
                  console.log(
                    `📩 Navigating to ChatScreen with receiverId: ${item.user.id}`
                  );

                  navigation.navigate("ChatScreen", {
                    receiverId: item.user.id,
                    receiverUsername: item.user.name,
                    chatId: item._id,
                    twilioChatChannelSid: item.twilioChatChannelSid,
                    chatStatus: item.status,
                    actualReceiverId: item.actualReceiverId,
                  });
                }}
                style={styles.chatItem}
              >
                <View style={styles.chatRow}>
                  {profilePic ? (
                    <Image source={{ uri: profilePic }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder} />
                  )}
                  <Text style={styles.chatName}>
                    {item.user.name || "Unknown User"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <View style={styles.bottomNavWrapper}>
        <BottomNav />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  chatItem: {
    padding: 15,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: "#eee",
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    backgroundColor: "#ddd",
  },
  chatName: { fontSize: 18, fontWeight: "600", color: "#333" },
  bottomNavWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
