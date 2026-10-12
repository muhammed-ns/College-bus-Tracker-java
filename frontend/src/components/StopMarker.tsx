import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Stop } from '../types';

interface StopMarkerProps {
  stop: Stop;
}

export const StopMarker: React.FC<StopMarkerProps> = ({ stop }) => {
  const stopIcon = useMemo(() => {
    const html = `
      <div class="relative flex items-center justify-center w-7 h-7">
        <div class="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-md border-2 border-white ring-1 ring-slate-400">
          ${stop.stopOrder}
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'custom-stop-marker',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
      popupAnchor: [0, -14],
    });
  }, [stop.stopOrder]);

  return (
    <Marker position={[stop.latitude, stop.longitude]} icon={stopIcon}>
      <Popup>
        <div className="p-1 min-w-[150px]">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-blue-600 mb-0.5">
            <span>Stop #{stop.stopOrder}</span>
          </div>
          <h4 className="font-bold text-slate-800 text-sm">{stop.stopName}</h4>
          <p className="text-[11px] text-slate-400 mt-1">
            {stop.latitude.toFixed(4)}, {stop.longitude.toFixed(4)}
          </p>
        </div>
      </Popup>
    </Marker>
  );
};

export default StopMarker;
