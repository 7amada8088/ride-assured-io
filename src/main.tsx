import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// PWA / service worker safety: never register inside the Lovable editor preview
// or any iframe. Service workers cause stale caches and break HMR.
const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const isPreviewHost =
  window.location.hostname.includes("id-preview--") ||
  window.location.hostname.includes("lovableproject.com");

if (isPreviewHost || isInIframe) {
  // Clean up any previously-registered SW so the preview always sees fresh code.
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    });
  }
}

createRoot(document.getElementById("root")!).render(<App />);
