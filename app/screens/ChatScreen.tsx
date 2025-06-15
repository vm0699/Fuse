import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Client as TwilioChatClient } from "twilio-chat";
import { useNavigation } from "@react-navigation/native";

const BASE_URL = "http://172.20.10.4:5000";

const datingTips = [
  "✨ Compliment something specific, not generic.",
  "💬 Ask open-ended questions, not just 'Hey!'",
  "🎯 Be yourself, not a highlight reel.",
  "⏳ Good things take time—like this chat loading!",
  "☺️ Keep it light, kind, and respectful.",
];

export default function ChatScreen({ route }) {
  const {
    receiverId,
    receiverUsername,
    twilioChatChannelSid,
    chatId,
    chatStatus,
    actualReceiverId,
  } = route.params;

  const navigation = useNavigation();
  const [twilioToken, setTwilioToken] = useState(null);
  const [client, setClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState(chatStatus);
  const [isReceiver, setIsReceiver] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    const init = async () => {
      await fetchUserData();
      await fetchTwilioToken();
    };
    init();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prevIndex) => (prevIndex + 1) % datingTips.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchUserData = async () => {
    const storedUserId = await AsyncStorage.getItem("userId");
    const storedUsername = await AsyncStorage.getItem("username");
    setUserId(storedUserId);
    setUsername(storedUsername);

    if (actualReceiverId && storedUserId === actualReceiverId) {
      setIsReceiver(true);
    }
  };

  const fetchTwilioToken = async () => {
    try {
      const jwtToken = await AsyncStorage.getItem("jwtToken");
      if (!jwtToken) return;

      const response = await fetch(`${BASE_URL}/api/chat/twilio-token`, {
        method: "GET",
        headers: { Authorization: `Bearer ${jwtToken}` },
      });

      const data = await response.json();
      if (response.ok && data.token) setTwilioToken(data.token);
    } catch (error) {
      console.error("❌ Fetch Twilio Token Error:", error);
    }
  };

  useEffect(() => {
    if (!twilioToken) return;

    const initTwilioClient = async () => {
      try {
        if (client) return;
        const twilioClient = await TwilioChatClient.create(twilioToken);
        setClient(twilioClient);

        const chatChannel = await twilioClient.getChannelBySid(twilioChatChannelSid);
        setChannel(chatChannel);

        if (chatChannel.status !== "joined") await chatChannel.join();

        chatChannel.on("messageAdded", (message) => setMessages((prev) => [...prev, message]));

        const messagesPage = await chatChannel.getMessages();
        setMessages(messagesPage.items);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error initializing Twilio client:", error);
      }
    };

    initTwilioClient();

    return () => {
      if (client) {
        client.shutdown();
        setClient(null);
      }
    };
  }, [twilioToken]);

  const sendMessage = async () => {
    if (status !== "accepted") {
      Alert.alert("Chat Locked", "The recipient hasn't accepted the chat yet.");
      return;
    }

    if (!channel || !message.trim()) return;

    try {
      await channel.sendMessage(message);
      setMessage("");
    } catch (error) {
      console.error("❌ Error sending message:", error);
      Alert.alert("Error", "Failed to send message.");
    }
  };

  const handleAccept = async () => {
    try {
      const jwtToken = await AsyncStorage.getItem("jwtToken");
      if (!jwtToken) return;

      const response = await fetch(`${BASE_URL}/api/chat/handle-chat-request`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ chatId, action: "accept" }),
      });

      const contentType = response.headers.get("content-type");

      if (!response.ok) {
        let errorMsg = "Failed to accept chat.";
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMsg = errorData.message || errorMsg;
        }
        Alert.alert("Error", errorMsg);
        return;
      }

      const result = await response.json();
      Alert.alert("Success", "Chat accepted!");
      setStatus("accepted");
    } catch (error) {
      console.error("❌ Accept Chat Error:", error);
      Alert.alert("Error", "Something went wrong while accepting the chat.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={80}
    >
      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.tipText}>{datingTips[tipIndex]}</Text>
        </View>
      </Modal>

      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>◄</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerText}>{receiverUsername || "Chat"}</Text>
          </View>
        </View>

        {status !== "accepted" && isReceiver && (
          <View style={styles.lockedBanner}>
            <Text style={styles.lockedText}>🔒 Chat request pending. Accept to start messaging.</Text>
            <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
              <Text style={styles.acceptText}>Accept Chat</Text>
            </TouchableOpacity>
          </View>
        )}

        <FlatList
          data={messages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => {
            const isMyMessage = item.author === username;
            return (
              <View
                style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.theirMessage]}
              >
                <Text style={styles.username}>
                  {isMyMessage ? username || "You" : receiverUsername || "User"}
                </Text>
                <Text style={styles.messageText}>{item.body}</Text>
              </View>
            );
          }}
        />

        <View style={styles.inputContainer}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Type a message..."
            style={styles.input}
            editable={status === "accepted"}
          />
          <TouchableOpacity
            onPress={sendMessage}
            style={styles.sendButton}
            disabled={status !== "accepted"}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#ff5864",
    position: "relative",
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  tipText: {
    marginTop: 20,
    fontSize: 16,
    color: "#fff",
    textAlign: "center",
    fontStyle: "italic",
  },
  backButton: {
    zIndex: 2,
  },
  backButtonText: {
    fontSize: 24,
    color: "#fff",
  },
  headerCenter: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  messageBubble: {
    padding: 12,
    margin: 8,
    borderRadius: 20,
    maxWidth: "75%",
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#ff5864",
  },
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  username: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
    color: "#555",
  },
  messageText: {
    fontSize: 16,
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  input: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
  },
  sendButton: {
    marginLeft: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#ff5864",
    borderRadius: 25,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  lockedBanner: {
    backgroundColor: "#fff3cd",
    padding: 12,
    alignItems: "center",
    borderBottomWidth: 1,
    borderColor: "#ffeeba",
  },
  lockedText: {
    color: "#856404",
    fontWeight: "600",
    marginBottom: 8,
  },
  acceptButton: {
    backgroundColor: "#28a745",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  acceptText: {
    color: "#fff",
    fontWeight: "600",
  },
});
