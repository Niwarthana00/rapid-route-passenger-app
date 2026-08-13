import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { NotificationsView } from '../components/notifications-view';

export default function ProfileScreen() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'සිංහල' | 'தமிழ்'>('English');
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isSavedRoutesModalOpen, setIsSavedRoutesModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How do I reserve a bus seat?',
      a: 'Select your route on the Home map, choose an active bus, tap "Book Seat", pick your seat numbers from the 2+2 layout, and confirm your booking.',
    },
    {
      q: 'How does the Next Halt Alarm work?',
      a: 'When enabled in Live Trip, the app tracks your bus location and alerts you with phone vibrations 1 halt before your destination so you never miss your stop.',
    },
    {
      q: 'Can I download my ticket as a PDF?',
      a: 'Yes! Tap the "PDF" button on any active or completed booking in the Bookings tab to save and share your official PDF receipt.',
    },
    {
      q: 'What should I do if I left an item on the bus?',
      a: 'Call the National Transport Commission Hotline at 1955 or tap "Report Lost Item" below to contact our dispatch terminal immediately.',
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of Rapid Route?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Logged Out', 'You have been logged out successfully.');
          },
        },
      ]
    );
  };

  if (isNotificationsOpen) {
    return <NotificationsView onBack={() => setIsNotificationsOpen(false)} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Title */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Card matching screenshot */}
        <View style={styles.userSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>JD</Text>
          </View>

          <View style={styles.userInfoCol}>
            <Text style={styles.userName}>John Doe</Text>
            <Text style={styles.userPhone}>+94 77 123 4567</Text>
          </View>
        </View>

        {/* Menu Settings Card */}
        <View style={styles.menuCard}>
          {/* Row 1: My Bookings */}
          <Pressable
            style={styles.menuRow}
            onPress={() => router.push('/bookings')}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="ticket-outline" size={20} color="#111827" />
              </View>
              <Text style={styles.menuLabel}>My Bookings</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>

          <View style={styles.rowDivider} />

          {/* Row 2: Saved Routes */}
          <Pressable
            style={styles.menuRow}
            onPress={() => setIsSavedRoutesModalOpen(true)}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="map-outline" size={20} color="#111827" />
              </View>
              <Text style={styles.menuLabel}>Saved Routes</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>

          <View style={styles.rowDivider} />

          {/* Row 3: Notifications */}
          <Pressable
            style={styles.menuRow}
            onPress={() => setIsNotificationsOpen(true)}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="notifications-outline" size={20} color="#111827" />
              </View>
              <Text style={styles.menuLabel}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>

          <View style={styles.rowDivider} />

          {/* Row 4: Language */}
          <Pressable
            style={styles.menuRow}
            onPress={() => setIsLanguageModalOpen(true)}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="globe-outline" size={20} color="#111827" />
              </View>
              <Text style={styles.menuLabel}>Language</Text>
            </View>
            <View style={styles.menuRightVal}>
              <Text style={styles.langValueText}>{selectedLanguage}</Text>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </View>
          </Pressable>

          <View style={styles.rowDivider} />

          {/* Row 5: Help & Support */}
          <Pressable
            style={styles.menuRow}
            onPress={() => setIsHelpModalOpen(true)}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="help-circle-outline" size={20} color="#111827" />
              </View>
              <Text style={styles.menuLabel}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>
        </View>

        {/* Log Out Card */}
        <Pressable style={styles.logoutCard} onPress={handleLogout}>
          <View style={styles.logoutLeft}>
            <View style={styles.logoutIconCircle}>
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <Text style={styles.logoutText}>Log Out</Text>
          </View>
        </Pressable>
      </ScrollView>

      {/* Language Picker Modal */}
      <Modal
        visible={isLanguageModalOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsLanguageModalOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsLanguageModalOpen(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Language</Text>

            {(['English', 'සිංහල', 'தமிழ்'] as const).map((lang) => (
              <Pressable
                key={lang}
                style={[
                  styles.languageOptionRow,
                  selectedLanguage === lang && styles.languageOptionRowSelected,
                ]}
                onPress={() => {
                  setSelectedLanguage(lang);
                  setIsLanguageModalOpen(false);
                }}
              >
                <Text
                  style={[
                    styles.languageOptionText,
                    selectedLanguage === lang && styles.languageOptionTextSelected,
                  ]}
                >
                  {lang}
                </Text>
                {selectedLanguage === lang && (
                  <Ionicons name="checkmark-circle" size={20} color="#059669" />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* Saved Routes Modal */}
      <Modal
        visible={isSavedRoutesModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsSavedRoutesModalOpen(false)}
      >
        <View style={styles.sheetOverlay}>
          <View style={styles.sheetModal}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Saved Routes</Text>
              <Pressable onPress={() => setIsSavedRoutesModalOpen(false)} hitSlop={8}>
                <Ionicons name="close-circle" size={24} color="#94A3B8" />
              </Pressable>
            </View>

            <View style={styles.savedRoutesList}>
              <View style={styles.savedRouteItem}>
                <View style={styles.savedRouteBadge}>
                  <Text style={styles.savedRouteBadgeText}>1-1</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.savedRouteTitle}>Colombo - Kandy</Text>
                  <Text style={styles.savedRouteSub}>Frequent morning commute</Text>
                </View>
                <Ionicons name="star" size={20} color="#F59E0B" />
              </View>

              <View style={styles.savedRouteItem}>
                <View style={styles.savedRouteBadge}>
                  <Text style={styles.savedRouteBadgeText}>138</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.savedRouteTitle}>Kottawa - Pettah</Text>
                  <Text style={styles.savedRouteSub}>High Level Road</Text>
                </View>
                <Ionicons name="star" size={20} color="#F59E0B" />
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Comprehensive Help & Support Modal */}
      <Modal
        visible={isHelpModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsHelpModalOpen(false)}
      >
        <View style={styles.sheetOverlay}>
          <View style={[styles.sheetModal, { maxHeight: '85%' }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Help & Support</Text>
              <Pressable onPress={() => setIsHelpModalOpen(false)} hitSlop={8}>
                <Ionicons name="close-circle" size={24} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 14, paddingBottom: 20 }}>
              {/* Emergency / Hotline Cards */}
              <Pressable
                style={styles.helpItem}
                onPress={() => Linking.openURL('tel:1955')}
              >
                <View style={[styles.helpIconBox, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="call" size={20} color="#059669" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.helpItemTitle}>National Transport Hotline (1955)</Text>
                  <Text style={styles.helpItemSub}>24/7 hotline for route info & complaints</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </Pressable>

              <Pressable
                style={styles.helpItem}
                onPress={() =>
                  Alert.alert('Live Support Chat', 'Connecting to Rapid Route passenger support agent. Estimated wait time: 1 min.')
                }
              >
                <View style={[styles.helpIconBox, { backgroundColor: '#EBF5FF' }]}>
                  <Ionicons name="chatbubbles" size={20} color="#0E90E6" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.helpItemTitle}>Live Chat with Support</Text>
                  <Text style={styles.helpItemSub}>Instant assistance with bookings & seats</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </Pressable>

              <Pressable
                style={styles.helpItem}
                onPress={() =>
                  Alert.alert('Lost & Found', 'Please provide your Booking ID and item description to dispatch.')
                }
              >
                <View style={[styles.helpIconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="bag-handle" size={20} color="#D97706" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.helpItemTitle}>Report Lost Item / Baggage</Text>
                  <Text style={styles.helpItemSub}>Recover items left on Rapid Route buses</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#94A3B8" />
              </Pressable>

              {/* FAQs Section */}
              <Text style={styles.faqSectionTitle}>Frequently Asked Questions</Text>
              {faqs.map((faq, idx) => {
                const isExpanded = expandedFaqIndex === idx;
                return (
                  <Pressable
                    key={idx}
                    style={styles.faqCard}
                    onPress={() => setExpandedFaqIndex(isExpanded ? null : idx)}
                  >
                    <View style={styles.faqHeaderRow}>
                      <Text style={styles.faqQuestionText}>{faq.q}</Text>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color="#64748B"
                      />
                    </View>
                    {isExpanded && (
                      <Text style={styles.faqAnswerText}>{faq.a}</Text>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    gap: 20,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 6,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#065F46',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#065F46',
  },
  userInfoCol: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  userPhone: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 4,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#EEF2F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconCircle: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  menuRightVal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  langValueText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  rowDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 64,
  },
  logoutCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: '#EEF2F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  logoutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  logoutIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#EF4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  languageOptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  languageOptionRowSelected: {
    backgroundColor: '#ECFDF5',
  },
  languageOptionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },
  languageOptionTextSelected: {
    color: '#059669',
    fontWeight: '800',
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheetModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  savedRoutesList: {
    gap: 12,
  },
  savedRouteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  savedRouteBadge: {
    backgroundColor: '#0E90E6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  savedRouteBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  savedRouteTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  savedRouteSub: {
    fontSize: 12,
    color: '#64748B',
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  helpIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpItemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  helpItemSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  faqSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
    marginTop: 10,
  },
  faqCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    gap: 8,
  },
  faqHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    paddingRight: 8,
  },
  faqAnswerText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
});
