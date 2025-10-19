// services/qr.js
(function () {
  const qrResultEl = document.getElementById("qr-result");
  let qrScannerStream = null;
  let qrScanInterval = null;

  window.startQRScanner = async function (videoEl) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Camera not supported");
    }
    qrScannerStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
    });
    videoEl.srcObject = qrScannerStream;
    videoEl.play();

    qrScanInterval = setInterval(() => {
      if (videoEl.videoWidth === 0 || videoEl.videoHeight === 0) return;
      const canvas = document.createElement("canvas");
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoEl, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imgData.data, canvas.width, canvas.height);
      if (code) {
        window.stopQRScanner(videoEl);
        qrResultEl.textContent = `QR: ${code.data}`;
        saveQRHistory(code.data);
      }
    }, 500);
  };

  window.stopQRScanner = function (videoEl) {
    if (qrScanInterval) {
      clearInterval(qrScanInterval);
      qrScanInterval = null;
    }
    if (qrScannerStream) {
      qrScannerStream.getTracks().forEach((t) => t.stop());
      qrScannerStream = null;
    }
    if (videoEl) {
      videoEl.pause();
      videoEl.srcObject = null;
    }
  };

  async function saveQRHistory(data) {
    try {
      const user = window._FIREBASE.auth.currentUser;
      if (!user) return;
      await window._FIREBASE.db.collection("qrHistory").add({
        uid: user.uid,
        data,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } catch (e) {
      console.error("Failed to save qr history", e);
    }
  }
})();
