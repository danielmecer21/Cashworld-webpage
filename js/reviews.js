/* =========================================================
   CASH WORLD - reviews data layer (used by reviews.html and admin.html)

   Two modes, chosen automatically from js/config.js:
   - "firebase": reviews are stored in your Firestore database (real use).
   - "local":    DEMO MODE. Reviews are kept in this browser only, so you
                 can try the pages before connecting a database.
   ========================================================= */
(function () {
  var CFG = (window.CW_CONFIG || {});
  var FB = CFG.firebase || {};
  var configured = !!(FB.apiKey && FB.projectId && FB.appId);

  var LS_KEY = "cw-reviews-demo";
  var LS_LAST = "cw-last-review";
  var SDK = "https://www.gstatic.com/firebasejs/10.12.2/";

  /* ---------- helpers ---------- */
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function oneLine(s, max) { return String(s == null ? "" : s).replace(/\s+/g, " ").trim().slice(0, max); }
  function multiLine(s, max) {
    return String(s == null ? "" : s).replace(/\r/g, "").replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n").trim().slice(0, max);
  }
  function byNewest(a, b) { return (b.createdAt || 0) - (a.createdAt || 0); }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement("script");
      s.src = src; s.onload = resolve;
      s.onerror = function () { reject(new Error("Could not load " + src)); };
      document.head.appendChild(s);
    });
  }

  /* ---------- Firebase (loaded only when configured) ---------- */
  var fbPromise = null;
  function fb() {
    if (!fbPromise) {
      fbPromise = (async function () {
        await loadScript(SDK + "firebase-app-compat.js");
        await Promise.all([loadScript(SDK + "firebase-firestore-compat.js"), loadScript(SDK + "firebase-auth-compat.js")]);
        window.firebase.initializeApp(FB);
        return { db: window.firebase.firestore(), auth: window.firebase.auth() };
      })();
    }
    return fbPromise;
  }

  /* ---------- demo-mode storage ---------- */
  function localAll() {
    try { var v = JSON.parse(lsGet(LS_KEY) || "[]"); return Array.isArray(v) ? v : []; } catch (e) { return []; }
  }
  function localSave(list) { lsSet(LS_KEY, JSON.stringify(list)); }

  /* ---------- public API ---------- */
  var API = {
    mode: configured ? "firebase" : "local",

    /* Check and clean a review. Returns {ok, error, review}. */
    check: function (input) {
      var r = {
        name: oneLine(input.name, 60),
        rating: parseInt(input.rating, 10),
        text: multiLine(input.text, 800)
      };
      if (!r.name) return { ok: false, error: "Please enter your name." };
      if (!(r.rating >= 1 && r.rating <= 5)) return { ok: false, error: "Please choose a star rating." };
      if (r.text.length < 5) return { ok: false, error: "Please write a few words about your experience." };
      return { ok: true, review: r };
    },

    /* Visitors: send a new review. It waits for your approval. */
    submit: async function (input) {
      var c = API.check(input);
      if (!c.ok) throw new Error(c.error);
      var last = parseInt(lsGet(LS_LAST) || "0", 10);
      if (Date.now() - last < 60000) throw new Error("Please wait a minute before sending another review.");

      var doc = { name: c.review.name, rating: c.review.rating, text: c.review.text, status: "pending", createdAt: Date.now() };
      if (configured) {
        var f = await fb();
        await f.db.collection("reviews").add(doc);
      } else {
        var list = localAll();
        doc.id = "l" + Date.now() + Math.random().toString(36).slice(2, 6);
        list.push(doc);
        localSave(list);
      }
      lsSet(LS_LAST, String(Date.now()));
    },

    /* Visitors: only approved reviews. */
    listPublic: async function () {
      var out;
      if (configured) {
        var f = await fb();
        var snap = await f.db.collection("reviews").where("status", "==", "approved").get();
        out = snap.docs.map(function (d) { var o = d.data(); o.id = d.id; return o; });
      } else {
        out = localAll().filter(function (r) { return r.status === "approved"; });
      }
      return out.sort(byNewest);
    },

    /* ----- Admin only (the database rules enforce this) ----- */
    listAll: async function () {
      var out;
      if (configured) {
        var f = await fb();
        var snap = await f.db.collection("reviews").get();
        out = snap.docs.map(function (d) { var o = d.data(); o.id = d.id; return o; });
      } else {
        out = localAll();
      }
      return out.sort(byNewest);
    },

    setStatus: async function (id, status) {
      if (["pending", "approved", "hidden"].indexOf(status) < 0) throw new Error("Bad status");
      await patch(id, { status: status });
    },

    setReply: async function (id, text) {
      var t = multiLine(text, 600);
      await patch(id, { reply: t, repliedAt: t ? Date.now() : 0 });
    },

    remove: async function (id) {
      if (configured) {
        var f = await fb();
        await f.db.collection("reviews").doc(id).delete();
      } else {
        localSave(localAll().filter(function (r) { return r.id !== id; }));
      }
    },

    auth: {
      signIn: async function (email, password) {
        var f = await fb();
        await f.auth.signInWithEmailAndPassword(email, password);
      },
      signOut: async function () {
        var f = await fb();
        await f.auth.signOut();
      },
      onChange: function (cb) {
        fb().then(function (f) { f.auth.onAuthStateChanged(cb); })
            .catch(function (e) { cb(null, e); });
      }
    }
  };

  async function patch(id, fields) {
    if (configured) {
      var f = await fb();
      await f.db.collection("reviews").doc(id).update(fields);
    } else {
      var list = localAll();
      list.forEach(function (r) { if (r.id === id) Object.keys(fields).forEach(function (k) { r[k] = fields[k]; }); });
      localSave(list);
    }
  }

  window.CWReviews = API;
})();
