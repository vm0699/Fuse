import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { ProfileContext } from '../../ProfileContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = "http://172.20.10.4:5000";

export default function PhotoUploadPage() {
  const navigation = useNavigation();
  const { profileData, updateProfileData } = useContext(ProfileContext);

  const initializePhotos = () => {
    if (profileData?.photos && Array.isArray(profileData.photos)) {
      const filled = [...profileData.photos];
      while (filled.length < 6) filled.push(null);
      return filled;
    }
    return Array(6).fill(null);
  };

  const [photos, setPhotos] = useState(initializePhotos);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Please enable gallery access.");
      }
    })();
  }, []);

  const handlePickPhoto = async (index) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        let updated = [...photos];
        updated[index] = result.assets[0].uri;
        setPhotos(updated);
        updateProfileData("photos", updated);
      }
    } catch (error) {
      console.error("❌ Photo picker error:", error);
    }
  };

  const handleSubmit = async () => {
    const filledPhotos = photos.filter(photo => photo !== null);
    if (filledPhotos.length < 4) {
      Alert.alert("Incomplete", "Please upload at least 4 photos.");
      return;
    }

    try {
      setUploading(true);
      const token = await AsyncStorage.getItem("jwtToken");
      const formData = new FormData();

      const phoneNumber = profileData.number;
      formData.append("phoneNumber", phoneNumber);

      filledPhotos.forEach((uri, i) => {
        const filename = uri.split('/').pop();
        const extMatch = /\.(\w+)$/.exec(filename ?? '');
        const type = extMatch ? `image/${extMatch[1]}` : `image`;

        formData.append("photos", {
          uri,
          name: filename,
          type,
        });
      });

      const uploadRes = await fetch(`${BASE_URL}/api/profile/upload-photos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const contentType = uploadRes.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const rawText = await uploadRes.text();
        console.error("🚨 Unexpected response:", rawText);
        throw new Error("Upload failed: Invalid server response.");
      }

      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadJson.message || "Upload failed");

      const uploadedPhotos = uploadJson.data.photos;
      updateProfileData("photos", uploadedPhotos);

      Alert.alert("Success", "Photos uploaded!");
      navigation.navigate("Guidelines");
    } catch (error) {
      console.error("❌ Upload Error:", error);
      Alert.alert("Error", error.message || "Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add at least 4 great photos</Text>
      <Text style={styles.description}>Whether it’s you with your pet, doing what you love, or at your favorite place — let your photos talk!</Text>

      <View style={styles.grid}>
        {photos.map((photo, index) => (
          <TouchableOpacity
            key={index}
            style={styles.photoBox}
            onPress={() => handlePickPhoto(index)}
          >
            {photo ? (
              <Image source={{ uri: photo }} style={styles.image} />
            ) : (
              <Text style={styles.placeholder}>+</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {uploading && <ActivityIndicator size="large" color="#e60f3f" style={{ marginTop: 16 }} />}

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: photos.filter(p => p !== null).length >= 4 ? "#e60f3f" : "#ccc" }]}
        disabled={photos.filter(p => p !== null).length < 4}
        onPress={handleSubmit}
      >
        <Text style={styles.submitText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  description: { fontSize: 14, color: "#555", marginBottom: 20 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  photoBox: {
    width: 100,
    height: 100,
    backgroundColor: "#eee",
    borderRadius: 10,
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  image: { width: "100%", height: "100%", borderRadius: 10 },
  placeholder: { fontSize: 32, color: "#aaa" },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  submitText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
});
