import React, { useState } from 'react';
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

export default function MyTripsScreen() {
  const [isAlarmEnabled, setIsAlarmEnabled] = useState(true);
  const [selectedDropOffHalt] = useState('Kadawatha');

  const journeyHalts: HaltStep[] = [
    { id: '1', name: 'Colombo Fort Terminal', time: '08:30 AM', status: 'passed' },
    { id: '2', name: 'Peliyagoda Interchange', time: '08:42 AM', status: 'passed' },
    { id: '3', name: 'Kelaniya Halt', time: '08:50 AM', status: 'passed' },
    { id: '4', name: 'Kadawatha Bus Stand', time: '09:05 AM', status: 'upcoming', distance: '1 stop away (2 min)', isAlarmHalt: true },
    { id: '5', name: 'Nittambuwa Town', time: '09:22 AM', status: 'upcoming', distance: '12 km (18 min)' },
    { id: '6', name: 'Pasyala Junction', time: '09:35 AM', status: 'upcoming', distance: '22 km' },
    { id: '7', name: 'Warakapola Station', time: '09:50 AM', status: 'upcoming', distance: '36 km' },
    { id: '8', name: 'Kegalle Main Stand', time: '10:15 AM', status: 'upcoming', distance: '55 km' },
    { id: '9', name: 'Mawanella Town', time: '10:30 AM', status: 'upcoming', distance: '70 km' },
    { id: '10', name: 'Kandy Goods Shed Terminal', time: '10:55 AM', status: 'upcoming', distance: '115 km' },
  ];

  // Check if bus is 1 halt before destination
  const isOneHaltBefore = true;

  const handleShareTrip = async () => {
    try {
      await Share.share({
        message: '🚍 I am traveling on Rapid Route Bus NA-1234 (1-1 Colombo - Kandy). Next stop: Kadawatha (1 stop away).',
      });
    } catch (error) {
      Alert.alert('Share Trip', 'Unable to share live trip link.');
    }
  };

  const handleTestAlarm = () => {
    // Vibrate phone (pattern: wait 0ms, vibrate 500ms, pause 200ms, vibrate 500ms)
    Vibration.vibrate([0, 500, 200, 500]);

    Alert.alert(
      '🔔 Next Halt Alarm',
      `Your stop is next! Approaching ${selectedDropOffHalt}. You are 1 halt away from your destination. Please get ready to alight!`,
      [{ text: 'Dismiss Alarm', style: 'cancel' }]
    );
  };

  const handleConductorHelp = () => {
    Alert.alert(
      '👨‍✈️ Conductor Assistance',
      `Conductor on Bus NA-1234 has been notified of your drop-off request at ${selectedDropOffHalt}.`,
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
              <Text style={styles.routePillText}>1-1</Text>
            </View>
            <View style={styles.busInfoCol}>
              <Text style={styles.routeTitle}>Colombo &rarr; Kandy</Text>
              <Text style={styles.busPlateSubtitle}>Bus: NA-1234 • Luxury A/C</Text>
            </View>
            <View style={styles.seatBadge}>
              <Text style={styles.seatBadgeText}>Seat 11</Text>
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
                <Text style={styles.alarmHintText}>
                  🔔 1 stop away. Phone will vibrate to alert you when reaching the halt.
                </Text>
                <Pressable style={styles.testAlarmBtn} onPress={handleTestAlarm}>
                  <Ionicons name="volume-high-outline" size={13} color="#059669" />
                  <Text style={styles.testAlarmText}>Test Alarm</Text>
                </Pressable>
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
              const isUpcoming = halt.status === 'upcoming';
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
    justifyContent: 'space-between',
    gap: 8,
  },
  alarmHintText: {
    flex: 1,
    fontSize: 11,
    color: '#047857',
    fontWeight: '600',
    lineHeight: 15,
  },
  testAlarmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  testAlarmText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
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
});
