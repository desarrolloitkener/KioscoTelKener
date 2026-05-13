(function () {
  var users = window.KENER_KIOSK_USERS || {};
  var TEAMS_WEB = "https://teams.cloud.microsoft/";
  var LS_EXT = "kener-ext";
  var LS_THEME = "kener-theme";

  /** Intents launcher (formato # como en la documentación de Fully). */
  function teamsIntentForPackage(pkg) {
    return (
      "intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=" +
      pkg +
      ";end"
    );
  }

  function teamsIntentAlt(pkg) {
    return (
      "intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;package=" +
      pkg +
      ";end"
    );
  }

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

  function getLaunch() {
    return window.KENER_LAUNCH || {};
  }

  function getCurrentUser() {
    var ext = normalizeExt(window.location.pathname) || getSavedExt();
    return ext ? users[ext] : null;
  }

  function getTeamsPackages() {
    var L = getLaunch();
    var list = Array.isArray(L.teamsPackages) && L.teamsPackages.length ? L.teamsPackages.slice() : ["com.microsoft.teams"];
    var u = getCurrentUser();
    if (u && u.teamsPackage && list.indexOf(u.teamsPackage) === -1) {
      list.unshift(String(u.teamsPackage));
    }
    return list;
  }

  function getTeamsDeepLinks() {
    var L = getLaunch();
    return Array.isArray(L.teamsDeepLinks) && L.teamsDeepLinks.length
      ? L.teamsDeepLinks.slice()
      : ["msteams://", "ms-teams://"];
  }

  function tryFullyStartIntent(url) {
    if (!window.fully || typeof fully.startIntent !== "function") return false;
    try {
      fully.startIntent(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  function tryFullyStartApplication(pkg) {
    if (!window.fully || typeof fully.startApplication !== "function") return false;
    try {
      fully.startApplication(pkg);
      return true;
    } catch (e) {
      return false;
    }
  }

  function openTeamsApp(ev) {
    if (ev) ev.preventDefault();
    var pkgs = getTeamsPackages();
    var i;
    for (i = 0; i < pkgs.length; i++) {
      if (tryFullyStartIntent(teamsIntentForPackage(pkgs[i]))) return;
      if (tryFullyStartIntent(teamsIntentAlt(pkgs[i]))) return;
    }
    for (i = 0; i < pkgs.length; i++) {
      if (tryFullyStartApplication(pkgs[i])) return;
    }
    var deep = getTeamsDeepLinks();
    for (i = 0; i < deep.length; i++) {
      if (tryFullyStartIntent(deep[i])) return;
    }
    for (i = 0; i < deep.length; i++) {
      try {
        window.location.href = deep[i];
        return;
      } catch (e2) {}
    }
    if (pkgs.length) {
      try {
        window.location.href = teamsIntentForPackage(pkgs[0]);
        return;
      } catch (e3) {}
    }
    window.location.assign(TEAMS_WEB);
  }

  function openTeamsWeb(ev) {
    if (ev) ev.preventDefault();
    window.location.assign(TEAMS_WEB);
  }

  function dialIntentDial(telUri) {
    return "intent:#Intent;action=android.intent.action.DIAL;data=" + encodeURIComponent(telUri) + ";end";
  }

  function dialIntentView(telUri) {
    return "intent:#Intent;action=android.intent.action.VIEW;data=" + encodeURIComponent(telUri) + ";end";
  }

  function openDial(ev) {
    if (ev) ev.preventDefault();
    var btn = $("btn-tel");
    var telUri = (btn && btn.getAttribute("data-tel")) || "";
    if (!telUri || telUri === "tel:") return;

    var L = getLaunch();
    var dialPkgs = [];
    var one = L.dialerPackage ? String(L.dialerPackage).trim() : "";
    if (one) dialPkgs.push(one);
    var many = L.dialerPackages;
    if (Array.isArray(many)) {
      many.forEach(function (p) {
        var q = p ? String(p).trim() : "";
        if (q && dialPkgs.indexOf(q) === -1) dialPkgs.push(q);
      });
    }

    if (tryFullyStartIntent(dialIntentDial(telUri))) return;
    if (tryFullyStartIntent(dialIntentView(telUri))) return;
    if (tryFullyStartIntent("intent://#Intent;action=android.intent.action.DIAL;data=" + encodeURIComponent(telUri) + ";end"))
      return;
    var j;
    for (j = 0; j < dialPkgs.length; j++) {
      if (tryFullyStartApplication(dialPkgs[j])) return;
    }

    try {
      window.location.href = telUri;
    } catch (e) {}
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
    var btn = $("btn-tel");
    if (!btn) return;
    var telUri =
      (u && u.telUri) || (u && u.extension ? "tel:" + String(u.extension).replace(/\s/g, "") : "");
    btn.setAttribute("data-tel", telUri);
    var ok = Boolean(telUri && telUri !== "tel:");
    btn.disabled = !ok;
    btn.style.opacity = ok ? "" : "0.45";
    btn.style.pointerEvents = ok ? "" : "none";
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

    var telBtn = $("btn-tel");
    if (telBtn) telBtn.addEventListener("click", openDial);

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
