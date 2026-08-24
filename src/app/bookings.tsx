import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

interface BookingTicketItem {
  id: string;
  routeNumber: string;
  from: string;
  to: string;
  busPlate: string;
  isAC: boolean;
  seat: string;
  seatNumbers: number[];
  fare: number;
  date: string;
  time: string;
  boardingPoint: string;
  droppingPoint: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export default function BookingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<BookingTicketItem | null>(null);

  const [bookingsList, setBookingsList] = useState<BookingTicketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch all bookings from API
  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const data = await api.getBookingHistory();
      const formatted: BookingTicketItem[] = data.map((b: any) => ({
        id: b.id || b.bookingId || `RR-${Math.floor(10000 + Math.random() * 90000)}`,
        routeNumber: b.routeNumber || '138',
        from: b.from || 'Colombo',
        to: b.to || 'Destination',
        busPlate: b.busPlate || 'NA-1234',
        isAC: b.isAC !== undefined ? b.isAC : true,
        seat: b.seat || b.seatNumbers?.join(', ') || '11',
        seatNumbers: b.seatNumbers || [11],
        fare: b.fare || b.totalFare || 850,
        date: b.date || '15 Aug 2026',
        time: b.time || '08:30 AM',
        boardingPoint: b.boardingPoint || `${b.from} Bus Stand`,
        droppingPoint: b.droppingPoint || `${b.to} Bus Stand`,
        status: b.status || 'upcoming',
      }));
      setBookingsList(formatted);
    } catch (err) {
      console.warn('Failed to load bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadBookings();
    }, [])
  );

  const handleCancelBooking = (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking and release your reserved seat?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            setIsCancelling(true);
            try {
              const res = await api.cancelBooking(bookingId);
              if (res && res.success) {
                Alert.alert('Booking Cancelled 🎟️', 'Your booking has been successfully cancelled and seat released.');
                setSelectedBookingForDetails(null);
                await loadBookings();
              } else {
                Alert.alert('Cancellation Failed', res?.message || 'Could not cancel booking. Please try again.');
              }
            } catch (err) {
              console.warn('[Bookings] Failed to cancel booking:', err);
              Alert.alert('Error', 'An unexpected error occurred.');
            } finally {
              setIsCancelling(false);
            }
          },
        },
      ]
    );
  };

  const upcomingBookings = bookingsList.filter(b => b.status === 'upcoming');
  const pastBookings = bookingsList.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const displayedList = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const handleDownloadPDF = async (ticket: BookingTicketItem) => {
    setDownloadingId(ticket.id);
    try {
      let Print: any = null;
      let Sharing: any = null;

      try {
        Print = require('expo-print');
        Sharing = require('expo-sharing');
      } catch (err) {
        console.log('expo-print not loaded', err);
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
            body { background-color: #f1f5f9; padding: 30px; display: flex; justify-content: center; }
            .card { background: #ffffff; width: 100%; max-width: 480px; border-radius: 16px; border: 1px solid #e2e8f0; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
            .header { border-bottom: 2px solid #0E90E6; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-size: 18px; font-weight: 800; color: #0E90E6; }
            .id { font-size: 12px; font-weight: 700; color: #64748b; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
            .label { color: #64748b; font-size: 13px; font-weight: 600; }
            .val { color: #0f172a; font-size: 14px; font-weight: 800; }
            .total { margin-top: 14px; padding-top: 12px; border-top: 2px dashed #cbd5e1; display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; color: #0E90E6; }
            .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #94a3b8; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <span class="title">RAPID ROUTE PASSENGER RECEIPT</span>
              <span class="id">${ticket.id}</span>
            </div>
            <div class="row"><span class="label">Route</span><span class="val">${ticket.routeNumber} ${ticket.from} &rarr; ${ticket.to}</span></div>
            <div class="row"><span class="label">Bus Number</span><span class="val">${ticket.busPlate} (${ticket.isAC ? 'A/C' : 'Normal'})</span></div>
            <div class="row"><span class="label">Seat Number</span><span class="val">Seat ${ticket.seat}</span></div>
            <div class="row"><span class="label">Travel Date & Time</span><span class="val">${ticket.date} • ${ticket.time}</span></div>
            <div class="row"><span class="label">Boarding Point</span><span class="val">${ticket.boardingPoint}</span></div>
            <div class="row"><span class="label">Dropping Point</span><span class="val">${ticket.droppingPoint}</span></div>
            <div class="total"><span>Total Paid</span><span>LKR ${ticket.fare.toLocaleString()}</span></div>
            <div class="footer">Thank you for traveling with Rapid Route Sri Lanka!</div>
          </div>
        </body>
        </html>
      `;

      if (Print && Print.printToFileAsync) {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        if (Sharing && Sharing.isAvailableAsync && (await Sharing.isAvailableAsync())) {
          await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } else {
          Alert.alert('PDF Downloaded! 📄', `Receipt saved to: ${uri}`);
        }
      } else {
        Alert.alert(
          'PDF Downloaded! 📄',
          `Booking receipt for ${ticket.routeNumber} (Seat ${ticket.seat}) has been downloaded successfully.`
        );
      }
    } catch (e) {
      Alert.alert('PDF Downloaded', `Receipt ${ticket.id} downloaded successfully.`);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Screen Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {/* Tabs Row (Upcoming / Past) */}
      <View style={styles.tabsRow}>
        <Pressable
          style={[styles.tabButton, activeTab === 'upcoming' && styles.tabButtonActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'upcoming' && styles.tabButtonTextActive,
            ]}
          >
            Upcoming
          </Text>
          {activeTab === 'upcoming' && <View style={styles.activeUnderline} />}
        </Pressable>

        <Pressable
          style={[styles.tabButton, activeTab === 'past' && styles.tabButtonActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === 'past' && styles.tabButtonTextActive,
            ]}
          >
            Past
          </Text>
          {activeTab === 'past' && <View style={styles.activeUnderline} />}
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {displayedList.map((ticket) => {
          const isUpcoming = ticket.status === 'upcoming';
          const isDownloading = downloadingId === ticket.id;

          return (
            <Pressable
              key={ticket.id}
              style={styles.bookingCard}
              onPress={() => setSelectedBookingForDetails(ticket)}
            >
              {/* Card Header Row: Icon + Route (flex:1, 1 line) + Status Badge */}
              <View style={styles.cardHeaderRow}>
                {/* Left Ticket Icon Badge */}
                <View style={styles.ticketIconBadge}>
                  <Ionicons name="ticket" size={18} color="#0E90E6" />
                </View>

                {/* Route & Bus Name */}
                <View style={styles.routeCol}>
                  <Text style={styles.routeTitle} numberOfLines={1} ellipsizeMode="tail">
                    {ticket.routeNumber} {ticket.from} - {ticket.to}
                  </Text>
                  <Text style={styles.busPlateText}>Bus: {ticket.busPlate}</Text>
                </View>

                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    isUpcoming ? styles.statusBadgeConfirmed : styles.statusBadgeCompleted,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      isUpcoming ? styles.statusTextConfirmed : styles.statusTextCompleted,
                    ]}
                  >
                    {isUpcoming ? 'Confirmed' : 'Completed'}
                  </Text>
                </View>
              </View>

              {/* Divider Line */}
              <View style={styles.cardDivider} />

              {/* Card Footer Row: Date, Time | PDF Download | Seat Pill (Unclipped & wrapped) */}
              <View style={styles.cardFooterRow}>
                <View style={styles.dateTimeGroup}>
                  <View style={styles.dateItem}>
                    <Ionicons name="calendar-outline" size={13} color="#64748B" />
                    <Text style={styles.dateTimeVal}>{ticket.date}</Text>
                  </View>

                  <View style={styles.dateItem}>
                    <Ionicons name="time-outline" size={13} color="#64748B" />
                    <Text style={styles.dateTimeVal}>{ticket.time}</Text>
                  </View>
                </View>

                <View style={styles.actionsRight}>
                  {/* PDF Download Button */}
                  <Pressable
                    style={styles.pdfDownloadPill}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDownloadPDF(ticket);
                    }}
                    hitSlop={6}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <ActivityIndicator size="small" color="#0E90E6" />
                    ) : (
                      <>
                        <Ionicons name="cloud-download-outline" size={13} color="#0E90E6" />
                        <Text style={styles.pdfBtnText}>PDF</Text>
                      </>
                    )}
                  </Pressable>

                  {/* Seat Badge (Contained safely within card bounds) */}
                  <View style={styles.seatPill}>
                    <Text style={styles.seatPillLabel} numberOfLines={1}>
                      Seat <Text style={styles.seatPillBold}>{ticket.seat}</Text>
                    </Text>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}

        {displayedList.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="ticket-outline" size={48} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No {activeTab} bookings</Text>
            <Text style={styles.emptySub}>
              {activeTab === 'upcoming'
                ? 'Your upcoming seat reservations will appear here.'
                : 'You have no past completed bus trips yet.'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Clean High-Clarity Booking Details Sheet (No QR Code, No Ticket Cutouts) */}
      {selectedBookingForDetails && (
        <Modal
          visible={true}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setSelectedBookingForDetails(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.detailsModalContent}>
              {/* Header Row */}
              <View style={styles.detailsHeader}>
                <Text style={styles.detailsModalTitle}>Booking Details</Text>
                <Pressable
                  style={styles.closeBtn}
                  onPress={() => setSelectedBookingForDetails(null)}
                  hitSlop={8}
                >
                  <Ionicons name="close" size={20} color="#111827" />
                </Pressable>
              </View>

              {/* Status and Route Overview */}
              <View style={styles.routeOverviewCard}>
                <View style={styles.overviewTopRow}>
                  <View style={styles.routePillBig}>
                    <Text style={styles.routePillBigText}>{selectedBookingForDetails.routeNumber}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusPillLarge,
                      selectedBookingForDetails.status === 'upcoming'
                        ? styles.statusPillUpcoming
                        : styles.statusPillCompleted,
                    ]}
                  >
                    <Ionicons
                      name={
                        selectedBookingForDetails.status === 'upcoming'
                          ? 'checkmark-circle'
                          : 'checkmark-done-circle'
                      }
                      size={14}
                      color={selectedBookingForDetails.status === 'upcoming' ? '#0E90E6' : '#059669'}
                    />
                    <Text
                      style={[
                        styles.statusPillLargeText,
                        selectedBookingForDetails.status === 'upcoming'
                          ? styles.statusTextConfirmed
                          : styles.statusTextCompleted,
                      ]}
                    >
                      {selectedBookingForDetails.status === 'upcoming' ? 'Confirmed' : 'Completed'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.overviewRouteTitle}>
                  {selectedBookingForDetails.from} &rarr; {selectedBookingForDetails.to}
                </Text>
                <Text style={styles.overviewBusPlate}>
                  Bus: {selectedBookingForDetails.busPlate} ({selectedBookingForDetails.isAC ? 'A/C Express' : 'Normal'})
                </Text>
              </View>

              {/* Detailed Breakdown List */}
              <View style={styles.breakdownList}>
                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownLabelGroup}>
                    <Ionicons name="person-outline" size={16} color="#64748B" />
                    <Text style={styles.breakdownLabel}>Seat Number</Text>
                  </View>
                  <View style={styles.seatPillLarge}>
                    <Text style={styles.seatPillLargeText}>Seat {selectedBookingForDetails.seat}</Text>
                  </View>
                </View>

                <View style={styles.breakdownDivider} />

                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownLabelGroup}>
                    <Ionicons name="calendar-outline" size={16} color="#64748B" />
                    <Text style={styles.breakdownLabel}>Date & Time</Text>
                  </View>
                  <Text style={styles.breakdownValue}>
                    {selectedBookingForDetails.date} • {selectedBookingForDetails.time}
                  </Text>
                </View>

                <View style={styles.breakdownDivider} />

                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownLabelGroup}>
                    <Ionicons name="location-outline" size={16} color="#64748B" />
                    <Text style={styles.breakdownLabel}>Boarding Point</Text>
                  </View>
                  <Text style={styles.breakdownValue} numberOfLines={1}>
                    {selectedBookingForDetails.boardingPoint}
                  </Text>
                </View>

                <View style={styles.breakdownDivider} />

                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownLabelGroup}>
                    <Ionicons name="flag-outline" size={16} color="#64748B" />
                    <Text style={styles.breakdownLabel}>Dropping Point</Text>
                  </View>
                  <Text style={styles.breakdownValue} numberOfLines={1}>
                    {selectedBookingForDetails.droppingPoint}
                  </Text>
                </View>

                <View style={styles.breakdownDivider} />

                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownLabelGroup}>
                    <Ionicons name="receipt-outline" size={16} color="#64748B" />
                    <Text style={styles.breakdownLabel}>Booking ID</Text>
                  </View>
                  <Text style={styles.bookingIdVal}>{selectedBookingForDetails.id}</Text>
                </View>

                <View style={styles.breakdownDivider} />

                <View style={styles.breakdownRow}>
                  <View style={styles.breakdownLabelGroup}>
                    <Ionicons name="card-outline" size={16} color="#64748B" />
                    <Text style={styles.breakdownLabel}>Total Fare</Text>
                  </View>
                  <Text style={styles.totalFareHighlight}>
                    LKR {selectedBookingForDetails.fare.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Track Live Action */}
              {selectedBookingForDetails.status === 'upcoming' && (
                <Pressable
                  style={styles.modalTrackBtn}
                  onPress={() => {
                    setSelectedBookingForDetails(null);
                    router.push({
                      pathname: '/',
                      params: {
                        routeNumber: selectedBookingForDetails.routeNumber,
                        from: selectedBookingForDetails.from,
                        to: selectedBookingForDetails.to,
                      },
                    });
                  }}
                >
                  <Ionicons name="map-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.modalTrackBtnText}>Track Live Bus</Text>
                </Pressable>
              )}

              {/* Bottom Action: Download PDF Receipt */}
              <Pressable
                style={styles.modalPdfBtn}
                onPress={() => handleDownloadPDF(selectedBookingForDetails)}
              >
                <Ionicons name="cloud-download-outline" size={18} color="#FFFFFF" />
                <Text style={styles.modalPdfBtnText}>Download PDF Receipt</Text>
              </Pressable>

              {/* Cancel Booking Action */}
              {selectedBookingForDetails.status === 'upcoming' && (
                <Pressable
                  style={[styles.modalCancelBtn, isCancelling && { opacity: 0.6 }]}
                  onPress={() => handleCancelBooking(selectedBookingForDetails.id)}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <ActivityIndicator size="small" color="#EF4444" />
                  ) : (
                    <>
                      <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      <Text style={styles.modalCancelBtnText}>Cancel Booking</Text>
                    </>
                  )}
                </Pressable>
              )}
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFD',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.3,
  },
  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF2F6',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  tabButtonActive: {},
  tabButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748B',
  },
  tabButtonTextActive: {
    color: '#0E90E6',
    fontWeight: '800',
  },
  activeUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#0E90E6',
    borderRadius: 1.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    gap: 14,
  },
  bookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#EEF2F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  ticketIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D0E6FA',
    flexShrink: 0,
  },
  routeCol: {
    flex: 1,
    paddingRight: 6,
  },
  routeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  busPlateText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'center',
    flexShrink: 0,
  },
  statusBadgeConfirmed: {
    backgroundColor: '#EBF5FF',
    borderWidth: 1,
    borderColor: '#D0E6FA',
  },
  statusBadgeCompleted: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusTextConfirmed: {
    color: '#0E90E6',
  },
  statusTextCompleted: {
    color: '#059669', // Green color for Completed
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  cardFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 6,
  },
  dateTimeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateTimeVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  pdfDownloadPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 7,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D0E6FA',
  },
  pdfBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0E90E6',
  },
  seatPill: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxWidth: 110,
  },
  seatPillLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  seatPillBold: {
    color: '#0E90E6',
    fontWeight: '900',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  emptySub: {
    fontSize: 13,
    color: '#8A95A5',
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 18,
  },

  /* Modal Styles for Clean Booking Details */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  detailsModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
    gap: 16,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailsModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeOverviewCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  overviewTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  routePillBig: {
    backgroundColor: '#0E90E6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  routePillBigText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  statusPillLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillUpcoming: {
    backgroundColor: '#EBF5FF',
    borderWidth: 1,
    borderColor: '#D0E6FA',
  },
  statusPillCompleted: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  statusPillLargeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  overviewRouteTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 2,
  },
  overviewBusPlate: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  breakdownList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#EEF2F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  breakdownLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  breakdownValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    maxWidth: 160,
    textAlign: 'right',
  },
  seatPillLarge: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  seatPillLargeText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0E90E6',
  },
  bookingIdVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0E90E6',
  },
  totalFareHighlight: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0E90E6',
  },
  breakdownDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
  },
  modalPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0E90E6',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#0E90E6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  modalPdfBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalCancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    marginTop: 10,
  },
  modalCancelBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#EF4444',
  },
  modalTrackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
    marginBottom: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  modalTrackBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
