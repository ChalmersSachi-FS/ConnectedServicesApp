// services/maps.js
window.initMap = function (containerId, center = { lat: 0, lon: 0 }) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = `<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=${
    center.lon - 0.05
  }%2C${center.lat - 0.05}%2C${center.lon + 0.05}%2C${
    center.lat + 0.05
  }&layer=mapnik" style="border: none; width:100%; height:100%"></iframe>`;
};
