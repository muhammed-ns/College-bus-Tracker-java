import React, { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import { Bus, Route, Trip } from '../types';
import Map from '../components/Map';
import StatusBadge from '../components/StatusBadge';
import useBusLocation from '../hooks/useBusLocation';
import {
  DEFAULT_CEA_STOPS,
  PRECOMPUTED_ROAD_PATH,
  computeNavigationState,
} from '../utils/roadRouting';
import {
  Bus as BusIcon,
  MapPin,
  Gauge,
  Clock,
  Radio,
  Navigation2,
  RefreshCw,
  ChevronRight,
  CornerUpRight,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const DEFAULT_ROUTE: Route = {
  id: 1,
  routeName: 'CEA Adoor – Adoor – Enathu – Kottarakkara (MC Road)',
  description:
    'Daily college transit route along MC Road starting from College of Engineering Adoor, via Manakala, Adoor KSRTC, Enathu, Kulakkada, Kottarakkara, and returning to CEA Adoor',
  active: true,
  stops: DEFAULT_CEA_STOPS,
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

  // Hook for live location and STOMP websocket subscription
  const { location, wsConnected, refetch: refetchLocation } = useBusLocation(true);

  const fetchInitialData = async () => {
    try {
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
    }
  };

  useEffect(() => {
    fetchInitialData();

    // Poll active trip status every 10 seconds to detect start/end of trips
    const interval = setInterval(async () => {
      try {
        const tripRes = await api.get<Trip>('/trip/active');
        if (tripRes.data) setTrip(tripRes.data);
      } catch {
        // silent catch
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const navState = useMemo(
    () => computeNavigationState(location, route?.stops || DEFAULT_CEA_STOPS, PRECOMPUTED_ROAD_PATH),
    [location, route?.stops]
  );

  const formattedPingTime = location.recordedAt
    ? new Date(location.recordedAt).toLocaleTimeString()
    : 'Awaiting live GPS';

  const tripStatus = trip?.status || 'NOT_STARTED';
  const sortedStops = useMemo(
    () => [...(route?.stops || DEFAULT_CEA_STOPS)].sort((a, b) => a.stopOrder - b.stopOrder),
    [route?.stops]
  );

  return (
    <div className="relative flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-slate-100">
      {/* Top Floating Google Maps-Style Navigation & Telemetry Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 max-w-5xl mx-auto space-y-2 pointer-events-none">
        {/* Google Maps Green Turn-by-Turn / Next Stop Banner */}
        <div className="pointer-events-auto bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white rounded-2xl shadow-xl border border-emerald-500/40 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/25 shadow-inner flex-shrink-0">
              <CornerUpRight className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-900/60 text-emerald-200 px-2 py-0.5 rounded-md border border-emerald-400/30">
                  NEXT STOP #{navState.nextStop.stopOrder}
                </span>
                <span className="text-xs text-emerald-100 font-medium hidden sm:inline">
                  via {navState.highwayName}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight leading-snug mt-0.5">
                {navState.nextStop.stopName}
              </h1>
              <p className="text-xs text-emerald-100 flex items-center gap-1.5">
                <span>Departed: {navState.currentStop.stopName.split('(')[0].trim()}</span>
                {navState.followingStops.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-xs sm:max-w-md">
                      Then: {navState.followingStops.slice(0, 3).map((s) => s.stopName.split('(')[0].trim()).join(' → ')}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Right Distance & ETA Pill (Google Maps Style) */}
          <div className="flex items-center space-x-3 bg-emerald-900/45 px-3.5 py-2 rounded-xl border border-white/15">
            <div className="text-right">
              <div className="text-base sm:text-lg font-extrabold leading-none text-white">
                {navState.distanceToNextStopKm < 1
                  ? `${Math.max(50, Math.round(navState.distanceToNextStopKm * 1000))} m`
                  : `${navState.distanceToNextStopKm.toFixed(1)} km`}
              </div>
              <div className="text-[11px] text-emerald-200 font-medium mt-0.5">
                ETA ~{navState.etaMinutes} min
              </div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <div className="text-sm font-bold text-amber-300">
                {location.speed != null ? `${location.speed.toFixed(0)}` : '0'}{' '}
                <span className="text-[10px] font-normal text-emerald-100">km/h</span>
              </div>
              <div className="text-[10px] text-emerald-200">{navState.progressPercent}% route</div>
            </div>
          </div>
        </div>

        {/* Secondary Compact Bus Info & Controls Bar */}
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-slate-200/90 px-3.5 py-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Bus & Route Summary */}
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <BusIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="font-bold text-slate-900 text-sm leading-tight">
                    {bus?.busNumber || 'CEA College Bus 1'}
                  </h2>
                  <span className="text-[11px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-mono">
                    {bus?.registrationNumber || 'KL-26-CEA-101'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Navigation2 className="w-3 h-3 text-blue-500" />
                  {route?.routeName}
                </p>
              </div>
            </div>

            {/* Badges and Live Telemetry */}
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge type="trip" status={tripStatus} />
              <StatusBadge type="location" status={location.status} />

              <div className="hidden lg:flex items-center space-x-2.5 pl-2.5 border-l border-slate-200 text-xs text-slate-600">
                <div className="flex items-center space-x-1" title="Last Updated">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{formattedPingTime}</span>
                </div>
              </div>
            </div>

            {/* Map Action Buttons */}
            <div className="flex items-center space-x-1.5">
              <button
                onClick={() => setAutoFollow(!autoFollow)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition cursor-pointer ${
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
                className="px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center space-x-1 transition cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>{sortedStops.length} Stops</span>
              </button>

              <button
                onClick={() => {
                  refetchLocation();
                  fetchInitialData();
                }}
                className="p-1.5 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                title="Refresh Map Data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Horizontal Route Stop Chain (CEA Adoor -> Adoor -> Enathu -> Kottarakkara) */}
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
            {sortedStops.map((stop, idx) => {
              const isNext = navState.nextStop?.stopOrder === stop.stopOrder;
              const isCurrent = navState.currentStop?.stopOrder === stop.stopOrder;
              const isPassed =
                !!location.latitude && stop.stopOrder < (navState.currentStop?.stopOrder || 1);
              const shortName = stop.stopName.split('(')[0].trim();

              return (
                <React.Fragment key={stop.id}>
                  <div
                    className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition ${
                      isNext
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                        : isCurrent
                        ? 'bg-blue-600 text-white'
                        : isPassed
                        ? 'bg-slate-100 text-slate-400 line-through'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {isPassed ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-black/15 flex items-center justify-center text-[9px] font-bold">
                        {stop.stopOrder}
                      </span>
                    )}
                    <span>{shortName}</span>
                  </div>
                  {idx < sortedStops.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-slate-300 flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Map Viewport */}
      <div className="flex-1 w-full h-full min-h-[450px]">
        <Map
          stops={sortedStops}
          busLocation={location}
          bus={bus}
          center={[9.085, 76.755]}
          zoom={12}
          autoFollowBus={autoFollow}
        />
      </div>

      {/* Stops Drawer / Sidebar Modal */}
      {showStopsList && (
        <div className="absolute bottom-6 right-6 z-20 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-4 max-h-96 flex flex-col">
          <div className="flex justify-between items-center mb-3 border-b pb-2">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Route Stops (CEA Adoor – Kottarakkara)
              </h3>
              <p className="text-xs text-slate-500">{route?.routeName}</p>
            </div>
            <button
              onClick={() => setShowStopsList(false)}
              className="text-slate-400 hover:text-slate-700 text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="overflow-y-auto space-y-2 pr-1 flex-1">
            {sortedStops.map((stop) => {
              const isNext = navState.nextStop?.stopOrder === stop.stopOrder;
              const isCurrent = navState.currentStop?.stopOrder === stop.stopOrder;
              return (
                <div
                  key={stop.id}
                  className={`flex items-center space-x-2.5 p-2.5 rounded-xl border text-xs transition ${
                    isNext
                      ? 'bg-emerald-50 border-emerald-300'
                      : isCurrent
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-slate-50 hover:bg-blue-50/40 border-slate-100'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full font-bold flex items-center justify-center text-[11px] flex-shrink-0 ${
                      isNext
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-white'
                    }`}
                  >
                    {stop.stopOrder}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-bold text-slate-800">{stop.stopName}</p>
                      {isNext && (
                        <span className="text-[9px] font-extrabold bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                          NEXT
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      {stop.latitude.toFixed(4)}° N, {stop.longitude.toFixed(4)}° E
                    </p>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom Status Ticker for Mobile */}
      <div className="sm:hidden absolute bottom-3 left-3 right-3 z-10 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-md border border-slate-200 text-xs flex justify-between items-center">
        <div className="flex items-center space-x-1.5">
          <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-amber-500'}`} />
          <span className="text-slate-600">{wsConnected ? 'Live STOMP' : 'Connecting...'}</span>
        </div>
        <div className="font-medium text-slate-700">
          Next: {navState.nextStop.stopName.split('(')[0].trim()} ({navState.distanceToNextStopKm.toFixed(1)} km)
        </div>
      </div>
    </div>
  );
};

export default StudentMap;
