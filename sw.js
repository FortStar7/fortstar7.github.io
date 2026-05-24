const CACHE_NAME = "karina-pack-static-v3";

const PRECACHE_URLS = [
  "./",
  "index.html",
  "privacy.html",
  "terms.html",
  "404.html",
  "assets/css/styles.css?v=20260523-2",
  "assets/js/config.js?v=20260523-2",
  "assets/js/ads.js?v=20260523-2",
  "assets/js/ad-gate.js?v=20260523-2",
  "assets/js/app.js?v=20260523-2",
  "assets/img/karina-hero.png",
  "assets/img/karina-cover.png",
  "assets/img/og-image.png",
  "assets/img/favicon.png",
  "site.webmanifest"
];

const NEVER_CACHE_PATTERNS = [
  /\/downloads\//i,
  /effectivecpmnetwork\.com/i,
  /highperformanceformat\.com/i
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (NEVER_CACHE_PATTERNS.some((pattern) => pattern.test(url.href))) {
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request, "index.html"));
    return;
  }

  event.respondWith(cacheFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  if (response && response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }

  return response;
}

async function networkFirst(request, fallbackUrl) {
  try {
    const response = await fetch(request);

    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cached = await caches.match(request);

    if (cached) {
      return cached;
    }

    return caches.match(fallbackUrl);
  }
}
