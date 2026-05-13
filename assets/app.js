(function () {
  var users = window.KENER_KIOSK_USERS || {};

  function normalizeExt(pathname) {
    var p = (pathname || "").replace(/^\/+|\/+$/g, "");
    if (!p) return "";
    var seg = p.split("/")[0];
    return /^[0-9]+$/.test(seg) ? seg : "";
  }

  function $(id) {
    return document.getElementById(id);
  }

  function renderUnknown() {
    $("screen-profile").hidden = true;
    $("screen-unknown").hidden = false;
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
  }

  function init() {
    $("screen-unknown").hidden = true;
    $("screen-profile").hidden = true;
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
