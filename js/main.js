/* =========================================================
   CASH WORLD - shared script (used by every page)
   Edit the settings in the box below.
   ========================================================= */

/* ============ EDIT THESE ============ */
const WHATSAPP = "263778577281";

// Indicative rates: how many units of each currency equal 1 USD.
// UPDATE these whenever your rates change.
const RATES = { USD:1, ZAR:16.0, GBP:0.78, EUR:0.92, BWP:13.6, ZWG:26.0 };

// How each currency's "note" card looks on the Currencies section.
// If you add a currency to RATES above, add a matching line here (sym = symbol, c1/c2 = gradient colours).
const CURRENCIES = {
  USD:{sym:"$",   name:"US Dollar",          c1:"#14532d", c2:"#2f8a5b"},
  ZAR:{sym:"R",   name:"South African Rand", c1:"#6b3d02", c2:"#c27c12"},
  GBP:{sym:"£",   name:"British Pound",      c1:"#47196b", c2:"#8446b0"},
  EUR:{sym:"€",   name:"Euro",               c1:"#12397a", c2:"#2f6fc0"},
  BWP:{sym:"P",   name:"Botswana Pula",      c1:"#0b4f5c", c2:"#1f8fa3"},
  ZWG:{sym:"ZiG", name:"Zimbabwe Gold",      c1:"#5c4106", c2:"#b8901e"}
};

const BRANCHES = [
  {city:"Harare", hq:true, addr:"130, 2nd Avenue, Showgrounds, Harare", tel:["+263 242 753 437","+263 77 857 7281"]},
  {city:"Bulawayo", addr:"Main Post Office, 7th Ave / Takawira, Bulawayo Mall", tel:[]},
  {city:"Mutare", addr:"Herbert Chitepo Street, Mutare", tel:["+263 717 471 583"]},
  {city:"Masvingo", addr:"2nd Floor, Room 2, Masvingo", tel:["+263 717 471 600"]},
  {city:"Kwekwe", addr:"21 Nelson Mandela Way / 2nd, Kwekwe", tel:["+263 710 384 056"]},
  {city:"Bindura", addr:"C12 2nd Floor, Simwami Complex, Opposite N Richards, Bindura", tel:["+263 711 471 587"]},
  {city:"Zvishavane", addr:"Tees Complex, 1st Floor, Office 107, Zvishavane", tel:["+263 717 471 587"]}
  // Add your 8th branch here: {city:"...", addr:"...", tel:["..."]}
];
/* ==================================== */

const $ = id => document.getElementById(id);

// Mobile menu
document.querySelectorAll("#menu a").forEach(a => a.addEventListener("click", () => $("menu").classList.remove("open")));
if ($("yr")) $("yr").textContent = new Date().getFullYear();

// Currency calculator (home page only)
if ($("amt")) {
  const codes = Object.keys(RATES);
  codes.forEach(c => { $("from").add(new Option(c,c)); $("to").add(new Option(c,c)); });
  $("from").value = "USD"; $("to").value = "ZAR";
  const calc = () => {
    const a = parseFloat($("amt").value) || 0;
    const f = $("from").value, t = $("to").value;
    const r = RATES[t] / RATES[f];
    $("out").textContent = (a * r).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2}) + " " + t;
    $("rateline").textContent = "1 " + f + " ≈ " + r.toFixed(4) + " " + t;
    const msg = `Hi Cash World, I'd like to exchange ${a} ${f} to ${t}. Please confirm today's rate.`;
    $("waquote").href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
  };
  ["amt","from","to"].forEach(id => $(id).addEventListener("input", calc));
  $("swap").onclick = () => { const f=$("from").value; $("from").value=$("to").value; $("to").value=f; calc(); };
  calc();
}

// Branch directory (branches page only)
if ($("branchGrid")) {
  const render = filter => {
    const list = filter==="All" ? BRANCHES : BRANCHES.filter(b => b.city===filter);
    $("branchGrid").innerHTML = list.map(b => `
      <div class="branch">
        ${b.hq?'<span class="hq">HEAD OFFICE</span>':''}
        <h3>${b.city}</h3>
        <p>📍 ${b.addr}</p>
        ${b.tel.length ? b.tel.map(t=>`<p><a href="tel:${t.replace(/\s/g,'')}">📞 ${t}</a></p>`).join("") : '<p><a href="contact.html">Contact us for details</a></p>'}
      </div>`).join("");
    document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t.dataset.c===filter));
  };
  $("tabs").innerHTML = ["All",...BRANCHES.map(b=>b.city)].map(c => `<button class="tab" data-c="${c}">${c}</button>`).join("");
  $("tabs").addEventListener("click", e => { if(e.target.dataset.c) render(e.target.dataset.c); });
  render("All");
}

// Contact form -> WhatsApp (contact page only)
if ($("contactForm")) {
  $("contactForm").addEventListener("submit", e => {
    e.preventDefault();
    const m = `Hello Cash World,\nName: ${$("name").value}\nPhone: ${$("phone").value}\nInterested in: ${$("topic").value}\n${$("msg").value}`;
    window.open("https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(m), "_blank");
  });
}

// Light / dark mode button (theme.js in the <head> sets the theme before the page paints)
(function () {
  const btn = $("themeToggle");
  if (!btn) return;
  const root = document.documentElement;
  const SUN = '<svg class="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M18.7 5.3L17 7M7 17l-1.7 1.7"/></svg>';
  const MOON = '<svg class="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.5 14.2A8.6 8.6 0 0 1 9.8 3.5a8.6 8.6 0 1 0 10.7 10.7z"/></svg>';
  btn.innerHTML = SUN + MOON;
  const refresh = () => {
    const dark = root.getAttribute("data-theme") === "dark";
    const label = dark ? "Switch to light mode" : "Switch to dark mode";
    btn.setAttribute("aria-label", label);
    btn.title = label;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#050c18" : "#0A1F3D");
  };
  btn.addEventListener("click", () => {
    root.classList.add("theme-switching");
    window.cwSetTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    setTimeout(() => root.classList.remove("theme-switching"), 450);
  });
  document.addEventListener("cw-themechange", refresh);
  refresh();
})();

// Floating currency symbols behind the banners
const FX_ITEMS = [ // [symbol, left %, top %, size rem, tilt deg, seconds, delay s]
  ["$",4,18,3.4,-10,13,0], ["€",14,68,2.6,8,16,-3], ["£",27,12,2.2,-6,12,-6], ["R",38,74,3.0,12,15,-2],
  ["P",49,20,2.4,-14,14,-9], ["$",58,62,3.6,6,17,-5], ["ZiG",69,14,2.0,-4,13,-7], ["€",78,70,2.8,10,15,-1],
  ["£",88,24,3.2,-12,16,-4], ["R",93,66,2.2,5,12,-8], ["$",22,40,1.8,9,11,-10], ["P",82,44,1.8,-7,12,-2]
];
document.querySelectorAll(".hero,.page-hero,.cta-band,.steps,.currencies").forEach(sec => {
  const fx = document.createElement("div");
  fx.className = "fx-bg";
  fx.setAttribute("aria-hidden", "true");
  fx.innerHTML = FX_ITEMS.map(([s,l,t,z,r,d,dl]) =>
    `<span style="left:${l}%;top:${t}%;font-size:${z}rem;--r:${r}deg;--d:${d}s;--delay:${dl}s">${s}</span>`).join("");
  sec.insertBefore(fx, sec.firstChild);
});

const fmtRate = r => r >= 10 ? r.toFixed(2) : r.toFixed(4);

// Scrolling rate ticker (home page)
if ($("tickerTrack")) {
  const items = Object.keys(RATES).filter(c => c !== "USD")
    .map(c => `<span class="tick-item"><b>USD/${c}</b>${fmtRate(RATES[c])}</span>`).join("");
  const set = `<span class="tick-label">Indicative rates</span>${items}`;
  $("tickerTrack").innerHTML = set.repeat(6);
}

// Currency "note" cards (home + services pages)
if ($("noteGrid")) {
  $("noteGrid").innerHTML = Object.keys(RATES).map(code => {
    const c = CURRENCIES[code] || {sym:code, name:code, c1:"#1F3864", c2:"#3b5ea8"};
    const rate = code === "USD" ? "Base currency" : `1 USD ≈ ${fmtRate(RATES[code])} ${code}`;
    const msg = `Hi Cash World, what's today's rate for ${code}?`;
    return `<a class="note reveal" style="--n1:${c.c1};--n2:${c.c2}" href="https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener" aria-label="${c.name} (${code}). Ask for today's rate on WhatsApp">
      <span class="note-head"><b>${code}</b><small>${c.name}</small></span>
      <span class="note-sym${c.sym.length > 1 ? " long" : ""}">${c.sym}</span>
      <span class="note-rate">${rate}</span>
    </a>`;
  }).join("");
}

// Scroll reveal
const io = new IntersectionObserver(es => es.forEach(x => { if(x.isIntersecting){ x.target.classList.add("in"); io.unobserve(x.target); } }), {threshold:.12});
document.querySelectorAll(".reveal").forEach(el => io.observe(el));
