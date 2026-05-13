(function () {
  var users = window.KENER_KIOSK_USERS || {};
  var TEAMS_PKG = "com.microsoft.teams";
  var TEAMS_WEB = "https://teams.cloud.microsoft/";
  var TEAMS_INTENT =
    "intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=" +
    TEAMS_PKG +
    ";end";
  var LS_EXT = "kener-ext";
  var LS_THEME = "kener-theme";

  function normalizeExt(pathname) {
    var p = (pathname || "").replace(/^\/+|\/+$/g, "");
    if (!p) return "";
    var seg = p.split("/")[0];
    return /^[0-9]+$/.test(seg) ? seg : "";
  }

  function $(id) {
    return document.getElementById(id);
  }

  function getSavedExt() {
    try {
      return localStorage.getItem(LS_EXT) || "";
    } catch (e) {
      return "";
    }
  }

  function saveExt(ext) {
    try {
      if (ext) localStorage.setItem(LS_EXT, ext);
    } catch (e) {}
  }

  function kioskMenuUrl() {
    var ext = normalizeExt(window.location.pathname) || getSavedExt();
    var base = window.location.origin + "/";
    return ext ? base + ext : base;
  }

  function goKioskMenu() {
    var url = kioskMenuUrl();
    if (window.fully && typeof fully.loadUrl === "function") {
      try {
        fully.loadUrl(url);
        return;
      } catch (e) {}
    }
    window.location.assign(url);
  }

  function openTeamsApp(ev) {
    if (ev) ev.preventDefault();
    if (window.fully && typeof fully.startApplication === "function") {
      try {
        fully.startApplication(TEAMS_PKG);
        return;
      } catch (e) {}
    }
    window.location.href = TEAMS_INTENT;
  }

  function openTeamsWeb(ev) {
    if (ev) ev.preventDefault();
    window.location.assign(TEAMS_WEB);
  }

  function applyTheme(theme) {
    var t = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", t);
    try {
      localStorage.setItem(LS_THEME, t);
    } catch (e) {}
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", t === "dark" ? "#050608" : "#f4f8fb");
    }
    var btn = $("btn-theme-toggle");
    if (btn) {
      btn.setAttribute("aria-label", t === "light" ? "Activar tema oscuro" : "Activar tema claro");
      btn.setAttribute("aria-pressed", t === "dark" ? "true" : "false");
    }
  }

  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme") || "light";
    applyTheme(cur === "light" ? "dark" : "light");
  }

  function initThemeToggle() {
    var btn = $("btn-theme-toggle");
    if (btn) btn.addEventListener("click", toggleTheme);
  }

  function initThemeFromStorage() {
    try {
      var s = localStorage.getItem(LS_THEME);
      if (s === "dark" || s === "light") applyTheme(s);
      else applyTheme("light");
    } catch (e) {
      applyTheme("light");
    }
  }

  function setTelTile(u) {
    var a = $("tile-tel");
    if (!a) return;
    var href = (u && u.telUri) || (u && u.extension ? "tel:" + String(u.extension).replace(/\s/g, "") : "tel:");
    a.setAttribute("href", href);
    a.setAttribute("aria-disabled", href === "tel:" ? "true" : "false");
    if (href === "tel:") {
      a.style.pointerEvents = "none";
      a.style.opacity = "0.45";
    } else {
      a.style.pointerEvents = "";
      a.style.opacity = "";
    }
  }

  function showChrome() {
    var bar = $("kiosk-chrome");
    if (bar) bar.hidden = false;
  }

  function renderUnknown() {
    $("screen-profile").hidden = true;
    $("screen-unknown").hidden = false;
    document.title = "Kener · Kiosco";
    showChrome();
  }

  function renderProfile(ext) {
    var u = users[ext];
    if (!u) {
      renderUnknown();
      return;
    }
    $("screen-unknown").hidden = true;
    $("screen-profile").hidden = false;
    $("field-name").textContent = u.name;
    $("field-extension").textContent = u.extension;
    $("field-title").textContent = u.title || "—";
    document.title = "Kener · Ext. " + u.extension;
    saveExt(ext);
    setTelTile(u);
    showChrome();
  }

  function applyMediaPaths() {
    var m = window.KENER_MEDIA;
    if (!m) return;
    if (m.logo) {
      var logo = document.querySelector(".brand-logo");
      if (logo) logo.src = m.logo;
    }
    var icons = m.icons;
    if (!icons) return;
    document.querySelectorAll("img[data-kener-icon]").forEach(function (img) {
      var key = img.getAttribute("data-kener-icon");
      if (key && icons[key]) img.src = icons[key];
    });
  }

  function setFooterYear() {
    var el = $("footer-year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  function init() {
    setFooterYear();
    applyMediaPaths();
    initThemeFromStorage();
    initThemeToggle();

    var teamsBtn = $("btn-teams");
    if (teamsBtn) teamsBtn.addEventListener("click", openTeamsApp);
    var teamsWeb = $("btn-teams-web");
    if (teamsWeb) teamsWeb.addEventListener("click", openTeamsWeb);

    var home = $("btn-kiosk-home");
    if (home) home.addEventListener("click", goKioskMenu);

    var ext = normalizeExt(window.location.pathname);
    if (!ext) {
      renderUnknown();
      return;
    }
    renderProfile(ext);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
