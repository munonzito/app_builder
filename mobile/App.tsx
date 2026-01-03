import React, { useCallback } from 'react';
import { StatusBar, View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { JetBrainsMono_400Regular, JetBrainsMono_700Bold } from '@expo-google-fonts/jetbrains-mono';
import * as SplashScreen from 'expo-splash-screen';

import { AuthProvider, ProjectProvider } from './src/providers';
import {
  AuthScreen,
  HomeScreen,
  BuilderScreen,
  ProjectListScreen,
  TemplatesScreen,
  SettingsScreen,
  LoginScreen,
  RegisterScreen,
  ForgotPasswordScreen,
  OnboardingScreen,
  RuntimePreviewScreen,
} from './src/screens';
import { AppColors } from './src/utils/styles';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Auth"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: AppColors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Builder" component={BuilderScreen} />
      <Stack.Screen name="Projects" component={ProjectListScreen} />
      <Stack.Screen name="Templates" component={TemplatesScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen 
        name="RuntimePreview" 
        component={RuntimePreviewScreen}
        options={{
          animation: 'fade',
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_700Bold,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider onLayout={onLayoutRootView}>
      <StatusBar barStyle="light-content" backgroundColor={AppColors.background} />
      <AuthProvider>
        <ProjectProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </ProjectProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: AppColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
