import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function BookingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Active Ticket Card */}
        <Text style={styles.sectionTitle}>Active Tickets</Text>
        <View style={styles.ticketContainer}>
          {/* Top part of ticket */}
          <View style={styles.ticketTop}>
            <View style={styles.ticketRouteHeader}>
              <View style={styles.busLabel}>
                <Ionicons name="bus-outline" size={14} color="#ffffff" />
                <Text style={styles.busLabelText}>138 Route</Text>
              </View>
              <Text style={styles.ticketValidText}>Valid Today</Text>
            </View>
            <Text style={styles.ticketRouteName}>Colombo Fort - Kottawa</Text>
            <View style={styles.detailsGrid}>
              <View>
                <Text style={styles.detailLabel}>Date</Text>
                <Text style={styles.detailValue}>16 Jul 2026</Text>
              </View>
              <View>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>One Way</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.detailLabel}>Fare</Text>
                <Text style={styles.detailValue}>LKR 120.00</Text>
              </View>
            </View>
          </View>

          {/* Dotted Divider line */}
          <View style={styles.ticketDivider}>
            <View style={styles.leftCutout} />
            <View style={styles.dashedLine} />
            <View style={styles.rightCutout} />
          </View>

          {/* Bottom part of ticket (QR code scanner placeholder) */}
          <View style={styles.ticketBottom}>
            <View style={styles.qrPlaceholder}>
              {/* Draw a mock vector QR code */}
              <View style={styles.qrCornerTopLeft} />
              <View style={styles.qrCornerTopRight} />
              <View style={styles.qrCornerBottomLeft} />
              <View style={styles.qrInnerBlock} />
              <Text style={styles.qrCodeLabel}>SCAN ON BOARD</Text>
            </View>
          </View>
        </View>

        {/* Buy Passes Section */}
        <Text style={styles.sectionTitle}>Travel Passes</Text>
        <Pressable style={styles.buyPassCard}>
          <View style={styles.passInfo}>
            <Ionicons name="star" size={24} color="#0E90E6" />
            <View style={styles.passTextColumn}>
              <Text style={styles.passTitle}>Monthly Season Pass</Text>
              <Text style={styles.passSubtitle}>Unlimited travel on route 138 & 120</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#8A95A5" />
        </Pressable>
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
  ticketContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10, // Curve reduced to 10
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  ticketTop: {
    padding: 20,
  },
  ticketRouteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  busLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E90E6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  busLabelText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  ticketValidText: {
    color: '#137333',
    fontSize: 12,
    fontWeight: '700',
  },
  ticketRouteName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailLabel: {
    fontSize: 11,
    color: '#8A95A5',
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '700',
  },
  ticketDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    backgroundColor: '#ffffff',
    position: 'relative',
  },
  leftCutout: {
    width: 10,
    height: 20,
    backgroundColor: '#FAFBFD',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'absolute',
    left: -1,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  rightCutout: {
    width: 10,
    height: 20,
    backgroundColor: '#FAFBFD',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'absolute',
    right: -1,
  },
  ticketBottom: {
    padding: 20,
    backgroundColor: '#FAFBFC',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  qrPlaceholder: {
    width: 130,
    height: 130,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10, // Curve reduced to 10
    backgroundColor: '#ffffff',
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  qrCornerTopLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 24,
    height: 24,
    borderWidth: 3,
    borderColor: '#111827',
  },
  qrCornerTopRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderWidth: 3,
    borderColor: '#111827',
  },
  qrCornerBottomLeft: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    width: 24,
    height: 24,
    borderWidth: 3,
    borderColor: '#111827',
  },
  qrInnerBlock: {
    width: 32,
    height: 32,
    backgroundColor: '#111827',
  },
  qrCodeLabel: {
    position: 'absolute',
    bottom: -15,
    fontSize: 9,
    fontWeight: '800',
    color: '#8A95A5',
    letterSpacing: 1.5,
  },
  buyPassCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10, // Curve reduced to 10
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.01,
    shadowRadius: 4,
    elevation: 1,
  },
  passInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  passTextColumn: {
    flexDirection: 'column',
    gap: 2,
  },
  passTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  passSubtitle: {
    fontSize: 12,
    color: '#8A95A5',
    fontWeight: '500',
  },
});
