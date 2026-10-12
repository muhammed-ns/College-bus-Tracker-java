import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Bus, Route, Trip, LocationUpdateRequest } from '../types';
import StatusBadge from '../components/StatusBadge';
import {
  Play,
  Square,
  Radio,
  WifiOff,
  Navigation,
  MapPin,
  Compass,
  Gauge,
  Clock,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Bus as BusIcon,
} from 'lucide-react';

export const DriverDashboard: React.FC = () => {
  const [bus, setBus] = useState<Bus | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isSharingLocation, setIsSharingLocation] = useState<boolean>(false);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [lastSentCoords, setLastSentCoords] = useState<{
    latitude: number;
    longitude: number;
    speed: number;
    time: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // References for tracking loops and simulation steps
  const locationIntervalRef = useRef<number | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const currentCoordsRef = useRef<{ latitude: number; longitude: number; speed: number } | null>(null);
  const simStepRef = useRef<number>(0);

  const fetchDriverDashboardData = async () => {
    try {
      const [busRes, routeRes, tripRes] = await Promise.allSettled([
        api.get<Bus>('/bus'),
        api.get<Route>('/route'),
        api.get<Trip>('/trip/active'),
      ]);

      if (busRes.status === 'fulfilled') setBus(busRes.value.data);
      if (routeRes.status === 'fulfilled') setRoute(routeRes.value.data);
      if (tripRes.status === 'fulfilled') setTrip(tripRes.value.data);
    } catch (err: any) {
      console.error('Failed to load driver dashboard data:', err);
    }
  };

  useEffect(() => {
    fetchDriverDashboardData();

    return () => {
      stopLocationSharing();
    };
  }, []);

  // Post coordinate update to backend API
  const sendLocationUpdate = async (coords: LocationUpdateRequest) => {
    try {
      await api.post('/driver/location', coords);
      setLastSentCoords({
        latitude: coords.latitude,
        longitude: coords.longitude,
        speed: coords.speed || 0,
        time: new Date().toLocaleTimeString(),
      });
      setErrorMessage(null);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error sending GPS coordinates to server';
      setErrorMessage(msg);
      console.error('Location transmission error:', err);
    }
  };

  // Start Trip
  const handleStartTrip = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const res = await api.post<Trip>('/driver/trip/start');
      setTrip(res.data);
      setSuccessMessage('Trip started successfully! You can now start sharing your location.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to start trip');
    } finally {
      setLoading(false);
    }
  };

  // End Trip
  const handleEndTrip = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      // Automatically stop sharing location when trip ends
      stopLocationSharing();

      const res = await api.post<Trip>('/driver/trip/end');
      setTrip(res.data);
      setSuccessMessage('Trip completed successfully. Location transmission stopped.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to end trip');
    } finally {
      setLoading(false);
    }
  };

  // Start Real Browser Geolocation Sharing (Every 5 seconds)
  const startRealLocationSharing = () => {
    if (!('geolocation' in navigator)) {
      setErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setErrorMessage(null);
    setIsSharingLocation(true);

    // Watch position to keep current position fresh
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        currentCoordsRef.current = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          speed: pos.coords.speed ? pos.coords.speed * 3.6 : 28.5, // convert m/s to km/h or fallback
        };
      },
      (err) => {
        console.warn('Geolocation watch error:', err.message);
        setErrorMessage(`Browser GPS error: ${err.message}. (Tip: Try the Simulate Route toggle below)`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );

    // Initial immediate ping
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const payload: LocationUpdateRequest = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          speed: pos.coords.speed ? pos.coords.speed * 3.6 : 25.0,
        };
        sendLocationUpdate(payload);
      },
      () => {
        // Fallback if first ping delays
      }
    );

    // Every 5 seconds transmission loop
    locationIntervalRef.current = window.setInterval(() => {
      if (currentCoordsRef.current) {
        sendLocationUpdate(currentCoordsRef.current);
      }
    }, 5000);
  };

  // Start Simulated Route Sharing (steps through stops or generates realistic progression)
  const startSimulatedSharing = () => {
    if (!route || !route.stops || route.stops.length === 0) {
      setErrorMessage('Route stops not loaded for simulation');
      return;
    }

    setIsSharingLocation(true);
    setIsSimulating(true);
    setErrorMessage(null);

    const stops = [...route.stops].sort((a, b) => a.stopOrder - b.stopOrder);
    let step = simStepRef.current % stops.length;

    // Send first simulated stop coordinate
    const targetStop = stops[step];
    sendLocationUpdate({
      latitude: targetStop.latitude,
      longitude: targetStop.longitude,
      speed: 32.5,
    });

    // Every 5 seconds advance smoothly through the route
    locationIntervalRef.current = window.setInterval(() => {
      step = (step + 1) % stops.length;
      simStepRef.current = step;
      const currentStop = stops[step];
      // Add slight jitter so it shows continuous real-time motion
      const jitterLat = currentStop.latitude + (Math.random() - 0.5) * 0.0008;
      const jitterLng = currentStop.longitude + (Math.random() - 0.5) * 0.0008;
      const simSpeed = 25.0 + Math.random() * 15.0;

      sendLocationUpdate({
        latitude: jitterLat,
        longitude: jitterLng,
        speed: simSpeed,
      });
    }, 5000);
  };

  // Stop Location Sharing
  const stopLocationSharing = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsSharingLocation(false);
    setIsSimulating(false);
  };

  const isTripRunning = trip?.status === 'RUNNING';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap justify-between items-center gap-4">
          <div>
            <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-blue-500/30 text-blue-200 border border-blue-400/30 inline-block mb-2">
              Driver Operation Console
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Shuttle Control Dashboard
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Manage your active transit run and transmit live GPS coordinates to students in real-time.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15">
            <div className="text-right">
              <p className="text-xs text-slate-300">Current Run Status</p>
              <div className="mt-0.5">
                <StatusBadge type="trip" status={trip?.status || 'NOT_STARTED'} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Banners */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <div>
            <h4 className="font-bold">Transmission Alert</h4>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3 text-emerald-700 text-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
          <div>
            <h4 className="font-bold">Status Update</h4>
            <p>{successMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Assigned Vehicle & Route Details */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-4">
              <BusIcon className="w-5 h-5 text-blue-600" />
              <span>Assigned Vehicle</span>
            </h2>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium">Bus Number</span>
                <span className="text-base font-bold text-slate-800">{bus?.busNumber || 'College Bus 1'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium">Registration Plate</span>
                <span className="text-base font-mono font-bold text-slate-800">{bus?.registrationNumber || 'CB-2026-X1'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Vehicle Status</span>
                  <span className="text-sm font-semibold text-slate-800">{bus?.status || 'ACTIVE'}</span>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2 mb-4">
              <Navigation className="w-5 h-5 text-blue-600" />
              <span>Assigned Route</span>
            </h2>
            <div className="space-y-2">
              <h3 className="font-bold text-slate-800">{route?.routeName || 'Main Campus Route'}</h3>
              <p className="text-xs text-slate-500">{route?.description}</p>
              <div className="pt-2">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  {route?.stops?.length || 0} Total Transit Stops
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle & Right: Actions & Live Broadcast Console */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Action Control Panel */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h2 className="font-bold text-slate-900 text-lg mb-1">Trip Controls</h2>
            <p className="text-xs text-slate-500 mb-6">
              Start your route run, initiate 5-second GPS sharing, and conclude the trip upon arrival.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Trip Button */}
              <button
                onClick={handleStartTrip}
                disabled={loading || isTripRunning}
                className="p-4 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Start Trip</span>
              </button>

              {/* End Trip Button */}
              <button
                onClick={handleEndTrip}
                disabled={loading || !isTripRunning}
                className="p-4 rounded-2xl font-bold text-sm flex items-center justify-center space-x-2 transition cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed bg-rose-600 hover:bg-rose-700 text-white"
              >
                <Square className="w-5 h-5 fill-current" />
                <span>End Trip</span>
              </button>
            </div>

            {/* Location Broadcast Controls */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm mb-3">Live GPS Transmission</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Real GPS Button */}
                <button
                  onClick={startRealLocationSharing}
                  disabled={!isTripRunning || isSharingLocation}
                  className="p-3.5 rounded-xl font-semibold text-xs flex flex-col items-center justify-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                >
                  <Radio className="w-4 h-4" />
                  <span>Share Device GPS</span>
                </button>

                {/* Simulated GPS Button (Ideal for testing locally on PC/laptop) */}
                <button
                  onClick={startSimulatedSharing}
                  disabled={!isTripRunning || isSharingLocation}
                  className="p-3.5 rounded-xl font-semibold text-xs flex flex-col items-center justify-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                  title="Simulates bus movement along the route for easy testing without moving"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Simulate Route GPS</span>
                </button>

                {/* Stop Sharing Button */}
                <button
                  onClick={stopLocationSharing}
                  disabled={!isSharingLocation}
                  className="p-3.5 rounded-xl font-semibold text-xs flex flex-col items-center justify-center gap-1.5 transition disabled:opacity-40 disabled:cursor-not-allowed bg-slate-200 hover:bg-slate-300 text-slate-800"
                >
                  <WifiOff className="w-4 h-4" />
                  <span>Stop Sharing</span>
                </button>
              </div>

              {isSharingLocation && (
                <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-semibold text-blue-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></span>
                    <span>
                      {isSimulating ? 'Simulated Route Mode Active (5s intervals)' : 'Device GPS Active (5s intervals)'}
                    </span>
                  </div>
                  <span className="text-[11px] text-blue-600 font-mono">Transmitting</span>
                </div>
              )}
            </div>
          </div>

          {/* Telemetry Monitor */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Compass className="w-5 h-5 text-blue-600" />
                <span>Live Telemetry Output</span>
              </h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                isSharingLocation ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {isSharingLocation ? 'Broadcasting to STOMP' : 'Idle'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 block font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Latitude
                </span>
                <span className="text-sm font-mono font-bold text-slate-800">
                  {lastSentCoords ? lastSentCoords.latitude.toFixed(5) : '--'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 block font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Longitude
                </span>
                <span className="text-sm font-mono font-bold text-slate-800">
                  {lastSentCoords ? lastSentCoords.longitude.toFixed(5) : '--'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 block font-medium flex items-center gap-1">
                  <Gauge className="w-3 h-3" /> Speed
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {lastSentCoords ? `${lastSentCoords.speed.toFixed(1)} km/h` : '--'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] text-slate-400 block font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Last Ping
                </span>
                <span className="text-sm font-bold text-slate-800">
                  {lastSentCoords ? lastSentCoords.time : '--'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
