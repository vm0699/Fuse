import React, { useState, useContext } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Input } from './Input'; // Custom Input component
import { SelectableTag } from '../../components/SelectableTag'; // Custom SelectableTag component
import { CircularNextButton } from '../../components/CircularNextButton'; // Custom CircularNextButton component
import { useProfile } from '../../ProfileContext'; // Use the custom hook for ProfileContext

const HEIGHTS = Array.from({ length: 101 }, (_, i) => 120 + i);

const INTERESTS = [
  { emoji: '🌆', label: 'City breaks' },
  { emoji: '⛺️', label: 'Camping' },
  { emoji: '🎵', label: 'Country' },
  { emoji: '🏳️‍🌈', label: 'LGBTQ+ rights' },
  { emoji: '🥦', label: 'Vegetarian' },
  { emoji: '🎫', label: 'Gigs' },
  { emoji: '🌱', label: 'Gardening' },
  { emoji: '🐕', label: 'Dogs' },
  { emoji: '☕️', label: 'Coffee' },
  { emoji: '🎪', label: 'Festivals' },
  { emoji: '🏔️', label: 'Hiking trips' },
  { emoji: '🎵', label: 'R&B' },
  { emoji: '🧶', label: 'Crafts' },
  { emoji: '💃', label: 'Dancing' },
  { emoji: '✍️', label: 'Writing' },
  { emoji: '🧘‍♀️', label: 'Yoga' },
];

const VALUES = [
  'Ambition', 'Confidence', 'Empathy', 'Generosity', 'Humour',
  'Kindness', 'Openness', 'Optimism', 'Playfulness', 'Sassiness',
  'Leadership', 'Curiosity', 'Gratitude', 'Humility', 'Loyalty',
  'Sarcasm', 'Emotional intelligence',
];

export default function ProfileDetailsPage({ navigation }) {
  const { profileData, updateNestedProfileData } = useProfile(); // Access profile data and updater functions
  const { profileDetails } = profileData; // Destructure profile details

  const [height, setHeight] = useState(profileDetails.height || 168);
  const [selectedInterests, setSelectedInterests] = useState(profileDetails.interests || []);
  const [selectedValues, setSelectedValues] = useState(profileDetails.values || []);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredInterests = INTERESTS.filter((interest) =>
    interest.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) => {
      if (prev.includes(interest)) {
        return prev.filter((i) => i !== interest);
      }
      if (prev.length >= 5) return prev;
      return [...prev, interest];
    });
  };

  const toggleValue = (value) => {
    setSelectedValues((prev) => {
      if (prev.includes(value)) {
        return prev.filter((v) => v !== value);
      }
      if (prev.length >= 3) return prev;
      return [...prev, value];
    });
  };

  const isComplete = height && selectedInterests.length > 0 && selectedValues.length > 0;

  const handleNext = () => {
    // Update the profile details in the context
    updateNestedProfileData('profileDetails', 'height', height);
    updateNestedProfileData('profileDetails', 'interests', selectedInterests);
    updateNestedProfileData('profileDetails', 'values', selectedValues);

    navigation.navigate('PromptSelection');
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Now, let's talk about you</Text>
          <Text style={styles.subtitle}>
            Let's get the small talk out of the way. We'll get into the deep and meaningful later.
          </Text>
        </View>

        {/* Height Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your height</Text>
          <ScrollView style={styles.heightScroll}>
            {HEIGHTS.map((h) => (
              <TouchableOpacity
                key={h}
                onPress={() => setHeight(h)}
                style={[
                  styles.heightOption,
                  height === h && styles.heightOptionSelected,
                ]}
              >
                <Text
                  style={[
                    styles.heightText,
                    height === h && styles.heightTextSelected,
                  ]}
                >
                  {h} cm
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Interests Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose 5 things you're really into</Text>
          <TextInput
            style={styles.input}
            placeholder="What are you into?"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          <View style={styles.tagContainer}>
            {filteredInterests.map((interest) => (
              <SelectableTag
                key={interest.label}
                selected={selectedInterests.includes(interest.label)}
                onPress={() => toggleInterest(interest.label)}
                disabled={
                  selectedInterests.length >= 5 &&
                  !selectedInterests.includes(interest.label)
                }
              >
                {interest.emoji} {interest.label}
              </SelectableTag>
            ))}
          </View>
          <Text style={styles.counter}>{selectedInterests.length}/5 selected</Text>
        </View>

        {/* Values Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tell us what you value in a person</Text>
          <View style={styles.tagContainer}>
            {VALUES.map((value) => (
              <SelectableTag
                key={value}
                selected={selectedValues.includes(value)}
                onPress={() => toggleValue(value)}
                disabled={
                  selectedValues.length >= 3 && !selectedValues.includes(value)
                }
              >
                {value}
              </SelectableTag>
            ))}
          </View>
          <Text style={styles.counter}>{selectedValues.length}/3 selected</Text>
        </View>
      </ScrollView>

      {/* Next Button */}
      <CircularNextButton
        disabled={!isComplete}
        onPress={handleNext} // Save to context and navigate
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  heightScroll: {
    maxHeight: 200,
  },
  heightOption: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  heightOptionSelected: {
    backgroundColor: '#eee',
  },
  heightText: {
    color: '#666',
  },
  heightTextSelected: {
    fontWeight: 'bold',
    color: '#000',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  counter: {
    marginTop: 10,
    color: '#666',
  },
});
