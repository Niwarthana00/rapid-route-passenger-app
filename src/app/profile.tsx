import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  Linking,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationsView } from '../components/notifications-view';
import { useAuth } from '../context/auth-context';
import { api } from '../services/api';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
  const router = useRouter();
  const { userProfile, user, logout, setCurrentUserFromStorage } = useAuth();

  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  // Edit Profile Form States
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need photo library permissions to change your profile picture.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.2,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const base64Data = result.assets[0].base64;
        const base64Image = `data:image/jpeg;base64,${base64Data}`;
        setEditPhotoUrl(base64Image);
      }
    } catch (error) {
      console.warn('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image from gallery.');
    }
  };

  const displayName = userProfile?.name || user?.displayName || 'John Doe';
  const displayPhone = userProfile?.phone || user?.email || '+94 77 123 4567';

  // Compute initials (e.g. John Doe -> JD)
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0].toUpperCase())
    .slice(0, 2)
    .join('') || 'JD';

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
          onPress: async () => {
            try {
              await logout();
            } catch (e) {
              console.log('Logout error', e);
            }
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
            {userProfile?.photoURL ? (
              <Image source={{ uri: userProfile.photoURL }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>

          <View style={styles.userInfoCol}>
            <Text style={styles.userName}>{displayName}</Text>
            <Text style={styles.userPhone}>{displayPhone}</Text>
          </View>
        </View>

        {/* Menu Settings Card */}
        <View style={styles.menuCard}>
          {/* Row 1: Edit Profile */}
          <Pressable
            style={styles.menuRow}
            onPress={() => {
              setEditName(displayName);
              setEditPhone(displayPhone);
              setEditEmail(userProfile?.email || '');
              setEditPhotoUrl(userProfile?.photoURL || '');
              setSaveError('');
              setIsEditProfileModalOpen(true);
            }}
          >
            <View style={styles.menuLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="person-outline" size={20} color="#111827" />
              </View>
              <Text style={styles.menuLabel}>Edit Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </Pressable>

          <View style={styles.rowDivider} />

          {/* Row 2: My Bookings */}
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

          {/* Row 4: Help & Support */}
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

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditProfileModalOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsEditProfileModalOpen(false)}
      >
        <View style={styles.sheetOverlay}>
          <View style={[styles.sheetModal, { maxHeight: '90%' }]}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Edit Profile</Text>
              <Pressable onPress={() => setIsEditProfileModalOpen(false)} hitSlop={8} disabled={isSaving}>
                <Ionicons name="close-circle" size={24} color="#94A3B8" />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.editFormWrapper} keyboardShouldPersistTaps="handled">
              {/* Photo Preview / Gallery Selection */}
              <Text style={styles.inputLabel}>Profile Picture</Text>
              <View style={styles.avatarSelectionContainer}>
                <Pressable onPress={pickImage} disabled={isSaving} style={styles.avatarPreviewCircle}>
                  {editPhotoUrl ? (
                    <Image source={{ uri: editPhotoUrl }} style={styles.avatarPreviewImage} />
                  ) : (
                    <Ionicons name="camera-outline" size={32} color="#64748B" />
                  )}
                </Pressable>

                <Pressable
                  style={styles.galleryBtn}
                  onPress={pickImage}
                  disabled={isSaving}
                >
                  <Ionicons name="image-outline" size={16} color="#0E90E6" />
                  <Text style={styles.galleryBtnText}>Choose from Gallery</Text>
                </Pressable>
              </View>

              {/* Name Input */}
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.editInput}
                placeholder="Enter full name"
                placeholderTextColor="#94A3B8"
                value={editName}
                onChangeText={setEditName}
                editable={!isSaving}
              />

              {/* Phone Input */}
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.editInput}
                placeholder="Enter phone number"
                placeholderTextColor="#94A3B8"
                value={editPhone}
                onChangeText={setEditPhone}
                editable={!isSaving}
                keyboardType="phone-pad"
              />

              {/* Email Input (READ-ONLY) */}
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={[styles.editInput, styles.disabledInput]}
                placeholder="Enter email address"
                placeholderTextColor="#94A3B8"
                value={editEmail}
                editable={false}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}

              {/* Action Buttons */}
              <View style={styles.modalBtnRow}>
                <Pressable
                  style={styles.cancelBtn}
                  onPress={() => setIsEditProfileModalOpen(false)}
                  disabled={isSaving}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>

                <Pressable
                  style={styles.saveBtn}
                  onPress={async () => {
                    if (!editName || !editPhone) {
                      setSaveError('Name and phone number are required.');
                      return;
                    }
                    setSaveError('');
                    setIsSaving(true);
                    try {
                      const res = await api.updateProfile({
                        fullName: editName.trim(),
                        phone: editPhone.trim(),
                        email: editEmail.trim(),
                        photoUrl: editPhotoUrl.trim(),
                      });

                      if (res.success && res.data) {
                        const existingStr = await AsyncStorage.getItem('userData');
                        if (existingStr) {
                          const existing = JSON.parse(existingStr);
                          existing.user = { ...existing.user, ...res.data.user };
                          existing.profile = {
                            ...existing.profile,
                            ...res.data.profile,
                            full_name: res.data.profile.fullName || res.data.profile.full_name || existing.profile.full_name
                          };
                          await AsyncStorage.setItem('userData', JSON.stringify(existing));
                        } else {
                          await AsyncStorage.setItem('userData', JSON.stringify(res.data));
                        }
                        await setCurrentUserFromStorage();
                        Alert.alert('Success', 'Profile updated successfully!');
                        setIsEditProfileModalOpen(false);
                      } else {
                        setSaveError(res.message || 'Failed to update profile. Please try again.');
                      }
                    } catch (err: any) {
                      console.error('[Profile] Edit failed:', err);
                      setSaveError(err.message || 'Network error. Please try again.');
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  )}
                </Pressable>
              </View>
            </ScrollView>
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
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  editFormWrapper: {
    paddingVertical: 10,
    gap: 14,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 4,
  },
  editInput: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  avatarSelectionContainer: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  avatarPreviewCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#065F46',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarPreviewImage: {
    width: '100%',
    height: '100%',
  },
  galleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginTop: 4,
  },
  galleryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0E90E6',
  },
  disabledInput: {
    backgroundColor: '#E5E7EB',
    color: '#6B7280',
    borderColor: '#D1D5DB',
  },
  errorText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 4,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4B5563',
  },
  saveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0E90E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
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
