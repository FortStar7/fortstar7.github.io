(function attachAdGate(window, document) {
  "use strict";

  class AdGate {
    constructor(options) {
      this.config = options.config;
      this.ads = options.ads;
      this.basePlacements = this.ads.placements;
      this.placements = this.buildRepeatedPlacements();
      this.state = this.createInitialState();
      this.elements = {};
      this.cards = new Map();
      this.timer = null;
      this.downloadAssetMissing = false;
    }

    init() {
      this.cacheElements();
      this.loadState();
      this.renderAdCards();
      this.bindEvents();
      this.hydrateStaticText();
      this.verifyDownloadAsset();

      if (this.state.consent) {
        this.loadAllAds();
      }

      this.updateTimerFromClock();
      this.updateUI();
    }

    buildRepeatedPlacements() {
      const repeats = Math.max(1, Number(this.config.gate.adRepeats) || 1);
      const slots = [];

      for (let round = 0; round < repeats; round += 1) {
        this.basePlacements.forEach((placement, index) => {
          slots.push({
            ...placement,
            slotId: `${placement.id}-${round + 1}`,
            slotTitle: `${placement.title} ${round + 1}.${index + 1}`
          });
        });
      }

      return slots;
    }

    createInitialState() {
      return {
        consent: false,
        startedAt: null,
        unlockedAt: null
      };
    }

    cacheElements() {
      this.elements.header = document.querySelector(".site-header");
      this.elements.adGrid = document.querySelector("[data-ad-grid]");
      this.elements.template = document.querySelector("#ad-card-template");
      this.elements.consentPanel = document.querySelector("[data-consent-panel]");
      this.elements.consentCheckbox = document.querySelector("[data-ad-consent-checkbox]");
      this.elements.consentButton = document.querySelector("[data-ad-consent-button]");
      this.elements.reloadAdsButton = document.querySelector("[data-reload-ads]");
      this.elements.startButtons = Array.from(document.querySelectorAll("[data-start-download]"));
      this.elements.adHint = document.querySelector("[data-ad-hint]");
      this.elements.progressBar = document.querySelector("[data-progress-bar]");
      this.elements.progressRing = document.querySelector("[data-progress-ring]");
      this.elements.waitProgress = document.querySelector("[data-wait-progress]");
      this.elements.waitDuration = document.querySelector("[data-wait-duration]");
      this.elements.timerDisplay = document.querySelector("[data-timer-display]");
      this.elements.gateLabel = document.querySelector("[data-gate-label]");
      this.elements.gateStatus = document.querySelector("[data-gate-status]");
      this.elements.unlockMessage = document.querySelector("[data-unlock-message]");
      this.elements.downloadButton = document.querySelector("[data-download-button]");
      this.elements.downloadActionLabel = document.querySelector("[data-download-action-label]");
      this.elements.downloadFile = document.querySelector("[data-download-file]");
      this.elements.resetProgress = document.querySelector("[data-reset-progress]");
      this.elements.downloadZone = document.querySelector("[data-download-zone]");
    }

    hydrateStaticText() {
      const { pack, gate } = this.config;

      if (this.elements.waitDuration) {
        this.elements.waitDuration.textContent = this.formatSeconds(gate.waitSeconds);
      }

      if (this.elements.timerDisplay) {
        this.elements.timerDisplay.textContent = this.formatSeconds(gate.waitSeconds);
      }

      if (this.elements.downloadFile) {
        this.elements.downloadFile.textContent = pack.fileName;
      }

      if (this.elements.downloadButton) {
        this.elements.downloadButton.href = pack.downloadUrl;
        this.elements.downloadButton.download = pack.fileName;
      }
    }

    loadState() {
      const progress = this.readJson(this.config.gate.storageKey);
      const consent = this.readJson(this.config.gate.consentKey);
      const initial = this.createInitialState();

      this.state = {
        ...initial,
        ...progress,
        consent: Boolean(consent && consent.accepted)
      };

      if (this.state.startedAt && Number.isNaN(Date.parse(this.state.startedAt))) {
        this.state.startedAt = null;
      }

      if (this.state.unlockedAt && Number.isNaN(Date.parse(this.state.unlockedAt))) {
        this.state.unlockedAt = null;
      }
    }

    readJson(key) {
      try {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      } catch (error) {
        console.warn("Nie udalo sie odczytac localStorage:", error);
        return null;
      }
    }

    writeJson(key, value) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn("Nie udalo sie zapisac localStorage:", error);
      }
    }

    saveProgress() {
      this.writeJson(this.config.gate.storageKey, {
        startedAt: this.state.startedAt,
        unlockedAt: this.state.unlockedAt
      });
    }

    saveConsent() {
      this.writeJson(this.config.gate.consentKey, {
        accepted: this.state.consent,
        acceptedAt: new Date().toISOString()
      });
    }

    renderAdCards() {
      if (!this.elements.adGrid || !this.elements.template) {
        return;
      }

      const fragment = document.createDocumentFragment();

      this.placements.forEach((placement, index) => {
        const node = this.elements.template.content.firstElementChild.cloneNode(true);
        const title = node.querySelector("[data-ad-title]");
        const size = node.querySelector("[data-ad-size]");
        const viewport = node.querySelector("[data-ad-viewport]");
        const timer = node.querySelector("[data-ad-timer]");

        node.dataset.adId = placement.slotId;
        node.style.setProperty("--ad-width", `${placement.width}px`);
        node.style.setProperty("--ad-height", `${placement.height}px`);

        if (title) {
          title.textContent = `${index + 1}. ${placement.slotTitle}`;
        }

        if (size) {
          size.textContent = placement.sizeLabel;
        }

        if (timer) {
          timer.textContent = "AD";
        }

        fragment.appendChild(node);

        this.cards.set(placement.slotId, {
          id: placement.slotId,
          placement,
          node,
          viewport,
          timer,
          loaded: false,
          frame: null
        });
      });

      this.elements.adGrid.replaceChildren(fragment);
    }

    bindEvents() {
      window.addEventListener("scroll", () => this.updateHeaderState(), { passive: true });
      document.addEventListener("visibilitychange", () => this.updateTimerFromClock());

      if (this.elements.consentCheckbox && this.elements.consentButton) {
        this.elements.consentCheckbox.checked = this.state.consent;
        this.elements.consentButton.disabled = !this.elements.consentCheckbox.checked;

        this.elements.consentCheckbox.addEventListener("change", () => {
          this.elements.consentButton.disabled = !this.elements.consentCheckbox.checked;
        });

        this.elements.consentButton.addEventListener("click", () => this.acceptConsent());
      }

      if (this.elements.reloadAdsButton) {
        this.elements.reloadAdsButton.addEventListener("click", () => this.reloadAds());
      }

      if (this.elements.resetProgress) {
        this.elements.resetProgress.addEventListener("click", () => this.resetProgress());
      }

      this.elements.startButtons.forEach((button) => {
        button.addEventListener("click", (event) => this.handleDownloadStart(event));
      });

      this.updateHeaderState();
    }

    updateHeaderState() {
      if (!this.elements.header) {
        return;
      }

      this.elements.header.dataset.elevated = String(window.scrollY > 12);
    }

    acceptConsent() {
      if (!this.elements.consentCheckbox || !this.elements.consentCheckbox.checked) {
        return;
      }

      this.state.consent = true;
      this.saveConsent();
      this.loadAllAds();
      this.updateUI();
    }

    loadAllAds() {
      this.cards.forEach((card) => this.loadAdFrame(card));
      this.setHint(this.config.ui.adReadyHint);
    }

    reloadAds() {
      if (!this.state.consent) {
        this.setHint("Najpierw zaakceptuj ladowanie reklam.");
        return;
      }

      this.cards.forEach((card) => {
        card.loaded = false;
        card.frame = null;
        this.loadAdFrame(card);
      });

      this.setHint("Reklamy zostaly przeladowane.");
    }

    loadAdFrame(card) {
      if (card.loaded || !card.viewport) {
        return;
      }

      const frame = document.createElement("iframe");
      frame.className = "ad-card__frame";
      frame.title = card.placement.slotTitle;
      frame.loading = "lazy";
      frame.referrerPolicy = "no-referrer-when-downgrade";
      frame.sandbox = "allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms";
      frame.dataset.adFluid = String(card.placement.fluid);
      frame.style.setProperty("--ad-width", `${card.placement.width}px`);
      frame.style.setProperty("--ad-height", `${card.placement.height}px`);
      frame.srcdoc = this.ads.buildFrameDocument(card.placement);

      card.viewport.replaceChildren(frame);
      card.frame = frame;
      card.loaded = true;
      card.node.classList.add("is-active");
      this.setStatus(card, "Aktywny", "status-pill--active");

      if (card.timer) {
        card.timer.textContent = "LIVE";
      }
    }

    setStatus(card, text, className) {
      const status = card.node.querySelector("[data-ad-status]");

      if (!status) {
        return;
      }

      status.className = `status-pill ${className || ""}`.trim();
      status.textContent = text;
    }

    setHint(text) {
      if (this.elements.adHint) {
        this.elements.adHint.textContent = text;
      }
    }

    handleDownloadStart(event) {
      const unlocked = this.isUnlocked();
      const isDownloadButton = event.currentTarget === this.elements.downloadButton;

      if (isDownloadButton && unlocked) {
        return;
      }

      event.preventDefault();

      if (unlocked) {
        this.scrollToDownloadZone();
        this.updateUI();
        return;
      }

      this.startWaitTimer();
      this.scrollToDownloadZone();
      this.updateUI();
    }

    startWaitTimer() {
      if (!this.state.startedAt || this.isUnlocked()) {
        this.state.startedAt = new Date().toISOString();
        this.state.unlockedAt = null;
        this.saveProgress();
      }

      this.ensureTimer();
    }

    ensureTimer() {
      if (this.timer) {
        return;
      }

      this.timer = window.setInterval(() => {
        this.updateTimerFromClock();
        this.updateUI();

        if (this.isUnlocked()) {
          this.stopTimer();
        }
      }, 250);
    }

    stopTimer() {
      if (this.timer) {
        window.clearInterval(this.timer);
        this.timer = null;
      }
    }

    updateTimerFromClock() {
      if (!this.state.startedAt || this.state.unlockedAt) {
        return;
      }

      if (this.getElapsedSeconds() >= this.config.gate.waitSeconds) {
        this.state.unlockedAt = new Date().toISOString();
        this.saveProgress();
        this.stopTimer();
      } else {
        this.ensureTimer();
      }
    }

    getElapsedSeconds() {
      if (!this.state.startedAt) {
        return 0;
      }

      const started = Date.parse(this.state.startedAt);

      if (Number.isNaN(started)) {
        return 0;
      }

      return Math.max(0, (Date.now() - started) / 1000);
    }

    getRemainingSeconds() {
      if (this.isUnlocked()) {
        return 0;
      }

      if (!this.state.startedAt) {
        return this.config.gate.waitSeconds;
      }

      return Math.max(0, Math.ceil(this.config.gate.waitSeconds - this.getElapsedSeconds()));
    }

    getProgressRatio() {
      if (this.isUnlocked()) {
        return 1;
      }

      if (!this.state.startedAt) {
        return 0;
      }

      return Math.min(1, this.getElapsedSeconds() / this.config.gate.waitSeconds);
    }

    isStarted() {
      return Boolean(this.state.startedAt);
    }

    isUnlocked() {
      return Boolean(this.state.unlockedAt);
    }

    scrollToDownloadZone() {
      const target = document.querySelector("#download");

      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    updateUI() {
      const started = this.isStarted();
      const unlocked = this.isUnlocked();
      const ratio = this.getProgressRatio();
      const percent = Math.round(ratio * 100);
      const remaining = this.getRemainingSeconds();

      if (this.elements.consentPanel) {
        this.elements.consentPanel.hidden = this.state.consent;
      }

      if (this.elements.reloadAdsButton) {
        this.elements.reloadAdsButton.disabled = !this.state.consent;
      }

      if (this.elements.progressBar) {
        this.elements.progressBar.style.width = `${percent}%`;
      }

      if (this.elements.progressRing) {
        this.elements.progressRing.style.setProperty("--ring-progress", `${Math.round(ratio * 360)}deg`);
      }

      if (this.elements.waitProgress) {
        this.elements.waitProgress.textContent = String(percent);
      }

      if (this.elements.timerDisplay) {
        this.elements.timerDisplay.textContent = this.formatSeconds(remaining);
      }

      if (this.elements.gateLabel) {
        this.elements.gateLabel.textContent = unlocked
          ? this.config.ui.downloadUnlockedLabel
          : started
            ? this.config.ui.downloadWaitingLabel
            : this.config.ui.downloadLockedLabel;
        this.elements.gateLabel.className = unlocked
          ? "status-pill status-pill--done"
          : started
            ? "status-pill status-pill--active"
            : "status-pill";
      }

      if (this.elements.gateStatus) {
        if (unlocked) {
          this.elements.gateStatus.textContent = this.downloadAssetMissing
            ? this.config.ui.fileMissingWarning
            : "Download jest odblokowany. Mozesz pobrac plik.";
        } else if (started) {
          this.elements.gateStatus.textContent = `Poczekaj jeszcze ${this.formatSeconds(remaining)}. Reklamy pozostaja widoczne w strefie ponizej.`;
        } else {
          this.elements.gateStatus.textContent = "Kliknij start, aby uruchomic 2-minutowy timer pobierania.";
        }
      }

      if (this.elements.unlockMessage) {
        this.elements.unlockMessage.textContent = unlocked
          ? this.config.ui.adCompleteHint
          : started
            ? `Odblokowanie za ${this.formatSeconds(remaining)}.`
            : "Kliknij dowolny przycisk pobierania, aby rozpoczac 2-minutowe odliczanie.";
      }

      if (this.elements.downloadButton) {
        this.elements.downloadButton.classList.toggle("is-disabled", started && !unlocked);
        this.elements.downloadButton.setAttribute("aria-disabled", "false");
      }

      if (this.elements.downloadActionLabel) {
        this.elements.downloadActionLabel.textContent = unlocked
          ? "Pobierz pack"
          : started
            ? `Czekaj ${this.formatSeconds(remaining)}`
            : "Rozpocznij timer";
      }

      if (!this.state.consent) {
        this.setHint(this.config.ui.adDisabledHint);
      } else if (unlocked) {
        this.setHint(this.config.ui.adCompleteHint);
      } else {
        this.setHint(this.config.ui.adReadyHint);
      }

      this.cards.forEach((card) => {
        if (!this.state.consent) {
          card.node.classList.remove("is-active");
          this.setStatus(card, "Gotowy", "");
          if (card.timer) {
            card.timer.textContent = "AD";
          }
        }
      });
    }

    resetProgress() {
      if (!window.confirm(this.config.ui.resetConfirm)) {
        return;
      }

      this.stopTimer();
      this.state.startedAt = null;
      this.state.unlockedAt = null;
      this.saveProgress();
      this.updateUI();
    }

    verifyDownloadAsset() {
      if (window.location.protocol === "file:") {
        return;
      }

      window
        .fetch(this.config.pack.downloadUrl, { method: "HEAD", cache: "no-store" })
        .then((response) => {
          this.downloadAssetMissing = !response.ok;
          this.updateUI();
        })
        .catch(() => {
          this.downloadAssetMissing = true;
          this.updateUI();
        });
    }

    formatSeconds(seconds) {
      const safeSeconds = Math.max(0, Math.ceil(Number(seconds) || 0));
      const minutes = Math.floor(safeSeconds / 60);
      const rest = safeSeconds % 60;
      return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
    }
  }

  window.KarinaAdGate = AdGate;
})(window, document);
