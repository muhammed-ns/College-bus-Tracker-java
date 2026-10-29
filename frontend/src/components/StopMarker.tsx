import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Stop } from '../types';

interface StopMarkerProps {
  stop: Stop;
  isNextStop?: boolean;
  isCurrentStop?: boolean;
  isPassed?: boolean;
}

// Short readable name for Google Maps-style map pill labels
function getShortStopLabel(name: string): string {
  if (name.includes('Departure Gate')) return 'CEA Adoor (Start)';
  if (name.includes('Arrival Terminal')) return 'CEA Adoor (End)';
  if (name.includes('Manakala')) return 'Manakala Jn';
  if (name.includes('High School')) return 'Adoor HS Jn';
  if (name.includes('Adoor KSRTC')) return 'Adoor KSRTC';
  if (name.includes('Nellimoodu') || name.includes('Bypass')) return 'Adoor Bypass';
  if (name.includes('Enathu')) return 'Enathu Jn';
  if (name.includes('Kulakkada')) return 'Kulakkada';
  if (name.includes('Mylom')) return 'Mylom Jn';
  if (name.includes('Kottarakkara')) return 'Kottarakkara';
  return name.split('(')[0].trim();
}

export const StopMarker: React.FC<StopMarkerProps> = ({
  stop,
  isNextStop = false,
  isCurrentStop = false,
  isPassed = false,
}) => {
  const shortLabel = getShortStopLabel(stop.stopName);

  const stopIcon = useMemo(() => {
    const circleClass = isNextStop
      ? 'bg-emerald-600 text-white ring-4 ring-emerald-400/50 scale-110'
      : isCurrentStop
      ? 'bg-blue-600 text-white ring-4 ring-blue-400/40'
      : isPassed
      ? 'bg-slate-400 text-white ring-1 ring-slate-300'
      : 'bg-white text-slate-900 border-2 border-blue-600 ring-2 ring-white';

    const labelBg = isNextStop
      ? 'bg-emerald-700 text-white border-emerald-500 shadow-lg'
      : isCurrentStop
      ? 'bg-blue-700 text-white border-blue-500 shadow-md'
      : 'bg-white/95 text-slate-800 border-slate-300 shadow-sm';

    const nextPulse = isNextStop
      ? `<div class="absolute -inset-2 rounded-full bg-emerald-500/35 animate-ping"></div>`
      : '';

    const nextBadge = isNextStop
      ? `<span class="text-[9px] uppercase tracking-wider font-extrabold bg-emerald-500 text-white px-1 rounded mr-1">NEXT</span>`
      : '';

    const html = `
      <div class="relative flex items-center justify-center w-8 h-8">
        ${nextPulse}
        <div class="relative z-10 w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-xs shadow-md border-2 border-white transition-transform ${circleClass}">
          ${stop.stopOrder}
        </div>
        <div class="absolute left-9 top-1/2 -translate-y-1/2 whitespace-nowrap px-2 py-0.5 rounded-full text-[11px] font-bold border ${labelBg} flex items-center pointer-events-none">
          ${nextBadge}${shortLabel}
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-stop-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  }, [stop.stopOrder, shortLabel, isNextStop, isCurrentStop, isPassed]);

  return (
    <Marker position={[stop.latitude, stop.longitude]} icon={stopIcon}>
      <Popup>
        <div className="p-1 min-w-[180px]">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-blue-600">
              Stop #{stop.stopOrder}
            </span>
            {isNextStop && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                NEXT STOP
              </span>
            )}
            {isCurrentStop && !isNextStop && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                CURRENT / DEPARTED
              </span>
            )}
          </div>
          <h4 className="font-bold text-slate-900 text-sm">{stop.stopName}</h4>
          <p className="text-[11px] text-slate-500 mt-1 font-mono">
            {stop.latitude.toFixed(4)}° N, {stop.longitude.toFixed(4)}° E
          </p>
        </div>
      </Popup>
    </Marker>
  );
};

export default StopMarker;
