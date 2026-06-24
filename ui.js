// ======================================================
// UI.JS - schone stabiele versie
// ======================================================

function getCurrentMatrixValue() {
  return loonBaremaMatrix?.[state.barema]?.[state.categorie] || 0;
}

function renderLoonMatrix() {
  const table = document.getElementById("loonMatrixTable");
  if (!table) return;

  let html = `
    <thead>
      <tr>
        <th></th>
        <th>S</th>
        <th>T</th>
        <th>U</th>
        <th>V</th>
      </tr>
    </thead>
    <tbody>
  `;

  Object.keys(loonBaremaMatrix).forEach(barema => {
    const row = loonBaremaMatrix[barema];

    html += `
      <tr>
        <td>${barema}</td>
        ${["S", "T", "U", "V"].map(cat => {
          const active = state.barema === barema && state.categorie === cat ? "active-cell" : "";
          return `
            <td class="matrix-cell ${active}" data-b="${barema}" data-c="${cat}">
              ${nfmt(row[cat], 4)}
            </td>
          `;
        }).join("")}
      </tr>
    `;
  });

  html += `</tbody>`;
  table.innerHTML = html;

  bindMatrixClicks();
}

function bindMatrixClicks() {
  document.querySelectorAll(".matrix-cell").forEach(cell => {
    cell.onclick = () => {
      state.barema = cell.dataset.b;
      state.categorie = cell.dataset.c;

      if (typeof syncMatrixState === "function") syncMatrixState();

      document.querySelectorAll(".matrix-cell").forEach(c => c.classList.remove("active-cell"));
      cell.classList.add("active-cell");

      renderRows();
      renderTotals();
      if (typeof save === "function") save();
    };
  });
}

function ensureMonth() {
  if (!state.month) {
    state.month = new Date().toISOString().slice(0, 7);
  }
}

function renderRows() {
  const rows = document.getElementById("rows");
  if (!rows) return;

  ensureMonth();

  const [y, m] = state.month.split("-").map(Number);
  const days = new Date(y, m, 0).getDate();

  rows.innerHTML = "";

  for (let d = 1; d <= days; d++) {
    const key = `${state.month}-${String(d).padStart(2, "0")}`;

    let entry = state.entries[key] || {
      code: "",
      hours: "",
      shiftRegime: "none",
      mask: false,
      lo: false,
      maskAmount: 0,
      loAmount: 0
    };

    const res = calculateDay(entry, key);
    const tr = document.createElement("tr");

    const codeOptions = ["", ...Object.keys(dayCodeRules)]
      .map(code => `<option value="${code}" ${entry.code === code ? "selected" : ""}>${code}</option>`)
      .join("");

    const shiftOptions = Object.entries(shiftLabels)
      .map(([shiftKey, label]) => `<option value="${shiftKey}" ${entry.shiftRegime === shiftKey ? "selected" : ""}>${label}</option>`)
      .join("");

    tr.innerHTML = `
      <td>${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}</td>
      <td>${res.context}</td>

      <td>
        <select data-key="${key}" data-field="code">
          ${codeOptions}
        </select>
      </td>

      <td>
        <select data-key="${key}" data-field="shiftRegime">
          ${shiftOptions}
        </select>
      </td>

      <td>
        <input type="text" data-key="${key}" data-field="hours" value="${entry.hours ?? ""}">
      </td>

      <td>${res.usedRate ? eur(res.usedRate, 4) : ""}</td>
      <td>${res.basisloon ? eur(res.basisloon) : ""}</td>
      <td>${res.ploegenpremie ? eur(res.ploegenpremie) : ""}</td>

      <td>
        <label>
          <input type="checkbox" data-key="${key}" data-field="mask" ${entry.mask ? "checked" : ""}>
          Masker
        </label>
        <label>
          <input type="checkbox" data-key="${key}" data-field="lo" ${entry.lo ? "checked" : ""}>
          L.O.
        </label>
      </td>

      <td>${res.control}</td>
    `;

    rows.appendChild(tr);
    state.entries[key] = entry;
  }

  bindInputs();
  renderTotals();
  if (typeof save === "function") save();
}

function bindInputs() {
  document.querySelectorAll("[data-key]").forEach(el => {
    el.oninput = updateEntry;
    el.onchange = updateEntry;
  });
}

function updateEntry(e) {
  const key = e.target.dataset.key;
  const field = e.target.dataset.field;

  if (!state.entries[key]) {
    state.entries[key] = {
      code: "",
      hours: "",
      shiftRegime: "none",
      mask: false,
      lo: false,
      maskAmount: 0,
      loAmount: 0
    };
  }

  const entry = state.entries[key];

  if (field === "mask" || field === "lo") {
    entry[field] = e.target.checked;

    if (field === "mask" && entry.mask) entry.lo = false;
    if (field === "lo" && entry.lo) entry.mask = false;
  } else {
    entry[field] = e.target.value;
  }

  if (field === "code") {
    const rule = dayCodeRules[entry.code];
    entry.shiftRegime = "none";
    entry.hours = rule ? rule.standardHours : "";
  }

  renderRows();
}

function renderTotals() {
  let totals = {
    hours: 0,
    basis: 0,
    shift: 0,
    fixed: 0,
    extra: 0,
    day: 0,
    seniorityBase: 0
  };

  for (const [key, entry] of Object.entries(state.entries)) {
    const res = calculateDay(entry, key);

    totals.hours += parseNum(entry.hours);
    totals.basis += res.basisloon;
    totals.shift += res.ploegenpremie;
    totals.fixed += res.vastePremie;
    totals.extra += res.extraPremies;
    totals.day += res.dagtotaal;
    totals.seniorityBase += res.seniorityBase;
  }

  const ancPct = getSeniorityPercentage();
  const monthAnc = totals.seniorityBase * (ancPct / 100);
  const gross = totals.day + monthAnc;

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText("sumCode", `${state.categorie}${state.barema}`);
  setText("sumMatrix", eur(getCurrentMatrixValue(), 4));
  setText("sumGul", eur(state.gul, 4));
  setText("sumAncPct", pct(ancPct));
  setText("sumAnc", eur(monthAnc));
  setText("sumGross", eur(gross));

  setText("totHours", nfmt(totals.hours));
  setText("totBasis", eur(totals.basis));
  setText("totShift", eur(totals.shift));
  setText("totFixed", eur(totals.fixed));
  setText("totExtra", eur(totals.extra));
  setText("totAncBase", eur(totals.seniorityBase));

  const badges = document.getElementById("badges");
  if (badges) {
    badges.innerHTML = `
      <span class="pill">Anc. basis ${eur(totals.seniorityBase)}</span>
      <span class="pill green">Bruto ${eur(gross)}</span>
    `;
  }
}

function renderPluginControls() {
  const el = document.getElementById("pluginControls");
  if (!el) return;

  el.innerHTML = Object.entries(pluginMeta)
    .map(([id, label]) => `
      <label class="pill">
        <input type="checkbox" data-plugin="${id}" ${state.pluginEnabled[id] ? "checked" : ""}>
        ${label}
      </label>
    `)
    .join("");

  document.querySelectorAll("[data-plugin]").forEach(x => {
    x.onchange = e => {
      state.pluginEnabled[e.target.dataset.plugin] = e.target.checked;
      renderRows();
      renderPluginControls();
    };
  });
}

function renderCodePills() {
  const el = document.getElementById("codePills");
  if (!el) return;

  el.innerHTML = Object.entries(dayCodeRules)
    .map(([code, rule]) => `<span class="pill">${code} — ${rule.label}</span>`)
    .join("");
}

function updateSettings() {
  const month = document.getElementById("month");
  const start = document.getElementById("start");
  const gul = document.getElementById("gul");
  const pAmount = document.getElementById("pAmount");

  if (month) state.month = month.value;
  if (start) state.startDate = start.value || "";
  if (gul) state.gul = parseNum(gul.value);
  if (pAmount) state.pAmount = parseNum(pAmount.value);

  if (typeof syncMatrixState === "function") syncMatrixState();

  renderRows();
}

["month", "start", "gul", "pAmount"].forEach(id => {
  const el = document.getElementById(id);
  if (!el) return;

  el.oninput = updateSettings;
  el.onchange = updateSettings;
});

console.log("ui.js geladen");
