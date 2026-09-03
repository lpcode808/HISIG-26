/* Conference program app.
   No framework, no build step. Content comes from data.js; everything the
   attendee types stays in localStorage on their own device. */

(() => {
  "use strict";

  /* ── helpers ─────────────────────────────────────────────────────────── */

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const dig = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);

  const el = (tag, props = {}, kids = []) => {
    const node = Object.assign(document.createElement(tag), props);
    for (const kid of [].concat(kids)) if (kid != null) node.append(kid);
    return node;
  };

  /* Outbound link to somewhere off this site. noopener/noreferrer because
     target=_blank without it hands the new tab a handle back to this one. */
  const extLink = (text, url) => el("a", {
    className: "ext", href: url, textContent: text,
    target: "_blank", rel: "noopener noreferrer"
  });

  const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const norm = (s) => String(s || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");

  const PREFIX = (DATA.event.storagePrefix || "conf") + "_";
  const K = { notes: PREFIX + "notes", stars: PREFIX + "stars" };

  /* localStorage can throw (Safari private mode, blocked cookies). Every read
     falls back to empty and every write reports failure rather than crashing. */
  const store = {
    read(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch { return fallback; }
    },
    write(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch { return false; }
    }
  };

  /* ── data indexes ────────────────────────────────────────────────────── */

  DATA.sessions.forEach((s, i) => { s.id = s.id || `s${i}-${slug(s.title).slice(0, 24)}`; });
  DATA.speakers.forEach((p) => { p.id = p.id || slug(p.name); });

  const sessionById = new Map(DATA.sessions.map((s) => [s.id, s]));
  const speakerById = new Map(DATA.speakers.map((p) => [p.id, p]));
  const speakerByName = new Map(DATA.speakers.map((p) => [norm(p.name), p]));
  const dayById = new Map(DATA.days.map((d) => [d.id, d]));

  const sessionsForSpeaker = (p) =>
    DATA.sessions.filter((s) => (s.speakers || []).some((n) => norm(n) === norm(p.name)));

  /* ── notes + stars ───────────────────────────────────────────────────── */

  /* A note is keyed "type:entityId". type is session | speaker | quick. */
  let notes = store.read(K.notes, {});
  let stars = new Set(store.read(K.stars, []));

  const noteKey = (type, id) => `${type}:${id}`;
  const getNote = (type, id) => notes[noteKey(type, id)];
  const noteCount = () => Object.keys(notes).length;

  function saveNote(type, id, text) {
    const key = noteKey(type, id);
    const trimmed = text.trim();
    if (!trimmed) {
      delete notes[key];
    } else {
      const existing = notes[key];
      notes[key] = {
        key, type, entityId: id, text: trimmed,
        createdAt: existing ? existing.createdAt : Date.now(),
        updatedAt: Date.now()
      };
    }
    const ok = store.write(K.notes, notes);
    syncNoteCount();
    return ok;
  }

  function toggleStar(kind, id) {
    const key = `${kind}:${id}`;
    stars.has(key) ? stars.delete(key) : stars.add(key);
    store.write(K.stars, [...stars]);
    return stars.has(key);
  }
  const isStarred = (kind, id) => stars.has(`${kind}:${id}`);

  function syncNoteCount() {
    const pill = $("#note-count");
    const n = noteCount();
    pill.hidden = n === 0;
    pill.textContent = n;
  }

  const relative = (ts) => {
    const mins = Math.round((Date.now() - ts) / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} min ago`;
    const hrs = Math.round(mins / 60);
    if (hrs < 24) return `${hrs} hr ago`;
    return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

  /* ── toast ───────────────────────────────────────────────────────────── */

  let toastTimer;
  function toast(msg) {
    const node = $("#toast");
    node.textContent = msg;
    node.hidden = false;
    node.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      node.classList.remove("show");
      setTimeout(() => { node.hidden = true; }, 200);
    }, 2200);
  }

  /* Plenty of attendees will star and type all day from the programme cards
     and never open the Notes tab, where the full explanation lives. The first
     save is the one moment we know they are listening, so spend it. Counting
     notes rather than storing a "seen" flag means someone who clears
     everything and starts over is told again, which is right. */
  function toastNoteSaved() {
    toast(Object.keys(notes).length === 1
      ? "Saved on this phone only — export before you go"
      : "Note saved");
  }

  /* ── static bindings ─────────────────────────────────────────────────── */

  function bindStatic() {
    for (const node of $$("[data-bind]")) {
      const value = dig(DATA, node.dataset.bind);
      if (value) node.textContent = value;
      else node.remove();
    }
    for (const node of $$("[data-bind-href]")) {
      const value = dig(DATA, node.dataset.bindHref);
      if (value) node.href = value; else node.removeAttribute("href");
    }
    if (DATA.event.name) document.title = `Program — ${DATA.event.name}`;

    const map = $("#venue-map");
    const address = dig(DATA, "event.venue.address");
    if (address) {
      map.textContent = address;
      map.href = "https://maps.google.com/?q=" + encodeURIComponent(
        [dig(DATA, "event.venue.name"), address].filter(Boolean).join(", "));
    } else {
      map.closest("p").remove();
    }

    const sponsors = DATA.event.sponsors || [];
    if (sponsors.length) {
      const mount = $("#event-sponsors");
      /* A sponsor line is either a plain string or { text, url }. */
      sponsors.forEach((s) => {
        const text = typeof s === "string" ? s : (s.text || "");
        const url  = typeof s === "string" ? "" : (s.url || "");
        if (!text) return;
        mount.append(el("li", {}, url ? extLink(text, url) : text));
      });
    } else {
      $("#event-sponsors").remove();
    }

    /* Built-by credit. Drops the whole line rather than leaving an empty <p>. */
    const credit = DATA.event.credit || {};
    const creditMount = $("#site-credit");
    if (credit.text) {
      creditMount.append(credit.url ? extLink(credit.text, credit.url) : credit.text);
    } else {
      creditMount.remove();
    }

    const reg = $("#register-link");
    if (DATA.event.registerUrl) {
      reg.href = DATA.event.registerUrl;
      reg.hidden = false;
    }
  }

  /* ── top-level tabs ──────────────────────────────────────────────────── */

  const TABS = ["program", "speakers", "notes"];

  function activateTab(name) {
    TABS.forEach((t) => {
      const on = t === name;
      $(`#tab-${t}`).setAttribute("aria-selected", String(on));
      $(`#tab-${t}`).tabIndex = on ? 0 : -1;
      $(`#panel-${t}`).hidden = !on;
    });
    if (name === "notes") renderNotes();
    window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  }

  function wireTabs() {
    TABS.forEach((t) => $(`#tab-${t}`).addEventListener("click", () => activateTab(t)));
    $(".tabs").addEventListener("keydown", (e) => {
      const i = TABS.indexOf(TABS.find((t) => $(`#tab-${t}`) === document.activeElement));
      if (i < 0) return;
      const next = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : null;
      if (next == null) return;
      e.preventDefault();
      const target = TABS[(next + TABS.length) % TABS.length];
      $(`#tab-${target}`).focus();
      activateTab(target);
    });
  }

  /* ── note editor (shared by session and speaker cards) ───────────────── */

  function noteEditor(type, id) {
    const existing = getNote(type, id);
    const box = el("div", { className: "note-editor" });
    const ta = el("textarea", {
      rows: 3,
      placeholder: "Your notes…",
      value: existing ? existing.text : ""
    });
    ta.setAttribute("aria-label", "Your notes for this item");

    const meta = el("span", { className: "muted small" },
      existing ? `Saved ${relative(existing.updatedAt)}` : "");
    const save = el("button", { className: "btn small", type: "button", textContent: "Save" });

    save.addEventListener("click", () => {
      const ok = saveNote(type, id, ta.value);
      if (!ok) return toast("Could not save — browser storage is blocked.");
      const now = getNote(type, id);
      meta.textContent = now ? `Saved ${relative(now.updatedAt)}` : "Cleared";
      if (now) toastNoteSaved(); else toast("Note cleared");
      syncNoteMarkers();
    });

    box.append(ta, el("div", { className: "note-row" }, [meta, save]));
    return box;
  }

  function syncNoteMarkers() {
    $$("[data-note-marker]").forEach((node) => {
      const [type, id] = node.dataset.noteMarker.split("|");
      node.classList.toggle("has-note", Boolean(getNote(type, id)));
    });
  }

  /* ── program ─────────────────────────────────────────────────────────── */

  const program = {
    day: DATA.days[0] ? DATA.days[0].id : null,
    query: "",
    track: "",
    starredOnly: false
  };

  const sessionHaystack = (s) => norm(
    [s.title, s.track, s.room, s.abstract, s.summary, (s.speakers || []).join(" ")]
      .filter(Boolean).join(" ")
  );

  const sessionMatches = (s) =>
    s.day === program.day &&
    (!program.track || s.track === program.track) &&
    (!program.starredOnly || isStarred("session", s.id)) &&
    (!program.query || sessionHaystack(s).includes(program.query));

  function sessionCard(s) {
    const card = el("article", {
      className: `session ${s.type || "session"}`,
      id: `session-${s.id}`
    });

    const when = el("div", { className: "when" }, [
      el("span", { className: "start", textContent: s.start }),
      s.end ? el("span", { className: "end", textContent: s.end }) : null,
      utcLine(s)
    ]);

    const head = el("div", { className: "s-head" }, [
      el("h3", { className: "title", textContent: s.title })
    ]);

    if (s.type !== "break") {
      const star = el("button", {
        className: "star",
        type: "button",
        textContent: "★"
      });
      star.setAttribute("aria-label", `Save ${s.title}`);
      star.setAttribute("aria-pressed", String(isStarred("session", s.id)));
      star.classList.toggle("on", isStarred("session", s.id));
      star.addEventListener("click", () => {
        const on = toggleStar("session", s.id);
        star.classList.toggle("on", on);
        star.setAttribute("aria-pressed", String(on));
        if (program.starredOnly) renderProgram();
      });
      head.append(star);
    }

    const body = el("div", { className: "body" }, [head]);

    if ((s.speakers || []).length) {
      const people = el("p", { className: "people" });
      s.speakers.forEach((name, i) => {
        if (i) people.append(", ");
        const p = speakerByName.get(norm(name));
        if (!p) return void people.append(name);
        const link = el("button", { className: "linkish", type: "button", textContent: name });
        link.addEventListener("click", () => openSpeaker(p.id));
        people.append(link);
      });
      body.append(people);
    }

    const meta = [];
    if (s.track) meta.push(el("span", { className: "tag", textContent: s.track }));
    if (s.room) meta.push(el("span", { className: "room", textContent: s.room }));
    if (meta.length) body.append(el("div", { className: "meta" }, meta));

    if (s.sponsor) body.append(el("p", { className: "sponsor", textContent: s.sponsor }));

    if ((s.links || []).length) {
      const row = el("p", { className: "links" });
      s.links.forEach((l, i) => {
        if (!l || !l.url) return;
        if (i) row.append(" · ");
        row.append(extLink(l.label || l.url, l.url));
      });
      if (row.childNodes.length) body.append(row);
    }

    if (s.type !== "break") {
      const details = el("details", { className: "expand" });
      const summary = el("summary");
      summary.dataset.noteMarker = `session|${s.id}`;
      summary.append(el("span", { className: "expand-label", textContent: "Details & notes" }));
      summary.append(el("span", { className: "note-dot", title: "You have a note here" }));
      details.append(summary);

      if (s.abstract) {
        s.abstract.split(/\n\s*\n/).forEach((para) =>
          details.append(el("p", { className: "abstract", textContent: para.trim() })));
      }
      if (s.summary) {
        details.append(el("p", { className: "summary" }, [
          el("strong", { textContent: "Why it matters: " }),
          s.summary
        ]));
      }
      details.append(noteEditor("session", s.id));
      body.append(details);
    }

    card.append(when, body);
    return card;
  }

  function renderProgram() {
    const list = DATA.sessions.filter(sessionMatches);
    const mount = $("#schedule");
    mount.textContent = "";

    $("#empty").hidden = list.length > 0;
    $("#count").textContent = list.length
      ? `${list.length} ${list.length === 1 ? "session" : "sessions"}`
      : "";

    const slots = new Map();
    for (const s of list) {
      if (!slots.has(s.start)) slots.set(s.start, []);
      slots.get(s.start).push(s);
    }

    for (const [start, group] of slots) {
      mount.append(el("section", { className: "slot" }, [
        el("h3", { className: "slot-time", textContent: start }),
        el("div", { className: "slot-body" }, group.map(sessionCard))
      ]));
    }

    syncNoteMarkers();
    updateLiveBadges();
  }

  function buildDayTabs() {
    const bar = $(".days");
    if (DATA.days.length < 2) { bar.hidden = true; return; }
    DATA.days.forEach((day) => {
      const tab = el("button", {
        type: "button", className: "day", id: `day-${day.id}`,
        role: "tab", textContent: day.label
      });
      if (day.dateLabel) tab.append(el("span", { className: "day-date", textContent: day.dateLabel }));
      tab.addEventListener("click", () => {
        program.day = day.id;
        syncDayTabs();
        renderProgram();
      });
      bar.append(tab);
    });
    syncDayTabs();
  }

  function syncDayTabs() {
    $$(".day").forEach((tab) => {
      const on = tab.id === `day-${program.day}`;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
    });
  }

  function buildTrackFilter() {
    const select = $("#track");
    const tracks = [...new Set(DATA.sessions.map((s) => s.track).filter(Boolean))];
    if (!tracks.length) { select.closest(".select").hidden = true; return; }
    tracks.forEach((t) => select.append(el("option", { value: t, textContent: t })));
    select.addEventListener("change", () => { program.track = select.value; renderProgram(); });
  }

  const debounce = (fn, ms = 120) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  };

  function wireProgramControls() {
    $("#q").addEventListener("input", debounce((e) => {
      program.query = norm(e.target.value.trim());
      renderProgram();
    }));
    const btn = $("#starred-only");
    btn.addEventListener("click", () => {
      program.starredOnly = !program.starredOnly;
      btn.setAttribute("aria-pressed", String(program.starredOnly));
      btn.classList.toggle("on", program.starredOnly);
      renderProgram();
    });
  }

  /* ── speakers ────────────────────────────────────────────────────────── */

  const speakerState = { query: "", starredOnly: false };

  const speakerHaystack = (p) => norm(
    [p.name, p.title, p.org, p.bio, sessionsForSpeaker(p).map((s) => s.title).join(" ")]
      .filter(Boolean).join(" ")
  );

  function speakerCard(p) {
    const card = el("article", { className: "speaker", id: `speaker-${p.id}` });

    const star = el("button", { className: "star", type: "button", textContent: "★" });
    star.setAttribute("aria-label", `Save ${p.name}`);
    star.setAttribute("aria-pressed", String(isStarred("speaker", p.id)));
    star.classList.toggle("on", isStarred("speaker", p.id));
    star.addEventListener("click", () => {
      const on = toggleStar("speaker", p.id);
      star.classList.toggle("on", on);
      star.setAttribute("aria-pressed", String(on));
      if (speakerState.starredOnly) renderSpeakers();
    });

    card.append(el("div", { className: "s-head" }, [
      el("h3", { textContent: p.name }), star
    ]));

    const affil = [p.title, p.org].filter(Boolean).join(", ");
    if (affil) {
      const line = el("p", { className: "muted" });
      line.append(p.url ? extLink(affil, p.url) : affil);
      card.append(line);
    }
    if (p.bio) card.append(el("p", { className: "bio", textContent: p.bio }));

    const mine = sessionsForSpeaker(p);
    if (mine.length) {
      const chips = el("div", { className: "chips" });
      mine.forEach((s) => {
        const chip = el("button", { className: "chip", type: "button", textContent: s.title });
        const day = dayById.get(s.day);
        chip.title = `${day ? day.label + " · " : ""}${s.start}`;
        chip.addEventListener("click", () => openSession(s.id));
        chips.append(chip);
      });
      card.append(chips);
    }

    const details = el("details", { className: "expand" });
    const summary = el("summary");
    summary.dataset.noteMarker = `speaker|${p.id}`;
    summary.append(el("span", { className: "expand-label", textContent: "Notes" }));
    summary.append(el("span", { className: "note-dot", title: "You have a note here" }));
    details.append(summary, noteEditor("speaker", p.id));
    card.append(details);

    return card;
  }

  function renderSpeakers() {
    const list = DATA.speakers.filter((p) =>
      (!speakerState.starredOnly || isStarred("speaker", p.id)) &&
      (!speakerState.query || speakerHaystack(p).includes(speakerState.query))
    );
    const mount = $("#speakers-list");
    mount.textContent = "";
    $("#speakers-empty").hidden = list.length > 0;
    $("#speaker-count").textContent = list.length
      ? `${list.length} ${list.length === 1 ? "speaker" : "speakers"}`
      : "";
    const grid = el("div", { className: "speaker-grid" }, list.map(speakerCard));
    mount.append(grid);
    syncNoteMarkers();
  }

  function wireSpeakerControls() {
    $("#speaker-q").addEventListener("input", debounce((e) => {
      speakerState.query = norm(e.target.value.trim());
      renderSpeakers();
    }));
    const btn = $("#speakers-starred-only");
    btn.addEventListener("click", () => {
      speakerState.starredOnly = !speakerState.starredOnly;
      btn.setAttribute("aria-pressed", String(speakerState.starredOnly));
      btn.classList.toggle("on", speakerState.starredOnly);
      renderSpeakers();
    });
  }

  /* ── cross-navigation ────────────────────────────────────────────────── */

  function openSpeaker(id) {
    speakerState.query = "";
    speakerState.starredOnly = false;
    $("#speaker-q").value = "";
    $("#speakers-starred-only").classList.remove("on");
    $("#speakers-starred-only").setAttribute("aria-pressed", "false");
    renderSpeakers();
    activateTab("speakers");
    reveal(`#speaker-${id}`);
  }

  function openSession(id) {
    const s = sessionById.get(id);
    if (!s) return;
    program.day = s.day;
    program.query = "";
    program.track = "";
    program.starredOnly = false;
    $("#q").value = "";
    $("#track").value = "";
    $("#starred-only").classList.remove("on");
    $("#starred-only").setAttribute("aria-pressed", "false");
    syncDayTabs();
    renderProgram();
    activateTab("program");
    reveal(`#session-${id}`);
  }

  function reveal(selector) {
    requestAnimationFrame(() => {
      const node = $(selector);
      if (!node) return;
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      node.classList.add("flash");
      setTimeout(() => node.classList.remove("flash"), 1600);
    });
  }

  /* ── notes tab ───────────────────────────────────────────────────────── */

  const notesState = { query: "" };

  const noteTitle = (n) =>
    n.type === "session" ? (sessionById.get(n.entityId)?.title || "Session")
    : n.type === "speaker" ? (speakerById.get(n.entityId)?.name || "Speaker")
    : "Quick note";

  function noteContext(n) {
    if (n.type === "session") {
      const s = sessionById.get(n.entityId);
      if (!s) return "Session";
      const day = dayById.get(s.day);
      return [day && day.label, s.start, s.room].filter(Boolean).join(" · ");
    }
    if (n.type === "speaker") {
      const p = speakerById.get(n.entityId);
      return p ? [p.title, p.org].filter(Boolean).join(", ") || "Speaker" : "Speaker";
    }
    return "Not tied to a session";
  }

  const noteLabel = { session: "Session", speaker: "Speaker", quick: "Quick" };

  function noteCard(n) {
    const card = el("article", { className: `note-card ${n.type}` });

    const head = el("div", { className: "s-head" }, [
      el("div", {}, [
        el("span", { className: "tag", textContent: noteLabel[n.type] || "Note" }),
        el("h3", { textContent: noteTitle(n) })
      ])
    ]);

    if (n.type !== "quick") {
      const go = el("button", { className: "btn small ghost", type: "button", textContent: "Open" });
      go.addEventListener("click", () =>
        n.type === "session" ? openSession(n.entityId) : openSpeaker(n.entityId));
      head.append(go);
    }

    card.append(head);
    card.append(el("p", { className: "muted small", textContent:
      `${noteContext(n)} · saved ${relative(n.updatedAt)}` }));
    card.append(el("p", { className: "note-text", textContent: n.text }));

    const del = el("button", { className: "btn small ghost danger", type: "button", textContent: "Delete" });
    del.addEventListener("click", () => {
      delete notes[n.key];
      store.write(K.notes, notes);
      syncNoteCount();
      renderNotes();
      syncNoteMarkers();
      toast("Note deleted");
    });
    card.append(del);

    return card;
  }

  function renderNotes() {
    const all = Object.values(notes).sort((a, b) => b.updatedAt - a.updatedAt);
    const list = notesState.query
      ? all.filter((n) => norm(`${noteTitle(n)} ${n.text}`).includes(notesState.query))
      : all;

    const mount = $("#notes-list");
    mount.textContent = "";
    $("#notes-empty").hidden = list.length > 0;
    $("#notes-empty").textContent = all.length
      ? "No notes match that search."
      : "No notes yet. Save one from any session or speaker.";
    $("#notes-count").textContent = list.length
      ? `${list.length} of ${all.length} ${all.length === 1 ? "note" : "notes"}`
      : "";

    list.forEach((n) => mount.append(noteCard(n)));

    const quick = getNote("quick", "general");
    $("#quick-note-meta").textContent = quick ? `Saved ${relative(quick.updatedAt)}` : "";
    if (quick && !$("#quick-note").value) $("#quick-note").value = quick.text;

    $("#export-btn").disabled = all.length === 0;
    $("#clear-btn").disabled = all.length === 0 && stars.size === 0;
  }

  function wireNotesControls() {
    $("#save-quick").addEventListener("click", () => {
      const ok = saveNote("quick", "general", $("#quick-note").value);
      if (!ok) toast("Could not save — browser storage is blocked.");
      else toastNoteSaved();
      renderNotes();
    });
    $("#notes-q").addEventListener("input", debounce((e) => {
      notesState.query = norm(e.target.value.trim());
      renderNotes();
    }));
  }

  /* ── export ──────────────────────────────────────────────────────────── */

  function exportMarkdown() {
    const list = Object.values(notes).sort((a, b) => a.createdAt - b.createdAt);
    const head = [
      `# ${DATA.event.name} — My Notes`, "",
      [DATA.event.dates, DATA.event.location].filter(Boolean).join(" · "), "",
      `Exported ${new Date().toLocaleString()} from this browser.`, ""
    ];
    if (!list.length) return head.concat("No notes saved yet.").join("\n");

    const starred = DATA.sessions.filter((s) => isStarred("session", s.id));
    if (starred.length) {
      head.push("---", "", "## Saved sessions", "");
      starred.forEach((s) => {
        const day = dayById.get(s.day);
        head.push(`- **${s.title}** — ${[day && day.label, s.start, s.room].filter(Boolean).join(" · ")}`);
      });
      head.push("");
    }

    const body = list.flatMap((n, i) => [
      "---", "",
      `## ${noteTitle(n)}`, "",
      `*${noteLabel[n.type] || "Note"} · ${noteContext(n)}*`, "",
      n.text,
      i < list.length - 1 ? "" : ""
    ]);

    return head.concat(body).join("\n");
  }

  const exportFilename = () => {
    const d = new Date();
    const p = (v) => String(v).padStart(2, "0");
    return `${slug(DATA.event.shortName || "conference")}-notes-` +
      `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.md`;
  };

  /* ── modals ──────────────────────────────────────────────────────────── */

  let lastFocus = null;

  function openModal(id) {
    lastFocus = document.activeElement;
    const overlay = $(`#${id}`);
    overlay.hidden = false;
    document.body.classList.add("locked");
    const focusable = $("button, textarea, input", overlay);
    if (focusable) focusable.focus();
  }

  function closeModal(id) {
    $(`#${id}`).hidden = true;
    document.body.classList.remove("locked");
    if (lastFocus) lastFocus.focus();
  }

  function wireModals() {
    $("#export-btn").addEventListener("click", () => {
      $("#export-text").value = exportMarkdown();
      $("#export-share").hidden = !navigator.share;
      openModal("export-modal");
    });
    $("#export-close").addEventListener("click", () => closeModal("export-modal"));

    $("#export-copy").addEventListener("click", async () => {
      const text = $("#export-text").value;
      try {
        await navigator.clipboard.writeText(text);
        toast("Copied to clipboard");
      } catch {
        /* Older iOS Safari and any non-secure origin reject the async API. */
        const ta = $("#export-text");
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        toast(document.execCommand("copy") ? "Copied to clipboard" : "Select the text and copy manually");
      }
    });

    $("#export-share").addEventListener("click", async () => {
      try {
        await navigator.share({ title: `${DATA.event.shortName} notes`, text: $("#export-text").value });
      } catch { /* user dismissed the share sheet */ }
    });

    $("#export-download").addEventListener("click", () => {
      const blob = new Blob([$("#export-text").value], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = el("a", { href: url, download: exportFilename() });
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      toast("Downloaded");
    });

    /* Clear-all is destructive, so it needs the phrase typed exactly. */
    const PHRASE = "delete all";
    $("#clear-btn").addEventListener("click", () => {
      $("#clear-input").value = "";
      $("#clear-confirm").disabled = true;
      openModal("clear-modal");
    });
    $("#clear-close").addEventListener("click", () => closeModal("clear-modal"));
    $("#clear-cancel").addEventListener("click", () => closeModal("clear-modal"));
    $("#clear-input").addEventListener("input", (e) => {
      $("#clear-confirm").disabled = e.target.value.trim().toLowerCase() !== PHRASE;
    });
    $("#clear-confirm").addEventListener("click", () => {
      notes = {};
      stars = new Set();
      store.write(K.notes, notes);
      store.write(K.stars, []);
      $("#quick-note").value = "";
      syncNoteCount();
      renderNotes();
      renderProgram();
      renderSpeakers();
      closeModal("clear-modal");
      toast("All notes deleted");
    });

    $$(".overlay").forEach((overlay) => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal(overlay.id);
      });
    });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      $$(".overlay").forEach((o) => { if (!o.hidden) closeModal(o.id); });
    });
  }

  /* ── NOW / Up Next ───────────────────────────────────────────────────── */

  /* Converts "2026-06-01" + "09:00" in the event's IANA zone to epoch ms.
     Works by measuring that zone's offset at the target instant rather than
     hardcoding one, so it stays correct across DST. */
  function zonedMs(dateISO, hhmm) {
    if (!dateISO || !hhmm) return null;
    const [y, mo, d] = dateISO.split("-").map(Number);
    const [h, mi] = hhmm.split(":").map(Number);
    if ([y, mo, d, h, mi].some(Number.isNaN)) return null;

    const naive = Date.UTC(y, mo - 1, d, h, mi);
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: DATA.event.timeZone, hour12: false,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
    const parts = fmt.formatToParts(new Date(naive)).reduce((acc, p) => {
      if (p.type !== "literal") acc[p.type] = Number(p.value);
      return acc;
    }, {});
    const seen = Date.UTC(parts.year, parts.month - 1, parts.day,
      parts.hour % 24, parts.minute, parts.second);
    return naive - (seen - naive);
  }

  /* The official program lists UTC beside HST because the audience is
     international. Derived rather than transcribed so the two cannot drift. */
  const utcFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC", hour: "2-digit", minute: "2-digit", hour12: false
  });

  function utcLine(s) {
    const day = dayById.get(s.day);
    const start = zonedMs(day && day.date, s.start24);
    if (start == null) return null;
    const end = zonedMs(day && day.date, s.end24);
    const text = end == null
      ? `${utcFmt.format(start)} UTC`
      : `${utcFmt.format(start)}–${utcFmt.format(end)} UTC`;
    return el("span", { className: "utc", textContent: text });
  }

  /* Today's calendar date as the event's timezone sees it. */
  function eventLocalDateKey(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: DATA.event.timeZone,
      year: "numeric", month: "2-digit", day: "2-digit"
    }).formatToParts(date).reduce((acc, p) => {
      if (p.type !== "literal") acc[p.type] = p.value;
      return acc;
    }, {});
    return `${parts.year}-${parts.month}-${parts.day}`;
  }

  function updateLiveBadges() {
    $$(".status-badge").forEach((b) => b.remove());
    $$(".session").forEach((n) => n.classList.remove("is-now", "is-next"));

    /* Off-event, "Up Next" would sit on the first session for months. Only
       badge while the event is actually running in its own timezone. */
    const today = eventLocalDateKey();
    if (!DATA.days.some((d) => d.date === today)) return;

    const now = Date.now();
    const timed = DATA.sessions
      .map((s) => {
        const day = dayById.get(s.day);
        return {
          s,
          start: zonedMs(day && day.date, s.start24),
          end: zonedMs(day && day.date, s.end24)
        };
      })
      .filter((x) => x.start != null)
      .sort((a, b) => a.start - b.start);

    if (!timed.length) return;

    const current = timed.filter((x) => x.end && now >= x.start && now < x.end);
    const next = timed.find((x) => x.start > now);

    const mark = (id, cls, label) => {
      const card = $(`#session-${id}`);
      if (!card) return;
      card.classList.add(cls);
      const when = $(".when", card);
      if (when) when.append(el("span", { className: `status-badge ${cls}`, textContent: label }));
    };

    if (current.length) current.forEach((x) => mark(x.s.id, "is-now", "Now"));
    else if (next) mark(next.s.id, "is-next", "Up Next");
  }

  /* ── init ────────────────────────────────────────────────────────────── */

  bindStatic();
  wireTabs();
  buildDayTabs();
  buildTrackFilter();
  wireProgramControls();
  wireSpeakerControls();
  wireNotesControls();
  wireModals();
  syncNoteCount();
  renderProgram();
  renderSpeakers();
  renderNotes();

  setInterval(updateLiveBadges, 60000);

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => { /* offline is optional */ });
    });
  }
})();
