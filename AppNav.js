import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ProfileProvider } from "./ProfileContext";

// Auth + Onboarding
import Login from "./app/screens/Login";
import PhoneVerif from "./app/screens/PhoneVerif";
import CodeVerif from "./app/screens/CodeVerif";
import Intro from "./app/screens/Intro";
import ProfileSetup from "./app/screens/ProfileSetup";
import ProfileDetails from "./app/screens/ProfileDetails";
import PromptSelection from "./app/screens/PromptSelection";
import PhotoUpload from "./app/screens/PhotoUpload";
import Guidelines from "./app/screens/Guidelines";

// Main App Screens
import Home from "./app/screens/Home";
import Profile from "./app/screens/ProfileMain";
import SwipeView from "./app/screens/SwipeView";
import SettingsScreen from "./app/screens/Settings";

// Chats & Video
import ChatInitiateScreen from "./app/screens/ChatInitiateScreen";
import ChatListScreen from "./app/screens/ChatListScreen";
import ChatScreen from "./app/screens/ChatScreen";
import NotificationSettings from "./app/screens/NotificationSettings";
import SecuritySettings from "./app/screens/SecuritySettings";
import VideoCallScreen from "./app/screens/VideoCallScreen";
import VideoInitiateScreen from "./app/screens/VideoInitiateScreen";
import WaitingScreen from "./app/screens/WaitingScreen";

// Profile Update Screens
import UpdateProfilePage from "./app/screens/UpdateProfilePage";
import PronounsScreen from "./app/screens/PronounScreen";
import DatingIntentionsScreen from "./app/screens/DatingIntentions";
import PoliticsScreen from "./app/screens/Politics";
import ReligionScreen from "./app/screens/Religion";
import SexualityScreen from "./app/screens/SexualityScreen";
import WorkScreen from "./app/screens/Work";
import LanguagesScreen from "./app/screens/Languages";
import JobScreen from "./app/screens/JobTitle";
import HomeTownScreen from "./app/screens/HomeTown";
import EduLevelScreen from "./app/screens/EduLevel";
import CollegeScreen from "./app/screens/College";
import InterestsScreen from "./app/screens/Interests";

// Newly Added Screens
import EthnicityScreen from "./app/screens/EthnicityScreen";
import ChildrenScreen from "./app/screens/ChildrenScreen";
import PetsScreen from "./app/screens/PetsScreen";
import ZodiacScreen from "./app/screens/ZodiacSignScreen";
import DrinkingScreen from "./app/screens/DrinkingScreen";
import SmokingScreen from "./app/screens/SmokingScreen";
import MarijuanaScreen from "./app/screens/MarijuanaScreen";
import DrugsScreen from "./app/screens/DrugsScreen";

import FilterScreen from "./app/screens/FilterScreen";
import NewAdmirersScreen from "./app/screens/NewAdmirersScreen";
import NewMatchesScreen from "./app/screens/NewMatches";
import NewMessagesScreen from "./app/screens/NewMessages";
import ContactFAQScreen from "./app/screens/ContactFAQ";
import LikedYouScreen from "./app/screens/LikedYouScreen";

import VideoAutoplaySettingsScreen from "./app/screens/VideoAutoplaySettingsScreen";
import PrivacySettingsScreen from "./app/screens/PrivacySettingsScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <ProfileProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
          <Stack.Screen name="PhoneVerif" component={PhoneVerif} />
          <Stack.Screen name="CodeVerif" component={CodeVerif} />
          <Stack.Screen name="Intro" component={Intro} />
          <Stack.Screen name="ProfileSetup" component={ProfileSetup} />
          <Stack.Screen name="ProfileDetails" component={ProfileDetails} />
          <Stack.Screen name="PromptSelection" component={PromptSelection} />
          <Stack.Screen name="PhotoUpload" component={PhotoUpload} />
          <Stack.Screen name="Guidelines" component={Guidelines} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="SwipeView" component={SwipeView} options={{ headerShown: false }} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="ChatInitiateScreen" component={ChatInitiateScreen} />
          <Stack.Screen name="ChatListScreen" component={ChatListScreen} />
          <Stack.Screen name="ChatScreen" component={ChatScreen} />
          <Stack.Screen name="NotificationSettings" component={NotificationSettings} />
          <Stack.Screen name="SecuritySettings" component={SecuritySettings} />
          <Stack.Screen name="VideoCallScreen" component={VideoCallScreen} />
          <Stack.Screen name="VideoInitiateScreen" component={VideoInitiateScreen} />
          <Stack.Screen name="WaitingScreen" component={WaitingScreen} />

          {/* Profile Edit Screens */}
          <Stack.Screen name="UpdateProfilePage" component={UpdateProfilePage} />
          <Stack.Screen name="PronounsScreen" component={PronounsScreen} />
          <Stack.Screen name="College" component={CollegeScreen} />
          <Stack.Screen name="DatingIntentions" component={DatingIntentionsScreen} />
          <Stack.Screen name="EduLevel" component={EduLevelScreen} />
          <Stack.Screen name="HomeTown" component={HomeTownScreen} />
          <Stack.Screen name="JobTitle" component={JobScreen} />
          <Stack.Screen name="Languages" component={LanguagesScreen} />
          <Stack.Screen name="Politics" component={PoliticsScreen} />
          <Stack.Screen name="Religion" component={ReligionScreen} />
          <Stack.Screen name="SexualityScreen" component={SexualityScreen} />
          <Stack.Screen name="Work" component={WorkScreen} />
          <Stack.Screen name="Interests" component={InterestsScreen} />

          {/* Newly Added Fields */}
          <Stack.Screen name="Ethnicity" component={EthnicityScreen} />
          <Stack.Screen name="Children" component={ChildrenScreen} />
          <Stack.Screen name="Pets" component={PetsScreen} />
          <Stack.Screen name="Zodiac" component={ZodiacScreen} />
          <Stack.Screen name="Drinking" component={DrinkingScreen} />
          <Stack.Screen name="Smoking" component={SmokingScreen} />
          <Stack.Screen name="Marijuana" component={MarijuanaScreen} />
          <Stack.Screen name="Drugs" component={DrugsScreen} />

          <Stack.Screen name="FilterScreen" component={FilterScreen} />
          <Stack.Screen name="New Admirers" component={NewAdmirersScreen} />
          <Stack.Screen name="New Matches" component={NewMatchesScreen} />
          <Stack.Screen name="New Messages" component={NewMessagesScreen} />
          <Stack.Screen name="Contact FAQ" component={ContactFAQScreen} />
          <Stack.Screen name="Liked You" component={LikedYouScreen} />
          <Stack.Screen name="Video Autoplay" component={VideoAutoplaySettingsScreen} />
          <Stack.Screen name="Privacy Settings" component={PrivacySettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ProfileProvider>
  );
}
