import React from 'react';
import DashboardLayout from './components/DashboardLayout';
import { TripProvider, useTrip } from './context/TripContext';
import { useTripEngine } from './hooks/useTripEngine';
import { useArrivalGeofence } from './hooks/useArrivalGeofence';
import { openOlaDeepLink, openUberDeepLink } from './utils/deepLinks';

function ActionCard() {
  const { trip } = useTrip();

  if (!trip) return <p className="text-sm text-slate-600">No active trip selected.</p>;

  if (trip.status === 'ARRIVAL') {
    return (
      <div className="space-y-2">
        <p className="text-sm">You are near destination. Book your final ride:</p>
        <button
          className="w-full rounded-lg bg-black px-3 py-2 text-white"
          onClick={() =>
            openUberDeepLink({
              pickupLat: trip.origin.lat,
              pickupLng: trip.origin.lng,
              dropoffLat: trip.destination.lat,
              dropoffLng: trip.destination.lng
            })
          }
        >
          Open Uber
        </button>
        <button
          className="w-full rounded-lg bg-green-700 px-3 py-2 text-white"
          onClick={() =>
            openOlaDeepLink({
              pickupLat: trip.origin.lat,
              pickupLng: trip.origin.lng,
              dropoffLat: trip.destination.lat,
              dropoffLng: trip.destination.lng
            })
          }
        >
          Open Ola
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2 text-sm">
      <p>Status: {trip.status}</p>
      <p>PNR: {trip.schedule?.pnr || 'Pending'}</p>
      <p>Seat: {trip.schedule?.seat || 'Pending'}</p>
    </div>
  );
}

function Dashboard() {
  const { trip } = useTrip();

  useTripEngine({
    userGps: trip?.origin,
    trafficMinutesToStation: 35
  });
  useArrivalGeofence(500);

  return (
    <DashboardLayout
      chatPane={<p className="text-sm text-slate-600">Gemini/Gemma JSON assistant stream…</p>}
      mapPane={<p className="text-sm text-slate-600">Google Maps: Home → Station → Destination</p>}
      actionPane={<ActionCard />}
      statsPane={
        <div className="space-y-2 text-sm text-slate-600">
          <p>Weather: 27°C, light rain</p>
          <p>Live status: {trip?.liveStatus?.message || 'Waiting for updates'}</p>
        </div>
      }
    />
  );
}

export default function App() {
  const tripId = import.meta.env.VITE_ACTIVE_TRIP_ID;

  return (
    <TripProvider tripId={tripId}>
      <Dashboard />
    </TripProvider>
  );
}
