import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Bus, Route, Trip } from '../types';
import Map from '../components/Map';
import StatusBadge from '../components/StatusBadge';
import useBusLocation from '../hooks/useBusLocation';
import { Bus as BusIcon, MapPin, Gauge, Clock, Radio, Navigation2, RefreshCw, ChevronRight } from 'lucide-react';

const DEFAULT_ROUTE: Route = {
  id: 1,
  routeName: 'CEA Campus & Adoor Town Route',
  description: 'Daily student transit route starting and ending at College of Engineering Adoor (CEA)',
  active: true,
  stops: [
    { id: 1, routeId: 1, stopName: 'College of Engineering Adoor (Departure Gate)', latitude: 9.1324, longitude: 76.7182, stopOrder: 1 },
    { id: 2, routeId: 1, stopName: 'Manakala Junction', latitude: 9.1352, longitude: 76.7225, stopOrder: 2 },
    { id: 3, routeId: 1, stopName: 'Karuvatta Junction', latitude: 9.1440, longitude: 76.7310, stopOrder: 3 },
    { id: 4, routeId: 1, stopName: 'Adoor KSRTC Central Bus Stand', latitude: 9.1538, longitude: 76.7335, stopOrder: 4 },
    { id: 5, routeId: 1, stopName: 'Adoor Revenue Tower / Private Stand', latitude: 9.1560, longitude: 76.7360, stopOrder: 5 },
    { id: 6, routeId: 1, stopName: 'Parakode Junction Market', latitude: 9.1425, longitude: 76.7512, stopOrder: 6 },
    { id: 7, routeId: 1, stopName: 'Ezhamkulam Temple Junction', latitude: 9.1305, longitude: 76.7580, stopOrder: 7 },
    { id: 8, routeId: 1, stopName: 'College of Engineering Adoor (Arrival Terminal)', latitude: 9.1324, longitude: 76.7182, stopOrder: 8 },
  ],
};

const DEFAULT_BUS: Bus = {
  id: 1,
  busNumber: 'CEA College Bus 1',
  registrationNumber: 'KL-26-CEA-101',
  status: 'ACTIVE',
};

export const StudentMap: React.FC = () => {
  const [bus, setBus] = useState<Bus>(DEFAULT_BUS);
  const [route, setRoute] = useState<Route>(DEFAULT_ROUTE);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [autoFollow, setAutoFollow] = useState<boolean>(true);
  const [showStopsList, setShowStopsList] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  // Hook for live location and STOMP websocket subscription
  const { location, wsConnected, refetch: refetchLocation } = useBusLocation(true);

  const fetchInitialData = async () => {
    try {
      setLoadingData(true);
      const [busRes, routeRes, tripRes] = await Promise.allSettled([
        api.get<Bus>('/bus'),
        api.get<Route>('/route'),
        api.get<Trip>('/trip/active'),
      ]);

      if (busRes.status === 'fulfilled' && busRes.value.data) setBus(busRes.value.data);
      if (routeRes.status === 'fulfilled' && routeRes.value.data && routeRes.value.data.stops?.length) {
        setRoute(routeRes.value.data);
      }
      if (tripRes.status === 'fulfilled' && tripRes.value.data) setTrip(tripRes.value.data);
    } catch (err) {
      console.error('Error fetching student initial data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchInitialData();

    // Poll active trip status every 10 seconds to detect start/end of trips
    const interval = setInterval(async () => {
      try {
        const tripRes = await api.get<Trip>('/trip/active');
        if (tripRes.data) setTrip(tripRes.data);
      } catch (err) {
        // silent catch
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const formattedPingTime = location.recordedAt
    ? new Date(location.recordedAt).toLocaleTimeString()
    : 'Not yet recorded';

  const tripStatus = trip?.status || 'NOT_STARTED';

  return (
    <div className="relative flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-100">
      {/* Floating Info Overlay Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 max-w-4xl mx-auto">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/80 p-3 sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Bus & Route Summary */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                <BusIcon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-bold text-slate-900 text-base leading-tight">
                    {bus?.busNumber || 'CEA College Bus 1'}
                  </h2>
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-mono">
                    {bus?.registrationNumber || 'KL-26-CEA-101'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Navigation2 className="w-3.5 h-3.5 text-blue-500" />
                  {route?.routeName || 'CEA Campus & Adoor Town Route'}
                </p>
              </div>
            </div>

            {/* Badges and Live Telemetry */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <StatusBadge type="trip" status={tripStatus} />
              <StatusBadge type="location" status={location.status} />

              <div className="hidden md:flex items-center space-x-3 pl-3 border-l border-slate-200 text-xs text-slate-600">
                <div className="flex items-center space-x-1" title="Current Speed">
                  <Gauge className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold text-slate-800">
                    {location.speed != null ? `${location.speed.toFixed(1)} km/h` : '0 km/h'}
                  </span>
                </div>
                <div className="flex items-center space-x-1" title="Last Updated">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formattedPingTime}</span>
                </div>
              </div>
            </div>

            {/* Map Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAutoFollow(!autoFollow)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
                  autoFollow
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title="Automatically pan map with moving bus"
              >
                <Radio className={`w-3.5 h-3.5 ${autoFollow ? 'animate-pulse' : ''}`} />
                <span>{autoFollow ? 'Auto-Pan On' : 'Auto-Pan Off'}</span>
              </button>

              <button
                onClick={() => setShowStopsList(!showStopsList)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center space-x-1 transition"
              >
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>{route?.stops?.length || 0} Stops</span>
              </button>

              <button
                onClick={() => {
                  refetchLocation();
                  fetchInitialData();
                }}
                className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 transition"
                title="Refresh Map Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="flex-1 w-full h-full min-h-[450px]">
        <Map
          stops={route?.stops || []}
          busLocation={location}
          bus={bus}
          center={[9.143, 76.735]}
          zoom={13}
          autoFollowBus={autoFollow}
        />
      </div>

      {/* Stops Drawer / Sidebar Modal */}
      {showStopsList && (
        <div className="absolute bottom-6 right-6 z-20 w-80 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-4 max-h-96 flex flex-col">
          <div className="flex justify-between items-center mb-3 border-b pb-2">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Scheduled Stops</h3>
              <p className="text-xs text-slate-500">{route?.routeName}</p>
            </div>
            <button
              onClick={() => setShowStopsList(false)}
              className="text-slate-400 hover:text-slate-700 text-sm font-bold"
            >
              ✕
            </button>
          </div>
          <div className="overflow-y-auto space-y-2 pr-1 flex-1">
            {route?.stops && route.stops.length > 0 ? (
              route.stops.map((stop) => (
                <div
                  key={stop.id}
                  className="flex items-center space-x-2.5 p-2 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 text-xs transition"
                >
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                    {stop.stopOrder}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800">{stop.stopName}</p>
                    <p className="text-[10px] text-slate-400">
                      {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4 text-center">No stops found</p>
            )}
          </div>
        </div>
      )}

      {/* Bottom Status Ticker for Mobile */}
      <div className="sm:hidden absolute bottom-3 left-3 right-3 z-10 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl shadow-md border border-slate-200 text-xs flex justify-between items-center">
        <div className="flex items-center space-x-1.5">
          <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-amber-500'}`}></span>
          <span className="text-slate-600">{wsConnected ? 'Live STOMP' : 'Connecting...'}</span>
        </div>
        <div className="font-medium text-slate-700">
          {location.speed != null ? `${location.speed.toFixed(1)} km/h` : '0 km/h'} • {formattedPingTime}
        </div>
      </div>
    </div>
  );
};

export default StudentMap;
