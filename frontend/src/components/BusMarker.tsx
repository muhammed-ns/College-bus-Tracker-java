import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { BusLocation, Bus } from '../types';

interface BusMarkerProps {
  location: BusLocation;
  bus?: Bus | null;
}

export const BusMarker: React.FC<BusMarkerProps> = ({ location, bus }) => {
  const { latitude, longitude, speed, recordedAt, status } = location;

  const busIcon = useMemo(() => {
    const isLive = status === 'LIVE';
    const isStale = status === 'STALE';
    const bgGradient = isLive
      ? 'from-blue-600 to-indigo-600'
      : isStale
      ? 'from-amber-500 to-amber-600'
      : 'from-slate-500 to-slate-600';

    const pulseRing = isLive
      ? `<div class="absolute -inset-2 rounded-full bg-blue-500/30 animate-ping"></div>`
      : '';

    const html = `
      <div class="relative flex items-center justify-center w-11 h-11">
        ${pulseRing}
        <div class="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr ${bgGradient} text-white shadow-xl ring-2 ring-white">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
          </svg>
        </div>
        <div class="absolute -bottom-1 w-2.5 h-2.5 bg-blue-600 rotate-45 border-r border-b border-white"></div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-bus-marker',
      iconSize: [44, 44],
      iconAnchor: [22, 40],
      popupAnchor: [0, -36],
    });
  }, [status]);

  if (!latitude || !longitude) {
    return null;
  }

  const formattedTime = recordedAt
    ? new Date(recordedAt).toLocaleTimeString()
    : 'Unknown';

  return (
    <Marker position={[latitude, longitude]} icon={busIcon}>
      <Popup className="bus-popup">
        <div className="p-1 min-w-[180px]">
          <div className="flex items-center justify-between border-b pb-2 mb-2">
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{bus?.busNumber || 'College Bus 1'}</h4>
              <p className="text-xs text-slate-500">{bus?.registrationNumber || 'CB-2026-X1'}</p>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                status === 'LIVE'
                  ? 'bg-green-100 text-green-700'
                  : status === 'STALE'
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {status}
            </span>
          </div>

          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Speed:</span>
              <span className="font-semibold text-slate-700">
                {speed != null ? `${speed.toFixed(1)} km/h` : '0 km/h'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Last Ping:</span>
              <span className="font-semibold text-slate-700">{formattedTime}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
              <span>GPS:</span>
              <span>
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </span>
            </div>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

export default BusMarker;
