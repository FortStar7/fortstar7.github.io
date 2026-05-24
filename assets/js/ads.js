(function attachAdPlacements(window) {
  "use strict";

  const sharedFrameStyles = `
    html,
    body {
      width: 100%;
      min-height: 100%;
      margin: 0;
      color: #f6f7fb;
      background: #0b0f16;
      font-family: Arial, Helvetica, sans-serif;
      overflow: hidden auto;
    }

    body {
      display: grid;
      place-items: center;
      padding: 0;
    }

    a {
      color: inherit;
    }

    iframe,
    img,
    embed,
    object {
      max-width: 100%;
    }

    .ad-shell {
      display: grid;
      width: 100%;
      min-height: 100vh;
      place-items: center;
      text-align: center;
    }
  `;

  const placements = [
    {
      id: "effective-direct-01",
      title: "Sponsor A",
      network: "effectivecpmnetwork",
      sizeLabel: "direct",
      width: 360,
      height: 280,
      fluid: true,
      html: `
        <script src="https://pl29534535.effectivecpmnetwork.com/93/cd/c2/93cdc2cef5c68dfaba154d9f427cddb0.js"><\/script>
      `
    },
    {
      id: "effective-native-01",
      title: "Sponsor B",
      network: "effectivecpmnetwork",
      sizeLabel: "native",
      width: 360,
      height: 320,
      fluid: true,
      html: `
        <script async="async" data-cfasync="false" src="https://pl29534536.effectivecpmnetwork.com/558aaa46cbd17e18a356a04da41e99a7/invoke.js"><\/script>
        <div id="container-558aaa46cbd17e18a356a04da41e99a7"></div>
      `
    },
    {
      id: "effective-direct-02",
      title: "Sponsor C",
      network: "effectivecpmnetwork",
      sizeLabel: "direct",
      width: 360,
      height: 280,
      fluid: true,
      html: `
        <script src="https://pl29534537.effectivecpmnetwork.com/39/3d/a5/393da5f06db4502a27c67b0f39ca2597.js"><\/script>
      `
    },
    {
      id: "highperformance-468x60",
      title: "Banner 468 x 60",
      network: "highperformanceformat",
      sizeLabel: "468 x 60",
      width: 468,
      height: 60,
      fluid: false,
      html: `
        <script>
          window.atOptions = {
            key: "12ddc8fbfc4dacd90ce60377d06cfb46",
            format: "iframe",
            height: 60,
            width: 468,
            params: {}
          };
          var atOptions = window.atOptions;
        <\/script>
        <script src="https://www.highperformanceformat.com/12ddc8fbfc4dacd90ce60377d06cfb46/invoke.js"><\/script>
      `
    },
    {
      id: "highperformance-300x250",
      title: "Rectangle 300 x 250",
      network: "highperformanceformat",
      sizeLabel: "300 x 250",
      width: 300,
      height: 250,
      fluid: false,
      html: `
        <script>
          window.atOptions = {
            key: "935eab503e09ec142ee3de4f723a3617",
            format: "iframe",
            height: 250,
            width: 300,
            params: {}
          };
          var atOptions = window.atOptions;
        <\/script>
        <script src="https://www.highperformanceformat.com/935eab503e09ec142ee3de4f723a3617/invoke.js"><\/script>
      `
    },
    {
      id: "highperformance-160x600",
      title: "Skyscraper 160 x 600",
      network: "highperformanceformat",
      sizeLabel: "160 x 600",
      width: 160,
      height: 600,
      fluid: false,
      html: `
        <script>
          window.atOptions = {
            key: "9fd8a71f0a2225deaa981baca5a67830",
            format: "iframe",
            height: 600,
            width: 160,
            params: {}
          };
          var atOptions = window.atOptions;
        <\/script>
        <script src="https://www.highperformanceformat.com/9fd8a71f0a2225deaa981baca5a67830/invoke.js"><\/script>
      `
    },
    {
      id: "highperformance-160x300",
      title: "Skyscraper 160 x 300",
      network: "highperformanceformat",
      sizeLabel: "160 x 300",
      width: 160,
      height: 300,
      fluid: false,
      html: `
        <script>
          window.atOptions = {
            key: "85fa3825766c7a160509b8ace302137a",
            format: "iframe",
            height: 300,
            width: 160,
            params: {}
          };
          var atOptions = window.atOptions;
        <\/script>
        <script src="https://www.highperformanceformat.com/85fa3825766c7a160509b8ace302137a/invoke.js"><\/script>
      `
    },
    {
      id: "highperformance-320x50",
      title: "Mobile banner 320 x 50",
      network: "highperformanceformat",
      sizeLabel: "320 x 50",
      width: 320,
      height: 50,
      fluid: false,
      html: `
        <script>
          window.atOptions = {
            key: "8f34e7c460e62c9a9943e45d7e602227",
            format: "iframe",
            height: 50,
            width: 320,
            params: {}
          };
          var atOptions = window.atOptions;
        <\/script>
        <script src="https://www.highperformanceformat.com/8f34e7c460e62c9a9943e45d7e602227/invoke.js"><\/script>
      `
    },
    {
      id: "highperformance-728x90",
      title: "Leaderboard 728 x 90",
      network: "highperformanceformat",
      sizeLabel: "728 x 90",
      width: 728,
      height: 90,
      fluid: false,
      html: `
        <script>
          window.atOptions = {
            key: "259c9232bc7e44565e33da0a1c52c0c5",
            format: "iframe",
            height: 90,
            width: 728,
            params: {}
          };
          var atOptions = window.atOptions;
        <\/script>
        <script src="https://www.highperformanceformat.com/259c9232bc7e44565e33da0a1c52c0c5/invoke.js"><\/script>
      `
    }
  ];

  function normalizePlacement(placement) {
    return Object.freeze({
      id: placement.id,
      title: placement.title,
      network: placement.network,
      sizeLabel: placement.sizeLabel,
      width: placement.width,
      height: placement.height,
      fluid: Boolean(placement.fluid),
      html: placement.html.trim()
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function buildFrameDocument(placement) {
    const safeNetwork = escapeHtml(placement.network);
    const safeTitle = escapeHtml(placement.title);

    return `<!doctype html>
      <html lang="pl">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <meta name="referrer" content="no-referrer-when-downgrade">
          <base target="_blank">
          <title>${safeTitle}</title>
          <style>${sharedFrameStyles}</style>
        </head>
        <body>
          <main class="ad-shell" data-network="${safeNetwork}">
            ${placement.html}
          </main>
        </body>
      </html>`;
  }

  window.KARINA_ADS = Object.freeze({
    placements: Object.freeze(placements.map(normalizePlacement)),
    buildFrameDocument
  });
})(window);
