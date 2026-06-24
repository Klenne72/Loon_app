// ======================================================
// PLUGINS.JS
// Payroll plugins + calculateDay
// ======================================================


// ------------------------------------------------------
// Basisloon plugin
// ------------------------------------------------------

function basicWagePlugin(ctx) {
  const { rule, hours } = ctx;

  if (rule.calculation === "basicWage") {
    ctx.res.usedRate = usedRate(rule);
    ctx.res.basisloon += ctx.res.usedRate * hours;
  }
}


// ------------------------------------------------------
// FF plugin
// ------------------------------------------------------

function ffPlugin(ctx) {
  const { rule, hours } = ctx;

  if (rule.calculation === "ff") {
    ctx.res.usedRate = usedRate(rule);
    ctx.res.basisloon += ctx.res.usedRate * hours;

    ctx.res.pct =
      typeof adminSettings !== "undefined" && adminSettings.ffShift != null
        ? parseNum(adminSettings.ffShift)
        : parseNum(rule.shiftPercentage);

    ctx.res.ploegenpremie += ctx.res.basisloon * (ctx.res.pct / 100);
    ctx.res.applied = `FF ${nfmt(ctx.res.pct, 2)}%`;
  }
}


// ------------------------------------------------------
// Vaste dagpremie plugin
// ------------------------------------------------------

function fixedDayAmountPlugin(ctx) {
  const { rule } = ctx;

  if (rule.calculation === "fixedDayAmount") {
    ctx.res.vastePremie += parseNum(
      state.pAmount || rule.fixedAmount || 0
    );
  }
}


// ------------------------------------------------------
// Context shift plugin
// Voor FD / OU
// ------------------------------------------------------

function contextShiftPlugin(ctx) {
  const { rule, hours, entry } = ctx;

  if (rule.calculation === "contextShift") {
    ctx.res.usedRate = usedRate(rule);

    const rawBasis = ctx.res.usedRate * hours;

    const s = getShiftCalculation(
      entry.shiftRegime || "none",
      ctx.context,
      rawBasis
    );

    ctx.res.basisloon += s.basis;
    ctx.res.ploegenpremie += s.ploeg;
    ctx.res.pct = s.pct;
    ctx.res.correctie = s.correctie;
    ctx.res.applied = s.applied;

    if (!entry.shiftRegime || entry.shiftRegime === "none") {
      ctx.res.control = "Geen ploeg gekozen";
    }
  }
}


// ------------------------------------------------------
// Extra premies plugin
// MaskerPremie / L.O.Premie
// ------------------------------------------------------

function extraPremiumsPlugin(ctx) {
  const { entry } = ctx;

  if (!["FF", "OU", "FD"].includes(entry.code)) return;

  const maskerAmount = entry.maskAmount !== "" && entry.maskAmount != null
    ? parseNum(entry.maskAmount)
    : extraRates.maskerPremie;

  const loAmount = entry.loAmount !== "" && entry.loAmount != null
    ? parseNum(entry.loAmount)
    : extraRates.loPremie;

  ctx.res.extraPremies += entry.mask ? maskerAmount : 0;
  ctx.res.extraPremies += entry.lo ? loAmount : 0;
}


// ------------------------------------------------------
// Seniority base plugin
// ------------------------------------------------------

function seniorityBasePlugin(ctx) {
  const { rule } = ctx;

  if (rule.countsForSeniority) {
    ctx.res.seniorityBase += ctx.res.basisloon;
  }
}


// ------------------------------------------------------
// Plugin registry
// ------------------------------------------------------

const plugins = [
  ["basicWage", basicWagePlugin],
  ["ff", ffPlugin],
  ["fixedDayAmount", fixedDayAmountPlugin],
  ["contextShift", contextShiftPlugin],
  ["extraPremiums", extraPremiumsPlugin],
  ["seniorityBase", seniorityBasePlugin]
];


// ------------------------------------------------------
// Dagberekening
// ------------------------------------------------------

function calculateDay(entry, dateStr) {
  const context = getDateContext(dateStr);
  const rule = dayCodeRules[entry.code];

  if (!rule) {
    let r = newResult(context);
    r.control = "Onbekende code";
    return r;
  }

  const hours =
    entry.hours === "" || entry.hours == null
      ? rule.standardHours
      : parseNum(entry.hours);

  let ctx = {
    entry,
    dateStr,
    context,
    rule,
    hours,
    res: newResult(context)
  };

  ctx.res.usedRate = usedRate(rule);

  for (const [id, fn] of plugins) {
    runPlugin(id, ctx, fn);
  }

  if (
    rule.wageSource === "gul" &&
    state.gul <= 0 &&
    rule.calculation !== "none"
  ) {
    ctx.res.control = "GUL ontbreekt";
  }

  ctx.res.dagtotaal =
    ctx.res.basisloon +
    ctx.res.ploegenpremie +
    ctx.res.vastePremie +
    ctx.res.extraPremies;

  return ctx.res;
}