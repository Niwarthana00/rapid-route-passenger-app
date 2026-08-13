import React from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, SafeAreaView, ScrollView, Platform } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';

// Mock Map Component
const VectorMapBackground = () => (
  <View style={styles.mapContainer}>
    <Svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" style={styles.mapSvg}>
      {/* Background Land */}
      <Path d="M0 0h400v400H0z" fill="#E6EFEA" />
      
      {/* Water body / River */}
      <Path
        d="M-50 150 C 100 120, 200 280, 450 250 L 450 300 C 200 330, 100 170, -50 200 Z"
        fill="#C5DFEB"
      />
      
      {/* Roads */}
      {/* Vertical Road */}
      <Path
        d="M 120 -50 C 140 150, 110 250, 150 450"
        fill="none"
        stroke="#ffffff"
        strokeWidth="20"
        strokeLinecap="round"
      />
      <Path
        d="M 120 -50 C 140 150, 110 250, 150 450"
        fill="none"
        stroke="#E2EBE6"
        strokeWidth="2"
        strokeDasharray="4,4"
        strokeLinecap="round"
      />
      
      {/* Curved Crossing Road */}
      <Path
        d="M -50 80 C 100 100, 250 120, 450 50"
        fill="none"
        stroke="#ffffff"
        strokeWidth="16"
        strokeLinecap="round"
      />
      
      {/* Road 3 (Leading to 138) */}
      <Path
        d="M 130 180 C 250 200, 280 300, 320 450"
        fill="none"
        stroke="#ffffff"
        strokeWidth="16"
        strokeLinecap="round"
      />
    </Svg>

    {/* Bus Marker 138 */}
    <View style={[styles.busMarker, { top: '55%', left: '46%' }]}>
      <View style={styles.markerBubble}>
        <Text style={styles.markerText}>138</Text>
      </View>
      <View style={styles.arrowContainer}>
        {/* We can use a simple custom triangle or arrow view */}
        <View style={[styles.navigationArrow, { transform: [{ rotate: '45deg' }] }]} />
      </View>
    </View>

    {/* Bus Marker 17 */}
    <View style={[styles.busMarker, { top: '35%', left: '72%' }]}>
      <View style={styles.markerBubble}>
        <Text style={styles.markerText}>17</Text>
      </View>
      <View style={styles.arrowContainer}>
        <View style={[styles.navigationArrow, { transform: [{ rotate: '-30deg' }] }]} />
      </View>
    </View>
  </View>
);

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header Overlay */}
      <View style={styles.headerContainer}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>Good morning,</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={18} color="#0E90E6" />
            <Text style={styles.locationText}>Colombo</Text>
          </View>
        </View>
        
        {/* Profile Avatar */}
        <Pressable style={styles.profileBadge}>
          <Text style={styles.profileText}>JD</Text>
        </Pressable>
      </View>

      {/* Search Input Overlay */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#8A95A5" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search route or halt..."
            placeholderTextColor="#8A95A5"
            editable={false} // Presentation only
          />
        </View>
      </View>

      {/* Mock Map Background */}
      <VectorMapBackground />

      {/* Bottom Sheet Details */}
      <View style={styles.bottomSheet}>
        {/* Handle Indicator */}
        <View style={styles.handleContainer}>
          <View style={styles.sheetHandle} />
        </View>

        <Text style={styles.sheetTitle}>Nearby Buses</Text>

        <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
          {/* Bus Card 138 */}
          <View style={styles.busCard}>
            <View style={styles.busInfo}>
              <Text style={styles.busRouteTitle}>138 Kottawa - Pettah</Text>
              <Text style={styles.busETA}>
                ETA: <Text style={styles.busETABold}>2 min</Text>
              </Text>
            </View>
            <View style={[styles.statusBadge, styles.badgeAvailable]}>
              <Ionicons name="people" size={14} color="#0E90E6" style={styles.badgeIcon} />
              <Text style={[styles.badgeText, styles.textAvailable]}>12 left</Text>
            </View>
          </View>

          {/* Bus Card 120 */}
          <View style={styles.busCard}>
            <View style={styles.busInfo}>
              <Text style={styles.busRouteTitle}>120 Horana - Pettah</Text>
              <Text style={styles.busETA}>
                ETA: <Text style={styles.busETABold}>5 min</Text>
              </Text>
            </View>
            <View style={[styles.statusBadge, styles.badgeAvailable]}>
              <Ionicons name="people" size={14} color="#0E90E6" style={styles.badgeIcon} />
              <Text style={[styles.badgeText, styles.textAvailable]}>4 left</Text>
            </View>
          </View>

          {/* Bus Card 17 */}
          <View style={styles.busCard}>
            <View style={styles.busInfo}>
              <Text style={styles.busRouteTitle}>17 Panadura - Kandy</Text>
              <Text style={styles.busETA}>
                ETA: <Text style={styles.busETABold}>8 min</Text>
              </Text>
            </View>
            <View style={[styles.statusBadge, styles.badgeFull]}>
              <Ionicons name="people" size={14} color="#EF4444" style={styles.badgeIcon} />
              <Text style={[styles.badgeText, styles.textFull]}>Full</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
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
  mapSvg: {
    width: '100%',
    height: '100%',
  },
  headerContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  greetingContainer: {
    flexDirection: 'column',
  },
  greetingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  profileBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileText: {
    color: '#0E90E6',
    fontSize: 14,
    fontWeight: '700',
  },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 110 : 80,
    left: 24,
    right: 24,
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10, // Curve reduced to 10
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  busMarker: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 5,
  },
  markerBubble: {
    backgroundColor: '#0E90E6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  markerText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#0E90E6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  arrowIcon: {
    position: 'absolute',
    zIndex: 6,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '48%',
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 10,
    zIndex: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  sheetHandle: {
    width: 48,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5E7EB',
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  sheetContent: {
    gap: 12,
    paddingBottom: 24,
  },
  busCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 10, // Curve reduced to 10
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  busInfo: {
    flexDirection: 'column',
    gap: 4,
  },
  busRouteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  busETA: {
    fontSize: 13,
    color: '#8A95A5',
    fontWeight: '500',
  },
  busETABold: {
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  badgeIcon: {
    marginRight: 2,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  badgeAvailable: {
    backgroundColor: '#EBF5FF',
  },
  textAvailable: {
    color: '#0E90E6',
  },
  badgeFull: {
    backgroundColor: '#FEE2E2',
  },
  textFull: {
    color: '#EF4444',
  },
});
