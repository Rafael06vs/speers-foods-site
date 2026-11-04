import React from "react";
import { createRoot } from "react-dom/client";
import App from "./src/App";
import "./src/styles/styles.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Elemento #root não encontrado no index.html.");

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
