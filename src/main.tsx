// src/main.tsx (o el archivo donde haces el createRoot)
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "sonner";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    {/* 👉 Aquí montamos el sistema de toasts */}
    <Toaster
      richColors
      closeButton
      position="top-center"
      expand
    />

    <div className="remi-root">
      <div className="remi-shell">
        <App />
      </div>
    </div>
  </React.StrictMode>
);

// Tu service worker se queda igual
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => console.log("SW registered"))
      .catch((err) => console.error("SW registration failed", err));
  });
}
