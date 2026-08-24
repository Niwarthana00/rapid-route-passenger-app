import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, Alert, Linking, LogBox } from 'react-native';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

LogBox.ignoreLogs([
  'expo-notifications',
  'Android Push notification',
  'expo-notifications: Android Push',
  '`expo-notifications` functionality is not fully supported in Expo Go',
]);

import { AnimatedSplashOverlay } from '../components/animated-icon';
import { OnboardingOverlay } from '../components/onboarding';
import { LoginOverlay } from '../components/login';
import AppTabs from '../components/app-tabs';
import { TabBarProvider, useTabBar } from '../context/tab-bar-context';
import { AuthProvider, useAuth } from '../context/auth-context';

SplashScreen.preventAutoHideAsync();

function AppFlowContent() {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const { user, isLoading } = useAuth();
  const { setTabBarVisible } = useTabBar();

  const isLoggedIn = !!user;

  // Hide bottom navigation bar during Splash, Onboarding, Login, and Signup
  useEffect(() => {
    if (!isOnboarded || !isLoggedIn) {
      setTabBarVisible(false);
    } else {
      setTabBarVisible(true);
    }
  }, [isOnboarded, isLoggedIn, setTabBarVisible]);

  // If the user is already logged in, they must have already completed onboarding
  useEffect(() => {
    if (isLoggedIn) {
      setIsOnboarded(true);
    }
  }, [isLoggedIn]);



  return (
    <>
      {/* App main tabs */}
      <AppTabs />

      {/* Full-screen initial overlays (Splash, Onboarding, Login/Signup) */}
      <AnimatedSplashOverlay />

      {!isOnboarded && !isLoggedIn && !isLoading && (
        <OnboardingOverlay onFinish={() => setIsOnboarded(true)} />
      )}

      {isOnboarded && !isLoggedIn && !isLoading && (
        <LoginOverlay onLoginSuccess={() => {}} />
      )}
    </>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <TabBarProvider>
          <AppFlowContent />
        </TabBarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
