// services/location.js
window.getCurrentLocation = async function (options = {}) {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          raw: pos,
        }),
      (err) => reject(err),
      Object.assign({ enableHighAccuracy: true, timeout: 10000 }, options)
    );
  });
};
