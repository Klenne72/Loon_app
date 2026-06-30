// ======================================================
// CONFIG.JS
// Vaste brondata van de payroll app
// Geen runtime user-data in deze file
// ======================================================


// ------------------------------------------------------
// LOONBAREMA MATRIX
// Rij = barema
// Kolom = categorie S / T / U / V
// ------------------------------------------------------

const loonBaremaMatrix = {
  "4":  { S: 19.9596, T: 20.7041, U: 21.0779, V: 21.4509 },
  "5":  { S: 20.3606, T: 21.1235, U: 21.6682, V: 21.8854 },
  "6":  { S: 20.6675, T: 21.4414, U: 22.0501, V: 22.2152 },
  "7":  { S: 20.8723, T: 21.6540, U: 22.3251, V: 22.4353 },
  "8":  { S: 21.1750, T: 21.9678, U: 22.5982, V: 22.7605 },
  "9":  { S: 21.5854, T: 22.3922, U: 22.9814, V: 23.2016 },
  "9+": { S: 22.4353, T: 22.9811, U: 23.9969, V: 25.0125 },
  "10": { S: 24.2418, T: 25.1502, U: 25.5355, V: 26.0582 }
};


// ------------------------------------------------------
// EXTRA PREMIES
// ------------------------------------------------------

const extraRates = {
  maskerPremie: 0.2840,
  loPremie: 4.0300
};


// ------------------------------------------------------
// PLOEGPERCENTAGES
// ------------------------------------------------------

const shiftPct = {
  weekday: {
    none: 0,
    Vroege: 2.60,
    Late: 8.60,
    Nacht: 25.60
  },

  saturday: {
    none: 0,
    Vroege: 26.60,
    Late: 46.60,
    Nacht: 73.80
  }
};


// ------------------------------------------------------
// LABELS
// ------------------------------------------------------

const shiftLabels = {
  none: "Kies shift",
  Vroege: "Vroege",
  Late: "Late",
  Nacht: "Nacht"
};


// ------------------------------------------------------
// DAGCODE REGELS
// ------------------------------------------------------

const dayCodeRules = {
  S: {
    label: "Vrij",
    wageSource: "none",
    standardHours: 0,
    calculation: "none",
    countsForSeniority: false
  },

  FF: {
    label: "Forfaitaire gewerkte dag",
    wageSource: "matrix",
    standardHours: 7.5,
    calculation: "ff",
    shiftPercentage: 42.20,
    countsForSeniority: true
  },

  Q: {
    label: "ADV-dag",
    wageSource: "gul",
    standardHours: 7.5,
    calculation: "basicWage",
    countsForSeniority: true
  },

  I: {
    label: "Anciënniteits-dag",
    wageSource: "gul",
    standardHours: 7.5,
    calculation: "basicWage",
    countsForSeniority: true
  },

  W: {
    label: "Feestdag",
    wageSource: "gul",
    standardHours: 7.5,
    calculation: "basicWage",
    countsForSeniority: true
  },

  RO: {
    label: "Recup Overuren",
    wageSource: "gul",
    standardHours: 7.5,
    calculation: "basicWage",
    countsForSeniority: true
  },

  P: {
    label: "Eindejaarspremie",
    wageSource: "none",
    standardHours: 0,
    calculation: "fixedDayAmount",
    fixedAmount: 140,
    countsForSeniority: false
  },

  T: {
    label: "Verlof",
    wageSource: "none",
    standardHours: 0,
    calculation: "none",
    countsForSeniority: false
  },

  IN: {
    label: "Inactiviteit Deeltijds",
    wageSource: "none",
    standardHours: 0,
    calculation: "none",
    countsForSeniority: false
  },

  FD: {
    label: "Feestdag prestatie",
    wageSource: "gul",
    standardHours: 7.5,
    calculation: "contextShift",
    countsForSeniority: true
  },

  OU: {
    label: "Overuren",
    wageSource: "matrix",
    standardHours: 0,
    calculation: "contextShift",
    countsForSeniority: false
  }
};


// ------------------------------------------------------
// PLUGIN META
// ------------------------------------------------------

const pluginMeta = {
  basicWage: "Basisloon plugin",
  ff: "FF 42,20% plugin",
  fixedDayAmount: "Vaste dagpremie plugin",
  contextShift: "FD/OU context-shift plugin",
  extraPremiums: "Extra premies plugin",
  seniorityBase: "Maandanciënniteit-basis plugin"
};


// ------------------------------------------------------
// COMPATIBILITY HELPERS
// Voor bestaande UI-code die nog loonMatrix verwacht
// ------------------------------------------------------

function formatMatrixCode(categorie, barema) {
  const cleanBarema = String(barema).padStart(2, "0");
  return `${categorie}${cleanBarema}`;
}

function buildLoonMatrixOptions() {
  const options = [];

  Object.keys(loonBaremaMatrix).forEach(barema => {
    ["S", "T", "U", "V"].forEach(categorie => {
      options.push({
        barema,
        categorie,
        code: formatMatrixCode(categorie, barema),
        rate: loonBaremaMatrix[barema][categorie],
        label: `${categorie}${barema}`
      });
    });
  });

  return options;
}

// Oude naam behouden zodat bestaande UI minder snel breekt
const loonMatrix = buildLoonMatrixOptions();
