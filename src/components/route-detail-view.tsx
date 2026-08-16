import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
  Alert,
  DimensionValue,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SeatBookingView } from './seat-booking-view';

export interface BusDetail {
  id: string;
  plateNumber: string;
  eta: string;
  seatsLeft: number | 'Full';
  totalSeats: number;
  isAC: boolean;
  fare: number;
  currentStop: string;
  markerTop?: DimensionValue;
  markerLeft?: DimensionValue;
  angle?: number;
}

export interface RouteDetailProps {
  route: {
    id?: string;
    routeNumber: string;
    from: string;
    to: string;
  };
  onBack: () => void;
  onBookSeat?: (bus: BusDetail) => void;
}

// Route Map Background with specific bus and halt positions
const RouteMapBackground = ({
  buses,
  selectedBusId,
  onSelectBus,
}: {
  buses: BusDetail[];
  selectedBusId: string;
  onSelectBus: (id: string) => void;
}) => (
  <View style={styles.mapContainer}>
    <Svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" style={styles.mapSvg}>
      {/* Land background */}
      <Path d="M0 0h400v400H0z" fill="#E6EFEA" />

      {/* Primary Highway Path */}
      <Path
        d="M 190 -20 C 170 100, 230 190, 160 420"
        fill="none"
        stroke="#ffffff"
        strokeWidth="24"
        strokeLinecap="round"
      />
      <Path
        d="M 190 -20 C 170 100, 230 190, 160 420"
        fill="none"
        stroke="#0E90E6"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="10,6"
      />

      {/* Connection to Halt */}
      <Path
        d="M 195 130 Q 220 180, 270 210"
        fill="none"
        stroke="#059669"
        strokeWidth="3"
        strokeDasharray="4,4"
      />

      {/* Secondary branch */}
      <Path
        d="M 190 110 C 290 150, 310 270, 370 390"
        fill="none"
        stroke="#ffffff"
        strokeWidth="16"
        strokeLinecap="round"
      />
    </Svg>

    {/* "My Halt" Location Marker */}
    <View style={[styles.haltMarker, { top: '38%', left: '58%' }]}>
      <View style={styles.haltCard}>
        <Text style={styles.haltCardText}>My Halt</Text>
      </View>
      <View style={styles.haltPin}>
        <Ionicons name="location" size={22} color="#0E90E6" />
      </View>
    </View>

    {/* Dynamic Bus Markers on Map */}
    {Array.isArray(buses) && buses.map((bus, index) => {
      const isSelected = bus.id === selectedBusId;
      return (
        <Pressable
          key={`${bus.id}-${index}`}
          style={[
            styles.busMarker,
            {
              top: bus.markerTop || '35%',
              left: bus.markerLeft || '50%',
            },
          ]}
          onPress={() => onSelectBus(bus.id)}
        >
          <View style={[styles.markerPlateBadge, isSelected && styles.markerPlateBadgeSelected]}>
            <Text style={styles.markerPlateText}>{bus.plateNumber}</Text>
          </View>
          <View style={styles.arrowContainer}>
            <View
              style={[
                styles.navigationArrow,
                isSelected && styles.navigationArrowSelected,
                { transform: [{ rotate: `${bus.angle || 0}deg` }] },
              ]}
            />
          </View>
        </Pressable>
      );
    })}
  </View>
);

export function RouteDetailView({
  route,
  onBack,
}: RouteDetailProps) {
  const { routeNumber, from, to } = route;
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 20);

  const [buses, setBuses] = useState<BusDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Draggable Bottom Sheet Configurations
  const screenHeight = Dimensions.get('window').height;
  const collapsedHeight = screenHeight * 0.40;
  const expandedHeight = screenHeight * 0.82;
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const sheetHeight = useRef(new Animated.Value(collapsedHeight)).current;
  const lastHeight = useRef(collapsedHeight);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        let nextHeight = lastHeight.current - gestureState.dy;
        if (nextHeight < collapsedHeight) {
          nextHeight = collapsedHeight;
        } else if (nextHeight > expandedHeight) {
          nextHeight = expandedHeight;
        }
        sheetHeight.setValue(nextHeight);
      },
      onPanResponderRelease: (e, gestureState) => {
        const finalHeight = lastHeight.current - gestureState.dy;
        const threshold = (collapsedHeight + expandedHeight) / 2;
        let targetHeight = collapsedHeight;
        
        if (finalHeight > threshold) {
          targetHeight = expandedHeight;
        }
        
        Animated.spring(sheetHeight, {
          toValue: targetHeight,
          useNativeDriver: false,
          friction: 8,
          tension: 40,
        }).start(() => {
          lastHeight.current = targetHeight;
          setSheetExpanded(targetHeight === expandedHeight);
        });
      },
    })
  ).current;

  // Fetch active buses on this route from API
  useEffect(() => {
    let isMounted = true;
    async function fetchBuses() {
      setIsLoading(true);
      try {
        const data = await api.getActiveBuses(route.id || route.routeNumber);
        if (isMounted) {
          setBuses(data || []);
          if (data && data.length > 0) {
            setSelectedBusId(data[0].id);
          }
        }
      } catch (err) {
        console.error('Failed to fetch buses:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchBuses();
    return () => { isMounted = false; };
  }, [route.id, route.routeNumber]);

  const [selectedBusId, setSelectedBusId] = useState<string>('1');
  const [expandedBusId, setExpandedBusId] = useState<string | null>(null);
  const [selectedBusForBooking, setSelectedBusForBooking] = useState<BusDetail | null>(null);

  // If user opened Seat Selection Screen for a bus
  if (selectedBusForBooking) {
    return (
      <SeatBookingView
        bus={selectedBusForBooking}
        routeNumber={routeNumber}
        from={from}
        to={to}
        onBack={() => setSelectedBusForBooking(null)}
      />
    );
  }

  const handleTrackOnly = (bus: BusDetail) => {
    Alert.alert('Live Tracking 📡', `Tracking bus ${bus.plateNumber} near ${bus.currentStop}. Estimated time of arrival is ${bus.eta}.`);
  };

  const toggleExpand = (busId: string) => {
    setExpandedBusId(expandedBusId === busId ? null : busId);
    setSelectedBusId(busId);
  };

  return (
    <View style={styles.container}>
      {/* Background Interactive Map */}
      <RouteMapBackground
        buses={buses}
        selectedBusId={selectedBusId}
        onSelectBus={(id) => {
          setSelectedBusId(id);
        }}
      />

      {/* Top Floating Header with Back Button and Route Info */}
      <View style={[styles.topHeader, { paddingTop: topInset + (Platform.OS === 'ios' ? 8 : 12) }]}>
        <Pressable onPress={onBack} style={styles.backButton} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </Pressable>

        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitleText}>
            {routeNumber} {from} - {to}
          </Text>
          <Text style={styles.headerSubText}>{buses.length} buses active on route</Text>
        </View>
      </View>

      {/* Bottom Sheet for Active Buses */}
      <Animated.View style={[styles.bottomSheet, { height: sheetHeight }]}>
        {/* Header Grabbing Area */}
        <View {...panResponder.panHandlers} style={styles.sheetHeaderGrabArea}>
          <View style={styles.handleContainer}>
            <View style={styles.sheetHandle} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <Text style={styles.loadingText}>Loading buses on route...</Text>
          ) : Array.isArray(buses) && buses.length > 0 ? (
            buses.map((bus, index) => {
              const isFull = bus.seatsLeft === 'Full';
              const isExpanded = expandedBusId === bus.id;
              const isSelected = selectedBusId === bus.id;

              return (
                <View
                  key={`${bus.id}-${index}`}
                  style={[
                    styles.busCard,
                    isSelected && styles.busCardSelected,
                  ]}
                >
                <View style={styles.cardHeaderRow}>
                  {/* Left: Plate + AC Badge */}
                  <View style={styles.plateGroup}>
                    <Text style={styles.plateText}>{bus.plateNumber}</Text>
                    {bus.isAC ? (
                      <View style={styles.acBadge}>
                        <Ionicons name="snow" size={11} color="#0E90E6" />
                        <Text style={styles.acBadgeText}>A/C</Text>
                      </View>
                    ) : (
                      <View style={styles.normalBadge}>
                        <Text style={styles.normalBadgeText}>Normal</Text>
                      </View>
                    )}
                  </View>

                  {/* Right: LKR Fare + Expand Toggle Icon */}
                  <View style={styles.fareAndExpandGroup}>
                    <View style={styles.fareBadgeBox}>
                      <Text style={styles.fareLabelSmall}>Fare</Text>
                      <Text style={styles.fareAmountText}>LKR {bus.fare}</Text>
                    </View>

                    <Pressable
                      style={styles.expandIconBtn}
                      onPress={() => toggleExpand(bus.id)}
                      hitSlop={8}
                    >
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={18}
                        color="#475569"
                      />
                    </Pressable>
                  </View>
                </View>

                {/* Row 2: Live Location / ETA | Seats Badge & Compact Book Button */}
                <View style={styles.cardMetaActionRow}>
                  {/* Location & ETA */}
                  <View style={styles.locationEtaCol}>
                    <View style={styles.locationSubRow}>
                      <Ionicons name="location-sharp" size={13} color="#0E90E6" />
                      <Text style={styles.locationText}>
                        {bus.currentStop}
                      </Text>
                    </View>
                    <View style={styles.etaSubRow}>
                      <Ionicons name="time-outline" size={12} color="#059669" />
                      <Text style={styles.etaText}>{bus.eta}</Text>
                    </View>
                  </View>

                  {/* Seats Pill & Book Button */}
                  <View style={styles.seatsAndBookCol}>
                    <View
                      style={[
                        styles.seatsPill,
                        isFull ? styles.seatsPillFull : styles.seatsPillAvailable,
                      ]}
                    >
                      <Ionicons
                        name="people"
                        size={12}
                        color={isFull ? '#EF4444' : '#0E90E6'}
                      />
                      <Text
                        style={[
                          styles.seatsPillText,
                          isFull ? styles.seatsTextFull : styles.seatsTextAvailable,
                        ]}
                      >
                        {isFull ? 'Full' : `${bus.seatsLeft} left`}
                      </Text>
                    </View>

                    <Pressable
                      style={[
                        styles.bookPillBtn,
                        isFull ? styles.bookPillBtnDisabled : styles.bookPillBtnActive,
                      ]}
                      onPress={() => setSelectedBusForBooking(bus)}
                      disabled={isFull}
                    >
                      <Text
                        style={[
                          styles.bookPillText,
                          isFull && styles.bookPillTextDisabled,
                        ]}
                      >
                        {isFull ? 'Sold Out' : 'Book Seat'}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {/* Expanded Section (Revealed on click of chevron) */}
                {isExpanded && (
                  <View style={styles.expandedWrapper}>
                    <View style={styles.expandedDivider} />

                    {/* 3 Mini Stat Chips */}
                    <View style={styles.statsChipsRow}>
                      <View style={styles.statChip}>
                        <Text style={styles.statChipLabel}>Capacity</Text>
                        <Text style={styles.statChipVal}>
                          {isFull ? '0 / 40' : `${bus.seatsLeft} / ${bus.totalSeats} seats`}
                        </Text>
                      </View>

                      <View style={styles.statChip}>
                        <Text style={styles.statChipLabel}>Bus Type</Text>
                        <Text style={styles.statChipVal}>
                          {bus.isAC ? 'Luxury A/C' : 'Standard CTB'}
                        </Text>
                      </View>

                      <View style={styles.statChip}>
                        <Text style={styles.statChipLabel}>Arrival</Text>
                        <Text style={styles.statChipVal}>{bus.eta}</Text>
                      </View>
                    </View>

                    {/* Compact Secondary Action */}
                    <View style={styles.expandedActionRow}>
                      <Pressable
                        style={styles.trackPillBtn}
                        onPress={() => handleTrackOnly(bus)}
                      >
                        <Ionicons name="navigate-outline" size={15} color="#0E90E6" />
                        <Text style={styles.trackPillText}>Track Live Location</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
              );
            })
          ) : (
            <Text style={styles.loadingText}>No active buses on this route</Text>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFD',
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
  topHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 14,
    zIndex: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(226, 232, 240, 0.8)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitleText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  haltMarker: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 5,
  },
  haltCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 2,
    borderWidth: 1.5,
    borderColor: '#0E90E6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  haltCardText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
  },
  haltPin: {
    marginTop: -4,
  },
  busMarker: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 6,
  },
  markerPlateBadge: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  markerPlateBadgeSelected: {
    backgroundColor: '#0E90E6',
    borderColor: '#FFFFFF',
  },
  markerPlateText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
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
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#0F172A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  navigationArrowSelected: {
    borderBottomColor: '#0E90E6',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAFBFD',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 8,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 8,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#EEF2F6',
  },
  sheetHeaderGrabArea: {
    width: '100%',
    backgroundColor: '#FAFBFD',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 6,
  },
  sheetHandle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
    gap: 12,
  },
  busCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#EEF2F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  busCardSelected: {
    borderColor: '#0E90E6',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  plateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  plateText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.2,
  },
  acBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  acBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0E90E6',
  },
  normalBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  normalBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  fareAndExpandGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fareBadgeBox: {
    alignItems: 'flex-end',
  },
  fareLabelSmall: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8A95A5',
    textTransform: 'uppercase',
  },
  fareAmountText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  expandIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardMetaActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationEtaCol: {
    flexDirection: 'column',
    gap: 3,
    flex: 1,
    marginRight: 12,
  },
  locationSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
  },
  etaSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  etaText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  seatsAndBookCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  seatsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  seatsPillAvailable: {
    backgroundColor: '#EBF5FF',
  },
  seatsPillFull: {
    backgroundColor: '#FEE2E2',
  },
  seatsPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  seatsTextAvailable: {
    color: '#0E90E6',
  },
  seatsTextFull: {
    color: '#EF4444',
  },
  bookPillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookPillBtnActive: {
    backgroundColor: '#0E90E6',
    shadowColor: '#0E90E6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  bookPillBtnDisabled: {
    backgroundColor: '#F1F5F9',
  },
  bookPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bookPillTextDisabled: {
    color: '#94A3B8',
  },

  /* Expanded Section */
  expandedWrapper: {
    marginTop: 12,
  },
  expandedDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginBottom: 12,
  },
  statsChipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 12,
  },
  statChip: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  statChipLabel: {
    fontSize: 10,
    color: '#8A95A5',
    fontWeight: '600',
    marginBottom: 2,
  },
  statChipVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  expandedActionRow: {
    flexDirection: 'row',
  },
  trackPillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  trackPillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0E90E6',
  },
  loadingText: {
    fontSize: 14,
    color: '#8A95A5',
    textAlign: 'center',
    paddingVertical: 20,
    fontWeight: '600',
  },
});
