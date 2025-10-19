// functions/index.js
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

admin.initializeApp();
const db = admin.firestore();

// Read keys from functions config
const OPENWEATHER_KEY = functions.config().openweathermap?.key;
const MAPBOX_KEY = functions.config().mapbox?.key || null;

exports.getWeather = functions.https.onRequest(async (req, res) => {
  try {
    const lat = req.query.lat;
    const lon = req.query.lon;
    if (!lat || !lon)
      return res.status(400).json({ error: "lat/lon required" });
    if (!OPENWEATHER_KEY)
      return res.status(500).json({ error: "OpenWeather key not configured" });

    const cacheKey = `weather_${lat}_${lon}`;
    const cacheDoc = await db.collection("__cache__").doc(cacheKey).get();
    const now = Date.now();
    if (cacheDoc.exists) {
      const d = cacheDoc.data();
      if (d.expiresAt && d.expiresAt.toMillis() > now) {
        return res.json(d.payload);
      }
    }

    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(
      lon
    )}&units=metric&exclude=minutely,alerts&appid=${OPENWEATHER_KEY}`;
    const r = await fetch(url);
    if (!r.ok)
      return res
        .status(502)
        .json({ error: "weather provider failed", status: r.status });
    const payload = await r.json();

    await db
      .collection("__cache__")
      .doc(cacheKey)
      .set({
        payload,
        expiresAt: admin.firestore.Timestamp.fromMillis(now + 45 * 1000), // 45s cache
      });

    res.json(payload);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});
