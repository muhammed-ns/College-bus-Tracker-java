import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import busWebSocket from '../services/websocket';
import { BusLocation } from '../types';

export const useBusLocation = (autoConnectWs = true) => {
  const [location, setLocation] = useState<BusLocation>({
    latitude: null,
    longitude: null,
    speed: null,
    recordedAt: null,
    status: 'UNAVAILABLE',
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [wsConnected, setWsConnected] = useState<boolean>(false);
  const isMountedRef = useRef(true);

  const fetchLatestLocation = useCallback(async () => {
    try {
      const response = await api.get<BusLocation>('/bus/location/latest');
      if (isMountedRef.current && response.data) {
        setLocation(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch latest bus location:', err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchLatestLocation();

    if (autoConnectWs) {
      busWebSocket.connect(
        (newLoc: BusLocation) => {
          if (isMountedRef.current) {
            setLocation(newLoc);
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
