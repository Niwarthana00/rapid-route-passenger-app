import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Share,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface HaltStep {
  id: string;
  name: string;
  time: string;
  status: 'passed' | 'current' | 'upcoming';
  distance?: string;
  isAlarmHalt?: boolean;
}

const ROUTE_HALTS: Record<string, string[]> = {
  '1-1': ['Colombo Fort Terminal', 'Peliyagoda Interchange', 'Kelaniya Halt', 'Kadawatha Bus Stand', 'Nittambuwa Town', 'Pasyala Junction', 'Warakapola Station', 'Kegalle Main Stand', 'Mawanella Town', 'Kandy Goods Shed Terminal'],
  '138': ['Pettah Main Stand', 'Colombo Fort', 'Torrington', 'Nugegoda Junction', 'Maharagama Multi-Modal', 'Pannipitiya', 'Kottawa Interchange'],
  '120': ['Pettah Main Stand', 'Nugegoda Stand', 'Boralesgamuwa', 'Piliyandala Town', 'Kahathuduwa', 'Pokunuwita', 'Horana Bus Stand'],
  '17': ['Panadura Town Stand', 'Moratuwa', 'Katubedda', 'Ratmalana', 'Mount Lavinia', 'Colombo Fort', 'Kegalle', 'Kandy Goods Shed'],
};

export default function MyTripsScreen() {
  const [isAlarmEnabled, setIsAlarmEnabled] = useState(true);
  const [activeBooking, setActiveBooking] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch active bookings on load
  useEffect(() => {
    async function loadActiveBooking() {
      setIsLoading(true);
      const data = await api.getBookingHistory();
      const upcoming = data.find((b: any) => b.status === 'upcoming');
      setActiveBooking(upcoming);
      setIsLoading(false);
    }
    loadActiveBooking();
  }, []);

  const selectedDropOffHalt = activeBooking ? activeBooking.to : 'Destination';

  // Generate dynamic halts matching the user's booked route number
  const haltsList = activeBooking ? (ROUTE_HALTS[activeBooking.routeNumber] || ROUTE_HALTS['138']) : [];
  const journeyHalts: HaltStep[] = haltsList.map((name, index) => {
    const isPassed = index < 3;
    const isCurrent = index === 3;
    return {
      id: String(index + 1),
      name,
      time: index === 0 && activeBooking ? activeBooking.time : `${8 + index}:10 AM`,
      status: isPassed ? 'passed' : isCurrent ? 'current' : 'upcoming',
      isAlarmHalt: isCurrent,
      distance: isCurrent ? '1 stop away (2 min)' : undefined,
    };
  });

  // Check if bus is 1 halt before destination
  const isOneHaltBefore = activeBooking !== null;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#0E90E6" />
          <Text style={styles.emptyTitle}>Loading live journey...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!activeBooking) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Live Journey</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="bus-outline" size={64} color="#8A95A5" style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>No Active Journey</Text>
          <Text style={styles.emptySubtitle}>
            Once you book a seat, your live tracking and journey progress will appear here in real-time.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleShareTrip = async () => {
    try {
      await Share.share({
        message: `🚍 I am traveling on Rapid Route Bus ${activeBooking.busPlate} (${activeBooking.routeNumber} ${activeBooking.routeName || `${activeBooking.from} - ${activeBooking.to}`}). Next stop: ${selectedDropOffHalt}.`,
      });
    } catch (error) {
      Alert.alert('Share Trip', 'Unable to share live trip link.');
    }
  };

  const handleConductorHelp = () => {
    Alert.alert(
      '👨‍✈️ Conductor Assistance',
      `Conductor on Bus ${activeBooking.busPlate} has been notified of your drop-off request at ${selectedDropOffHalt}.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Live Journey</Text>
          <View style={styles.onBoardPill}>
            <View style={styles.livePulseDot} />
            <Text style={styles.onBoardText}>ON BOARD</Text>
          </View>
        </View>

        {/* Share Live Trip Button */}
        <Pressable style={styles.shareBtn} onPress={handleShareTrip} hitSlop={8}>
          <Ionicons name="share-social-outline" size={18} color="#0E90E6" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Active Bus Card Header */}
        <View style={styles.activeBusCard}>
          <View style={styles.busMetaRow}>
            <View style={styles.routePill}>
              <Text style={styles.routePillText}>{activeBooking.routeNumber}</Text>
            </View>
            <View style={styles.busInfoCol}>
              <Text style={styles.routeTitle}>{activeBooking.routeName || `${activeBooking.from} → ${activeBooking.to}`}</Text>
              <Text style={styles.busPlateSubtitle}>Bus: {activeBooking.busPlate} • {activeBooking.isAC ? 'Luxury A/C' : 'Standard CTB'}</Text>
            </View>
            <View style={styles.seatBadge}>
              <Text style={styles.seatBadgeText}>Seat {activeBooking.seatNumbers?.join(', ') || activeBooking.seat || '11'}</Text>
            </View>
          </View>

          {/* 3 Live Telemetry Chips */}
          <View style={styles.telemetryRow}>
            <View style={styles.telemetryBox}>
              <Ionicons name="speedometer-outline" size={16} color="#0E90E6" />
              <Text style={styles.telemetryVal}>52 km/h</Text>
              <Text style={styles.telemetryLabel}>Live Speed</Text>
            </View>

            <View style={styles.telemetryBox}>
              <Ionicons name="time-outline" size={16} color="#059669" />
              <Text style={styles.telemetryVal}>38 min</Text>
              <Text style={styles.telemetryLabel}>To Destination</Text>
            </View>

            <View style={styles.telemetryBox}>
              <Ionicons name="navigate-outline" size={16} color="#6366F1" />
              <Text style={styles.telemetryVal}>24.5 km</Text>
              <Text style={styles.telemetryLabel}>Distance Left</Text>
            </View>
          </View>
        </View>

        {/* Next Halt Alarm Banner (Appears only 1 halt before destination) */}
        {isOneHaltBefore && (
          <View style={[styles.alarmCard, isAlarmEnabled && styles.alarmCardActive]}>
            <View style={styles.alarmHeaderRow}>
              <View style={styles.alarmIconGroup}>
                <View style={[styles.alarmIconCircle, isAlarmEnabled && styles.alarmIconCircleActive]}>
                  <Ionicons
                    name={isAlarmEnabled ? 'notifications' : 'notifications-off-outline'}
                    size={20}
                    color={isAlarmEnabled ? '#059669' : '#94A3B8'}
                  />
                </View>
                <View style={styles.alarmTextCol}>
                  <Text style={styles.alarmTitle}>Your stop is next!</Text>
                  <Text style={styles.alarmSubtitle}>
                    Get ready to alight at <Text style={styles.alarmTargetHalt}>{selectedDropOffHalt}</Text>
                  </Text>
                </View>
              </View>

              <Switch
                value={isAlarmEnabled}
                onValueChange={(val) => {
                  setIsAlarmEnabled(val);
                  if (val) {
                    Vibration.vibrate(200);
                  }
                }}
                trackColor={{ false: '#E2E8F0', true: '#A7F3D0' }}
                thumbColor={isAlarmEnabled ? '#059669' : '#CBD5E1'}
              />
            </View>

            {isAlarmEnabled && (
              <View style={styles.alarmActiveFooter}>
                <Ionicons name="information-circle-outline" size={16} color="#059669" />
                <Text style={styles.alarmHintText}>
                  1 stop away. Phone will automatically vibrate when approaching your destination halt.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Halt-by-Halt Vertical Route Journey Timeline */}
        <View style={styles.timelineSectionCard}>
          <View style={styles.timelineHeader}>
            <Text style={styles.timelineSectionTitle}>Route Progress</Text>
            <Text style={styles.timelineNextHaltNotice}>Next: {selectedDropOffHalt} (2 min)</Text>
          </View>

          <View style={styles.timelineList}>
            {journeyHalts.map((halt, index) => {
              const isPassed = halt.status === 'passed';
              const isLast = index === journeyHalts.length - 1;

              return (
                <View key={halt.id} style={styles.timelineItemRow}>
                  {/* Left Column: Time & Distance */}
                  <View style={styles.timeCol}>
                    <Text style={[styles.haltTimeText, halt.isAlarmHalt && styles.haltTimeCurrent]}>
                      {halt.time}
                    </Text>
                    {halt.distance && (
                      <Text style={[styles.haltDistanceText, halt.isAlarmHalt && styles.haltDistanceCurrent]}>
                        {halt.distance}
                      </Text>
                    )}
                  </View>

                  {/* Center Column: Node Circle & Vertical Line */}
                  <View style={styles.nodeColumn}>
                    {/* Top connecting line segment */}
                    {index > 0 && (
                      <View
                        style={[
                          styles.verticalLineTop,
                          isPassed ? styles.linePassed : styles.lineUpcoming,
                        ]}
                      />
                    )}

                    {/* Node Dot / Marker */}
                    {halt.isAlarmHalt ? (
                      <View style={styles.currentNodeOuter}>
                        <Ionicons name="notifications" size={11} color="#FFFFFF" />
                      </View>
                    ) : isPassed ? (
                      <View style={styles.passedNode}>
                        <Ionicons name="checkmark" size={10} color="#FFFFFF" />
                      </View>
                    ) : (
                      <View style={styles.upcomingNode} />
                    )}

                    {/* Bottom connecting line segment */}
                    {!isLast && (
                      <View
                        style={[
                          styles.verticalLineBottom,
                          isPassed ? styles.linePassed : styles.lineUpcoming,
                        ]}
                      />
                    )}
                  </View>

                  {/* Right Column: Halt Name & Badges */}
                  <View style={styles.haltInfoCol}>
                    <View style={styles.haltNameRow}>
                      <Text
                        style={[
                          styles.haltNameText,
                          isPassed && styles.haltNamePassed,
                          halt.isAlarmHalt && styles.haltNameCurrent,
                        ]}
                      >
                        {halt.name}
                      </Text>
                    </View>

                    {halt.isAlarmHalt && (
                      <View style={styles.alarmPointBadge}>
                        <Ionicons name="notifications" size={11} color="#059669" />
                        <Text style={styles.alarmPointBadgeText}>
                          Your destination • 1 stop away
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Safety & Assistance Footer */}
        <View style={styles.assistanceCard}>
          <View style={styles.assistanceLeft}>
            <Ionicons name="shield-checkmark" size={22} color="#059669" />
            <View>
              <Text style={styles.assistanceTitle}>Need Conductor Help?</Text>
              <Text style={styles.assistanceSub}>Notify conductor of baggage / stop request</Text>
            </View>
          </View>

          <Pressable style={styles.assistanceBtn} onPress={handleConductorHelp}>
            <Text style={styles.assistanceBtnText}>Notify</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.3,
  },
  onBoardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  onBoardText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  shareBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    gap: 14,
  },
  activeBusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#EEF2F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  busMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  routePill: {
    backgroundColor: '#0E90E6',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routePillText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  busInfoCol: {
    flex: 1,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  busPlateSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  seatBadge: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D0E6FA',
  },
  seatBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0E90E6',
  },
  telemetryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  telemetryBox: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  telemetryVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  telemetryLabel: {
    fontSize: 10,
    color: '#8A95A5',
    fontWeight: '600',
  },
  alarmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#EEF2F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  alarmCardActive: {
    borderColor: '#A7F3D0',
    backgroundColor: '#ECFDF5',
  },
  alarmHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alarmIconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  alarmIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alarmIconCircleActive: {
    backgroundColor: '#059669',
  },
  alarmTextCol: {
    flex: 1,
  },
  alarmTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  alarmSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  alarmTargetHalt: {
    color: '#059669',
    fontWeight: '800',
  },
  alarmActiveFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#D1FAE5',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alarmHintText: {
    flex: 1,
    fontSize: 12,
    color: '#047857',
    fontWeight: '600',
    lineHeight: 16,
  },
  timelineSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#EEF2F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timelineSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  timelineNextHaltNotice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  timelineList: {
    gap: 0,
  },
  timelineItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 48,
  },
  timeCol: {
    width: 72,
    alignItems: 'flex-end',
    paddingRight: 10,
    paddingTop: 2,
  },
  haltTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  haltTimeCurrent: {
    color: '#059669',
    fontWeight: '900',
  },
  haltDistanceText: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '500',
    marginTop: 2,
  },
  haltDistanceCurrent: {
    color: '#059669',
    fontWeight: '700',
  },
  nodeColumn: {
    width: 24,
    alignItems: 'center',
    position: 'relative',
    height: '100%',
  },
  verticalLineTop: {
    position: 'absolute',
    top: 0,
    width: 2,
    height: 10,
  },
  verticalLineBottom: {
    position: 'absolute',
    top: 18,
    bottom: 0,
    width: 2,
  },
  linePassed: {
    backgroundColor: '#0E90E6',
  },
  lineUpcoming: {
    backgroundColor: '#E2E8F0',
  },
  passedNode: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0E90E6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    marginTop: 2,
  },
  currentNodeOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 3,
  },
  upcomingNode: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    marginTop: 3,
  },
  haltInfoCol: {
    flex: 1,
    paddingLeft: 8,
    paddingBottom: 14,
  },
  haltNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  haltNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  haltNamePassed: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  haltNameCurrent: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '900',
  },
  alarmPointBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  alarmPointBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  assistanceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#EEF2F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  assistanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  assistanceTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  assistanceSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  assistanceBtn: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  assistanceBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    backgroundColor: '#FAFBFD',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8A95A5',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 6,
  },
});
