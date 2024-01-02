import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./Components/Header/Header";
import DomainGenerator from "./Components/Domaingeneration/Domainai";
import Pricing from "./Components/Pricing/Pricing";
import { Analytics } from '@vercel/analytics/react'; //Not working for now... look at it later(Don't forget to remove below render part.)

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Analytics />
    <App />
    <Header />
    <DomainGenerator />
    <Pricing />
  </React.StrictMode>
);

reportWebVitals();
