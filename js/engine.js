// ======================================================
// ENGINE.JS
// Payroll calculation engine
// ======================================================


// ------------------------------------------------------
// Belgische feestdagen
// ------------------------------------------------------

function getBelgianHolidays(year) {
  const fixed = [
    `${year}-01-01`,
    `${year}-05-01`,
    `${year}-07-21`,
    `${year}-08-15`,
    `${year}-11-01`,
    `${year}-11-11`,
    `${year}-12-25`
  ];

  function easter(y) {
    let f = Math.floor,
      a = y % 19,
      b = f(y / 100),
      c = y % 100,
      d = f(b / 4),
      e = b % 4,
      g = f((8 * b + 13) / 25),
      h = (19 * a + b - d - g + 15) % 30,
      i = f(c / 4),
      k = c % 4,
      l = (32 + 2 * e + 2 * i - h - k) % 7,
      m = f((a + 11 * h + 22 * l) / 451),
      mo = f((h + l - 7 * m + 114) / 31),
      da = ((h + l - 7 * m + 114) % 31) + 1;

    return new Date(y, mo - 1, da);
  }

  const e = easter(year);

  const add = n => {
    let x = new Date(e);
    x.setDate(x.getDate() + n);

    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
  };

  return fixed.concat([
    add(1),   // Paasmaandag
    add(39),  // O.H. Hemelvaart
    add(50)   // Pinkstermaandag
  ]);
}


// ------------------------------------------------------
// Datumcontext
// ------------------------------------------------------

function getDateContext(dateStr) {
  const y = parseInt(dateStr.slice(0, 4), 10);

  if (getBelgianHolidays(y).includes(dateStr)) {
    return "feestdag";
  }

  const d = new Date(dateStr + "T00:00:00");

  if (d.getDay() === 0) return "zondag";
  if (d.getDay() === 6) return "zaterdag";

  return "weekdag";
}


// ------------------------------------------------------
// Indexfactor ophalen
// Voorlopig compatibility met adminSettings.indexFactor
// Later kan hier indexHistory komen
// ------------------------------------------------------

function getIndexFactorForMonth(month) {
  if (
    typeof adminSettings !== "undefined" &&
    adminSettings.indexFactor != null
  ) {
    return parseNum(adminSettings.indexFactor);
  }

  return 1;
}


// ------------------------------------------------------
// Uurloon bepalen
// ------------------------------------------------------

function usedRate(rule) {
  const matrixFactor = getIndexFactorForMonth(state.month);

  if (rule.wageSource === "matrix") {
    const base = getSelectedMatrixRate();

    // Matrix wordt geïndexeerd
    return base * matrixFactor;
  }

  if (rule.wageSource === "gul") {
    // GUL wordt bewust NIET geïndexeerd
    return state.gul;
  }

  return 0;
}


// ------------------------------------------------------
// Shiftpercentage ophalen
// Admin overrides blijven mogelijk
// ------------------------------------------------------

function getShiftPctSource(context) {
  if (context === "zaterdag") {
    if (
      typeof adminSettings !== "undefined" &&
      adminSettings.saturdayShiftPct
    ) {
      return adminSettings.saturdayShiftPct;
    }

    return shiftPct.saturday;
  }

  if (
    typeof adminSettings !== "undefined" &&
    adminSettings.weekdayShiftPct
  ) {
    return adminSettings.weekdayShiftPct;
  }

  return shiftPct.weekday;
}


// ------------------------------------------------------
// Shiftberekening
// ------------------------------------------------------

function getShiftCalculation(shift, context, rawBasis) {
  if (!shift || shift === "none") {
    return {
      pct: 0,
      correctie: "-",
      basis: rawBasis,
      ploeg: 0,
      applied: "Geen"
    };
  }

  const pctSource = getShiftPctSource(context);
  const pctValue = pctSource[shift] || 0;

  let basis = rawBasis;
  let ploeg = rawBasis * (pctValue / 100);
  let correctie = "Normaal";

  if (context === "zondag" || context === "feestdag") {
    const factor =
      typeof adminSettings !== "undefined" && adminSettings.sunFactor
        ? parseNum(adminSettings.sunFactor)
        : 2;

    basis = rawBasis * factor;
    ploeg = ploeg * factor;
    correctie = `×${nfmt(factor, 2)} basis en ×${nfmt(factor, 2)} ploeg`;
  }

  return {
    pct: pctValue,
    correctie,
    basis,
    ploeg,
    applied: `${context} / ${shift}`
  };
}


// ------------------------------------------------------
// Anciënniteitspercentage
// ------------------------------------------------------

function getSeniorityPercentage() {
  if (!state.startDate || !state.month) return 0;

  const start = new Date(state.startDate);
  const [y, m] = state.month.split("-").map(Number);
  const ref = new Date(y, m, 0);

  if (Number.isNaN(start.getTime()) || start > ref) return 0;

  let yrs = ref.getFullYear() - start.getFullYear();
  let md = ref.getMonth() - start.getMonth();

  if (md < 0 || (md === 0 && ref.getDate() < start.getDate())) {
    yrs--;
  }

  return yrs >= 20 ? 10.5
    : yrs >= 15 ? 8.75
    : yrs >= 10 ? 6
    : yrs >= 8 ? 5
    : yrs >= 4 ? 4
    : yrs >= 2 ? 3
    : 0;
}


// ------------------------------------------------------
// Nieuw resultaatobject
// ------------------------------------------------------

function newResult(context) {
  return {
    usedRate: 0,
    basisloon: 0,
    ploegenpremie: 0,
    vastePremie: 0,
    extraPremies: 0,
    dagtotaal: 0,
    seniorityBase: 0,
    control: "OK",
    context,
    pct: 0,
    correctie: "-",
    applied: "-",
    plugins: []
  };
}


// ------------------------------------------------------
// Plugin runner
// ------------------------------------------------------

function runPlugin(id, ctx, fn) {
  if (!state.pluginEnabled[id]) return;

  fn(ctx);
  ctx.res.plugins.push(id);
}