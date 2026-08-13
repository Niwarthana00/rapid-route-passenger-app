import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Platform,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface InTripAlertViewProps {
  busPlate?: string;
  nextStop?: string;
  from?: string;
  to?: string;
  onBack: () => void;
}

export function InTripAlertView({
  busPlate = 'NA-1234',
  nextStop = 'Kadawatha',
  from = 'Colombo',
  to = 'Kandy',
  onBack,
}: InTripAlertViewProps) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 20);

  return (
    <View style={styles.container}>
      {/* Interactive Vector Map Background */}
      <View style={styles.mapContainer}>
        <Svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
          {/* Land */}
          <Path d="M0 0h400v400H0z" fill="#E6EFEA" />
          
          {/* Waterway */}
          <Path
            d="M-50 160 C 100 130, 200 290, 450 260 L 450 310 C 200 340, 100 180, -50 210 Z"
            fill="#C5DFEB"
          />

          {/* Highway Route Path */}
          <Path
            d="M 120 -50 C 140 150, 110 250, 150 450"
            fill="none"
            stroke="#ffffff"
            strokeWidth="22"
            strokeLinecap="round"
          />
          <Path
            d="M 120 -50 C 140 150, 110 250, 150 450"
            fill="none"
            stroke="#059669"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Secondary Crossing Road */}
          <Path
            d="M -50 90 C 100 110, 250 130, 450 60"
            fill="none"
            stroke="#ffffff"
            strokeWidth="16"
            strokeLinecap="round"
          />
        </Svg>

        {/* Current Bus Pin on Map */}
        <View style={[styles.busMapMarker, { top: '48%', left: '38%' }]}>
          <View style={styles.busMarkerBubble}>
            <Ionicons name="bus" size={12} color="#FFFFFF" />
            <Text style={styles.markerText}>{busPlate}</Text>
          </View>
          <View style={styles.pulseRing} />
        </View>

        {/* Destination Halt Pin (Kadawatha) */}
        <View style={[styles.haltDestinationPin, { top: '38%', left: '35%' }]}>
          <View style={styles.pinBubble}>
            <Ionicons name="location" size={16} color="#FFFFFF" />
          </View>
          <Text style={styles.pinLabel}>{nextStop}</Text>
        </View>
      </View>

      {/* Top Floating Notification Banner matching mockup */}
      <View style={[styles.topBannerWrapper, { paddingTop: topInset + (Platform.OS === 'ios' ? 8 : 12) }]}>
        <View style={styles.topBannerCard}>
          <View style={styles.bannerIconCircle}>
            <Ionicons name="notifications" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerTitle}>Your stop is next!</Text>
            <Text style={styles.bannerSubtitle}>Get ready to alight at {nextStop}</Text>
          </View>
        </View>
      </View>

      {/* Back / Close button */}
      <Pressable
        style={[styles.floatingBackButton, { top: topInset + (Platform.OS === 'ios' ? 80 : 84) }]}
        onPress={onBack}
        hitSlop={10}
      >
        <Ionicons name="chevron-back" size={22} color="#111827" />
      </Pressable>

      {/* Bottom Floating Trip Info Card matching mockup */}
      <View style={styles.bottomCardContainer}>
        <View style={styles.bottomSheetCard}>
          {/* Card Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handleBar} />
          </View>

          {/* Header Row */}
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardTitleCol}>
              <Text style={styles.currentTripLabel}>Current Trip</Text>
              <Text style={styles.tripMainTitle}>You are on Bus {busPlate}</Text>
            </View>
            <Pressable style={styles.targetLocationBtn}>
              <Ionicons name="locate" size={20} color="#059669" />
            </Pressable>
          </View>

          {/* Info Details Box */}
          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Next Stop</Text>
              <Text style={styles.infoValueBold}>{nextStop}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Your Destination</Text>
              <Text style={styles.infoValueGreen}>1 stop away</Text>
            </View>
          </View>

          {/* Route Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressEndpointsRow}>
              <Text style={styles.endpointText}>{from}</Text>
              <Text style={styles.endpointText}>{to}</Text>
            </View>

            <View style={styles.progressBarTrack}>
              <View style={styles.progressBarFill} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6EFEA',
    position: 'relative',
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  busMapMarker: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  busMarkerBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  pulseRing: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(5, 150, 105, 0.25)',
    position: 'absolute',
    top: -4,
    zIndex: -1,
  },
  haltDestinationPin: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 9,
  },
  pinBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  pinLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#111827',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
    overflow: 'hidden',
  },
  topBannerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 20,
  },
  topBannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  bannerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bannerSubtitle: {
    fontSize: 13,
    color: '#E6F4EA',
    fontWeight: '500',
    marginTop: 1,
  },
  floatingBackButton: {
    position: 'absolute',
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  bottomCardContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    zIndex: 20,
  },
  bottomSheetCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  handleContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitleCol: {
    flex: 1,
  },
  currentTripLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A95A5',
    marginBottom: 2,
  },
  tripMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  targetLocationBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  infoValueBold: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  infoValueGreen: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  progressContainer: {
    gap: 6,
  },
  progressEndpointsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  endpointText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8A95A5',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '72%',
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 3,
  },
});
