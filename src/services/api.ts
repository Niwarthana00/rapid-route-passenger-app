import { BusDetail } from '@/components/route-detail-view';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getBackendUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:5000/api/v1`;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api/v1';
  }
  return 'http://localhost:5000/api/v1';
};

const API_BASE_URL = getBackendUrl();
console.log('[API] Configured Backend Base URL:', API_BASE_URL);


// Helper to handle fetch with timeout to prevent long hanging offline calls
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export const api = {
  // 1. Get Nearby Buses based on user's location coordinates
  async getNearbyBuses(latitude: number, longitude: number) {
    try {
      console.log(`[API] Fetching nearby buses for lat: ${latitude}, lng: ${longitude}`);
      const res = await fetchWithTimeout(`${API_BASE_URL}/buses/nearby?latitude=${latitude}&longitude=${longitude}`);
      if (res.ok) {
        return await res.json();
      }
      throw new Error(`Server returned ${res.status}`);
    } catch (err) {
      console.warn('[API] getNearbyBuses failed, returning empty:', err);
      return [];
    }
  },

  // 2. Get active buses running on a specific route (either by ID or routeNumber)
  async getActiveBuses(routeIdOrNum: string): Promise<BusDetail[]> {
    try {
      console.log(`[API] Fetching active buses for route ID/Number: ${routeIdOrNum}`);
      const res = await fetchWithTimeout(`${API_BASE_URL}/routes/${routeIdOrNum}/buses`);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) {
          return json;
        }
        if (json && json.success && Array.isArray(json.data)) {
          return json.data;
        }
        if (json && Array.isArray(json.data)) {
          return json.data;
        }
      }
      throw new Error(`Server returned ${res.status}`);
    } catch (err) {
      console.warn('[API] getActiveBuses failed, returning empty:', err);
      return [];
    }
  },

  // 3. Get seat occupancy status for a specific bus
  async getBusSeats(busId: string): Promise<{ occupiedSeats: number[] }> {
    try {
      console.log(`[API] Fetching seat arrangement for bus: ${busId}`);
      const res = await fetchWithTimeout(`${API_BASE_URL}/bookings/trips/${busId}/seats`);
      if (res.ok) {
        const json = await res.json();
        const dataObj = json && json.success ? json.data : json;
        const seatsList = dataObj && Array.isArray(dataObj.seats) ? dataObj.seats : [];
        
        const occupiedSeats = seatsList
          .filter((s: any) => s.status === 'occupied' || s.isOccupied === true || s.occupied === true || s.isBooked === true)
          .map((s: any) => typeof s.number === 'number' ? s.number : s.seatNumber);
          
        return { occupiedSeats };
      }
      throw new Error(`Server returned ${res.status}`);
    } catch (err) {
      console.warn('[API] getBusSeats failed, returning empty occupied list:', err);
      return { occupiedSeats: [] };
    }
  },

  // 4. Create new ticket booking / seat reservation
  async createBooking(bookingDetails: {
    routeNumber: string;
    from: string;
    to: string;
    busPlate: string;
    isAC: boolean;
    seatNumbers: number[];
    totalFare: number;
    busId?: string;
  }) {
    try {
      console.log('[API] Creating new booking:', bookingDetails);
      const token = await AsyncStorage.getItem('userToken');
      const userDataStr = await AsyncStorage.getItem('userData');
      let passengerName = 'Passenger';
      let passengerPhone = '0771234567';
      
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        const u = userData.user || {};
        const p = userData.profile || {};
        passengerName = p.full_name || p.fullName || u.fullName || u.name || 'Passenger';
        passengerPhone = u.phone || p.phone || '0771234567';
      }

      const body = {
        tripId: bookingDetails.busId || '',
        seatNumbers: bookingDetails.seatNumbers,
        passengerName,
        passengerPhone,
        paymentMethod: 'CARD',
      };

      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetchWithTimeout(`${API_BASE_URL}/bookings/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const json = await res.json();
        return json && json.success ? json.data : json;
      }
      throw new Error(`Server returned ${res.status}`);
    } catch (err) {
      console.error('[API] createBooking failed:', err);
      throw err;
    }
  },

  // 5. Get list of previous passenger bookings/trips
  async getBookingHistory() {
    try {
      console.log('[API] Fetching passenger booking history');
      const token = await AsyncStorage.getItem('userToken');
      const headers: any = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetchWithTimeout(`${API_BASE_URL}/bookings/my-trips`, {
        headers,
      });
      if (res.ok) {
        const json = await res.json();
        const rawList = json && json.success && Array.isArray(json.data) 
          ? json.data 
          : (Array.isArray(json) ? json : (json && Array.isArray(json.data) ? json.data : []));

        return rawList.map((b: any) => {
          const rawStatus = (b.status || 'CONFIRMED').toUpperCase();
          let status = 'upcoming';
          if (rawStatus === 'CANCELLED') {
            status = 'cancelled';
          } else if (rawStatus === 'COMPLETED') {
            status = 'completed';
          }

          const bookedDate = b.bookedAt || b.tripDate || new Date().toISOString();
          const formattedDate = new Date(bookedDate).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          });
          const formattedTime = new Date(bookedDate).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          });

          return {
            id: b.bookingId || `RR-${Math.floor(10000 + Math.random() * 90000)}`,
            routeNumber: b.routeNumber || '138',
            from: b.from || 'Colombo',
            to: b.to || 'Destination',
            busPlate: b.busPlate || 'NA-1234',
            isAC: b.isAC !== undefined ? b.isAC : true,
            seat: b.seatNumber ? `${b.seatNumber}` : '11',
            seatNumbers: b.seatNumber ? [b.seatNumber] : [11],
            fare: parseFloat(b.fare) || 850,
            date: formattedDate,
            time: formattedTime,
            status: status,
            tripId: b.tripId,
          };
        });
      }
      throw new Error(`Server returned ${res.status}`);
    } catch (err) {
      console.warn('[API] getBookingHistory failed, returning empty:', err);
      return [];
    }
  },

  // 6. Get list of routes with search filtering
  async getRoutes(searchQuery?: string) {
    try {
      let url = `${API_BASE_URL}/routes?limit=10`;
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      console.log(`[API] Fetching routes: ${url}`);
      const res = await fetchWithTimeout(url);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json)) {
          return json;
        }
        if (json && json.success && Array.isArray(json.data)) {
          return json.data;
        }
        if (json && Array.isArray(json.data)) {
          return json.data;
        }
      }
      throw new Error(`Server returned ${res.status}`);
    } catch (err) {
      console.warn('[API] getRoutes failed, returning empty:', err);
      return [];
    }
  },

  // 7. Register Passenger
  async registerPassenger(data: {
    fullName: string;
    phone: string;
    email?: string;
    password: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  // 8. Login (Passenger & Driver)
  async loginUser(identifier: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    return await response.json();
  },

  // 9. Get Logged-in Profile
  async getUserProfile(token: string) {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return await response.json();
  },

  // 11. Get live location of a bus trip
  async getLiveLocation(tripId: string) {
    try {
      console.log('[API] Fetching live location for trip:', tripId);
      const res = await fetchWithTimeout(`${API_BASE_URL}/tracking/trips/${tripId}`);
      if (res.ok) {
        const json = await res.json();
        return json && json.success ? json.data : json;
      }
      throw new Error(`Server returned ${res.status}`);
    } catch (err) {
      console.warn('[API] getLiveLocation failed:', err);
      return null;
    }
  },

  // 12. Update Passenger Profile
  async updateProfile(data: {
    fullName: string;
    phone: string;
    email?: string;
    photoUrl?: string;
  }) {
    const token = await AsyncStorage.getItem('userToken');
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  },
};

// Standalone exports for compatibility
export const registerPassenger = api.registerPassenger;
export const loginUser = api.loginUser;
export const getUserProfile = api.getUserProfile;
export const getLiveLocation = api.getLiveLocation;
export const updateProfile = api.updateProfile;

// 10. Get list of previous passenger bookings/trips with explicit token/passengerId options
export const getMyBookings = async (token?: string, passengerId?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const url = passengerId 
    ? `${API_BASE_URL}/bookings/my-trips?passengerId=${passengerId}`
    : `${API_BASE_URL}/bookings/my-trips`;

  const response = await fetch(url, { headers });
  return await response.json();
};
