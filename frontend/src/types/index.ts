export type Role = 'ADMIN' | 'DRIVER' | 'STUDENT';
export type BusStatus = 'ACTIVE' | 'INACTIVE';
export type TripStatus = 'NOT_STARTED' | 'RUNNING' | 'COMPLETED';
export type LocationStatus = 'LIVE' | 'STALE' | 'UNAVAILABLE';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  enabled?: boolean;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Bus {
  id: number;
  busNumber: string;
  registrationNumber: string;
  status: BusStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface Stop {
  id: number;
  routeId: number;
  stopName: string;
  latitude: number;
  longitude: number;
  stopOrder: number;
}

export interface Route {
  id: number;
  routeName: string;
  description?: string;
  active: boolean;
  createdAt?: string;
  stops: Stop[];
}

export interface Trip {
  id: number;
  busId: number;
  busNumber: string;
  registrationNumber: string;
  driverId: number;
  driverName: string;
  routeId: number;
  routeName: string;
  status: TripStatus;
  startedAt?: string;
  endedAt?: string;
}

export interface BusLocation {
  latitude: number | null;
  longitude: number | null;
  speed: number | null;
  recordedAt: string | null;
  status: LocationStatus;
}

export interface LocationUpdateRequest {
  latitude: number;
  longitude: number;
  speed?: number;
}

export interface DriverSummary {
  id: number;
  name: string;
  email: string;
  role: Role;
  enabled: boolean;
  createdAt: string;
}
