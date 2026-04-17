import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const TripContext = createContext(null);

export function TripProvider({ tripId, children }) {
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tripId) {
      setTrip(null);
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(doc(db, 'trips', tripId), (snapshot) => {
      setTrip(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
      setLoading(false);
    });

    return () => unsub();
  }, [tripId]);

  const updateTrip = async (payload) => {
    if (!tripId) return;
    await updateDoc(doc(db, 'trips', tripId), {
      ...payload,
      updatedAt: new Date()
    });
  };

  const value = useMemo(
    () => ({ trip, tripId, loading, updateTrip }),
    [trip, tripId, loading]
  );

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

export const useTrip = () => {
  const ctx = useContext(TripContext);
  if (!ctx) {
    throw new Error('useTrip must be used inside TripProvider');
  }

  return ctx;
};
