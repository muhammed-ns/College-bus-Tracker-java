import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Stop, BusLocation, Bus } from '../types';
import BusMarker from './BusMarker';
import StopMarker from './StopMarker';
import {
  PRECOMPUTED_ROAD_PATH,
  fetchRoadRouteGeometry,
  computeNavigationState,
  haversineKm,
} from '../utils/roadRouting';

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
  roadPath: [number, number][];
  autoFollowBus: boolean;
}> = ({ busLocation, roadPath, autoFollowBus }) => {
  const map = useMap();

  // If bus moves and autoFollowBus is true, pan smoothly
  useEffect(() => {
    if (autoFollowBus && busLocation?.latitude && busLocation?.longitude) {
      map.panTo([busLocation.latitude, busLocation.longitude], {
        animate: true,
        duration: 1.0,
      });
    }
  }, [busLocation?.latitude, busLocation?.longitude, autoFollowBus, map]);

  // Initial fit bounds to include the road route
  useEffect(() => {
    if (roadPath.length > 1 && !busLocation?.latitude) {
      const bounds = L.latLngBounds(roadPath);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [roadPath, map, busLocation?.latitude]);

  return null;
};

export const Map: React.FC<MapProps> = ({
  stops = [],
  busLocation,
  bus,
  center = [9.085, 76.755],
  zoom = 12,
  autoFollowBus = true,
}) => {
  const [roadPath, setRoadPath] = useState<[number, number][]>(PRECOMPUTED_ROAD_PATH);

  // Sort stops by stopOrder
  const sortedStops = useMemo(
    () => [...(stops || [])].sort((a, b) => a.stopOrder - b.stopOrder),
    [stops]
  );

  // Fetch OSRM road-following geometry whenever stops change
  useEffect(() => {
    let active = true;
    fetchRoadRouteGeometry(sortedStops).then((geometry) => {
      if (active && geometry && geometry.length > 1) {
        setRoadPath(geometry);
      }
    });
    return () => {
      active = false;
    };
  }, [sortedStops]);

  const navState = useMemo(
    () => computeNavigationState(busLocation, sortedStops, roadPath),
    [busLocation, sortedStops, roadPath]
  );

  // Avoid overlapping Stop #10 on top of Stop #1 at CEA Adoor unless Stop #10 is the active Next Stop
  const visibleStops = useMemo(() => {
    if (sortedStops.length <= 2) return sortedStops;
    const first = sortedStops[0];
    return sortedStops.filter((stop, idx) => {
      if (idx === 0) return true;
      const sameAsFirst =
        haversineKm(first.latitude, first.longitude, stop.latitude, stop.longitude) < 0.08;
      if (sameAsFirst && navState.nextStop?.id !== stop.id) {
        return false;
      }
      return true;
    });
  }, [sortedStops, navState.nextStop?.id]);

  const fullRoadPositions: LatLngExpression[] = roadPath;
  const traveledPositions: LatLngExpression[] = navState.traveledPath;
  const upcomingPositions: LatLngExpression[] = navState.upcomingPath;

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

        {/* Google Maps Style Road-Following Route Polyline */}
        {fullRoadPositions.length > 1 && (
          <>
            {/* Traveled segment behind bus (muted slate-blue) */}
            {traveledPositions.length > 1 && (
              <Polyline
                positions={traveledPositions}
                pathOptions={{
                  color: '#64748b',
                  weight: 6,
                  opacity: 0.65,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            )}

            {/* Upcoming road outer dark blue border (Google Maps route casing) */}
            <Polyline
              positions={upcomingPositions.length > 1 ? upcomingPositions : fullRoadPositions}
              pathOptions={{
                color: '#185ABC',
                weight: 9,
                opacity: 0.9,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />

            {/* Upcoming road inner Google Maps vibrant blue fill */}
            <Polyline
              positions={upcomingPositions.length > 1 ? upcomingPositions : fullRoadPositions}
              pathOptions={{
                color: '#4285F4',
                weight: 5.5,
                opacity: 1.0,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </>
        )}

        {/* All Stop Markers along the Road */}
        {visibleStops.map((stop) => {
          const isNextStop = navState.nextStop?.stopOrder === stop.stopOrder;
          const isCurrentStop = navState.currentStop?.stopOrder === stop.stopOrder;
          const isPassed =
            !!busLocation?.latitude && stop.stopOrder < (navState.currentStop?.stopOrder || 1);

          return (
            <StopMarker
              key={stop.id}
              stop={stop}
              isNextStop={isNextStop}
              isCurrentStop={isCurrentStop}
              isPassed={isPassed}
            />
          );
        })}

        {/* Live Bus Marker */}
        {busLocation && <BusMarker location={busLocation} bus={bus} />}

        {/* Automatic View Controller */}
        <MapViewController
          busLocation={busLocation}
          roadPath={roadPath}
          autoFollowBus={autoFollowBus}
        />
      </MapContainer>
    </div>
  );
};

export default Map;
