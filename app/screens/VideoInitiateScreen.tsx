import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera } from "expo-camera";
import { PermissionsAndroid } from "react-native";
import { BottomNav } from "../../components/BottomNav";

export default function VideoInitiateScreen() {
  const [interests, setInterests] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("jwtToken");
      if (storedUserId) {
        setUserId(storedUserId);
      } else {
        navigation.navigate("LoginScreen");
      }
    };
    fetchUserId();
  }, []);

  const requestPermissions = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    if (Platform.OS === "android") {
      const audioPermission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      return (
        status === "granted" &&
        audioPermission === PermissionsAndroid.RESULTS.GRANTED
      );
    }
    return status === "granted";
  };

  const handleStartCall = async () => {
    const trimmed = interests.trim();
    if (!trimmed || !userId) {
      Alert.alert("Error", "Please enter interests and ensure you're logged in.");
      return;
    }

    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      Alert.alert(
        "Permission Denied",
        "Camera and Microphone access are required to start a video call."
      );
      return;
    }

    const interestsArray = trimmed
      .toLowerCase()
      .split(",")
      .map((i) => i.trim())
      .filter(Boolean);

    navigation.navigate("WaitingScreen", {
      userId,
      interests: interestsArray,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.heading}>Enter Interests</Text>

          <TextInput
            style={styles.input}
            placeholder="e.g., movies, fitness, travel"
            value={interests}
            onChangeText={setInterests}
            autoCapitalize="none"
            autoCorrect={false}
            multiline
          />

          <View style={styles.buttonWrapper}>
            <Button title="Start Video Call" onPress={handleStartCall} />
          </View>

          {/* ✅ Bottom Navigation */}
          <View style={styles.bottomNavWrapper}>
            <BottomNav />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  buttonWrapper: {
    marginBottom: 60,
  },
  bottomNavWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
