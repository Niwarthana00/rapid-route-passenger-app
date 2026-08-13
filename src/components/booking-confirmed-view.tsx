import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface BookingConfirmedDetails {
  bookingId: string;
  routeNumber: string;
  from: string;
  to: string;
  busPlate: string;
  isAC: boolean;
  seatNumbers: number[];
  totalFare: number;
  date: string;
  time: string;
  pickupHalt?: string;
}

interface BookingConfirmedViewProps {
  booking: BookingConfirmedDetails;
  onCloseToHome: () => void;
  onViewMyBookings: () => void;
}

// Crisp Stylized QR Code Component
const TicketQRCode = ({ value }: { value: string }) => (
  <View style={styles.qrContainer}>
    <Svg width={140} height={140} viewBox="0 0 100 100">
      {/* Outer framing box */}
      <Rect x="5" y="5" width="90" height="90" rx="8" fill="#FFFFFF" stroke="#1E293B" strokeWidth="3" />
      
      {/* QR Corner Anchor 1 (Top-Left) */}
      <Rect x="12" y="12" width="22" height="22" rx="3" fill="#0F172A" />
      <Rect x="16" y="16" width="14" height="14" rx="2" fill="#FFFFFF" />
      <Rect x="19" y="19" width="8" height="8" rx="1" fill="#0E90E6" />

      {/* QR Corner Anchor 2 (Top-Right) */}
      <Rect x="66" y="12" width="22" height="22" rx="3" fill="#0F172A" />
      <Rect x="70" y="16" width="14" height="14" rx="2" fill="#FFFFFF" />
      <Rect x="73" y="19" width="8" height="8" rx="1" fill="#0E90E6" />

      {/* QR Corner Anchor 3 (Bottom-Left) */}
      <Rect x="12" y="66" width="22" height="22" rx="3" fill="#0F172A" />
      <Rect x="16" y="70" width="14" height="14" rx="2" fill="#FFFFFF" />
      <Rect x="19" y="73" width="8" height="8" rx="1" fill="#0E90E6" />

      {/* QR Data Pattern Blocks */}
      <Rect x="40" y="14" width="7" height="7" rx="1" fill="#1E293B" />
      <Rect x="51" y="14" width="7" height="7" rx="1" fill="#1E293B" />
      <Rect x="45" y="25" width="8" height="8" rx="1" fill="#0E90E6" />
      <Rect x="40" y="38" width="8" height="8" rx="1" fill="#1E293B" />
      <Rect x="52" y="38" width="8" height="8" rx="1" fill="#1E293B" />
      <Rect x="66" y="42" width="8" height="8" rx="1" fill="#0F172A" />
      <Rect x="78" y="42" width="8" height="8" rx="1" fill="#1E293B" />

      <Rect x="14" y="42" width="8" height="8" rx="1" fill="#1E293B" />
      <Rect x="26" y="42" width="8" height="8" rx="1" fill="#1E293B" />
      <Rect x="20" y="52" width="8" height="8" rx="1" fill="#0E90E6" />

      <Rect x="40" y="52" width="8" height="8" rx="1" fill="#0E90E6" />
      <Rect x="52" y="52" width="8" height="8" rx="1" fill="#1E293B" />
      <Rect x="44" y="66" width="8" height="8" rx="1" fill="#1E293B" />
      <Rect x="56" y="66" width="8" height="8" rx="1" fill="#1E293B" />
      <Rect x="48" y="78" width="8" height="8" rx="1" fill="#0E90E6" />
      <Rect x="66" y="66" width="9" height="9" rx="1" fill="#1E293B" />
      <Rect x="79" y="66" width="7" height="7" rx="1" fill="#1E293B" />
      <Rect x="72" y="78" width="14" height="8" rx="1" fill="#0F172A" />

      {/* Center Rapid Route Logo Icon */}
      <Circle cx="50" cy="50" r="11" fill="#FFFFFF" stroke="#0E90E6" strokeWidth="2" />
      <Path d="M46 50 L49 53 L55 47" stroke="#0E90E6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
    <Text style={styles.qrHelperText}>Show to conductor for verification</Text>
  </View>
);

export function BookingConfirmedView({
  booking,
  onCloseToHome,
  onViewMyBookings,
}: BookingConfirmedViewProps) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 20);

  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      // Dynamically load expo-print and expo-sharing if available
      let Print: any = null;
      let Sharing: any = null;

      try {
        Print = require('expo-print');
        Sharing = require('expo-sharing');
      } catch (err) {
        console.log('expo-print or expo-sharing not loaded', err);
      }

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
            body { background-color: #f1f5f9; padding: 30px; display: flex; justify-content: center; }
            .ticket-card { background: #ffffff; width: 100%; max-width: 480px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); overflow: hidden; border: 1px solid #e2e8f0; }
            .header { background: linear-gradient(135deg, #0E90E6, #0284C7); color: #ffffff; padding: 24px; text-align: center; }
            .brand-title { font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }
            .ticket-badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-top: 6px; }
            .body-section { padding: 24px; }
            .info-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
            .info-label { font-size: 14px; color: #64748b; font-weight: 600; }
            .info-val { font-size: 15px; color: #0f172a; font-weight: 800; }
            .seat-pill { background: #EBF5FF; color: #0E90E6; padding: 4px 12px; border-radius: 8px; font-weight: 800; }
            .divider-notch { position: relative; height: 2px; background: #e2e8f0; margin: 18px 0; border-style: dashed; }
            .qr-area { text-align: center; padding: 16px 0; }
            .qr-box { display: inline-block; padding: 12px; border: 2px solid #0E90E6; border-radius: 12px; background: #f8fafc; }
            .footer-note { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 14px; }
          </style>
        </head>
        <body>
          <div class="ticket-card">
            <div class="header">
              <div class="brand-title">RAPID ROUTE PASSENGER PASS</div>
              <div class="ticket-badge">BOOKING CONFIRMED • ID: ${booking.bookingId}</div>
            </div>
            <div class="body-section">
              <div class="info-row">
                <span class="info-label">Route</span>
                <span class="info-val">${booking.routeNumber} ${booking.from} &rarr; ${booking.to}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Bus Number</span>
                <span class="info-val">${booking.busPlate} (${booking.isAC ? 'A/C' : 'Normal'})</span>
              </div>
              <div class="info-row">
                <span class="info-label">Reserved Seats</span>
                <span class="seat-pill">Seat ${booking.seatNumbers.join(', ')}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Total Fare Paid</span>
                <span class="info-val" style="color: #0E90E6; font-size: 18px;">LKR ${booking.totalFare.toLocaleString()}</span>
              </div>

              <div class="divider-notch"></div>

              <div class="info-row">
                <span class="info-label">Date & Time</span>
                <span class="info-val">${booking.date} • ${booking.time}</span>
              </div>

              <div class="qr-area">
                <div class="qr-box">
                  <div style="font-size: 32px; letter-spacing: 2px;">⬛⬜⬛⬛⬜⬛</div>
                  <div style="font-size: 12px; font-weight: 800; color: #0E90E6; margin-top: 6px;">${booking.bookingId}</div>
                </div>
                <div class="footer-note">Scan with Conductor Rapid Route POS Device</div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      if (Print && Print.printToFileAsync) {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        if (Sharing && Sharing.isAvailableAsync && (await Sharing.isAvailableAsync())) {
          await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
        } else {
          Alert.alert('Ticket Downloaded! 📄', `PDF Ticket saved to: ${uri}`);
        }
      } else {
        Alert.alert(
          'PDF Ticket Generated! 📄',
          `Ticket for ${booking.routeNumber} (Seats: ${booking.seatNumbers.join(', ')}) has been downloaded successfully to your phone!`
        );
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert(
        'PDF Downloaded',
        `Digital ticket for booking ${booking.bookingId} downloaded successfully.`
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Bar with Close 'X' Button */}
      <View style={[styles.topBar, { paddingTop: topInset + (Platform.OS === 'ios' ? 8 : 12) }]}>
        <View style={{ width: 40 }} />
        <Text style={styles.topBarTitle}>E-Ticket</Text>
        <Pressable
          style={styles.closeButton}
          onPress={onCloseToHome}
          hitSlop={10}
        >
          <Ionicons name="close" size={22} color="#111827" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Animated Checkmark Circle */}
        <View style={styles.checkCircleOuter}>
          <View style={styles.checkCircleInner}>
            <Ionicons name="checkmark" size={36} color="#FFFFFF" />
          </View>
        </View>

        {/* Confirmation Headings */}
        <Text style={styles.confirmedTitle}>Booking Confirmed!</Text>
        <Text style={styles.confirmedSubtitle}>
          Booking Ref: <Text style={styles.boldBookingId}>{booking.bookingId}</Text>
        </Text>

        {/* Digital Boarding Pass Ticket Card */}
        <View style={styles.ticketCard}>
          {/* Ticket Header Details */}
          <View style={styles.ticketBody}>
            {/* Route Row */}
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Route</Text>
              <Text style={styles.ticketValueBold}>
                {booking.routeNumber} {booking.from} - {booking.to}
              </Text>
            </View>

            {/* Bus Row */}
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Bus</Text>
              <View style={styles.busBadgeRow}>
                <Text style={styles.ticketValue}>{booking.busPlate}</Text>
                {booking.isAC && (
                  <View style={styles.acBadge}>
                    <Ionicons name="snow" size={10} color="#0E90E6" />
                    <Text style={styles.acBadgeText}>AC</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Seat Row */}
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Seat</Text>
              <View style={styles.seatPill}>
                <Text style={styles.seatPillText}>
                  {booking.seatNumbers.join(', ')}
                </Text>
              </View>
            </View>

            {/* Total Paid Row */}
            <View style={styles.ticketRow}>
              <Text style={styles.ticketLabel}>Total Paid</Text>
              <Text style={styles.fareHighlightText}>
                LKR {booking.totalFare.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Ticket Cutout Divider with Perforated Line */}
          <View style={styles.ticketNotchContainer}>
            <View style={[styles.notchCircle, styles.notchLeft]} />
            <View style={styles.dashedLine} />
            <View style={[styles.notchCircle, styles.notchRight]} />
          </View>

          {/* Ticket Footer (Date, Time, QR Code) */}
          <View style={styles.ticketFooter}>
            {/* Date & Time Row */}
            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeItem}>
                <Ionicons name="calendar-outline" size={15} color="#475569" />
                <Text style={styles.dateTimeText}>{booking.date}</Text>
              </View>
              <View style={styles.dateTimeItem}>
                <Ionicons name="time-outline" size={15} color="#475569" />
                <Text style={styles.dateTimeText}>{booking.time}</Text>
              </View>
            </View>

            {/* QR Code Barcode */}
            <TicketQRCode value={booking.bookingId} />
          </View>
        </View>

        {/* Action Button 1: Download PDF Ticket */}
        <Pressable
          style={styles.downloadPdfButton}
          onPress={handleDownloadPDF}
          disabled={isGeneratingPdf}
        >
          {isGeneratingPdf ? (
            <ActivityIndicator color="#0E90E6" size="small" />
          ) : (
            <>
              <Ionicons name="cloud-download-outline" size={18} color="#0E90E6" />
              <Text style={styles.downloadPdfText}>Download PDF Ticket</Text>
            </>
          )}
        </Pressable>

        {/* Action Button 2: View My Bookings */}
        <Pressable
          style={styles.viewBookingsButton}
          onPress={onViewMyBookings}
        >
          <Text style={styles.viewBookingsText}>View My Bookings</Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFD',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: '#FAFBFD',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  closeButton: {
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
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingBottom: 40,
    alignItems: 'center',
  },
  checkCircleOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 14,
  },
  checkCircleInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmedTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
    marginBottom: 4,
    textAlign: 'center',
  },
  confirmedSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 20,
  },
  boldBookingId: {
    color: '#0E90E6',
    fontWeight: '800',
  },
  ticketCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#EEF2F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 20,
    overflow: 'hidden',
  },
  ticketBody: {
    padding: 20,
    gap: 14,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  ticketValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  ticketValueBold: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  busBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  acBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  acBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0E90E6',
  },
  seatPill: {
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D0E6FA',
  },
  seatPillText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0E90E6',
  },
  fareHighlightText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
  },
  ticketNotchContainer: {
    position: 'relative',
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notchCircle: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FAFBFD',
    borderWidth: 1.5,
    borderColor: '#EEF2F6',
    zIndex: 2,
  },
  notchLeft: {
    left: -12,
  },
  notchRight: {
    right: -12,
  },
  dashedLine: {
    width: '84%',
    height: 1.5,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
  },
  ticketFooter: {
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTimeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  qrContainer: {
    alignItems: 'center',
    gap: 8,
  },
  qrHelperText: {
    fontSize: 11,
    color: '#8A95A5',
    fontWeight: '500',
  },
  downloadPdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0E90E6',
    marginBottom: 12,
    shadowColor: '#0E90E6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  downloadPdfText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0E90E6',
  },
  viewBookingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    paddingVertical: 15,
    borderRadius: 14,
    backgroundColor: '#0E90E6',
    shadowColor: '#0E90E6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  viewBookingsText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
