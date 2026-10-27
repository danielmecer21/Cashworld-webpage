/* =========================================================
   CASH WORLD - theme loader (light / dark mode)
   Loaded in the <head> of every page so the right theme is set
   BEFORE the page paints (no white flash on dark mode).
   Order of choice: the visitor's saved choice, then their device setting.
   ========================================================= */
(function () {
  var KEY = "cw-theme";
  var root = document.documentElement;

  function saved() {
    try { var v = localStorage.getItem(KEY); return (v === "light" || v === "dark") ? v : null; }
    catch (e) { return null; }
  }
  function systemTheme() {
    return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
  }
  function apply(theme) {
    root.setAttribute("data-theme", theme);
    document.dispatchEvent(new Event("cw-themechange"));
  }

  apply(saved() || systemTheme());

  // Until the visitor picks a theme themselves, follow their device if it changes.
  if (window.matchMedia) {
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    var onChange = function () { if (!saved()) apply(systemTheme()); };
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  window.cwSetTheme = function (theme) {
    try { localStorage.setItem(KEY, theme); } catch (e) {}
    apply(theme);
  };
})();
