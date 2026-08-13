import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, Pressable, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const itemStyle = styles.settingItem as ViewStyle;
  const logoutStyle = [styles.settingItem, styles.logoutItem] as ViewStyle[];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>JD</Text>
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.profileName}>John Doe</Text>
            <Text style={styles.profileEmail}>john.doe@example.com</Text>
          </View>
        </View>

        {/* Settings Group */}
        <Text style={styles.groupTitle}>Account Settings</Text>

        <Pressable style={itemStyle}>
          <View style={styles.settingLeft}>
            <Ionicons name="card-outline" size={20} color="#0E90E6" />
            <Text style={styles.settingText}>Payment Methods</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#8A95A5" />
        </Pressable>

        <Pressable style={itemStyle}>
          <View style={styles.settingLeft}>
            <Ionicons name="location-outline" size={20} color="#0E90E6" />
            <Text style={styles.settingText}>Saved Places</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#8A95A5" />
        </Pressable>

        <Pressable style={itemStyle}>
          <View style={styles.settingLeft}>
            <Ionicons name="notifications-outline" size={20} color="#0E90E6" />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#8A95A5" />
        </Pressable>

        <Text style={styles.groupTitle}>Preferences</Text>

        <Pressable style={itemStyle}>
          <View style={styles.settingLeft}>
            <Ionicons name="globe-outline" size={20} color="#0E90E6" />
            <Text style={styles.settingText}>Language</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#8A95A5" />
        </Pressable>

        <Pressable style={logoutStyle}>
          <View style={styles.settingLeft}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={[styles.settingText, styles.logoutText]}>Log out</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#EF4444" />
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
    gap: 12,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10, // Curve reduced to 10
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
    gap: 16,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EBF5FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0E90E6',
  },
  profileMeta: {
    flexDirection: 'column',
    gap: 4,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  profileEmail: {
    fontSize: 13,
    color: '#8A95A5',
    fontWeight: '500',
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A95A5',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  logoutItem: {
    borderColor: '#FEE2E2',
    backgroundColor: '#FFF5F5',
  },
  logoutText: {
    color: '#EF4444',
  },
});
