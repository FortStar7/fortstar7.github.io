(function attachSiteConfig(window) {
  "use strict";

  const config = {
    site: {
      name: "Karina Pack",
      shortName: "Karina",
      locale: "pl-PL",
      baseUrl: "./",
      supportEmail: "kontakt@example.com"
    },
    pack: {
      id: "karina-pack",
      title: "Karina Pack",
      fileName: "Karina_Pack.mp4",
      downloadUrl: "https://mega.nz/file/OpgHUDQb#ZOEyN8F7aXZZAUU65qhddWxzEiO5vT8j6S2jWaTPt78",
      format: "MP4",
      qualityLabel: "HD",
      category: "editing pack",
      description:
        "Scenki wideo do dynamicznych editow, shortow, fan montazy i social contentu."
    },
    gate: {
      waitSeconds: 120,
      adRepeats: 3,
      minVisibleRatio: 0.62,
      storageKey: "karina-pack-wait-gate-v2",
      consentKey: "karina-pack-ad-consent-v1",
      unlockCelebrationMs: 1400
    },
    ui: {
      downloadLockedLabel: "Zablokowane",
      downloadWaitingLabel: "Odliczanie",
      downloadUnlockedLabel: "Odblokowane",
      fileMissingWarning:
        "Nie wykryto pliku download. Przed publikacja wrzuc Karina_Pack.mp4 do katalogu downloads.",
      adDisabledHint: "Reklamy sa jeszcze wylaczone.",
      adReadyHint: "Reklamy sa aktywne i beda stale wyswietlane na stronie.",
      adCompleteHint: "Minely 2 minuty. Download jest aktywny.",
      timerPausedText: "Timer pauzuje, dopoki karta nie jest widoczna.",
      resetConfirm:
        "Czy na pewno zresetowac postep odblokowania dla Karina Pack na tym urzadzeniu?"
    },
    serviceWorker: {
      enabled: true,
      url: "sw.js?v=20260523-2"
    }
  };

  window.KARINA_PACK_SITE = Object.freeze(config);
})(window);
