// ======================================================
// STORAGE.JS
// Runtime state bewaren/laden
// ======================================================

function save() {
  localStorage.setItem(
    STORE,
    JSON.stringify(state)
  );
}

function load() {

  const s = localStorage.getItem(STORE);

  if (s) {
    try {
      Object.assign(
        state,
        JSON.parse(s)
      );
    } catch (err) {
      console.warn(
        "State kon niet geladen worden",
        err
      );
    }
  }

  // standaard maand
  if (!state.month) {
    const d = new Date();

    state.month =
      `${d.getFullYear()}-${String(
        d.getMonth() + 1
      ).padStart(2, "0")}`;
  }

  // plugin fallback
  state.pluginEnabled = {
    basicWage: true,
    ff: true,
    fixedDayAmount: true,
    contextShift: true,
    extraPremiums: true,
    seniorityBase: true,

    ...(state.pluginEnabled || {})
  };

  // indexatie fallback
  if (state.indexSimulationActive === undefined) {
    state.indexSimulationActive = false;
  }

  if (state.indexFactor === undefined) {
    state.indexFactor = 1;
  }

}
