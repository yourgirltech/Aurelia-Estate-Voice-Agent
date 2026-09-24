import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { COMPANY } from "./config/company.js";
import "react-phone-number-input/style.css";
import "./index.css";

document.title = `${COMPANY.name} — Enquiry`;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
