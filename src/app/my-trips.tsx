import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { SymbolView } from 'expo-symbols';

export default function MyTripsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Trips</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Trip Section */}
        <Text style={styles.sectionTitle}>Active Trip</Text>
        <View style={styles.activeTripCard}>
          <View style={styles.cardHeader}>
            <View style={styles.routeBadge}>
              <Text style={styles.routeText}>138</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>In Progress</Text>
            </View>
          </View>

          <Text style={styles.tripRouteName}>Colombo Fort - Kottawa</Text>
          
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressLineBg}>
              <View style={styles.progressLineFill} />
            </View>
            <View style={styles.stationRow}>
              <Text style={styles.stationText}>Colombo Fort</Text>
              <Text style={styles.stationText}>Kottawa</Text>
            </View>
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.fareLabel}>Estimated Fare</Text>
            <Text style={styles.fareAmount}>LKR 120.00</Text>
          </View>
        </View>

        {/* History Section */}
        <Text style={styles.sectionTitle}>Past Trips</Text>
        
        {/* Past Trip 1 */}
        <View style={styles.pastTripCard}>
          <View style={styles.pastTripHeader}>
            <Text style={styles.pastTripRoute}>120 Horana - Pettah</Text>
            <Text style={styles.pastTripFare}>LKR 90.00</Text>
          </View>
          <View style={styles.pastTripDetails}>
            <View style={styles.detailRow}>
              <SymbolView name="calendar" size={14} tintColor="#8A95A5" />
              <Text style={styles.detailText}>Yesterday, 05:40 PM</Text>
            </View>
            <View style={[styles.historyBadge, styles.badgeCompleted]}>
              <Text style={styles.completedText}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Past Trip 2 */}
        <View style={styles.pastTripCard}>
          <View style={styles.pastTripHeader}>
            <Text style={styles.pastTripRoute}>17 Panadura - Kandy</Text>
            <Text style={styles.pastTripFare}>LKR 350.00</Text>
          </View>
          <View style={styles.pastTripDetails}>
            <View style={styles.detailRow}>
              <SymbolView name="calendar" size={14} tintColor="#8A95A5" />
              <Text style={styles.detailText}>14 Jul 2026, 08:15 AM</Text>
            </View>
            <View style={[styles.historyBadge, styles.badgeCompleted]}>
              <Text style={styles.completedText}>Completed</Text>
            </View>
          </View>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  scrollContent: {
    padding: 24,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  activeTripCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10, // Curve reduced to 10
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeBadge: {
    backgroundColor: '#0E90E6',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  routeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  statusBadge: {
    backgroundColor: '#EBF5FF',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    color: '#0E90E6',
    fontSize: 12,
    fontWeight: '700',
  },
  tripRouteName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressLineBg: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressLineFill: {
    width: '65%',
    height: '100%',
    backgroundColor: '#0E90E6',
  },
  stationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stationText: {
    fontSize: 12,
    color: '#8A95A5',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  fareLabel: {
    fontSize: 14,
    color: '#8A95A5',
    fontWeight: '500',
  },
  fareAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  pastTripCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 10, // Curve reduced to 10
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  pastTripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pastTripRoute: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  pastTripFare: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },
  pastTripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#8A95A5',
    fontWeight: '500',
  },
  historyBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeCompleted: {
    backgroundColor: '#E6F4EA',
  },
  completedText: {
    color: '#137333',
    fontSize: 11,
    fontWeight: '700',
  },
});
