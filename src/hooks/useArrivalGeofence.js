import { useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { useTrip } from '../context/TripContext';

const toRad = (value) => (value * Math.PI) / 180;

const distanceInMeters = (a, b) => {
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);

  return 2 * R * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

export function useArrivalGeofence(radiusMeters = 500) {
  const { trip, updateTrip } = useTrip();

  useEffect(() => {
    if (!trip || !trip.destination || trip.status === 'ARRIVAL' || trip.status === 'COMPLETED') {
      return;
    }

    let watchId;

    const startWatch = async () => {
      watchId = await Geolocation.watchPosition(
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        },
        async (position) => {
          if (!position?.coords) return;

          const current = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          const destination = {
            lat: trip.destination.lat,
            lng: trip.destination.lng
          };

          if (distanceInMeters(current, destination) <= radiusMeters) {
            await updateTrip({
              status: 'ARRIVAL',
              logic_triggers: {
                ...trip.logic_triggers,
                arrivedSent: true
              },
              liveStatus: {
                message: 'Arrived near destination. Open Uber/Ola for last-mile ride.',
                etaMinutes: 0,
                lastUpdated: new Date()
              }
            });
          }
        }
      );
    };

    startWatch();

    return () => {
      if (watchId) {
        Geolocation.clearWatch({ id: watchId });
      }
    };
  }, [trip, radiusMeters, updateTrip]);
}

export default useArrivalGeofence;
