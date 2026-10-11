/* mind.curiosta.com — page experiments. Vanilla JS, no tracking, nothing sent anywhere.
   Only the Patronus memory is stored, in localStorage, and only when the visitor presses "Keep it here". */
(function () {
  "use strict";
  var $ = function (root, sel) { return root.querySelector(sel); };
  var $$ = function (root, sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); };
  function show(el) { if (el) el.hidden = false; }
  function hide(el) { if (el) el.hidden = true; }
  function focusEl(el) { if (!el) return; if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1"); try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" }); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function press(group, btn) { group.forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); }); }
  function setPressable(btns) { btns.forEach(function (b) { b.setAttribute("aria-pressed", "false"); }); }
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  function today() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function niceDate(iso) { var p = iso.split("-"); var m = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][+p[1] - 1]; return +p[2] + " " + m + " " + p[0]; }

  /* ---------- Home: 60-second recall test ---------- */
  function recall(lab) {
    var passage = $(lab, ".passage"), rateStep = $(lab, '[data-step="rate"]'), recallStep = $(lab, '[data-step="recall"]');
    var markStep = $(lab, '[data-step="mark"]'), aha = $(lab, '[data-step="aha"]');
    var rateBtns = $$(lab, "[data-rate]"), hideBtn = $(lab, '[data-action="hide"]'), resultBtn = $(lab, '[data-action="result"]');
    var rating = 0, marks = {};
    var Q = [
      { id: "rq1", q: "What are the two modes called?", a: "Focused and diffuse." },
      { id: "rq2", q: "What does focused work have to leave behind?", a: "An unfinished problem, for diffuse mode to chew on." },
      { id: "rq3", q: "What do rereading and highlighting actually give you?", a: "Recognition. The feeling of knowing, not recall." }
    ];
    setPressable(rateBtns);
    rateBtns.forEach(function (b) { b.addEventListener("click", function () { rating = +b.getAttribute("data-rate"); press(rateBtns, b); hideBtn.disabled = false; }); });
    hideBtn.addEventListener("click", function () {
      hide(passage.parentNode.querySelector(".passage")); passage.hidden = true;
      hide(rateStep); show(recallStep); $(lab, "#rq1").focus();
    });
    $(lab, '[data-action="check"]').addEventListener("click", function () {
      var rows = $(lab, "#recall-rows"); rows.innerHTML = ""; marks = {};
      Q.forEach(function (q, i) {
        var yours = $(lab, "#" + q.id).value.trim();
        var row = document.createElement("div"); row.className = "recall-row";
        row.innerHTML = '<p class="recall-q">' + (i + 1) + ". " + esc(q.q) + '</p><p class="recall-a"><b>Answer:</b> ' + esc(q.a) + "</p>" +
          (yours ? '<p class="recall-yours">You wrote: ' + esc(yours) + "</p>" : '<p class="recall-yours">You answered in your head.</p>') +
          '<div class="mark" role="group" aria-label="Mark question ' + (i + 1) + '"><button type="button" class="chip" data-m="1">Got it</button><button type="button" class="chip" data-m="0.5">Partly</button><button type="button" class="chip" data-m="0">Missed it</button></div>';
        var btns = $$(row, "[data-m]"); setPressable(btns);
        btns.forEach(function (b) { b.addEventListener("click", function () { press(btns, b); marks[i] = +b.getAttribute("data-m"); resultBtn.disabled = Object.keys(marks).length < Q.length; }); });
        rows.appendChild(row);
      });
      passage.hidden = false; // show the paragraph again so they can check
      hide(recallStep); show(markStep); focusEl(markStep);
    });
    resultBtn.addEventListener("click", function () {
      var score = 0; Object.keys(marks).forEach(function (k) { score += marks[k]; });
      var conf = rating / 5, got = score / 3;
      $(lab, "#recall-score").textContent = "You felt " + rating + "/5 sure. You recalled " + (score % 1 ? score.toFixed(1) : score) + " of 3.";
      var msg;
      if (got < conf - 0.15) msg = "The paragraph felt clearer than it turned out to be. That gap, between how sure you felt and what you could bring back, is the whole problem in one minute. You weren't careless. Fluent text feels learned while it's in front of you.";
      else if (got > conf + 0.15) msg = "You recalled more than you expected. Good. Notice the difference anyway: you couldn't tell how much you knew until you tried to bring it back. The feeling of knowing was a poor guide in both directions.";
      else if (score === 3) msg = "All three, and you knew it. Now the real test: try again tomorrow without looking. What lasts is decided by sleep and by spacing, not by tonight.";
      else msg = "Your feeling and your recall roughly matched this time. Most people only find out how much stuck by trying, which is the point: you found out by closing the page, not by rereading it.";
      $(lab, "#recall-msg").textContent = msg;
      hide(markStep); show(aha); focusEl(aha);
    });
    $(lab, '[data-action="again"]').addEventListener("click", function () {
      rating = 0; marks = {}; setPressable(rateBtns); hideBtn.disabled = true;
      $$(lab, "input").forEach(function (i) { i.value = ""; });
      passage.hidden = false; hide(aha); hide(markStep); hide(recallStep); show(rateStep); focusEl(lab);
    });
  }

  /* ---------- Patronus ---------- */
  var KEY = "mind.patronus.v1";
  var VAGUE = ["nice","good","great","fine","okay","ok","amazing","awesome","fun","productive","busy","normal","usual","lovely","interesting","boring","bad","wonderful","relaxing","chill","stuff","things","usual","whatever","beautiful","memorable"];
  var SIGNALS = [
    { label: "a sound", re: /\b(heard|hear|hearing|sound|sounds|noise|loud|quiet|silence|music|song|honk\w*|horn|ring\w*|buzz\w*|bark\w*|laugh\w*|shout\w*|whisper\w*|rain|thunder|cried|crying|sang|singing|playing|tick\w*|clatter\w*|hiss\w*)\b/i },
    { label: "a sight, smell, taste or touch", re: /\b(saw|see|seen|smell\w*|smelt|scent|taste\w*|bitter|sweet|salty|sour|spicy|cold|hot|warm|cool|wet|dry|rough|soft|sticky|bright|dark|dim|red|blue|green|yellow|white|black|orange|grey|gray|pink|brown|light|shadow|steam\w*)\b/i },
    { label: "words someone said", re: /["“”«»]|\b(said|says|asked|told|replied|shouted|whispered|called out)\b/i },
    { label: "what your hands or body were doing", re: /\b(hand|hands|holding|held|hold|grip\w*|typing|typed|carry\w*|carried|finger\w*|cooking|cooked|cutting|chopp\w*|washing|wash\w*|stirr\w*|pour\w*|wrote|writing|walking|walked|sitting|sat|standing|stood|lying|leaning|cup|glass|pen|phone|steering|bag)\b/i },
    { label: "a specific place", re: /\b(kitchen|room|bedroom|balcony|terrace|roof|bus|auto|metro|train|station|platform|office|desk|road|street|lane|market|shop|store|cafe|café|canteen|park|school|college|class|library|temple|church|mosque|hospital|car|bike|scooter|stairs|gate|window|door|queue|counter|bed|sofa|table|garden)\b/i },
    { label: "a time or a number", re: /\d|\b(morning|afternoon|evening|night|midnight|noon|o'clock|am|pm)\b/i }
  ];
  function patronus(lab) {
    var ta = $(lab, "#pat-text"), result = $(lab, '[data-step="result"]'), write = $(lab, '[data-step="write"]');
    var retrieve = $(lab, '[data-step="retrieve"]');
    var saved = store.get(KEY);
    if (saved && saved.text) {
      $(lab, '[data-field="saved-date"]').textContent = niceDate(saved.date) + (saved.date === today() ? " (earlier today; it works best after a night's sleep)" : "");
      show(retrieve);
    }
    $(lab, '[data-action="compare"]').addEventListener("click", function () {
      var s = store.get(KEY); if (!s) return;
      $(lab, '[data-field="then"]').textContent = s.text;
      $(lab, '[data-field="now"]').textContent = $(lab, "#pat-retrieve").value.trim() || "(blank)";
      var out = $(lab, '[data-step="compare-out"]'); show(out); focusEl(out);
    });
    $(lab, '[data-action="forget"]').addEventListener("click", function () {
      store.del(KEY); hide(retrieve); focusEl(write);
    });
    $(lab, '[data-action="check"]').addEventListener("click", function () {
      var text = ta.value.trim();
      if (text.length < 3) { ta.focus(); ta.setAttribute("aria-invalid", "true"); ta.placeholder = "Write something first, even one line."; return; }
      ta.removeAttribute("aria-invalid");
      var found = SIGNALS.filter(function (s) { return s.re.test(text); });
      var words = text.toLowerCase().match(/[a-z']+/g) || [];
      var vague = []; words.forEach(function (w) { if (VAGUE.indexOf(w) > -1 && vague.indexOf(w) < 0) vague.push(w); });
      $(lab, '[data-field="found"]').innerHTML = SIGNALS.map(function (s) { var ok = found.indexOf(s) > -1; return "<li>" + (ok ? "✓ " : "· <span style=\"color:var(--muted)\">no ") + esc(s.label) + (ok ? "" : "</span>") + "</li>"; }).join("");
      $(lab, '[data-field="vague"]').innerHTML = vague.length ? vague.map(function (v) { return '<mark class="flag">' + esc(v) + "</mark>"; }).join(" ") + "<br><span class=\"note\">These say how it felt, not what happened.</span>" : "None spotted.";
      var n = found.length, verdict;
      if (n >= 4 && vague.length === 0) verdict = "<strong>That reads like a memory.</strong> A stranger could stand in it. Now the real test: keep it here and rewrite it from memory tomorrow.";
      else if (n >= 3) verdict = "<strong>Part memory, part caption.</strong> Some of it a stranger could picture. Add the missing pieces from the list, the ones you can actually remember, not ones you'd guess.";
      else verdict = "<strong>That's closer to a caption than a memory.</strong> It tells someone how it felt, but they couldn't picture it. Try again with one sound, one sentence someone said, and what your hands were doing. If you can't remember them, that's the finding.";
      $(lab, '[data-field="verdict"]').innerHTML = verdict;
      $(lab, '[data-field="saved-msg"]').textContent = "";
      show(result); focusEl(result);
    });
    $(lab, '[data-action="save"]').addEventListener("click", function () {
      var ok = store.set(KEY, { date: today(), text: ta.value.trim() });
      $(lab, '[data-field="saved-msg"]').textContent = ok ? "Kept in this browser only. Nothing was sent anywhere. Come back to this page tomorrow and it will ask you to rewrite it before showing you the original." : "Your browser didn't allow local storage. Copy it somewhere instead, and rewrite it tomorrow before you look.";
    });
    $(lab, '[data-action="retry"]').addEventListener("click", function () { hide(result); ta.focus(); });
  }

  /* ---------- Occlumency ---------- */
  function occlumency(lab) {
    var msg = $(lab, '[data-step="message"]'), start = $(lab, '[data-step="start"]'), feel = $(lab, '[data-step="feel"]');
    var explain = $(lab, '[data-step="explain"]'), timerEl = $(lab, '[data-field="timer"]'), bar = $(lab, '[data-field="bar"]');
    var clock = $(lab, '[data-step="clock"]');
    var choices = $$(lab, "[data-choice]"), feels = $$(lab, "[data-feel]");
    var LIMIT = 20, left = LIMIT, t0 = 0, iv = null, timedOut = false, chosen = null;
    hide(msg); hide(explain); setPressable(choices); setPressable(feels);
    function fmt(s) { return "0:" + ("0" + s).slice(-2); }
    function stop() { if (iv) clearInterval(iv); iv = null; }
    $(lab, '[data-action="open"]').addEventListener("click", function () {
      hide(start); show(msg); t0 = Date.now(); left = LIMIT; timerEl.textContent = fmt(left); bar.style.width = "100%";
      iv = setInterval(function () {
        left -= 1; timerEl.textContent = fmt(Math.max(left, 0)); bar.style.width = Math.max(left, 0) / LIMIT * 100 + "%";
        if (left <= 0) { stop(); timedOut = true; timerEl.textContent = "0:00"; $(lab, '[data-step="clock"] .note').textContent = " · time's up. Nothing happened. No account closed, nobody was charged. The deadline only existed on the screen. Choose whenever you're ready."; }
      }, 1000);
      focusEl(msg);
    });
    $(lab, '[data-action="stop-timer"]').addEventListener("click", function () { stop(); hide(clock); });
    var NOTES = {
      send: ["Send the money", "That's the impulse the message was built for. If you hesitated even for a second, notice what made you hesitate. That was the start of Occlumency."],
      forward: ["Forward it to the family group", "It feels like doing something. But forwarding spreads the panic, and it still isn't a check. Everyone in the group now has the same unverified message."],
      ask: ["Reply: \"Which hospital?\"", "Better than paying. But you're still talking inside the sender's channel, and whoever sent it can answer anything. The check has to happen outside the message."],
      call: ["Call Mama on the number you already have", "That's the move. One call outside the message settles it either way: you reach her, or you learn she's at home making tea."],
      ignore: ["Ignore it", "Safe for your money. But if it had been real, she'd still be stuck. Calling the number you already had settles it both ways, in under a minute."]
    };
    choices.forEach(function (b) { b.addEventListener("click", function () {
      if (chosen) return; chosen = b.getAttribute("data-choice"); press(choices, b); stop();
      var secs = Math.max(1, Math.round((Date.now() - t0) / 1000));
      $(lab, '[data-field="choice"]').textContent = NOTES[chosen][0] + ", after " + secs + " second" + (secs === 1 ? "" : "s") + ".";
      $(lab, '[data-field="choice-note"]').textContent = NOTES[chosen][1] + (timedOut ? " (The timer ran out first, and nothing happened. That's worth remembering.)" : "");
      choices.forEach(function (c) { c.disabled = true; });
      show(feel); focusEl(feel);
    }); });
    var FEEL = {
      fear: "You named fear. The hospital line was put there for that.",
      rush: "You named rush. The 6 o'clock deadline and the timer were put there for that. The timer on this page was fake, and so was the one in the message.",
      guilt: "You named guilt. \"Don't tell Papa\" and \"please beta\" are put there to make checking feel like betrayal.",
      duty: "You named love or duty. That's the most honest answer and the most exploited one. The message borrows your love for the real person.",
      doubt: "You named doubt. Good. Doubt is the feeling that buys you time. Use it to make the call outside the message.",
      nothing: "You named nothing much. Fine, but you still chose in a few seconds. A feeling you don't notice still gets a vote."
    };
    feels.forEach(function (b) { b.addEventListener("click", function () {
      press(feels, b); $(lab, '[data-field="feel-note"]').textContent = FEEL[b.getAttribute("data-feel")] + " Naming it is the spell: once it has a name, it stops being the one deciding.";
      // highlight hooks in the message
      $$(lab, "[data-hook]").forEach(function (h) { h.classList.add("flag"); h.outerHTML = '<mark class="flag">' + h.innerHTML + "</mark>"; });
      show(explain); focusEl(explain);
    }); });
  }

  /* ---------- Legilimency ---------- */
  function legilimency(lab) {
    var stance = null, before = 0, after = 0, asked = [];
    var stanceBtns = $$(lab, "[data-stance]"), qBtns = $$(lab, "[data-q]");
    var b1 = $$(lab, '[data-scale="before"] .chip'), b2 = $$(lab, '[data-scale="after"] .chip');
    var askStep = $(lab, '[data-step="ask"]'), omitted = $(lab, '[data-step="omitted"]');
    var article = $(lab, '[data-step="article"]'), rate1 = $(lab, '[data-step="rate1"]'), ahaBox = $(lab, '[data-step="leg-aha"]');
    [stanceBtns, qBtns, b1, b2].forEach(setPressable);
    hide(article); hide(rate1); hide(omitted);
    stanceBtns.forEach(function (b) { b.addEventListener("click", function () { stance = b.getAttribute("data-stance"); press(stanceBtns, b); show(article); show(rate1); }); });
    b1.forEach(function (b) { b.addEventListener("click", function () { before = +b.getAttribute("data-v"); press(b1, b); show(askStep); }); });
    qBtns.forEach(function (b) { b.addEventListener("click", function () { var on = b.getAttribute("aria-pressed") !== "true"; b.setAttribute("aria-pressed", on ? "true" : "false"); }); });
    $(lab, '[data-action="reveal"]').addEventListener("click", function () {
      asked = qBtns.filter(function (b) { return b.getAttribute("aria-pressed") === "true"; }).map(function (b) { return b.getAttribute("data-q"); });
      var gaps = $$(omitted, "[data-gap]"), hit = 0;
      gaps.forEach(function (g) { var keys = g.getAttribute("data-gap").split(" "); var yes = keys.some(function (k) { return asked.indexOf(k) > -1; }); if (yes) { hit++; g.insertAdjacentHTML("beforeend", ' <span class="flag-key">you asked</span>'); } });
      $(lab, '[data-field="asked"]').textContent = asked.length ? "Your questions pointed at " + hit + " of the 3 gaps. The article gave you no hint they existed." : "You didn't pick any questions. That's the usual reaction to a tidy story: it doesn't feel like anything is missing.";
      $$(lab, '[data-action="reveal"]').forEach(function (x) { x.disabled = true; });
      qBtns.forEach(function (x) { x.disabled = true; });
      show(omitted); focusEl(omitted);
    });
    b2.forEach(function (b) { b.addEventListener("click", function () {
      after = +b.getAttribute("data-v"); press(b2, b);
      var d = before - after;
      $(lab, '[data-field="moved"]').textContent = "Before: " + before + "/5. After: " + after + "/5.";
      var m = d > 0 ? "Your judgment moved " + d + " point" + (d > 1 ? "s" : "") + ", and not one sentence of the article changed. " : d === 0 ? "Your rating held. Either you'd already discounted the piece, or the gaps didn't feel like they mattered. Worth asking which. " : "Your rating went up. Unusual, and worth a second look at why. ";
      if (stance === "yes") m += "You also said you favour bans, so this was a story that agreed with you, which is where gaps are hardest to see.";
      else if (stance === "no") m += "You said you're against bans. You may have doubted this piece easily. The real test is a piece on your side.";
      else m += "You weren't sure about bans, which makes it easier to read cleanly. Try this on something you feel strongly about.";
      $(lab, '[data-field="leg-msg"]').textContent = m; show(ahaBox);
    }); });
  }

  /* ---------- Priori Incantatem ---------- */
  function priori(lab) {
    var hops = [4, 3, 2, 1].map(function (n) { return $(lab, '[data-hop="' + n + '"]'); });
    var backBtn = $(lab, '[data-action="back"]'), count = $(lab, '[data-field="hopcount"]'), aha = $(lab, '[data-step="priori-aha"]');
    var guesses = $$(lab, "[data-guess]"), guess = null, i = 0;
    hops.forEach(hide); hide(aha); setPressable(guesses);
    count.textContent = "You are at hop 5 of 5: the forward.";
    guesses.forEach(function (b) { b.addEventListener("click", function () { guess = b.getAttribute("data-guess"); press(guesses, b); backBtn.disabled = false; }); });
    backBtn.addEventListener("click", function () {
      if (i >= hops.length) return;
      var h = hops[i]; show(h); i++;
      count.textContent = i < hops.length ? "Hop " + (5 - i) + " of 5. Keep going." : "You've reached the first source.";
      if (i >= hops.length) {
        backBtn.disabled = true;
        $(lab, '[data-field="guess-note"]').textContent = guess === "Fewer than a hundred" ? "You guessed fewer than a hundred. Good instinct. Most people go with the size of the headline." : guess === "No idea" ? "You said you had no idea, which is the honest answer to a forward with no source." : "You guessed " + guess.toLowerCase() + ". The headline set your sense of scale before you knew anything.";
        show(aha); focusEl(aha);
      } else focusEl(h);
    });
  }

  /* ---------- Foundation ---------- */
  function foundation(lab) {
    var btns = $$(lab, "[data-model]"), brk = $(lab, '[data-step="break"]'), fin = $(lab, '[data-step="found-aha"]');
    var steps = $$(lab, ".order li");
    function at(n) { steps.forEach(function (s) { s.classList.toggle("now", +s.getAttribute("data-o") === n); }); }
    hide(fin); at(5); setPressable(btns);
    var BREAK = {
      heavy: ["A whole tree trunk, far heavier than any nail, floats down a river.", "Your model said heavy things sink. Weight alone can't be it."],
      material: ["A steel ship floats. So does a steel bowl set gently on water.", "Your model said metal sinks. The same metal floats or sinks depending on its shape."],
      small: ["A large boulder sinks. A tiny dry wooden bead floats.", "Your model said small, hard things sink. Size goes both ways, so it can't be the rule."],
      density: ["A lump of clay sinks. Press the same clay into a bowl and it floats. Same clay, same weight.", "Your model survives, but only if \"its size\" includes the air the bowl holds. You just refined it. That's a deduction."]
    };
    var tried = 0;
    btns.forEach(function (b) { b.addEventListener("click", function () {
      var m = b.getAttribute("data-model"); tried++;
      press(btns, b); at(3);
      $(lab, '[data-field="obs"]').textContent = BREAK[m][0];
      $(lab, '[data-field="obs-note"]').textContent = BREAK[m][1];
      if (m === "density") {
        btns.forEach(function (x) { x.disabled = true; });
        $(lab, '[data-field="next-prompt"]').textContent = tried > 1 ? "It took " + tried + " models to get here. Every one you dropped was dropped because of an observation, not because someone told you. One more observation to go." : "You got there first time. One more observation to go, and it applies to your model too.";
        show(brk); show(fin); at(5); focusEl(brk);
      } else {
        b.disabled = true; b.classList.add("wrong");
        $(lab, '[data-field="next-prompt"]').textContent = "Your model broke. Pick another one that fits everything so far, including this new observation.";
        show(brk); at(4); focusEl(brk);
      }
    }); });
  }

  /* ---------- Learn: chunking ---------- */
  function lcs(a, b) { var m = []; for (var i = 0; i <= a.length; i++) { m[i] = []; for (var j = 0; j <= b.length; j++) m[i][j] = i && j ? (a[i - 1] === b[j - 1] ? m[i - 1][j - 1] + 1 : Math.max(m[i - 1][j], m[i][j - 1])) : 0; } return m[a.length][b.length]; }
  function chunk(lab) {
    var ROUNDS = ["QZKTMPRWXHDL", "ATMUPIPINSMS"], r = 0, scores = [];
    var letters = $(lab, '[data-field="letters"]'), go = $(lab, '[data-step="go"]'), type = $(lab, '[data-step="type"]');
    var input = $(lab, "#chunk-in"), aha = $(lab, '[data-step="chunk-aha"]'), label = $(lab, '[data-field="round-label"]');
    hide(aha);
    $(lab, '[data-action="show"]').addEventListener("click", function () {
      hide(go); letters.textContent = ROUNDS[r]; var secs = 5;
      label.textContent = "Round " + (r + 1) + " of 2 · " + secs + " seconds";
      var iv = setInterval(function () { secs--; label.textContent = "Round " + (r + 1) + " of 2 · " + secs + " second" + (secs === 1 ? "" : "s"); if (secs <= 0) { clearInterval(iv); letters.textContent = "• • • • • • • • • • • •"; label.textContent = "Round " + (r + 1) + " of 2 · now type them"; input.value = ""; show(type); input.focus(); } }, 1000);
    });
    function score() {
      var guess = input.value.toUpperCase().replace(/[^A-Z]/g, ""), s = lcs(ROUNDS[r], guess.slice(0, 20));
      scores.push(s); hide(type);
      if (r === 0) {
        $(lab, '[data-field="r1"]').textContent = "Round 1: " + s + " of 12 in order. Now round 2.";
        r = 1; letters.textContent = "Ready?"; label.textContent = "Round 2 of 2"; show(go); $(lab, '[data-action="show"]').focus();
      } else {
        $(lab, '[data-field="r1"]').textContent = "";
        $(lab, '[data-field="scores"]').textContent = "Round 1: " + scores[0] + "/12. Round 2: " + scores[1] + "/12.";
        $(lab, '[data-field="chunk-msg"]').textContent = scores[1] > scores[0] ? "Same number of letters, same five seconds. Round 2 just wasn't twelve things." : "Your scores were close. You may have chunked round 1 your own way, or you didn't spot the words in round 2. Look again: A-T-M, U-P-I, P-I-N, S-M-S.";
        letters.textContent = "ATM · UPI · PIN · SMS"; label.textContent = "Round 2, unpacked";
        show(aha); focusEl(aha);
      }
    }
    $(lab, '[data-action="score"]').addEventListener("click", score);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); score(); } });
  }

  /* ---------- Learn: prompt choice ---------- */
  function promptLab(lab) {
    var btns = $$(lab, "[data-prompt]"), aha = $(lab, '[data-step="prompt-aha"]'); hide(aha); setPressable(btns);
    btns.forEach(function (b) { b.addEventListener("click", function () {
      press(btns, b);
      $(lab, '[data-field="prompt-msg"]').innerHTML = b.getAttribute("data-prompt") === "a" ? "<strong>Most of us would type that one.</strong> It's the natural thing to ask, and that's exactly the trap." : "<strong>You picked the harder one.</strong> It's slower and more annoying, and it's the one that works.";
      show(aha); focusEl(aha);
    }); });
    $(lab, '[data-action="copy"]').addEventListener("click", function () {
      var t = "Ask me three questions about photosynthesis, one at a time. Don't give the answers until I've tried.", out = $(lab, '[data-field="copied"]');
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { out.textContent = "Copied. Swap in your own topic."; }, function () { out.textContent = t; });
      else out.textContent = t;
    });
  }

  /* ---------- Learn: focus timer ---------- */
  function pomo(lab) {
    var clock = $(lab, '[data-field="clock"]'), phase = $(lab, '[data-field="phase"]'), startBtn = $(lab, '[data-action="start"]');
    var iv = null, end = 0, mode = "focus", baseTitle = document.title;
    function fmt(ms) { var s = Math.max(0, Math.round(ms / 1000)); return ("0" + Math.floor(s / 60)).slice(-2) + ":" + ("0" + s % 60).slice(-2); }
    function tick() {
      var left = end - Date.now(); clock.textContent = fmt(left); document.title = fmt(left) + " · " + baseTitle;
      if (left <= 0) {
        clearInterval(iv); iv = null;
        if (mode === "focus") { mode = "break"; var q = $(lab, "#pomo-q").value.trim(); phase.textContent = "Stop. Stand up and walk for five minutes, without a feed." + (q ? " Take this with you: " + q : ""); startBtn.textContent = "Start the 5-minute walk"; clock.textContent = "05:00"; }
        else { mode = "focus"; phase.textContent = "Back. Before you open anything, write down what came to you on the walk, even if it's nothing."; startBtn.textContent = "Start focus"; clock.textContent = "25:00"; }
        document.title = baseTitle;
      }
    }
    startBtn.addEventListener("click", function () {
      if (iv) return;
      end = Date.now() + (mode === "focus" ? 25 : 5) * 60000;
      phase.textContent = mode === "focus" ? "Focused: 25 minutes. Phone face down." : "Walking. Let it wander.";
      iv = setInterval(tick, 1000); tick();
    });
    $(lab, '[data-action="reset"]').addEventListener("click", function () { clearInterval(iv); iv = null; mode = "focus"; clock.textContent = "25:00"; phase.textContent = "Focused: 25 minutes. Phone face down."; startBtn.textContent = "Start focus"; document.title = baseTitle; });
  }

  /* ---------- Defense ---------- */
  function defense(lab) {
    var scs = $$(lab, ".scenario"), picks = {}, scoreBtn = $(lab, '[data-action="score"]'), aha = $(lab, '[data-step="def-aha"]');
    hide(aha);
    scs.forEach(function (sc) {
      var v = $(sc, "[data-verdict]"), btns = $$(sc, "[data-act]"); hide(v); setPressable(btns);
      btns.forEach(function (b) { b.addEventListener("click", function () { press(btns, b); picks[sc.getAttribute("data-sc")] = b.getAttribute("data-act"); scoreBtn.disabled = Object.keys(picks).length < scs.length; }); });
    });
    scoreBtn.addEventListener("click", function () {
      var acted = 0, traps = 0, fine = 0;
      scs.forEach(function (sc) {
        var trap = sc.getAttribute("data-trap") === "1", p = picks[sc.getAttribute("data-sc")];
        if (trap) { traps++; if (p === "act") acted++; } else if (p === "act") fine++;
        var good = trap ? p === "check" : p === "act";
        $$(sc, "[data-act]").forEach(function (b) { b.disabled = true; if (b.getAttribute("aria-pressed") === "true") b.classList.add(good ? "right" : "wrong"); });
        show($(sc, "[data-verdict]"));
      });
      $(lab, '[data-field="def-score"]').textContent = "You'd have acted on " + acted + " of " + traps + " traps.";
      var m = acted === 0 ? "None got through. " : acted === 1 ? "One got through, on a calm day with a label saying it's an exercise. A real one arrives when you're busy. " : acted + " got through, and that's with a label telling you this was an exercise. ";
      m += fine ? "And you acted on the genuine one, which is right. Checking isn't the same as refusing." : "You also held back on the genuine one. Fair enough, but the steps below would have cleared it in seconds. The goal is literacy, not suspicion.";
      $(lab, '[data-field="def-msg"]').textContent = m;
      scoreBtn.disabled = true; show(aha); focusEl(aha);
    });
  }

  /* ---------- Ideas ---------- */
  function ideas(lab) {
    var btns = $$(lab, "[data-idea]"); setPressable(btns);
    btns.forEach(function (b) { b.addEventListener("click", function () {
      press(btns, b);
      $(lab, '[data-field="idea-msg"]').textContent = b.getAttribute("data-idea") === "one" ? "That's what this site believes too. Here's why, below." : "Most people would say two. This site argues they're one skill, pointed in two directions. Read the first idea and see if it holds.";
    }); });
  }

  /* ---------- Calendar filters ---------- */
  function calendar() {
    var state = { spell: "all", cost: "all", format: "all", cadence: "all", city: "all" };
    var buttons = $$(document, ".filter-btn"), entries = $$(document, "#cal-upcoming .cal-entry"), empty = document.getElementById("cal-empty");
    if (!buttons.length) return;
    function apply() {
      var visible = 0;
      entries.forEach(function (entry) {
        var ok = Object.keys(state).every(function (k) { return state[k] === "all" || entry.getAttribute("data-" + k) === state[k]; });
        entry.style.display = ok ? "" : "none"; if (ok) visible++;
      });
      if (empty) empty.hidden = visible !== 0;
    }
    buttons.forEach(function (btn) { btn.addEventListener("click", function () {
      var g = btn.getAttribute("data-filter");
      buttons.forEach(function (b) { if (b.getAttribute("data-filter") === g) { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); } });
      btn.classList.add("active"); btn.setAttribute("aria-pressed", "true");
      if (Object.prototype.hasOwnProperty.call(state, g)) state[g] = btn.getAttribute("data-value");
      apply();
    }); });
  }

  var LABS = { recall: recall, patronus: patronus, occlumency: occlumency, legilimency: legilimency, priori: priori, foundation: foundation, chunk: chunk, prompt: promptLab, pomo: pomo, defense: defense, ideas: ideas };
  function init() {
    $$(document, "[data-lab]").forEach(function (lab) {
      var fn = LABS[lab.getAttribute("data-lab")];
      if (fn) { try { fn(lab); } catch (e) { if (window.console) console.error("mind lab failed:", lab.getAttribute("data-lab"), e); } }
    });
    calendar();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
