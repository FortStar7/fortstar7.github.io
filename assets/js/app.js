(function bootstrapKarinaPack(window, document) {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  function registerServiceWorker(config) {
    if (!config.serviceWorker.enabled || !("serviceWorker" in navigator)) {
      return;
    }

    window.addEventListener("load", () => {
      navigator.serviceWorker.register(config.serviceWorker.url).catch((error) => {
        console.warn("Service worker nie zostal zarejestrowany:", error);
      });
    });
  }

  function enhanceAnchorScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (event) => {
        const id = anchor.getAttribute("href");

        if (!id || id === "#") {
          return;
        }

        const target = document.querySelector(id);

        if (!target) {
          return;
        }

        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, "", id);
      });
    });
  }

  function exposeDiagnostics(gate) {
    window.KARINA_PACK_DEBUG = Object.freeze({
      getState: () => ({ ...gate.state }),
      getConfig: () => window.KARINA_PACK_SITE,
      getAds: () => window.KARINA_ADS.placements.map((placement) => ({ ...placement, html: "[hidden]" }))
    });
  }

  ready(() => {
    const config = window.KARINA_PACK_SITE;
    const ads = window.KARINA_ADS;

    if (!config || !ads || !window.KarinaAdGate) {
      console.error("Brakuje konfiguracji strony lub modulu reklam.");
      return;
    }

    const gate = new window.KarinaAdGate({ config, ads });
    gate.init();
    enhanceAnchorScrolling();
    registerServiceWorker(config);
    exposeDiagnostics(gate);
  });
})(window, document);
