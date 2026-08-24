import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '../services/api';

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

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await api.getNotifications();
      if (res && res.success && Array.isArray(res.data)) {
        const mapped: NotificationItem[] = res.data.map((n: any) => ({
          id: n.id,
          type: n.message_type || 'booking',
          title: n.title || (n.message_type === 'booking' ? 'Booking Confirmed' : 'System Alert'),
          message: n.body || '',
          time: n.sent_at ? new Date(n.sent_at).toLocaleDateString() : 'Just now',
          isRead: n.status === 'READ' || n.isRead === true,
        }));
        setNotifications(mapped);
      }
    } catch (err) {
      console.warn('[Notifications] Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    // Optimistic UI update
    setNotifications(
      notifications.map((item) => ({ ...item, isRead: true }))
    );
    try {
      await api.markAllNotificationsRead();
    } catch (err) {
      console.warn('[Notifications] Failed to mark read on database:', err);
    }
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
        {isLoading ? (
          <ActivityIndicator size="large" color="#0E90E6" style={{ marginTop: 40 }} />
        ) : notifications.length > 0 ? (
          notifications.map((item) => {
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
          })
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="notifications-off-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>We will alert you here when your bus is approaching or booking is confirmed.</Text>
          </View>
        )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 80,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8A95A5',
    textAlign: 'center',
    lineHeight: 18,
  },
});
