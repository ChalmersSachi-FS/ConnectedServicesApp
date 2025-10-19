// app.js - wire UI to services
// NOTE: This file must be loaded after the service scripts in index.html.
// It waits for DOMContentLoaded so DOM elements exist, and uses the window-attached service functions.

document.addEventListener("DOMContentLoaded", () => {
  // Grab elements AFTER DOM is ready
  const btnGetWeather = document.getElementById("btn-get-weather");
  const weatherStatus = document.getElementById("weather-status");
  const weatherResult = document.getElementById("weather-result");
  const btnOpenCamera = document.getElementById("btn-open-camera");
  const btnTakePhoto = document.getElementById("btn-take-photo");
  const fileInput = document.getElementById("file-input");
  const btnSaveEntry = document.getElementById("btn-save-entry");
  const btnOpenQR = document.getElementById("btn-open-qr");
  const journalList = document.getElementById("journal-list");
  const mapContainer = "map";
  const btnRecenter = document.getElementById("btn-recenter");

  // Initialize app
  (async function init() {
    // Setup auth UI quick sign / sign out
    setupAuthUI();

    if (btnGetWeather) {
      btnGetWeather.addEventListener("click", async () => {
        weatherStatus.textContent = "Requesting location...";
        try {
          const loc = await window.getCurrentLocation();
          weatherStatus.textContent = `Got location (${loc.lat.toFixed(
            4
          )}, ${loc.lon.toFixed(4)}), fetching weather...`;
          const data = await window.fetchWeather(loc.lat, loc.lon);
          weatherStatus.textContent = "Weather loaded";
          showWeather(data);
          window.initMap(mapContainer, { lat: loc.lat, lon: loc.lon });
        } catch (e) {
          console.error(e);
          weatherStatus.textContent =
            "Failed to load weather: " + (e.message || e);
        }
      });
    }

    if (btnOpenCamera) {
      btnOpenCamera.addEventListener("click", async () => {
        try {
          await window.openCamera();
        } catch (e) {
          alert("Camera error: " + e.message);
        }
      });
    }

    if (btnTakePhoto) {
      btnTakePhoto.addEventListener("click", () => {
        try {
          window.takePhoto();
        } catch (e) {
          alert("Take photo failed: " + e.message);
        }
      });
    }

    if (fileInput) {
      fileInput.addEventListener("change", async (ev) => {
        const f = ev.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          const imgEl = document.getElementById("last-photo");
          if (imgEl) imgEl.src = e.target.result;
        };
        reader.readAsDataURL(f);
      });
    }

    if (btnSaveEntry) {
      btnSaveEntry.addEventListener("click", async () => {
        try {
          const imgEl = document.getElementById("last-photo");
          const img = imgEl?.src;
          if (!img) {
            alert("No photo to save");
            return;
          }
          const loc = await window.getCurrentLocation();
          const weather = await window.fetchWeather(loc.lat, loc.lon);
          const user = window._FIREBASE.auth.currentUser;
          if (!user) {
            alert("Please sign in to save entries");
            return;
          }
          await window._FIREBASE.db.collection("journalEntries").add({
            uid: user.uid,
            image: img,
            location: { lat: loc.lat, lon: loc.lon },
            weather: {
              summary: weather.current?.weather?.[0]?.description || "",
            },
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
          alert("Saved entry");
          loadJournal();
        } catch (e) {
          console.error(e);
          alert("Save failed: " + e.message);
        }
      });
    }

    if (btnOpenQR) {
      btnOpenQR.addEventListener("click", async () => {
        const video = document.createElement("video");
        video.style.width = "100%";
        video.style.height = "200px";
        document.getElementById("qr-section").appendChild(video);
        try {
          await window.startQRScanner(video);
        } catch (e) {
          alert("QR scanner error: " + e.message);
          video.remove();
        }
      });
    }

    if (btnRecenter) {
      btnRecenter.addEventListener("click", async () => {
        try {
          const loc = await window.getCurrentLocation();
          window.initMap(mapContainer, { lat: loc.lat, lon: loc.lon });
        } catch (e) {
          alert("Recenter failed: " + e.message);
        }
      });
    }

    // Load journal on startup
    loadJournal();
  })();

  function showWeather(data) {
    const el = document.getElementById("weather-result");
    if (!el) return;
    el.classList.remove("hidden");
    el.innerHTML = `
      <strong>${data?.current?.weather?.[0]?.main || "N/A"}</strong>
      <div>Temp: ${data?.current?.temp ?? "N/A"}</div>
      <div>Wind: ${data?.current?.wind_speed ?? "N/A"}</div>
    `;
  }

  async function loadJournal() {
    const user = window._FIREBASE?.auth?.currentUser;
    journalList.innerHTML = "";
    if (!user) {
      journalList.textContent = "Sign in to view your journal.";
      return;
    }
    const snap = await window._FIREBASE.db
      .collection("journalEntries")
      .where("uid", "==", user.uid)
      .orderBy("createdAt", "desc")
      .limit(20)
      .get();
    snap.forEach((doc) => {
      const d = doc.data();
      const el = document.createElement("div");
      el.className = "journal-entry";
      el.innerHTML = `<img src="${d.image}" style="max-width:200px"/><div>${
        d.weather?.summary || ""
      }</div><div>${d.location?.lat?.toFixed(4) || ""}, ${
        d.location?.lon?.toFixed(4) || ""
      }</div>`;
      journalList.appendChild(el);
    });
  }

  // Basic auth UI
  function setupAuthUI() {
    const authBar = document.getElementById("auth-bar");
    const user = window._FIREBASE?.auth?.currentUser;
    function render(u) {
      if (!authBar) return;
      authBar.innerHTML = "";
      if (u) {
        const name = u.email || u.displayName || "User";
        authBar.innerHTML = `<span>${name}</span> <button id="btn-signout">Sign out</button>`;
        document.getElementById("btn-signout").addEventListener("click", () => {
          window._FIREBASE.auth.signOut();
        });
      } else {
        authBar.innerHTML = `<button id="btn-signin">Sign in</button> <button id="btn-signup">Sign up</button>`;
        document
          .getElementById("btn-signin")
          .addEventListener("click", simpleSignIn);
        document
          .getElementById("btn-signup")
          .addEventListener("click", simpleSignUp);
      }
    }
    if (window._FIREBASE?.auth) {
      window._FIREBASE.auth.onAuthStateChanged((u) => {
        render(u);
        loadJournal();
      });
    }
    render(user);

    async function simpleSignIn() {
      const email = prompt("Email");
      const pass = prompt("Password");
      if (!email || !pass) return;
      try {
        await window._FIREBASE.auth.signInWithEmailAndPassword(email, pass);
        alert("Signed in");
      } catch (e) {
        alert(e.message);
      }
    }
    async function simpleSignUp() {
      const email = prompt("Email");
      const pass = prompt("Password");
      if (!email || !pass) return;
      try {
        await window._FIREBASE.auth.createUserWithEmailAndPassword(email, pass);
        alert("Account created");
      } catch (e) {
        alert(e.message);
      }
    }
  }
}); // end DOMContentLoaded listener
