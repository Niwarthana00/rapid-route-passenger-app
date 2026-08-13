import { Image } from 'expo-image';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { Keyframe, Easing } from 'react-native-reanimated';
import { useState, useEffect } from 'react';

import classes from './animated-icon.module.css';
const DURATION = 600;

export function AnimatedSplashOverlay() {
  const [animate, setAnimate] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Show custom splash screen for 2.5 seconds, then trigger exit animation
    const animTimer = setTimeout(() => {
      setAnimate(true);
    }, 2500);

    // Completely unmount the splash screen after the exit animation finishes
    const unmountTimer = setTimeout(() => {
      setVisible(false);
    }, 2500 + DURATION);

    return () => {
      clearTimeout(animTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (!visible) return null;

  const splashKeyframe = new Keyframe({
    0: {
      opacity: 1,
      transform: [{ scale: 1 }],
    },
    100: {
      opacity: 0,
      transform: [{ scale: 1.05 }],
    },
  });

  const content = (
    <View style={styles.splashContent}>
      {/* Circle Badge with Bus Icon */}
      <View style={styles.badgeContainer}>
        <View style={styles.busContainer}>
          {/* Windshield */}
          <View style={styles.windshieldContainer}>
            <View style={styles.window} />
            <View style={styles.window} />
          </View>
          
          {/* Divider line */}
          <View style={styles.busDivider} />
          
          {/* Headlights and Grill */}
          <View style={styles.grillContainer}>
            <View style={styles.headlight} />
            <View style={styles.grillLine} />
            <View style={styles.headlight} />
          </View>
          
          {/* Wheels */}
          <View style={styles.wheelLeft} />
          <View style={styles.wheelRight} />
        </View>
      </View>

      {/* Brand Title */}
      <Text style={styles.brandTitle}>Rapid Route</Text>
      
      {/* Subtitle */}
      <Text style={styles.brandSubtitle}>Know before you go</Text>
    </View>
  );

  return animate ? (
    <Animated.View
      entering={splashKeyframe.duration(DURATION)}
      style={styles.splashOverlay}>
      {content}
    </Animated.View>
  ) : (
    <View style={styles.splashOverlay}>
      {content}
    </View>
  );
}

const keyframe = new Keyframe({
  0: {
    transform: [{ scale: 0 }],
  },
  60: {
    transform: [{ scale: 1.2 }],
    easing: Easing.elastic(1.2),
  },
  100: {
    transform: [{ scale: 1 }],
    easing: Easing.elastic(1.2),
  },
});

const logoKeyframe = new Keyframe({
  0: {
    opacity: 0,
  },
  60: {
    transform: [{ scale: 1.2 }],
    opacity: 0,
    easing: Easing.elastic(1.2),
  },
  100: {
    transform: [{ scale: 1 }],
    opacity: 1,
    easing: Easing.elastic(1.2),
  },
});

const glowKeyframe = new Keyframe({
  0: {
    transform: [{ rotateZ: '-180deg' }, { scale: 0.8 }],
    opacity: 0,
  },
  [300 / 1000]: {
    transform: [{ rotateZ: '0deg' }, { scale: 1 }],
    opacity: 1,
    easing: Easing.elastic(0.7),
  },
  100: {
    transform: [{ rotateZ: '7200deg' }],
  },
});

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View entering={glowKeyframe.duration(60 * 1000 * 4)} style={styles.glow}>
        <Image style={styles.glow} source={require('@/assets/images/logo-glow.png')} />
      </Animated.View>

      <Animated.View style={styles.background} entering={keyframe.duration(300)}>
        <div className={classes.expoLogoBackground} />
      </Animated.View>

      <Animated.View style={styles.imageContainer} entering={logoKeyframe.duration(300)}>
        <Image style={styles.image} source={require('@/assets/images/expo-logo.png')} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: '100%',
    zIndex: 1000,
    position: 'absolute',
    top: 128 / 2 + 138,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    width: 201,
    height: 201,
    position: 'absolute',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
  },
  image: {
    position: 'absolute',
    width: 76,
    height: 71,
  },
  background: {
    width: 128,
    height: 128,
    position: 'absolute',
  },
  splashOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#ffffff', // Clean white background for splash screen
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  splashContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#EBF4F6', // Light teal/cyan/blue circle background
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  busContainer: {
    width: 66,
    height: 56,
    borderWidth: 3.5,
    borderColor: '#0E90E6', // Blue color matching screenshot
    borderRadius: 12,
    backgroundColor: '#ffffff',
    padding: 6,
    justifyContent: 'space-between',
    position: 'relative',
  },
  windshieldContainer: {
    flexDirection: 'row',
    gap: 5,
    flex: 1.2,
  },
  window: {
    flex: 1,
    borderWidth: 2.5,
    borderColor: '#0E90E6',
    borderRadius: 4,
  },
  busDivider: {
    height: 3,
    backgroundColor: '#0E90E6',
    marginVertical: 4,
    borderRadius: 1.5,
  },
  grillContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 0.8,
    paddingHorizontal: 2,
  },
  headlight: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#0E90E6',
  },
  grillLine: {
    width: 18,
    height: 3,
    backgroundColor: '#0E90E6',
    borderRadius: 1.5,
  },
  wheelLeft: {
    position: 'absolute',
    bottom: -9,
    left: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3.5,
    borderColor: '#0E90E6',
    backgroundColor: '#ffffff',
  },
  wheelRight: {
    position: 'absolute',
    bottom: -9,
    right: 10,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3.5,
    borderColor: '#0E90E6',
    backgroundColor: '#ffffff',
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8A95A5', // Gray-blue subtitle color
  },
});
