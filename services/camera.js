// services/camera.js
(function () {
  const video = document.getElementById("camera-stream");
  const canvas = document.getElementById("camera-canvas");
  const lastPhoto = document.getElementById("last-photo");
  let stream = null;

  window.openCamera = async function () {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Camera not supported");
    }
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });
    video.srcObject = stream;
    video.classList.remove("hidden");
  };

  window.closeCamera = function () {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      stream = null;
    }
    video.classList.add("hidden");
  };

  window.takePhoto = function () {
    if (!video || video.readyState < 2) {
      throw new Error("Camera not ready");
    }
    const w = video.videoWidth;
    const h = video.videoHeight;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    lastPhoto.src = dataUrl;
    lastPhoto.classList.remove("hidden");
    return dataUrl;
  };
})();
