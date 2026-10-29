/* CASH WORLD - public Reviews page (reviews.html) */
(function () {
  var $ = function (id) { return document.getElementById(id); };
  var R = window.CWReviews;

  var stars = function (n) { return "★".repeat(n) + "☆".repeat(5 - n); };
  var fmtDate = function (ms) {
    return new Date(ms).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };
  /* Everything from visitors goes in with textContent, never innerHTML, so nobody can inject code. */
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  if (R.mode === "local") $("demoNote").hidden = false;

  /* Delete buttons show only for the signed-in admin (or in demo mode). The database rules enforce this too. */
  var isAdmin = R.mode === "local";
  var shown = [];

  function renderList(list) {
    shown = list;
    var box = $("reviewList");
    box.textContent = "";

    var sum = $("ratingSummary");
    if (list.length) {
      var avg = list.reduce(function (t, r) { return t + r.rating; }, 0) / list.length;
      $("avgNum").textContent = avg.toFixed(1);
      $("avgStars").textContent = stars(Math.round(avg));
      $("avgCount").textContent = list.length + (list.length === 1 ? " review" : " reviews");
      sum.hidden = false;
    } else {
      sum.hidden = true;
      box.appendChild(el("p", "empty", "No reviews yet. Be the first to share your experience."));
      return;
    }

    list.forEach(function (r) {
      var card = el("article", "review");
      var head = el("div", "review-head");
      head.appendChild(el("b", "review-name", r.name));
      var st = el("span", "review-stars", stars(r.rating));
      st.setAttribute("role", "img");
      st.setAttribute("aria-label", r.rating + " out of 5 stars");
      head.appendChild(st);
      card.appendChild(head);
      card.appendChild(el("small", "review-date", fmtDate(r.createdAt)));
      card.appendChild(el("p", "review-text", r.text));
      if (r.reply) {
        var rep = el("div", "review-reply");
        rep.appendChild(el("b", null, "Reply from Cash World"));
        rep.appendChild(el("p", null, r.reply));
        card.appendChild(rep);
      }
      if (isAdmin) {
        var del = el("button", "btn btn-danger btn-sm", "Delete review");
        del.type = "button";
        del.style.marginTop = "12px";
        del.addEventListener("click", function () {
          if (!window.confirm("Delete this review for good?")) return;
          del.disabled = true;
          R.remove(r.id).then(load).catch(function (err) {
            del.disabled = false;
            window.alert("Could not delete: " + (err && err.message ? err.message : "unknown error"));
          });
        });
        card.appendChild(del);
      }
      box.appendChild(card);
    });
  }

  function load() {
    R.listPublic().then(renderList).catch(function () {
      $("reviewList").textContent = "";
      $("reviewList").appendChild(el("p", "empty", "Reviews could not be loaded right now. Please try again later."));
    });
  }

  $("reviewForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = $("rvMsg");
    msg.className = "form-msg";
    msg.textContent = "";

    /* hidden trap field: real people leave it empty, spam bots fill it in */
    if ($("rvWebsite").value) { msg.textContent = "Thank you!"; return; }

    var chosen = document.querySelector('input[name="rating"]:checked');
    var btn = $("rvSend");
    btn.disabled = true;
    R.submit({ name: $("rvName").value, rating: chosen ? chosen.value : 0, text: $("rvText").value })
      .then(function () {
        $("reviewForm").reset();
        msg.className = "form-msg ok";
        msg.textContent = "Thank you! Your review is now on this page.";
        load();
      })
      .catch(function (err) {
        msg.className = "form-msg bad";
        msg.textContent = err && err.message ? err.message : "Sorry, something went wrong. Please try again.";
      })
      .then(function () { btn.disabled = false; });
  });

  if (R.mode !== "local") {
    R.auth.onChange(function (user) {
      var now = !!user;
      if (now !== isAdmin) { isAdmin = now; renderList(shown); }
    });
  }

  load();
})();
