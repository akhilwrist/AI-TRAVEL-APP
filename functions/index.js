const { onObjectFinalized } = require('firebase-functions/v2/storage');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { getMessaging } = require('firebase-admin/messaging');

initializeApp();
const db = getFirestore();

const mockExtractTicketData = async () => {
  return {
    pnr: 'PNR-987654',
    departureTime: Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 12)),
    arrivalTime: Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 16)),
    seat: 'B1-22'
  };
};

exports.onTicketUpload = onObjectFinalized(async (event) => {
  const filePath = event.data.name || '';
  if (!filePath.startsWith('tickets/')) return;

  const [, tripId] = filePath.split('/');
  if (!tripId) return;

  const ticketData = await mockExtractTicketData();

  await db.collection('trips').doc(tripId).set(
    {
      status: 'BOOKED',
      schedule: ticketData,
      liveStatus: {
        message: 'Ticket parsed successfully. Trip is now booked.',
        lastUpdated: Timestamp.now(),
        etaMinutes: null
      },
      updatedAt: Timestamp.now()
    },
    { merge: true }
  );
});

exports.preTripPackingReminder = onSchedule('every 60 minutes', async () => {
  const windowStart = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 23));
  const windowEnd = Timestamp.fromDate(new Date(Date.now() + 1000 * 60 * 60 * 25));

  const snapshot = await db
    .collection('trips')
    .where('status', '==', 'BOOKED')
    .where('schedule.departureTime', '>=', windowStart)
    .where('schedule.departureTime', '<=', windowEnd)
    .get();

  for (const doc of snapshot.docs) {
    const trip = doc.data();
    if (trip.logic_triggers?.packingSent) continue;

    const userDoc = await db.collection('users').doc(trip.userId).get();
    const user = userDoc.data();
    const tokens = user?.notificationTokens || [];

    if (tokens.length) {
      await getMessaging().sendEachForMulticast({
        tokens,
        notification: {
          title: 'Poyalo Packing Alert',
          body: 'Trip starts in ~24h. Pack based on weather conditions.'
        },
        data: {
          tripId: doc.id,
          intent: 'PACKING_ALERT'
        }
      });
    }

    await doc.ref.set(
      {
        logic_triggers: {
          ...(trip.logic_triggers || {}),
          packingSent: true
        },
        updatedAt: Timestamp.now()
      },
      { merge: true }
    );
  }
});
