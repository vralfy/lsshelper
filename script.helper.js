if (!document.lss_helper.helper) {
  document.lss_helper.helper = {};
}

document.lss_helper.helper.formatNumber = (arg) => {
  return arg.toString().padStart(2, '0');
}

document.lss_helper.helper.hash = (str) => {
  str = str || JSON.stringify({ mission: document.lss_helper.missions, vehicles: document.lss_helper.vehicles });
  let hash = 0;
  if (!str.length) {
      return 0;
  }

  for (let i = 0; i < str.length; i++) {
      let char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
  }

  return hash;
};

document.lss_helper.helper.getDistance = (obj1, obj2) => {
  const lat = (obj1.lat ?? 0) - (obj2.lat ?? 0);
  const lng = (obj1.lng ?? 0) - (obj2.lng ?? 0);
  // return Math.sqrt(lat * lat + lng * lng);
  const radius = 6371; // Radius of the Earth in km
  const radLat1 = obj1.lat * Math.PI / 180;
  const radLat2 = obj2.lat * Math.PI / 180;
  const dLat = (obj1.lat - obj2.lat) * Math.PI / 180;
  const dLon = (obj1.lng - obj2.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(radLat1) * Math.cos(radLat1) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radius * c; // Distance in km
}