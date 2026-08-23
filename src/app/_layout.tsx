import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, Alert, Linking } from 'react-native';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

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

  // Request location permission immediately after successful login/registration transition
  useEffect(() => {
    if (isLoggedIn) {
      (async () => {
        try {
          // 1. Check if Location Services (GPS) are physically turned on in the device settings
          const isServicesEnabled = await Location.hasServicesEnabledAsync();
          if (!isServicesEnabled) {
            Alert.alert(
              'Location Services Disabled',
              'Your device\'s GPS / Location services are turned off. Please enable GPS Location in your phone settings to find nearby routes.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Settings', onPress: () => Linking.openSettings() }
              ]
            );
          }

          // 2. Check and request app foreground location permissions
          const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
          let finalStatus = existingStatus;

          if (existingStatus !== 'granted') {
            const { status } = await Location.requestForegroundPermissionsAsync();
            finalStatus = status;
          }

          if (finalStatus !== 'granted') {
            Alert.alert(
              'Location Access Required',
              'Rapid Route needs location permissions to find and display nearby bus routes in real-time. Please enable location permissions in settings.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Settings', onPress: () => Linking.openSettings() }
              ]
            );
          }
        } catch (error) {
          console.warn('[Location] Permission check failed:', error);
        }
      })();
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
