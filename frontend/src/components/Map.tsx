import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Stop, BusLocation, Bus } from '../types';
import BusMarker from './BusMarker';
import StopMarker from './StopMarker';

interface MapProps {
  stops?: Stop[];
  busLocation?: BusLocation;
  bus?: Bus | null;
  center?: [number, number];
  zoom?: number;
  autoFollowBus?: boolean;
}

// Controller component to smoothly pan/zoom map
const MapViewController: React.FC<{
  busLocation?: BusLocation;
  stops?: Stop[];
  autoFollowBus: boolean;
}> = ({ busLocation, stops, autoFollowBus }) => {
  const map = useMap();

  // If bus moves and autoFollowBus is true, pan smoothly
  useEffect(() => {
    if (autoFollowBus && busLocation?.latitude && busLocation?.longitude) {
      map.panTo([busLocation.latitude, busLocation.longitude], {
        animate: true,
        duration: 1.2,
      });
    }
  }, [busLocation?.latitude, busLocation?.longitude, autoFollowBus, map]);

  // Initial fit bounds to include all stops
  useEffect(() => {
    const validStops = stops || [];
    if (validStops.length > 0 && !busLocation?.latitude) {
      const bounds = L.latLngBounds(
        validStops.map((s) => [s.latitude, s.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [stops, map, busLocation?.latitude]);

  return null;
};

export const Map: React.FC<MapProps> = ({
  stops = [],
  busLocation,
  bus,
  center = [9.143, 76.735],
  zoom = 13,
  autoFollowBus = true,
}) => {
  // Sort stops by stopOrder to draw the polyline along the route
  const sortedStops = [...(stops || [])].sort((a, b) => a.stopOrder - b.stopOrder);
  const polylinePositions: LatLngExpression[] = sortedStops.map((stop) => [
    stop.latitude,
    stop.longitude,
  ]);

  return (
    <div className="relative w-full h-full min-h-[450px]">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="w-full h-full min-h-[450px] rounded-2xl shadow-inner z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Polyline connecting all stops */}
        {polylinePositions.length > 1 && (
          <>
            {/* Outer glowing line */}
            <Polyline
              positions={polylinePositions}
              pathOptions={{
                color: '#3b82f6',
                weight: 6,
                opacity: 0.7,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
            {/* Inner dashed line for transit aesthetic */}
            <Polyline
              positions={polylinePositions}
              pathOptions={{
                color: '#1d4ed8',
                weight: 3,
                dashArray: '6, 8',
                opacity: 0.9,
              }}
            />
          </>
        )}

        {/* All Stop Markers */}
        {sortedStops.map((stop) => (
          <StopMarker key={stop.id} stop={stop} />
        ))}

        {/* Live Bus Marker */}
        {busLocation && <BusMarker location={busLocation} bus={bus} />}

        {/* Automatic View Controller */}
        <MapViewController
          busLocation={busLocation}
          stops={sortedStops}
          autoFollowBus={autoFollowBus}
        />
      </MapContainer>
    </div>
  );
};

export default Map;
