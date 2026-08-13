import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface NotificationItem {
  id: string;
  type: 'arrival' | 'approaching' | 'delay' | 'booking' | 'completed';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

interface NotificationsViewProps {
  onBack: () => void;
  onSelectNotification?: (item: NotificationItem) => void;
}

export function NotificationsView({
  onBack,
  onSelectNotification,
}: NotificationsViewProps) {
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 20);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '1',
      type: 'arrival',
      title: 'Bus Arriving Soon',
      message: 'Bus NA-1234 is 2 minutes away from your halt.',
      time: 'Just now',
      isRead: false,
    },
    {
      id: '2',
      type: 'approaching',
      title: 'Approaching Your Stop',
      message: 'Get ready! Your destination Kadawatha is the next stop.',
      time: '10 min ago',
      isRead: false,
    },
    {
      id: '3',
      type: 'delay',
      title: 'Route Delay Alert',
      message: 'Heavy traffic on Route 138. Expect a 15 min delay.',
      time: '1 hour ago',
      isRead: true,
    },
    {
      id: '4',
      type: 'booking',
      title: 'Booking Confirmed',
      message: 'Your seat 11 on NA-1234 has been confirmed successfully.',
      time: '2 hours ago',
      isRead: true,
    },
    {
      id: '5',
      type: 'completed',
      title: 'Bus Arrived',
      message: 'Bus NB-5678 has arrived at your halt.',
      time: 'Yesterday',
      isRead: true,
    },
  ]);

  const handleMarkAllRead = () => {
    setNotifications(
      notifications.map((item) => ({ ...item, isRead: true }))
    );
  };

  const getIconConfig = (type: NotificationItem['type']) => {
    switch (type) {
      case 'arrival':
        return { name: 'bus', color: '#059669', bg: '#ECFDF5' };
      case 'approaching':
        return { name: 'location', color: '#059669', bg: '#ECFDF5' };
      case 'delay':
        return { name: 'warning', color: '#EF4444', bg: '#FEE2E2' };
      case 'booking':
        return { name: 'checkmark-circle', color: '#0E90E6', bg: '#EBF5FF' };
      case 'completed':
      default:
        return { name: 'bus', color: '#64748B', bg: '#F1F5F9' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: topInset + (Platform.OS === 'ios' ? 8 : 12) }]}>
        <View style={styles.headerTitleRow}>
          <Pressable onPress={onBack} style={styles.backButton} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </Pressable>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>

        <Pressable onPress={handleMarkAllRead} hitSlop={8}>
          <Text style={styles.markAllReadText}>Mark all read</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {notifications.map((item) => {
          const iconConfig = getIconConfig(item.type);

          return (
            <Pressable
              key={item.id}
              style={[
                styles.notificationCard,
                !item.isRead && styles.notificationCardUnread,
              ]}
              onPress={() => {
                if (onSelectNotification) {
                  onSelectNotification(item);
                }
              }}
            >
              {/* Icon Circle */}
              <View style={[styles.iconCircle, { backgroundColor: iconConfig.bg }]}>
                <Ionicons
                  name={iconConfig.name as keyof typeof Ionicons.glyphMap}
                  size={20}
                  color={iconConfig.color}
                />
              </View>

              {/* Content Column */}
              <View style={styles.contentCol}>
                <View style={styles.titleRow}>
                  <Text style={[styles.itemTitle, !item.isRead && styles.itemTitleUnread]}>
                    {item.title}
                  </Text>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>

                <Text style={styles.messageText}>{item.message}</Text>
              </View>

              {/* Unread indicator dot */}
              {!item.isRead && <View style={styles.unreadDot} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
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
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: -0.3,
  },
  markAllReadText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#059669',
  },
  scrollContent: {
    paddingVertical: 10,
    paddingBottom: 100,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
    gap: 14,
    position: 'relative',
  },
  notificationCardUnread: {
    backgroundColor: '#F8FAFC',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  contentCol: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  itemTitleUnread: {
    fontWeight: '800',
    color: '#0F172A',
  },
  timeText: {
    fontSize: 12,
    color: '#8A95A5',
    fontWeight: '500',
  },
  messageText: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    fontWeight: '400',
  },
  unreadDot: {
    position: 'absolute',
    left: 8,
    top: '50%',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0E90E6',
  },
});
