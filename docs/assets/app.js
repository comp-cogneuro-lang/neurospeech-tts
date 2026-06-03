// Build the samples page from manifest.json. Static — works on GitHub Pages.

const SAMPLES = "samples";

// Mirror scripts/build_site_samples.py:safe_name
function safeName(word) {
  return word.trim().toLowerCase().replace(/\//g, "_").replace(/ /g, "_");
}

function sentencePath(lang, i, spkId) {
  return `${SAMPLES}/${lang}/sentences/s${i}_${spkId}.wav`;
}
function wordPath(lang, spkId, word) {
  return `${SAMPLES}/${lang}/words/${spkId}/${safeName(word)}.wav`;
}

function el(tag, attrs = {}, children = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else n.setAttribute(k, v);
  }
  for (const c of [].concat(children)) {
    if (c) n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return n;
}

function audio(src) {
  return el("audio", { controls: "", preload: "none", src });
}

function sentenceBlock(lang, speakers) {
  const wrap = el("div");
  wrap.appendChild(el("h3", { class: "block-title" }, [
    "Sentences ",
    el("span", { class: "hint", text: `— ${lang.sentences.length} sentences × ${speakers.length} voices` }),
  ]));

  const table = el("table", { class: "sentence-table" });
  const thead = el("thead");
  const hrow = el("tr", {}, [el("th", { text: "Sentence" })]);
  speakers.forEach((s) => hrow.appendChild(el("th", { text: s.name })));
  thead.appendChild(hrow);
  table.appendChild(thead);

  const tbody = el("tbody");
  lang.sentences.forEach((text, i) => {
    const tr = el("tr", {}, [el("td", { class: "sent-text", text })]);
    speakers.forEach((s) => {
      tr.appendChild(el("td", {}, [audio(sentencePath(lang.code, i, s.id))]));
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  wrap.appendChild(table);
  return wrap;
}

function wordsBlock(lang, speakers) {
  const wrap = el("div");
  wrap.appendChild(el("h3", { class: "block-title" }, [
    "Words ",
    el("span", { class: "hint", text: `— ${lang.words.length} words per voice` }),
  ]));

  const grid = el("div", { class: "speaker-grid" });
  speakers.forEach((s) => {
    const card = el("div", { class: "speaker-card" });
    card.appendChild(el("div", { class: "spk-head" }, [
      el("span", { class: "spk-name", text: s.name }),
      el("span", { class: "spk-tag", text: s.tag }),
    ]));
    const list = el("div", { class: "word-list" });
    lang.words.forEach((w) => {
      list.appendChild(el("div", { class: "word-row" }, [
        el("span", { class: "w", text: w }),
        audio(wordPath(lang.code, s.id, w)),
      ]));
    });
    card.appendChild(list);
    grid.appendChild(card);
  });
  wrap.appendChild(grid);
  return wrap;
}

function langSection(lang, speakers) {
  const sec = el("section", { class: "lang-section", id: `lang-${lang.code}` });

  const head = el("div", { class: "lang-heading" }, [
    el("span", { class: "flag", text: lang.flag || "" }),
    el("h2", { text: lang.name }),
    el("span", { class: "native", text: lang.native && lang.native !== lang.name ? `· ${lang.native}` : "" }),
  ]);
  if (!lang.available) head.appendChild(el("span", { class: "badge-soon", text: "coming soon" }));
  sec.appendChild(head);

  if (lang.available) {
    sec.appendChild(sentenceBlock(lang, speakers));
    sec.appendChild(wordsBlock(lang, speakers));
  } else {
    sec.appendChild(el("div", { class: "placeholder" }, [
      el("p", { text: `Audio for ${lang.name} hasn't been added yet.` }),
      el("p", {}, [
        "Drop WAVs into ",
        el("code", { text: `samples/${lang.code}/` }),
        " and set ",
        el("code", { text: `"available": true` }),
        " in ",
        el("code", { text: "manifest.json" }),
        ".",
      ]),
    ]));
  }
  return sec;
}

function buildNav(languages) {
  const nav = document.getElementById("lang-nav");
  nav.innerHTML = "";
  languages.forEach((l) => {
    const btn = el("button", {
      class: l.available ? "" : "unavailable",
      text: `${l.flag || ""} ${l.name}`.trim(),
    });
    btn.addEventListener("click", () => {
      document.getElementById(`lang-${l.code}`)
        .scrollIntoView({ behavior: "smooth", block: "start" });
      nav.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
    nav.appendChild(btn);
  });
}

async function main() {
  const content = document.getElementById("content");
  let manifest;
  try {
    const res = await fetch("manifest.json", { cache: "no-cache" });
    manifest = await res.json();
  } catch (e) {
    content.innerHTML = `<p class="loading">Could not load manifest.json — ${e}</p>`;
    return;
  }

  document.getElementById("site-title").textContent = manifest.title || "TTS samples";
  document.getElementById("site-subtitle").textContent = manifest.subtitle || "";

  const speakers = manifest.speakers || [];
  buildNav(manifest.languages);

  content.innerHTML = "";
  manifest.languages.forEach((l) => content.appendChild(langSection(l, speakers)));

  const first = document.querySelector("#lang-nav button");
  if (first) first.classList.add("active");
}

main();
