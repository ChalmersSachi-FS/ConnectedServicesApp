// services/weather.js
window.fetchWeather = async function (lat, lon) {
  try {
    // Replace FUNCTION_URL with your deployed function URL if you updated it.
    const FUNCTION_URL = window.WEATHER_FUNCTION_URL || "/functions/getWeather";
    const resp = await fetch(
      `${FUNCTION_URL}?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(
        lon
      )}`
    );
    if (!resp.ok) throw new Error(`Weather fetch failed: ${resp.status}`);
    const data = await resp.json();
    return data;
  } catch (e) {
    throw e;
  }
};
