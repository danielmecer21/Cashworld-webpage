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

  function renderList(list) {
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
        msg.textContent = "Thank you! Your review has been received and will appear once we have approved it.";
        if (R.mode === "local") load();
      })
      .catch(function (err) {
        msg.className = "form-msg bad";
        msg.textContent = err && err.message ? err.message : "Sorry, something went wrong. Please try again.";
      })
      .then(function () { btn.disabled = false; });
  });

  load();
})();
