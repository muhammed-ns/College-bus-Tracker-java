import React from 'react';
import { TripStatus, LocationStatus } from '../types';

interface StatusBadgeProps {
  type: 'trip' | 'location';
  status: TripStatus | LocationStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, status }) => {
  if (type === 'trip') {
    switch (status) {
      case 'RUNNING':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-2 h-2 mr-1.5 bg-emerald-500 rounded-full animate-ping"></span>
            TRIP RUNNING
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            COMPLETED
          </span>
        );
      case 'NOT_STARTED':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            NOT STARTED
          </span>
        );
    }
  }

  // Location status: LIVE, STALE, UNAVAILABLE
  switch (status) {
    case 'LIVE':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-700 border border-green-500/30">
          <span className="relative flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
          </span>
          LIVE
        </span>
      );
    case 'STALE':
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 border border-amber-500/30">
          <span className="h-2 w-2 mr-2 rounded-full bg-amber-500"></span>
          STALE (&gt;30s)
        </span>
      );
    case 'UNAVAILABLE':
    default:
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-700 border border-rose-500/30">
          <span className="h-2 w-2 mr-2 rounded-full bg-rose-500"></span>
          UNAVAILABLE
        </span>
      );
  }
};

export default StatusBadge;
