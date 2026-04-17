export const openUberDeepLink = ({ pickupLat, pickupLng, dropoffLat, dropoffLng }) => {
  const url = `uber://?action=setPickup&pickup[latitude]=${pickupLat}&pickup[longitude]=${pickupLng}&dropoff[latitude]=${dropoffLat}&dropoff[longitude]=${dropoffLng}`;
  window.location.href = url;
};

export const openOlaDeepLink = ({ pickupLat, pickupLng, dropoffLat, dropoffLng }) => {
  const url = `ola://book?pickup_lat=${pickupLat}&pickup_lng=${pickupLng}&drop_lat=${dropoffLat}&drop_lng=${dropoffLng}`;
  window.location.href = url;
};
