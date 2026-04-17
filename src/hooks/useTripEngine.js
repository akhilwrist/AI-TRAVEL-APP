import { useEffect } from 'react';
import { useTrip } from '../context/TripContext';

const INR_BUDGET_CAP = 5000;

const mockSearchItineraries = async () => {
  return [
    { provider: 'Amadeus', priceInr: 4800, pnr: 'AMD123', seat: 'S1-33' },
    { provider: 'Agoda', priceInr: 5300, pnr: 'AGO456', seat: 'B2-14' }
  ];
};

const pickBestItinerary = (itineraries) => {
  return itineraries
    .filter((option) => option.priceInr <= INR_BUDGET_CAP)
    .sort((a, b) => a.priceInr - b.priceInr)[0];
};

export function useTripEngine({ userGps, trafficMinutesToStation, now = new Date() }) {
  const { trip, updateTrip } = useTrip();

  useEffect(() => {
    if (!trip || trip.status !== 'PLANNING') return;

    const runPlanning = async () => {
      const itineraries = await mockSearchItineraries();
      const best = pickBestItinerary(itineraries);
      if (!best) return;

      await updateTrip({
        status: 'BOOKED',
        schedule: {
          ...trip.schedule,
          pnr: best.pnr,
          seat: best.seat,
          fareInr: best.priceInr,
          provider: best.provider
        },
        liveStatus: {
          message: `Best fare booked via ${best.provider}`,
          etaMinutes: null,
          lastUpdated: now
        }
      });
    };

    runPlanning();
  }, [trip, updateTrip, now]);

  useEffect(() => {
    if (!trip || trip.status !== 'TRANSIT') return;
    if (!trip.schedule?.departureTime || !trip.origin) return;

    const remainingMinutes = Math.max(
      0,
      Math.floor((new Date(trip.schedule.departureTime).getTime() - now.getTime()) / 60000)
    );

    const userAtHome =
      Math.abs((userGps?.lat ?? 0) - trip.origin.lat) < 0.001 &&
      Math.abs((userGps?.lng ?? 0) - trip.origin.lng) < 0.001;

    if (userAtHome && trafficMinutesToStation > remainingMinutes && !trip.logic_triggers?.trafficAlertSent) {
      updateTrip({
        logic_triggers: {
          ...trip.logic_triggers,
          trafficAlertSent: true
        },
        liveStatus: {
          message: 'Leave now: traffic delay risk detected.',
          etaMinutes: trafficMinutesToStation,
          lastUpdated: now
        }
      });
    }
  }, [trip, trafficMinutesToStation, userGps, updateTrip, now]);
}

export default useTripEngine;
