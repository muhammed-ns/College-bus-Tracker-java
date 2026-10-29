import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import busWebSocket from '../services/websocket';
import { BusLocation } from '../types';

export const useBusLocation = (autoConnectWs = true) => {
  const [location, setLocation] = useState<BusLocation>(() => {
    try {
      const cached = localStorage.getItem('bus_live_location');
      if (cached) return JSON.parse(cached) as BusLocation;
    } catch {
      // ignore
    }
    return {
      latitude: null,
      longitude: null,
      speed: null,
      recordedAt: null,
      status: 'UNAVAILABLE',
    };
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const isMountedRef = useRef(true);

  const fetchLatestLocation = useCallback(async () => {
    try {
      const response = await api.get<BusLocation>('/bus/location/latest');
      if (isMountedRef.current && response.data && response.data.latitude != null) {
        setLocation(response.data);
      }
    } catch {
      // Fallback to localStorage cached live location if backend is unreachable
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchLatestLocation();

    // Listen to BroadcastChannel for instant zero-latency multi-tab presentation sync
    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('campus_bus_live_sync');
      channel.onmessage = (event) => {
        if (isMountedRef.current && event.data?.type === 'LOCATION_UPDATE') {
          setLocation(event.data.payload);
          setWsConnected(true);
        }
      };
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'bus_live_location' && e.newValue && isMountedRef.current) {
        try {
          setLocation(JSON.parse(e.newValue));
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorage);

    if (autoConnectWs) {
      busWebSocket.connect(
        (newLoc: BusLocation) => {
          if (isMountedRef.current) {
            setLocation(newLoc);
            localStorage.setItem('bus_live_location', JSON.stringify(newLoc));
          }
        },
        (connected: boolean) => {
          if (isMountedRef.current) {
            setWsConnected(connected);
          }
        }
      );
    }

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('storage', handleStorage);
      if (channel) {
        channel.close();
      }
      if (autoConnectWs) {
        busWebSocket.disconnect();
      }
    };
  }, [autoConnectWs, fetchLatestLocation]);

  return {
    location,
    loading,
    wsConnected,
    refetch: fetchLatestLocation,
  };
};

export default useBusLocation;
