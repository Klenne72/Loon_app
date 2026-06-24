// ======================================================
// STATE.JS
// Runtime data van de app
// ======================================================

const STORE = "v9_plugin_payroll_engine";

let state = {
  entries: {},

  month: "",
  startDate: "",

  // Nieuwe matrixkeuze
  barema: "7",
  categorie: "T",

  // Backwards compatibility met bestaande UI
  matrixCode: "T07",
  matrixRate: 21.6540,

  // GUL blijft aparte input
  gul: 25,

  // Vaste P / dag
  pAmount: 140,

  pluginEnabled: {
    basicWage: true,
    ff: true,
    fixedDayAmount: true,
    contextShift: true,
    extraPremiums: true,
    seniorityBase: true
  }
};


// ------------------------------------------------------
// Helper: actieve matrixrate ophalen uit config
// ------------------------------------------------------

function getSelectedMatrixRate() {
  return loonBaremaMatrix?.[state.barema]?.[state.categorie] || 0;
}


// ------------------------------------------------------
// Helper: matrix state synchroniseren
// Handig als barema/categorie wijzigt
// ------------------------------------------------------

function syncMatrixState() {
  state.matrixRate = getSelectedMatrixRate();
  state.matrixCode = formatMatrixCode(state.categorie, state.barema);
}