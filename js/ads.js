/* =========================================================
   CASH WORLD - Google AdSense loader (public pages only)

   - Does nothing until you put your publisher ID in js/config.js.
   - Asks the visitor first. Ads load only after they press "Accept".
   - Ad boxes marked class="ad-slot" stay hidden unless ads are running,
     so you never see empty gaps.
   ========================================================= */
(function () {
  var A = (window.CW_CONFIG || {}).adsense || {};
  if (!A.client) return;

  var KEY = "cw-ads-consent";
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { if (v) localStorage.setItem(KEY, v); else localStorage.removeItem(KEY); } catch (e) {} }

  function loadAds() {
    if (window.__cwAdsLoaded) return;
    window.__cwAdsLoaded = true;
    window.adsbygoogle = window.adsbygoogle || [];

    var s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(A.client);
    document.head.appendChild(s);

    var slots = A.slots || {};
    document.querySelectorAll(".ad-slot").forEach(function (box) {
      var id = slots[box.getAttribute("data-ad-slot")];
      if (!id) return; // no unit ID: leave the box hidden and let Auto ads do the work
      var ins = box.querySelector("ins");
      ins.setAttribute("data-ad-client", A.client);
      ins.setAttribute("data-ad-slot", id);
      box.hidden = false;
      try { window.adsbygoogle.push({}); } catch (e) {}
    });
  }

  function showBanner() {
    if (document.getElementById("adConsent")) return;
    var bar = document.createElement("div");
    bar.id = "adConsent";
    bar.className = "consent";
    bar.setAttribute("role", "dialog");
    bar.setAttribute("aria-label", "Advertising choice");

    var p = document.createElement("p");
    p.textContent = "We show ads from Google to help keep this site running. Ads may use cookies. Do you accept?";
    var a = document.createElement("a");
    a.href = "privacy.html";
    a.textContent = " Read our privacy policy.";
    p.appendChild(a);

    var row = document.createElement("div");
    row.className = "consent-btns";
    var yes = document.createElement("button");
    yes.type = "button"; yes.className = "btn btn-gold"; yes.textContent = "Accept";
    var no = document.createElement("button");
    no.type = "button"; no.className = "btn btn-line"; no.textContent = "No thanks";
    yes.addEventListener("click", function () { set("yes"); bar.remove(); loadAds(); });
    no.addEventListener("click", function () { set("no"); bar.remove(); });
    row.appendChild(yes); row.appendChild(no);

    bar.appendChild(p); bar.appendChild(row);
    document.body.appendChild(bar);
  }

  /* lets the privacy page reopen the choice */
  window.cwAdsChoice = function () { set(null); showBanner(); };
  var choiceBtn = document.getElementById("adChoiceBtn");
  if (choiceBtn) choiceBtn.hidden = false;

  var saved = get();
  if (saved === "yes") loadAds();
  else if (saved !== "no") showBanner();
})();
