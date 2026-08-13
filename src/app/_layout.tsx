import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { useState } from 'react';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { OnboardingOverlay } from '@/components/onboarding';
import { LoginOverlay } from '@/components/login';
import AppTabs from '@/components/app-tabs';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      {!isOnboarded && (
        <OnboardingOverlay onFinish={() => setIsOnboarded(true)} />
      )}
      {isOnboarded && !isLoggedIn && (
        <LoginOverlay onLoginSuccess={() => setIsLoggedIn(true)} />
      )}
      <AppTabs />
    </ThemeProvider>
  );
}
