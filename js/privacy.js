/* =========================================================
   CASH WORLD - privacy page helper
   Highlights the current section in the "On this page" list
   (a scrolling chip bar on phones, a sticky side list on desktop).
   ========================================================= */
(function () {
  var links = [].slice.call(document.querySelectorAll(".pv-toc a"));
  if (!links.length || !("IntersectionObserver" in window)) return;

  var byId = {};
  var sections = [];
  links.forEach(function (a) {
    var id = a.getAttribute("href").slice(1);
    var el = document.getElementById(id);
    if (el) { byId[id] = a; sections.push(el); }
  });

  function activate(a) {
    links.forEach(function (l) { l.classList.remove("on"); l.removeAttribute("aria-current"); });
    a.classList.add("on");
    a.setAttribute("aria-current", "true");
    // on phones the list scrolls sideways: keep the active chip in view
    var list = a.parentNode.parentNode;
    if (list.scrollWidth > list.clientWidth + 2) {
      list.scrollTo({ left: Math.max(0, a.parentNode.offsetLeft - 16), behavior: "smooth" });
    }
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && byId[e.target.id]) activate(byId[e.target.id]);
    });
  }, { rootMargin: "-25% 0px -60% 0px" });

  sections.forEach(function (s) { io.observe(s); });
  if (links[0]) links[0].classList.add("on");
})();
