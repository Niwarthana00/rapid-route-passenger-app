import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');

// --- VECTOR GRAPHIC COMPONENTS ---

const TrackingGraphic = () => (
  <View style={styles.graphicContainer}>
    {/* Concentric Circle Rings */}
    <View style={styles.outerRing}>
      <View style={styles.innerRing} />
    </View>

    {/* Map Pin Card (White) */}
    <View style={[styles.cardBase, styles.cardWhite, { top: 40, left: 35 }]}>
      <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <Path 
          d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z" 
          fill="#0E90E6"
        />
      </Svg>
    </View>

    {/* Navigation Arrow Card (Blue) */}
    <View style={[styles.cardBase, styles.cardBlue, { bottom: 40, right: 35 }]}>
      <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <Path 
          d="M21 3L3 10.53L11.47 12.53L13.47 21L21 3Z" 
          fill="#ffffff"
        />
      </Svg>
    </View>
  </View>
);

const PaymentGraphic = () => (
  <View style={[styles.graphicContainer, { backgroundColor: '#F5F7FA' }]}>
    {/* Concentric Circle Rings */}
    <View style={[styles.outerRing, { borderColor: '#E5E9F0' }]}>
      <View style={[styles.innerRing, { borderColor: '#E5E9F0' }]} />
    </View>

    {/* Wallet Card (White) */}
    <View style={[styles.cardBase, styles.cardWhite, { top: 40, left: 35 }]}>
      <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <Path 
          d="M21 18V6C21 4.9 20.1 4 19 4H5C3.9 4 3 4.9 3 6V18C3 19.1 3.9 20 5 20H19C20.1 20 21 19.1 21 18ZM19 8H5V6H19V8ZM19 12H5V10H19V12ZM19 16H5V14H19V16Z" 
          fill="#0E90E6"
        />
      </Svg>
    </View>

    {/* QR Scan Card (Blue) */}
    <View style={[styles.cardBase, styles.cardBlue, { bottom: 40, right: 35 }]}>
      <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <Path 
          d="M3 3H9V9H3V3ZM5 5V7H7V5H5ZM3 15H9V21H3V15ZM5 17V19H7V17H5ZM15 3H21V9H15V3ZM17 5V7H19V5H17ZM15 15H17V17H15V15ZM17 17H19V19H17V17ZM19 15H21V17H19V15ZM15 19H17V21H15V19ZM19 19H21V21H19V19Z" 
          fill="#ffffff"
        />
      </Svg>
    </View>
  </View>
);

const PlannerGraphic = () => (
  <View style={[styles.graphicContainer, { backgroundColor: '#FAF8F5' }]}>
    {/* Concentric Circle Rings */}
    <View style={[styles.outerRing, { borderColor: '#EFEAE2' }]}>
      <View style={[styles.innerRing, { borderColor: '#EFEAE2' }]} />
    </View>

    {/* Map Path Card (White) */}
    <View style={[styles.cardBase, styles.cardWhite, { top: 40, left: 35 }]}>
      <Svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <Path 
          d="M20.5 3H16.5C15.67 3 15 3.67 15 4.5V8.5C15 9.33 15.67 10 16.5 10H20.5C21.33 10 22 9.33 22 8.5V4.5C22 3.67 21.33 3 20.5 3ZM7.5 14H3.5C2.67 14 2 14.67 2 15.5V19.5C2 20.33 2.67 21 3.5 21H7.5C8.33 21 9 20.33 9 19.5V15.5C9 14.67 8.33 14 7.5 14ZM16.5 14H20.5C21.33 14 22 14.67 22 15.5V19.5C22 20.33 21.33 21 20.5 21H16.5C15.67 21 15 20.33 15 19.5V15.5C15 14.67 15.67 14 16.5 14ZM5.5 10H7.5V12.5H16.5V10H18.5V14H5.5V10Z" 
          fill="#0E90E6"
        />
      </Svg>
    </View>

    {/* Clock Card (Blue) */}
    <View style={[styles.cardBase, styles.cardBlue, { bottom: 40, right: 35 }]}>
      <Svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="9" stroke="#ffffff" strokeWidth="2" fill="none" />
        <Path d="M12 6V12L16 14" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" />
      </Svg>
    </View>
  </View>
);

interface OnboardingOverlayProps {
  onFinish: () => void;
}

export function OnboardingOverlay({ onFinish }: OnboardingOverlayProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const onboardingSlides = [
    {
      graphic: <TrackingGraphic />,
      title: "Live bus tracking",
      description: "See exactly where your bus is and know when it will arrive at your halt. No more waiting in the sun.",
    },
    {
      graphic: <PaymentGraphic />,
      title: "Cashless payments",
      description: "Pay seamlessly using your digital wallet and scan QR codes to board instantly. No loose change needed.",
    },
    {
      graphic: <PlannerGraphic />,
      title: "Plan your journey",
      description: "Find the fastest routes, view schedules, and receive alerts about service delays or traffic.",
    },
  ];

  const handleNext = () => {
    if (currentSlide < onboardingSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onFinish();
    }
  };

  const handleSkip = () => {
    onFinish();
  };

  const slide = onboardingSlides[currentSlide];

  return (
    <SafeAreaView style={styles.overlayContainer}>
      {/* Top Header */}
      <View style={styles.header}>
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>

      {/* Content Wrapper */}
      <View style={styles.content}>
        {/* Central Graphic */}
        <View style={styles.graphicOuterContainer}>
          {slide.graphic}
        </View>

        {/* Text Section */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </View>

        {/* Dot Indicators */}
        <View style={styles.indicatorContainer}>
          {onboardingSlides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentSlide ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.footer}>
        <Pressable onPress={handleNext} style={styles.nextButton}>
          <Text style={styles.nextText}>
            {currentSlide === onboardingSlides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#ffffff',
    zIndex: 99999,
    elevation: 99999,
  },
  header: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  skipText: {
    fontSize: 16,
    color: '#8A95A5',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  graphicOuterContainer: {
    marginBottom: 40,
  },
  graphicContainer: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#F2F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  outerRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: '#E2ECEC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    borderColor: '#E2ECEC',
  },
  cardBase: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardWhite: {
    backgroundColor: '#ffffff',
  },
  cardBlue: {
    backgroundColor: '#0E90E6',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  indicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: '#0E90E6',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#E5E7EB',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 36,
  },
  nextButton: {
    backgroundColor: '#0E90E6',
    borderRadius: 10,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0E90E6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  nextText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
