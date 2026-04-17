import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from '@navigation/AppNavigator';
import Toast from '@components/ui/Toast';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <AppNavigator />
        <Toast />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}