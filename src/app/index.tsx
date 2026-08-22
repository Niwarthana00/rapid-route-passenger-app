import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, Pressable, Platform, ScrollView, ActivityIndicator, Animated, PanResponder, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { RouteDetailView } from '../components/route-detail-view';
import { NotificationsView } from '../components/notifications-view';
import { useTabBar } from '../context/tab-bar-context';
import { useAuth } from '../context/auth-context';
import { api } from '../services/api';

interface RouteItem {
  id: string;
  routeNumber: string;
  from: string;
  to: string;
  activeBuses: number;
}

// SAMPLE_ROUTES has been removed in favor of live backend API queries

// Mock Map Component for Home Screen
const VectorMapBackground = () => (
  <View style={styles.mapContainer}>
    <Svg width="100%" height="100%" viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" style={styles.mapSvg}>
      {/* Background Land */}
      <Path d="M0 0h400v400H0z" fill="#E6EFEA" />
      
      {/* Water body / River */}
      <Path
        d="M-50 150 C 100 120, 200 280, 450 250 L 450 300 C 200 330, 100 170, -50 200 Z"
        fill="#C5DFEB"
      />
      
      {/* Primary Roads */}
      <Path
        d="M 120 -50 C 140 150, 110 250, 150 450"
        fill="none"
        stroke="#ffffff"
        strokeWidth="20"
        strokeLinecap="round"
      />
      <Path
        d="M 120 -50 C 140 150, 110 250, 150 450"
        fill="none"
        stroke="#E2EBE6"
        strokeWidth="2"
        strokeDasharray="4,4"
        strokeLinecap="round"
      />
      
      {/* Curved Crossing Road */}
      <Path
        d="M -50 80 C 100 100, 250 120, 450 50"
        fill="none"
        stroke="#ffffff"
        strokeWidth="16"
        strokeLinecap="round"
      />
      
      {/* Road 3 (Leading to 138) */}
      <Path
        d="M 130 180 C 250 200, 280 300, 320 450"
        fill="none"
        stroke="#ffffff"
        strokeWidth="16"
        strokeLinecap="round"
      />
    </Svg>

    {/* Bus Marker 138 */}
    <View style={[styles.busMarker, { top: '55%', left: '46%' }]}>
      <View style={styles.markerBubble}>
        <Text style={styles.markerText}>138</Text>
      </View>
      <View style={styles.arrowContainer}>
        <View style={[styles.navigationArrow, { transform: [{ rotate: '45deg' }] }]} />
      </View>
    </View>

    {/* Bus Marker 17 */}
    <View style={[styles.busMarker, { top: '35%', left: '72%' }]}>
      <View style={styles.markerBubble}>
        <Text style={styles.markerText}>17</Text>
      </View>
      <View style={styles.arrowContainer}>
        <View style={[styles.navigationArrow, { transform: [{ rotate: '-30deg' }] }]} />
      </View>
    </View>
  </View>
);

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 20);
  const { setTabBarVisible } = useTabBar();
  const { userProfile, user } = useAuth();

  const displayName = userProfile?.name || user?.displayName || 'JD';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0].toUpperCase())
    .slice(0, 2)
    .join('') || 'JD';

  const [isSearching, setIsSearching] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Draggable Bottom Sheet Configurations
  const screenHeight = Dimensions.get('window').height;
  const collapsedHeight = screenHeight * 0.40;
  const expandedHeight = screenHeight * 0.82;
  const [sheetExpanded, setSheetExpanded] = useState(false);
  const sheetHeight = useRef(new Animated.Value(collapsedHeight)).current;
  const lastHeight = useRef(collapsedHeight);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (e, gestureState) => {
        let nextHeight = lastHeight.current - gestureState.dy;
        if (nextHeight < collapsedHeight) {
          nextHeight = collapsedHeight;
        } else if (nextHeight > expandedHeight) {
          nextHeight = expandedHeight;
        }
        sheetHeight.setValue(nextHeight);
      },
      onPanResponderRelease: (e, gestureState) => {
        const finalHeight = lastHeight.current - gestureState.dy;
        const threshold = (collapsedHeight + expandedHeight) / 2;
        let targetHeight = collapsedHeight;
        
        if (finalHeight > threshold) {
          targetHeight = expandedHeight;
        }
        
        Animated.spring(sheetHeight, {
          toValue: targetHeight,
          useNativeDriver: false,
          friction: 8,
          tension: 40,
        }).start(() => {
          lastHeight.current = targetHeight;
          setSheetExpanded(targetHeight === expandedHeight);
        });
      },
    })
  ).current;
  const [selectedRoute, setSelectedRoute] = useState<{
    id?: string;
    routeNumber: string;
    from: string;
    to: string;
  } | null>(null);

  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);

  // Fetch routes from API with debouncing to prevent excessive queries
  useEffect(() => {
    let active = true;
    async function loadRoutes() {
      setIsLoadingRoutes(true);
      const data = await api.getRoutes(searchQuery);
      if (active) {
        setRoutes(data);
        setIsLoadingRoutes(false);
      }
    }

    const delayDebounceFn = setTimeout(() => {
      loadRoutes();
    }, 350);

    return () => {
      active = false;
      clearTimeout(delayDebounceFn);
    };
  }, [searchQuery]);

  // Automatically hide tab bar when searching, viewing route detail or notifications
  useEffect(() => {
    if (isSearching || selectedRoute !== null || isNotificationsOpen) {
      setTabBarVisible(false);
    } else {
      setTabBarVisible(true);
    }
  }, [isSearching, selectedRoute, isNotificationsOpen, setTabBarVisible]);

  const handleSelectRoute = (route: RouteItem) => {
    setSelectedRoute({
      id: route.id,
      routeNumber: route.routeNumber,
      from: route.from,
      to: route.to,
    });
    setIsSearching(false);
  };

  const handleSelectNearbyBus = (route: any) => {
    setSelectedRoute({
      id: route.id,
      routeNumber: route.routeNumber,
      from: route.from,
      to: route.to,
    });
  };

  // If Notifications Screen is opened
  if (isNotificationsOpen) {
    return (
      <NotificationsView
        onBack={() => setIsNotificationsOpen(false)}
      />
    );
  }

  // If a specific route is opened (Route Detail Screen)
  if (selectedRoute) {
    return (
      <RouteDetailView
        route={selectedRoute}
        onBack={() => {
          setSelectedRoute(null);
          setTabBarVisible(true);
        }}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* When in Search Mode */}
      {isSearching ? (
        <View style={[styles.searchViewContainer, { paddingTop: topInset + (Platform.OS === 'ios' ? 8 : 12) }]}>
          {/* Top Search Bar with Back Button */}
          <View style={styles.searchHeaderRow}>
            <Pressable
              onPress={() => setIsSearching(false)}
              style={styles.backButton}
              hitSlop={10}
            >
              <Ionicons name="chevron-back" size={24} color="#111827" />
            </Pressable>

            <View style={styles.searchInputWrapper}>
              <Ionicons name="search-outline" size={20} color="#0E90E6" style={styles.searchFieldIcon} />
              <TextInput
                style={styles.searchFieldInput}
                placeholder="Search route or destination..."
                placeholderTextColor="#8A95A5"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                  <Ionicons name="close-circle" size={18} color="#8A95A5" />
                </Pressable>
              )}
            </View>
          </View>

          {/* Search Content ScrollView */}
          <ScrollView
            style={styles.searchScrollView}
            contentContainerStyle={styles.searchScrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.searchSectionTitle}>Matching Routes</Text>

            {isLoadingRoutes ? (
              <ActivityIndicator size="large" color="#0E90E6" style={{ marginVertical: 30 }} />
            ) : routes.length > 0 ? (
              <View style={styles.routesCardContainer}>
                {routes.map((route, index) => {
                  const isLast = index === routes.length - 1;
                  return (
                    <Pressable
                      key={route.id}
                      style={[styles.routeRowItem, isLast && styles.routeRowItemLast]}
                      onPress={() => handleSelectRoute(route)}
                    >
                      {/* Route Number Badge */}
                      <View style={styles.routeBadgePill}>
                        <Text style={styles.routeBadgeText}>{route.routeNumber}</Text>
                      </View>

                      {/* Route Info */}
                      <View style={styles.routeInfoCol}>
                        <View style={styles.routeDestinationRow}>
                          <Text style={styles.routeFromText} numberOfLines={1} ellipsizeMode="tail">{route.from}</Text>
                          <Ionicons name="arrow-forward" size={14} color="#64748B" style={styles.routeArrow} />
                          <Text style={styles.routeToText} numberOfLines={1} ellipsizeMode="tail">{route.to}</Text>
                        </View>
                        <View style={styles.activeBusesRow}>
                          <Ionicons name="bus" size={13} color={route.activeBuses > 0 ? '#0E90E6' : '#94A3B8'} />
                          <Text style={[styles.activeBusesText, route.activeBuses === 0 && { color: '#94A3B8' }]}>
                            {route.activeBuses > 0 ? `${route.activeBuses} active buses` : 'No active buses'}
                          </Text>
                        </View>
                      </View>

                      <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyStateContainer}>
                <Ionicons name="search" size={40} color="#CBD5E1" />
                <Text style={styles.emptyStateTitle}>No matching routes</Text>
                <Text style={styles.emptyStateSub}>
                  No routes found matching &ldquo;{searchQuery}&rdquo;. Try another city or bus number.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      ) : (
        /* Normal Map + Bottom Sheet Home View */
        <>
          {/* Mock Map Background */}
          <VectorMapBackground />

          {/* Top Floating Header & Search Area */}
          <View style={[styles.topSection, { paddingTop: topInset + (Platform.OS === 'ios' ? 8 : 12) }]}>
            {/* Header Overlay */}
            <View style={styles.headerContainer}>
              <View style={styles.greetingContainer}>
                <Text style={styles.greetingText}>Good morning,</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={16} color="#0E90E6" />
                  <Text style={styles.locationText}>Colombo</Text>
                </View>
              </View>
              
              {/* Header Right: Notification Bell + Profile Avatar */}
              <View style={styles.headerRightRow}>
                <Pressable
                  style={styles.notificationBadge}
                  onPress={() => setIsNotificationsOpen(true)}
                  hitSlop={8}
                >
                  <Ionicons name="notifications-outline" size={20} color="#111827" />
                  <View style={styles.unreadRedDot} />
                </Pressable>

                <Pressable
                  style={styles.profileBadge}
                  onPress={() => router.push('/profile')}
                  hitSlop={8}
                >
                  <Text style={styles.profileText}>{initials}</Text>
                </Pressable>
              </View>
            </View>

            {/* Search Bar (Click to Open Search) */}
            <Pressable
              style={styles.searchContainer}
              onPress={() => setIsSearching(true)}
            >
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={20} color="#0E90E6" style={styles.searchIcon} />
                <Text style={styles.searchBarPlaceholder}>
                  {searchQuery ? searchQuery : 'Search route or destination...'}
                </Text>
                {searchQuery ? (
                  <Pressable
                    onPress={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                    }}
                    hitSlop={8}
                  >
                    <Ionicons name="close-circle" size={18} color="#8A95A5" />
                  </Pressable>
                ) : null}
              </View>
            </Pressable>
          </View>

          {/* Bottom Sheet Details */}
          <Animated.View style={[styles.bottomSheet, { height: sheetHeight }]}>
            {/* Header Grabbing Area */}
            <View {...panResponder.panHandlers} style={styles.sheetHeaderGrabArea}>
              {/* Handle Indicator */}
              <View style={styles.handleContainer}>
                <View style={styles.sheetHandle} />
              </View>

              <Text style={styles.sheetTitle}>Nearby Buses</Text>
            </View>

            <ScrollView contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
              {isLoadingRoutes ? (
                <ActivityIndicator size="large" color="#0E90E6" style={{ marginVertical: 30 }} />
              ) : routes.length > 0 ? (
                routes.map((route) => {
                  return (
                    <Pressable
                      key={route.id}
                      style={styles.busCard}
                      onPress={() => handleSelectNearbyBus(route)}
                    >
                      <View style={styles.busInfo}>
                        {/* Header: Route badge and active count */}
                        <View style={styles.busCardHeader}>
                          <View style={styles.busRouteBadge}>
                            <Text style={styles.busRouteBadgeText}>{route.routeNumber}</Text>
                          </View>
                          <View style={styles.activeBusesCountRow}>
                            <Ionicons name="bus" size={13} color={route.activeBuses > 0 ? '#0E90E6' : '#94A3B8'} />
                            <Text style={[styles.activeBusesCountText, route.activeBuses === 0 && { color: '#94A3B8' }]}>
                              {route.activeBuses > 0 ? `${route.activeBuses} Active` : 'No Active'}
                            </Text>
                          </View>
                        </View>
                        
                        {/* Destinations */}
                        <View style={styles.busCardRouteCol}>
                          <Text style={styles.busRouteStationText}>{route.from}</Text>
                          <View style={styles.toLabelRow}>
                            <View style={styles.toLine} />
                            <Text style={styles.toLabelText}>to</Text>
                            <View style={styles.toLine} />
                          </View>
                          <Text style={styles.busRouteStationText}>{route.to}</Text>
                        </View>
                      </View>
                      <View style={styles.chevronWrapper}>
                        <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                      </View>
                    </Pressable>
                  );
                })
              ) : (
                <Text style={styles.loadingText}>No routes found</Text>
              )}
            </ScrollView>
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6EFEA',
    position: 'relative',
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  mapSvg: {
    width: '100%',
    height: '100%',
  },
  topSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 20,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  greetingContainer: {
    flexDirection: 'column',
  },
  greetingText: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  headerRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  notificationBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  unreadRedDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  profileBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  profileText: {
    color: '#0E90E6',
    fontSize: 14,
    fontWeight: '800',
  },
  searchContainer: {
    width: '100%',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  searchBarPlaceholder: {
    flex: 1,
    fontSize: 15,
    color: '#8A95A5',
    fontWeight: '500',
  },
  searchIcon: {
    marginRight: 10,
  },
  busMarker: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 5,
  },
  markerBubble: {
    backgroundColor: '#0E90E6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  markerText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  arrowContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#0E90E6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 10,
    zIndex: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  sheetHeaderGrabArea: {
    width: '100%',
    backgroundColor: '#ffffff',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  sheetHandle: {
    width: 48,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5E7EB',
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  sheetContent: {
    gap: 12,
    paddingBottom: 95,
  },
  busCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  busInfo: {
    flexDirection: 'column',
    gap: 4,
    flex: 1,
  },
  busCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  busRouteBadge: {
    backgroundColor: '#EBF5FF',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  busRouteBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0E90E6',
  },
  activeBusesCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  activeBusesCountText: {
    fontSize: 12,
    color: '#0E90E6',
    fontWeight: '700',
  },
  busCardRouteCol: {
    flexDirection: 'column',
    gap: 4,
    flex: 1,
  },
  toLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 2,
    width: '100%',
  },
  toLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  toLabelText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94A3B8',
    textTransform: 'lowercase',
  },
  busRouteStationText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  chevronWrapper: {
    marginLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
    marginLeft: 12,
  },
  badgeIcon: {
    marginRight: 2,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  badgeAvailable: {
    backgroundColor: '#EBF5FF',
  },
  textAvailable: {
    color: '#0E90E6',
  },
  badgeFull: {
    backgroundColor: '#FEE2E2',
  },
  textFull: {
    color: '#EF4444',
  },

  /* Search View Overlay Styles */
  searchViewContainer: {
    flex: 1,
    backgroundColor: '#FAFBFD',
    paddingHorizontal: 20,
  },
  searchHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
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
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1.5,
    borderColor: '#0E90E6',
    shadowColor: '#0E90E6',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  searchFieldIcon: {
    marginRight: 8,
  },
  searchFieldInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    paddingVertical: 0,
  },
  searchScrollView: {
    flex: 1,
  },
  searchScrollContent: {
    paddingBottom: 110,
  },
  searchSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },
  routesCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  routeRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 14,
  },
  routeRowItemLast: {
    borderBottomWidth: 0,
  },
  routeBadgePill: {
    backgroundColor: '#EBF5FF',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0E90E6',
  },
  routeInfoCol: {
    flex: 1,
    flexDirection: 'column',
    gap: 4,
  },
  routeDestinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  routeFromText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  routeArrow: {
    marginTop: 1,
  },
  routeToText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  activeBusesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  activeBusesText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 8,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 8,
  },
  emptyStateSub: {
    fontSize: 13,
    color: '#8A95A5',
    textAlign: 'center',
    lineHeight: 18,
  },
  loadingText: {
    fontSize: 14,
    color: '#8A95A5',
    textAlign: 'center',
    paddingVertical: 20,
    fontWeight: '600',
  },
});
