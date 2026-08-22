import { version } from 'expo/package.json';
import { Image } from 'expo-image';
import { StyleSheet, View, useColorScheme } from 'react-native';

import { ExternalLink } from './external-link';
import { ThemedText } from './themed-text';
import { Spacing } from '../constants/theme';

export function WebBadge() {
  const scheme = useColorScheme();

  return (
    <View style={styles.container}>
      <ThemedText type="code" themeColor="textSecondary" style={styles.versionText}>
        v{version}
      </ThemedText>
      <ExternalLink href="https://expo.dev">
        <Image
          source={
            scheme === 'dark'
              ? require('../../assets/images/expo-badge-white.png')
              : require('../../assets/images/expo-badge.png')
          }
          style={styles.badgeImage}
        />
      </ExternalLink>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: Spacing.two,
    padding: Spacing.five,
  },
  versionText: {
    textAlign: 'center',
  },
  badgeImage: {
    width: 123,
    aspectRatio: 123 / 24,
  },
});
