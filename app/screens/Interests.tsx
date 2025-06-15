import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const interestsData = {
  "Self-care": [
    "🕯️ Aromatherapy", "🌠 Astrology", "❄️ Cold plunging", "💎 Crystals",
    "💬 Deep chats", "✍ Journalling", "🧠 Mindfulness", "🥦 Nutrition"
  ],
  Sports: [
    "🤸‍♂️ Gym", "🏈 American football", "🏊 Athletics", "🏋️ Badminton",
    "⚾ Baseball", "🏀 Basketball", "💪 Bodybuilding", "🧓 Bouldering"
  ],
  Creativity: [
    "🎨 Art", "🔊 Crafts", "🧾 Crocheting", "💃 Dancing",
    "🖊️ Design", "🖋️ Drawing", "👗 Fashion", "🧵 Knitting"
  ],
  "Going out": [
    "🍻 Bars", "☕️ Cafe-hopping", "🏆 Drag shows", "🎉 Festivals",
    "🍿 Films", "🎟 Gigs", "👩‍🎤 Improv", "🎤 Karaoke"
  ],
  "Staying in": [
    "🤖 AI", "🍰 Baking", "🎲 Board games", "♘ Chess",
    "🍽️ Cooking", "🌱 Gardening", "🌿 House plants", "🎙️ Podcasts"
  ],
  "Film and TV": [
    "📺 Action & adventure", "📺 Animated", "📺 Anime", "📺 Bollywood",
    "📺 Comedy", "📺 Cooking shows", "📺 Crime", "📺 Documentaries"
  ],
  Reading: [
    "📖 Action & adventure", "📖 Biographies", "📖 Classics",
    "📖 Comedy", "📖 Comic books", "📖 Crime", "📖 Fantasy", "📖 History"
  ],
  Music: [
    "🎵 Afro", "🎵 Arab", "🎵 Blues", "🎵 Classical",
    "🎵 Country", "🎵 Desi", "🎵 EDM", "🎵 Electronic"
  ],
  "Food and drink": [
    "🍺 Beer", "🍗 BBQ", "🍟 Biryani", "🧋 Boba tea",
    "🍔 Burgers", "🍰 Cake", "🍸 Cocktails", "🍹 Cocktails"
  ],
  Travelling: [
    "🌆 City breaks", "🚵 Backpacking", "🏖️ Beaches", "🏕️ Camping",
    "🏡 Country escapes", "🎣 Fishing trips", "🏔 Hiking trips", "🚌 Road trips"
  ]
};

export default function InterestsScreen() {
  const navigation = useNavigation();
  const [selected, setSelected] = useState<string[]>([]);

  const toggleSelect = (item: string) => {
    setSelected((prev) => {
      if (prev.includes(item)) {
        return prev.filter((i) => i !== item);
      } else if (prev.length < 5) {
        return [...prev, item];
      } else {
        Alert.alert("Limit Reached", "You can select up to 5 interests only.");
        return prev;
      }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Interests</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.done}>Done</Text>
        </TouchableOpacity>
      </View>

      {Object.entries(interestsData).map(([category, items]) => (
        <View key={category} style={styles.section}>
          <Text style={styles.category}>{category}</Text>
          <View style={styles.grid}>
            {items.map((item) => {
              const isSelected = selected.includes(item);
              return (
                <TouchableOpacity
                  key={item}
                  onPress={() => toggleSelect(item)}
                  style={[styles.chip, isSelected && styles.selectedChip]}
                >
                  <Text style={[styles.chipText, isSelected && styles.selectedText]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  back: { color: "#6B21A8", fontWeight: "600" },
  done: { color: "#6B21A8", fontWeight: "600" },
  title: { fontSize: 20, fontWeight: "bold" },
  section: { padding: 16 },
  category: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#111827",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  chipText: { fontSize: 16, color: "#111" },
  selectedChip: { backgroundColor: "#FACC15" },
  selectedText: { fontWeight: "bold" },
});
