import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div className="remi-root">
      <div className="remi-shell">
        <App />
      </div>
    </div>
  </React.StrictMode>
);
