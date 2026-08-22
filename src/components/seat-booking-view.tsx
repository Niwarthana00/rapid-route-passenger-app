import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
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
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BusDetail } from './route-detail-view';
import { BookingConfirmedView, BookingConfirmedDetails } from './booking-confirmed-view';
import { useTabBar } from '../context/tab-bar-context';

interface SeatBookingViewProps {
  bus: BusDetail;
  routeNumber: string;
  from: string;
  to: string;
  onBack: () => void;
  onConfirmBooking?: (selectedSeats: number[], totalFare: number) => void;
}

interface SeatItem {
  number: number;
  label: string;
  status: 'available' | 'occupied' | 'booked';
  isOccupied?: boolean;
  isBooked?: boolean;
  occupied?: boolean;
}

export function SeatBookingView({
  bus,
  routeNumber,
  from,
  to,
  onBack,
  onConfirmBooking,
}: SeatBookingViewProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 20);

  const totalSeats = 40;
  const availableCount = typeof bus.seatsLeft === 'number' ? bus.seatsLeft : 0;

  // State to hold confirmed booking after user confirms the dialog
  const [confirmedBooking, setConfirmedBooking] = useState<BookingConfirmedDetails | null>(null);

  const [seats, setSeats] = useState<SeatItem[]>([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState(true);
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState<number[]>([]);

  // Fetch real-time seat configuration from backend API
  useEffect(() => {
    async function loadSeats() {
      setIsLoadingSeats(true);
      try {
        const data = await api.getBusSeats(bus.id);
        const occupiedList = data && Array.isArray(data.occupiedSeats) ? data.occupiedSeats : [];
        const occupiedSet = new Set(occupiedList);
        
        const seatList: SeatItem[] = Array.from({ length: totalSeats }, (_, i) => {
          const seatNum = i + 1;
          return {
            number: seatNum,
            label: `${seatNum}`,
            status: occupiedSet.has(seatNum) ? 'occupied' : 'available',
          };
        });
        setSeats(seatList);
      } catch (err) {
        console.warn('[SeatBooking] Failed to fetch seat configuration, using all available fallback:', err);
        const seatList: SeatItem[] = Array.from({ length: totalSeats }, (_, i) => {
          const seatNum = i + 1;
          return {
            number: seatNum,
            label: `${seatNum}`,
            status: 'available',
          };
        });
        setSeats(seatList);
      } finally {
        setIsLoadingSeats(false);
      }
    }
    loadSeats();
  }, [bus.id]);

  const toggleSeat = (seat: SeatItem) => {
    if (seat.status === 'occupied') return;

    if (selectedSeatNumbers.includes(seat.number)) {
      setSelectedSeatNumbers(selectedSeatNumbers.filter((n) => n !== seat.number));
    } else {
      setSelectedSeatNumbers([...selectedSeatNumbers, seat.number]);
    }
  };

  const totalFare = selectedSeatNumbers.length * bus.fare;

  const handleCheckout = () => {
    if (selectedSeatNumbers.length === 0) {
      Alert.alert('Select a Seat', 'Please select at least one available seat to proceed.');
      return;
    }

    const seatsText = selectedSeatNumbers.length > 1
      ? `seats ${selectedSeatNumbers.join(', ')}`
      : `seat ${selectedSeatNumbers[0]}`;

    // Prompt "Are you sure?" confirmation dialog
    Alert.alert(
      'Confirm Reservation',
      `Are you sure you want to book ${seatsText} on bus ${bus.plateNumber} (${routeNumber} ${from} - ${to}) for LKR ${totalFare.toLocaleString()}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes, Confirm',
          onPress: () => {
            // POST booking request to backend API
            api.createBooking({
              routeNumber,
              from,
              to,
              busPlate: bus.plateNumber,
              isAC: bus.isAC,
              seatNumbers: selectedSeatNumbers,
              totalFare,
              busId: bus.id,
            }).then((bookingResult) => {
              const newBooking: BookingConfirmedDetails = {
                bookingId: bookingResult.bookingId,
                routeNumber: bookingResult.routeNumber,
                from: bookingResult.from,
                to: bookingResult.to,
                busPlate: bookingResult.busPlate,
                isAC: bookingResult.isAC,
                seatNumbers: bookingResult.seatNumbers,
                totalFare: bookingResult.totalFare,
                date: bookingResult.date,
                time: bookingResult.time,
              };

              setConfirmedBooking(newBooking);
              if (onConfirmBooking) {
                onConfirmBooking(selectedSeatNumbers, totalFare);
              }
            });
          },
        },
      ]
    );
  };

  const { setTabBarVisible } = useTabBar();

  // Render loading screen if seats are loading or not populated yet
  if (isLoadingSeats || seats.length === 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: topInset + (Platform.OS === 'ios' ? 8 : 12) }]}>
          <Pressable onPress={onBack} style={styles.backButton} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </Pressable>
          <View style={styles.headerTitleCol}>
            <Text style={styles.headerTitle}>Select Seat</Text>
            <Text style={styles.headerSubtitle}>
              {bus.plateNumber} • {from} - {to}
            </Text>
          </View>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAFBFD' }}>
          <ActivityIndicator size="large" color="#0E90E6" />
          <Text style={{ marginTop: 12, fontSize: 14, color: '#64748B', fontWeight: '600' }}>Loading seat layout...</Text>
        </View>
      </View>
    );
  }

  // Render Booking Confirmed Screen when confirmed
  if (confirmedBooking) {
    return (
      <BookingConfirmedView
        booking={confirmedBooking}
        onCloseToHome={() => {
          setConfirmedBooking(null);
          setTabBarVisible(true);
          onBack();
        }}
        onViewMyBookings={() => {
          setConfirmedBooking(null);
          setTabBarVisible(true);
          onBack();
          router.push('/bookings');
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: topInset + (Platform.OS === 'ios' ? 8 : 12) }]}>
        <Pressable onPress={onBack} style={styles.backButton} hitSlop={10}>
          <Ionicons name="chevron-back" size={24} color="#111827" />
        </Pressable>

        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>Select Seat</Text>
          <Text style={styles.headerSubtitle}>
            {bus.plateNumber} • {from} - {to}
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.seatAvailableBox]} />
            <Text style={styles.legendText}>Available ({availableCount})</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.seatOccupiedBox]} />
            <Text style={styles.legendText}>Occupied</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, styles.seatSelectedBox]} />
            <Text style={styles.legendText}>Selected</Text>
          </View>
        </View>

        {/* Bus Cabin Visual Layout */}
        <View style={styles.busCabinContainer}>
          {/* Front of Bus (Windshield + Driver) */}
          <View style={styles.busFrontHeader}>
            <View style={styles.entranceDoor}>
              <Ionicons name="enter-outline" size={16} color="#64748B" />
              <Text style={styles.entranceText}>Entrance</Text>
            </View>
            <View style={styles.driverSection}>
              <Ionicons name="speedometer-outline" size={18} color="#0E90E6" />
              <View style={styles.steeringWheelCircle}>
                <Ionicons name="radio-button-on" size={14} color="#0E90E6" />
              </View>
              <Text style={styles.driverText}>Driver</Text>
            </View>
          </View>

          <View style={styles.cabinDivider} />

          {/* 2 + 2 Standard Passenger Seats with Center Aisle */}
          <View style={styles.seatsGrid}>
            {Array.from({ length: 10 }, (_, rowIndex) => {
              const seat1 = seats[rowIndex * 4];
              const seat2 = seats[rowIndex * 4 + 1];
              const seat3 = seats[rowIndex * 4 + 2];
              const seat4 = seats[rowIndex * 4 + 3];

              return (
                <View key={rowIndex} style={styles.seatRow}>
                  {/* Left Pair: Seat 1 & Seat 2 */}
                  <View style={styles.seatPair}>
                    <SeatButton
                      seat={seat1}
                      isSelected={selectedSeatNumbers.includes(seat1.number)}
                      onPress={() => toggleSeat(seat1)}
                    />
                    <SeatButton
                      seat={seat2}
                      isSelected={selectedSeatNumbers.includes(seat2.number)}
                      onPress={() => toggleSeat(seat2)}
                    />
                  </View>

                  {/* Center Walking Aisle */}
                  <View style={styles.centerAisle}>
                    <Text style={styles.aisleRowNumber}>{rowIndex + 1}</Text>
                  </View>

                  {/* Right Pair: Seat 3 & Seat 4 */}
                  <View style={styles.seatPair}>
                    <SeatButton
                      seat={seat3}
                      isSelected={selectedSeatNumbers.includes(seat3.number)}
                      onPress={() => toggleSeat(seat3)}
                    />
                    <SeatButton
                      seat={seat4}
                      isSelected={selectedSeatNumbers.includes(seat4.number)}
                      onPress={() => toggleSeat(seat4)}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sticky Checkout Bar */}
      <View style={styles.checkoutBar}>
        <View style={styles.checkoutMeta}>
          <Text style={styles.selectedSeatsSummary}>
            {selectedSeatNumbers.length > 0
              ? `Seat ${selectedSeatNumbers.join(', ')}`
              : 'No seat selected'}
          </Text>
          <Text style={styles.totalFareText}>
            LKR {totalFare.toLocaleString()}
          </Text>
        </View>

        <Pressable
          style={[
            styles.confirmButton,
            selectedSeatNumbers.length === 0 && styles.confirmButtonDisabled,
          ]}
          onPress={handleCheckout}
          disabled={selectedSeatNumbers.length === 0}
        >
          <Text style={styles.confirmButtonText}>
            Book Seat ({selectedSeatNumbers.length})
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

function SeatButton({
  seat,
  isSelected,
  onPress,
}: {
  seat: SeatItem | undefined;
  isSelected: boolean;
  onPress: () => void;
}) {
  if (!seat) return null;
  const isOccupied = 
    seat.status === 'occupied' || 
    seat.status === 'booked' || 
    seat.isOccupied === true || 
    seat.isBooked === true || 
    seat.occupied === true;

  return (
    <Pressable
      style={[
        styles.seatButton,
        isOccupied && styles.seatOccupied,
        !isOccupied && !isSelected && styles.seatAvailable,
        isSelected && styles.seatSelected,
      ]}
      onPress={onPress}
      disabled={isOccupied}
      hitSlop={4}
    >
      {/* Headrest detail for realistic seat representation */}
      <View
        style={[
          styles.seatHeadrest,
          isOccupied && styles.seatHeadrestOccupied,
          !isOccupied && !isSelected && styles.seatHeadrestAvailable,
          isSelected && styles.seatHeadrestSelected,
        ]}
      />
      
      <Text
        style={[
          styles.seatLabel,
          isOccupied && styles.seatLabelOccupied,
          !isOccupied && !isSelected && styles.seatLabelAvailable,
          isSelected && styles.seatLabelSelected,
        ]}
      >
        {seat.label}
      </Text>
      {isSelected && (
        <Ionicons
          name="checkmark"
          size={11}
          color="#FFFFFF"
          style={styles.selectedCheck}
        />
      )}
    </Pressable>
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
    paddingHorizontal: 20,
    gap: 14,
    backgroundColor: '#FFFFFF',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  headerTitleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
    alignItems: 'center',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
  },
  seatAvailableBox: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  seatOccupiedBox: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  seatSelectedBox: {
    backgroundColor: '#0E90E6',
  },
  legendText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  busCabinContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
  },
  busFrontHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
  },
  entranceDoor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  entranceText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EBF5FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  steeringWheelCircle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0E90E6',
  },
  cabinDivider: {
    height: 1.5,
    backgroundColor: '#F1F5F9',
    marginBottom: 16,
  },
  seatsGrid: {
    gap: 12,
  },
  seatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seatPair: {
    flexDirection: 'row',
    gap: 8,
  },
  centerAisle: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aisleRowNumber: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
  },
  seatButton: {
    width: 42,
    height: 42,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1.5,
    marginTop: 6, // space for headrest
  },
  seatAvailable: {
    backgroundColor: '#F0F9FF',
    borderColor: '#38BDF8',
  },
  seatOccupied: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  seatSelected: {
    backgroundColor: '#0E90E6',
    borderColor: '#0E90E6',
    shadowColor: '#0E90E6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  seatHeadrest: {
    width: 18,
    height: 5,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
    position: 'absolute',
    top: -5,
    alignSelf: 'center',
    borderWidth: 1.5,
    borderBottomWidth: 0,
  },
  seatHeadrestAvailable: {
    backgroundColor: '#F0F9FF',
    borderColor: '#38BDF8',
  },
  seatHeadrestOccupied: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
  },
  seatHeadrestSelected: {
    backgroundColor: '#0E90E6',
    borderColor: '#0E90E6',
  },
  seatLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  seatLabelAvailable: {
    color: '#0284C7',
  },
  seatLabelOccupied: {
    color: '#94A3B8',
  },
  seatLabelSelected: {
    color: '#FFFFFF',
  },
  selectedCheck: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 8,
  },
  checkoutMeta: {
    flexDirection: 'column',
    gap: 2,
  },
  selectedSeatsSummary: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  totalFareText: {
    fontSize: 19,
    fontWeight: '900',
    color: '#111827',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#0E90E6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#0E90E6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  confirmButtonDisabled: {
    backgroundColor: '#CBD5E1',
    shadowOpacity: 0,
    elevation: 0,
  },
  confirmButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
