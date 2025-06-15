import React, { useEffect, useState, useRef } from "react";
import { View, Text, ActivityIndicator, Button, StyleSheet, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import io from "socket.io-client";

const NGROK_SERVER_URL = "https://8822-2401-4900-7b9a-3af-2dca-5527-1364-b457.ngrok-free.app"; 
const SOCKET_SERVER = "wss://8822-2401-4900-7b9a-3af-2dca-5527-1364-b457.ngrok-free.app"; 

export default function WaitingScreen() {
  const navigation = useNavigation();
  const { userId, interests } = useRoute().params;
  const socket = useRef(null);
  const [waiting, setWaiting] = useState(true);
  const [matchedInterest, setMatchedInterest] = useState("");

  useEffect(() => {
    if (!userId || !interests) {
      console.error("❌ Missing userId or interests, going back...");
      return navigation.goBack();
    }

    console.log("🔹 Attempting WebSocket connection to:", SOCKET_SERVER);

    socket.current = io(SOCKET_SERVER, {
      path: "/socket.io",    // ✅ Mandatory for ngrok+socket.io
      transports: ["websocket"],
      forceNew: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.current.on("connect", () => {
      console.log("✅ WebSocket Connected:", socket.current.id);
      socket.current.emit("join_video_queue", { userId, interests });
    });

    socket.current.on("match_found", async ({ matchedUserId, room, matchedInterest }) => {
      setWaiting(false);
      if (matchedInterest) setMatchedInterest(matchedInterest);

      console.log(`✅ Match found: ${matchedUserId} in Room: ${room}`);

      const token = await fetchTwilioToken(userId, room);
      if (!token) {
        console.error("❌ Failed to fetch Twilio Token.");
        Alert.alert("Error", "Failed to generate video token.");
        return;
      }

      navigation.replace("VideoCallScreen", {
        userId,
        matchedUserId,
        room,
        twilioToken: token,
      });
    });

    socket.current.on("disconnect", () => {
      console.log("❌ WebSocket Disconnected:", socket.current.id);
    });

    socket.current.on("connect_error", (err) => {
      console.error("❌ WebSocket Connection Error:", err);
    });

    // Timeout if no match
    const timeout = setTimeout(() => {
      if (waiting) {
        Alert.alert("No match found", "Please try again in a few minutes.");
        navigation.goBack();
      }
    }, 60000);

    return () => {
      clearTimeout(timeout);
      if (socket.current) {
        socket.current.off("match_found");
        socket.current.off("disconnect");
        socket.current.disconnect();
        console.log("🧹 Cleaned up WebSocket listeners on unmount");
      }
    };
  }, []);

  const fetchTwilioToken = async (userId, room) => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");

      console.log("📤 Sending Twilio Token Request:", { identity: userId, room });

      const response = await fetch(`${NGROK_SERVER_URL}/api/video/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ identity: userId, room }),
      });

      const data = await response.json();
      console.log("📥 Twilio Token Response:", data);

      if (data.success) {
        return data.token;
      } else {
        console.error("❌ Failed to fetch token:", data.message);
        return null;
      }
    } catch (error) {
      console.error("❌ Token Fetch Error:", error);
      return null;
    }
  };

  return (
    <View style={styles.container}>
      {waiting ? (
        <>
          <Text style={styles.heading}>Searching for a match...</Text>
          <ActivityIndicator size="large" color="#007AFF" />
        </>
      ) : (
        <>
          <Text style={styles.heading}>Match Found! Connecting...</Text>
          {matchedInterest ? (
            <Text style={styles.subtext}>
              Matched on: <Text style={{ fontWeight: "bold" }}>{matchedInterest}</Text>
            </Text>
          ) : null}
        </>
      )}

      <Button
        title="Cancel"
        onPress={() => navigation.goBack()}
        color="red"
        disabled={!waiting}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#222",
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
    textAlign: "center",
  },
  subtext: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 20,
    textAlign: "center",
  },
});
