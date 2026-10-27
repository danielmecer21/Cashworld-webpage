/* CASH WORLD - Admin page (admin.html): read, approve, hide, delete and reply to reviews */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var R = window.CWReviews;

  var all = [];
  var filter = "all";

  var stars = function (n) { return "★".repeat(n) + "☆".repeat(5 - n); };
  var fmtDate = function (ms) {
    return new Date(ms).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };
  /* Visitor text is only ever inserted with textContent, so it cannot run as code. */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function button(label, cls, onClick) {
    var b = el("button", cls, label);
    b.type = "button";
    b.addEventListener("click", onClick);
    return b;
  }

  function note(text, bad) {
    var n = $("adminMsg");
    n.hidden = !text;
    n.textContent = text || "";
    n.className = "notice" + (bad ? " bad" : "");
  }

  /* ---------- data ---------- */
  function load() {
    return R.listAll().then(function (list) {
      all = list;
      note("");
      render();
    }).catch(function (err) {
      var denied = err && /permission|insufficient/i.test(String(err.message || err.code));
      note(denied
        ? "You are signed in, but this account is not set as the admin in your Firestore rules. See SETUP-GUIDE.txt, step 6."
        : "Could not load reviews: " + (err && err.message ? err.message : "unknown error"), true);
    });
  }

  function act(promise) {
    return promise.then(load).catch(function (err) {
      note("That did not work: " + (err && err.message ? err.message : "unknown error"), true);
    });
  }

  /* ---------- screen ---------- */
  function counts() {
    var c = { all: all.length, pending: 0, approved: 0, hidden: 0, sum: 0 };
    all.forEach(function (r) { c[r.status] = (c[r.status] || 0) + 1; c.sum += r.rating || 0; });
    return c;
  }

  function renderStats() {
    var c = counts();
    var box = $("stats");
    box.textContent = "";
    [
      ["Total", c.all],
      ["Waiting", c.pending],
      ["Published", c.approved],
      ["Hidden", c.hidden],
      ["Average", c.all ? (c.sum / c.all).toFixed(1) + " ★" : "-"]
    ].forEach(function (s) {
      var d = el("div", "stat");
      d.appendChild(el("b", null, String(s[1])));
      d.appendChild(el("span", null, s[0]));
      box.appendChild(d);
    });
  }

  function renderFilters() {
    var c = counts();
    var box = $("filters");
    box.textContent = "";
    [["all", "All"], ["pending", "Waiting"], ["approved", "Published"], ["hidden", "Hidden"]].forEach(function (f) {
      var b = el("button", "tab" + (filter === f[0] ? " active" : ""), f[1] + " (" + c[f[0]] + ")");
      b.type = "button";
      b.addEventListener("click", function () { filter = f[0]; render(); });
      box.appendChild(b);
    });
  }

  function statusLabel(s) { return s === "approved" ? "Published" : s === "hidden" ? "Hidden" : "Waiting for approval"; }

  function renderCard(r) {
    var card = el("article", "a-review status-" + r.status);

    var top = el("div", "a-top");
    var who = el("div");
    who.appendChild(el("b", "review-name", r.name));
    who.appendChild(el("small", "review-date", fmtDate(r.createdAt)));
    top.appendChild(who);
    var right = el("div", "a-right");
    var st = el("span", "review-stars", stars(r.rating));
    st.setAttribute("role", "img");
    st.setAttribute("aria-label", r.rating + " out of 5 stars");
    right.appendChild(st);
    right.appendChild(el("span", "badge badge-" + r.status, statusLabel(r.status)));
    top.appendChild(right);
    card.appendChild(top);

    card.appendChild(el("p", "review-text", r.text));

    var acts = el("div", "a-actions");
    if (r.status !== "approved") acts.appendChild(button("Publish", "btn btn-gold btn-sm", function () { act(R.setStatus(r.id, "approved")); }));
    if (r.status !== "hidden") acts.appendChild(button("Hide", "btn btn-line btn-sm", function () { act(R.setStatus(r.id, "hidden")); }));
    acts.appendChild(button("Delete", "btn btn-danger btn-sm", function () {
      if (window.confirm("Delete this review for good?")) act(R.remove(r.id));
    }));
    card.appendChild(acts);

    var form = el("div", "a-reply");
    var label = el("label", null, r.reply ? "Your public reply" : "Reply to this review");
    var ta = el("textarea");
    ta.rows = 3;
    ta.maxLength = 600;
    ta.value = r.reply || "";
    ta.placeholder = "Write a reply. Visitors see it under the review once the review is published.";
    var id = "reply-" + r.id;
    ta.id = id;
    label.htmlFor = id;
    form.appendChild(label);
    form.appendChild(ta);
    var row = el("div", "a-actions");
    row.appendChild(button(r.reply ? "Update reply" : "Save reply", "btn btn-navy btn-sm", function () {
      var v = ta.value.trim();
      if (!v) { note("Type a reply first, or use Remove reply.", true); return; }
      act(R.setReply(r.id, v));
    }));
    if (r.reply) row.appendChild(button("Remove reply", "btn btn-line btn-sm", function () { act(R.setReply(r.id, "")); }));
    form.appendChild(row);
    card.appendChild(form);

    return card;
  }

  function render() {
    renderStats();
    renderFilters();
    var box = $("adminList");
    box.textContent = "";
    var list = all.filter(function (r) { return filter === "all" || r.status === filter; });
    if (!list.length) {
      box.appendChild(el("p", "empty", all.length ? "Nothing in this list." : "No reviews yet. They will appear here as soon as visitors send them."));
      return;
    }
    list.forEach(function (r) { box.appendChild(renderCard(r)); });
  }

  /* ---------- sign-in (real database only) ---------- */
  function showPanel(on) {
    $("panel").hidden = !on;
    $("loginForm").hidden = on || R.mode === "local";
    $("signOut").hidden = !on || R.mode === "local";
  }

  $("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var m = $("loginMsg");
    m.textContent = "";
    $("loginBtn").disabled = true;
    R.auth.signIn($("admEmail").value.trim(), $("admPass").value)
      .catch(function (err) {
        var code = (err && err.code) || "";
        m.textContent = /invalid|wrong|user-not-found|credential/.test(code)
          ? "Wrong email or password."
          : "Could not sign in" + (err && err.message ? ": " + err.message : ".");
      })
      .then(function () { $("loginBtn").disabled = false; });
  });
  $("signOut").addEventListener("click", function () { R.auth.signOut(); });

  /* ---------- start ---------- */
  if (R.mode === "local") {
    $("demoNote").hidden = false;
    showPanel(true);
    load();
  } else {
    showPanel(false);
    R.auth.onChange(function (user, err) {
      if (err) { $("loginMsg").textContent = "Could not reach the database: " + err.message; return; }
      if (user) { showPanel(true); load(); }
      else { all = []; showPanel(false); }
    });
  }
})();
