import React from 'react';
import { registerRootComponent } from 'expo';
import AppNavigator from './AppNav'; // Your navigator file
import 'react-native-reanimated';


export default function App() {
  return <AppNavigator />;
}

registerRootComponent(App);
