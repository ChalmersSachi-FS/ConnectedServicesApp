# ConnectedServicesApp

# ConnectedServicesWebApp

**Course assignment 3.8 — Connected Services**  
Implementation: Web Progressive App (HTML/CSS/JS) + Firebase Functions (Node.js)  
**Author:** [Sachi Chalmers]  
**Due:** Oct 19, 2025 @ 11:59 PM EDT

---

## Summary

- I am using html,css & javascript because I am comfortable with it and when i do use expo I always run into and error I can never fix.

This repository contains a cross-platform web application (usable on desktop browsers and mobile browsers) that implements the core Module 3 learning objectives:

- Third-party API integration (OpenWeatherMap for weather; Mapbox static tiles + interactive view)
- Device hardware access (browser geolocation, camera via getUserMedia, file input fallback)
- QR code scanning (via `jsQR`) and QR history
- Photo metadata read (timestamp, and if EXIF GPS exists — we attempt to read)
- Backend: Firebase Functions to proxy third-party API calls (protect API keys), handle Firestore writes, and basic secure endpoints
- Authentication: Firebase Auth (email/password) and Firestore for user preferences and saved entries
- Error handling and fallback UIs

> **Note:** The course asked for an Expo (TypeScript) implementation. Due to project constraints, this submission provides a functionally equivalent web implementation. All required features are implemented; the README maps every assignment requirement to the implemented functionality.

---

## Project structure

(See repo root for full tree.) Key folders:

- `index.html`, `global.css`, `app.js` — front-end
- `services/` — client-side service modules (weather, maps, camera, qr, firebase init)
- `functions/` — Firebase Functions (proxy endpoints)
- `firestore.rules` — Firestore security rules
- `REFLECTION.md` — 300–500 word reflection

---

## Quick start (local)

1. Install Firebase CLI if you haven't:
   ```bash
   npm install -g firebase-tools
   ```
