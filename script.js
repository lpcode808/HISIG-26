(() => {
  "use strict";

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const dig = (obj, path) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);

  const el = (tag, props = {}, kids = []) => {
    const node = Object.assign(document.createElement(tag), props);
    for (const kid of [].concat(kids)) {
      if (kid != null) node.append(kid);
    }
    return node;
  };

  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  /* ---- static bindings: data.js -> [data-bind] / [data-bind-href] --------- */

  function bindStatic() {
    for (const node of $$("[data-bind]")) {
      const value = dig(DATA, node.dataset.bind);
      if (value) node.textContent = value;
      else if (!node.textContent.trim()) node.remove();
    }
    for (const node of $$("[data-bind-href]")) {
      const value = dig(DATA, node.dataset.bindHref);
      if (value) node.href = value;
      else node.removeAttribute("href");
    }
    const name = dig(DATA, "event.name");
    if (name) document.title = `Program — ${name}`;
  }

  /* ---- state ------------------------------------------------------------- */

  const state = {
    day: DATA.days[0] ? DATA.days[0].id : null,
    query: "",
    track: ""
  };

  const haystack = (s) =>
    [s.title, s.track, s.room, s.abstract, (s.speakers || []).join(" ")]
      .filter(Boolean).join(" ").toLowerCase();

  const matches = (s) =>
    s.day === state.day &&
    (!state.track || s.track === state.track) &&
    (!state.query || haystack(s).includes(state.query));

  /* ---- controls ---------------------------------------------------------- */

  function buildDayTabs() {
    const bar = $(".days");
    DATA.days.forEach((day) => {
      const tab = el("button", {
        type: "button",
        className: "day",
        id: `tab-${day.id}`,
        role: "tab",
        textContent: day.label
      });
      tab.setAttribute("aria-controls", "schedule");
      if (day.date) tab.append(el("span", { className: "day-date", textContent: day.date }));
      tab.addEventListener("click", () => {
        state.day = day.id;
        syncTabs();
        render();
      });
      bar.append(tab);
    });
    syncTabs();
  }

  function syncTabs() {
    $$(".day").forEach((tab) => {
      const on = tab.id === `tab-${state.day}`;
      tab.setAttribute("aria-selected", String(on));
      tab.tabIndex = on ? 0 : -1;
    });
  }

  function buildTrackFilter() {
    const select = $("#track");
    const tracks = [...new Set(DATA.sessions.map((s) => s.track).filter(Boolean))];
    if (!tracks.length) {
      select.closest(".select").hidden = true;
      return;
    }
    tracks.forEach((t) => select.append(el("option", { value: t, textContent: t })));
    select.addEventListener("change", () => {
      state.track = select.value;
      render();
    });
  }

  function wireSearch() {
    const input = $("#q");
    let timer;
    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        state.query = input.value.trim().toLowerCase();
        render();
      }, 120);
    });
  }

  /* ---- schedule ---------------------------------------------------------- */

  function sessionNode(s) {
    const times = el("div", { className: "when" }, [
      el("span", { className: "start", textContent: s.start }),
      s.end ? el("span", { className: "end", textContent: s.end }) : null
    ]);

    const meta = [];
    if (s.track) meta.push(el("span", { className: "tag", textContent: s.track }));
    if (s.room) meta.push(el("span", { className: "room", textContent: s.room }));

    const body = el("div", { className: "body" }, [
      el("h3", { className: "title", textContent: s.title }),
      (s.speakers || []).length
        ? el("p", { className: "people", textContent: s.speakers.join(", ") })
        : null,
      meta.length ? el("div", { className: "meta" }, meta) : null
    ]);

    if (s.abstract) {
      const details = el("details", { className: "abstract" }, [
        el("summary", { textContent: "Details" }),
        el("p", { textContent: s.abstract })
      ]);
      body.append(details);
    }

    return el("article", { className: `session ${s.type || "session"}` }, [times, body]);
  }

  function render() {
    const list = DATA.sessions.filter(matches);
    const mount = $("#schedule");
    mount.textContent = "";

    $("#empty").hidden = list.length > 0;
    $("#count").textContent = list.length
      ? `${list.length} ${list.length === 1 ? "session" : "sessions"}`
      : "";

    const byTime = new Map();
    for (const s of list) {
      if (!byTime.has(s.start)) byTime.set(s.start, []);
      byTime.get(s.start).push(s);
    }

    for (const [start, group] of byTime) {
      mount.append(
        el("section", { className: "slot" }, [
          el("h3", { className: "slot-time", textContent: start }),
          el("div", { className: "slot-body" }, group.map(sessionNode))
        ])
      );
    }
  }

  /* ---- speakers ---------------------------------------------------------- */

  function renderSpeakers() {
    const mount = $("#speakers-list");
    const speakers = DATA.speakers || [];
    if (!speakers.length) {
      $("#speakers").hidden = true;
      return;
    }
    speakers.forEach((p) => {
      const affil = [p.title, p.org].filter(Boolean).join(", ");
      mount.append(
        el("li", { className: "speaker", id: `speaker-${slug(p.name)}` }, [
          el("h3", { textContent: p.name }),
          affil ? el("p", { className: "muted", textContent: affil }) : null,
          p.bio ? el("p", { className: "bio", textContent: p.bio }) : null
        ])
      );
    });
  }

  /* ---- go ---------------------------------------------------------------- */

  bindStatic();
  buildDayTabs();
  buildTrackFilter();
  wireSearch();
  renderSpeakers();
  render();
})();
