// admin.js - adminmodus, indexatie en engine-instellingen
const ADMIN_PASSWORD="admin123";
const ADMIN_STORE="v9_admin_settings";
let adminSettings={ffShift:42.20,weekdayShiftPct:{none:0,Vroege:2.60,Late:8.60,Nacht:25.60},saturdayShiftPct:{none:0,Vroege:26.60,Late:46.60,Nacht:73.80},sunFactor:2,indexFactor:1};
function loadAdminSettings(){const saved=localStorage.getItem(ADMIN_STORE);if(!saved)return;try{const p=JSON.parse(saved);adminSettings={...adminSettings,...p,weekdayShiftPct:{...adminSettings.weekdayShiftPct,...(p.weekdayShiftPct||{})},saturdayShiftPct:{...adminSettings.saturdayShiftPct,...(p.saturdayShiftPct||{})}}}catch{}}
function saveAdminSettings(){localStorage.setItem(ADMIN_STORE,JSON.stringify(adminSettings))}
function initAdmin(){loadAdminSettings();const toggle=document.getElementById('adminToggle');const tabBtn=document.getElementById('adminTabBtn');if(!toggle||!tabBtn)return;toggle.onchange=()=>{if(toggle.checked){const pwd=prompt('Admin wachtwoord:');if(pwd===ADMIN_PASSWORD){tabBtn.style.display='inline-block';bindAdminInputs()}else{alert('Fout wachtwoord');toggle.checked=false;tabBtn.style.display='none'}}else{tabBtn.style.display='none'}}}
function setAdminValue(id,value){const el=document.getElementById(id);if(el)el.value=String(value).replace('.',',')}
function bindAdminNumber(id,getter,setter){const el=document.getElementById(id);if(!el)return;setAdminValue(id,getter());el.oninput=e=>{setter(parseNum(e.target.value));saveAdminSettings();triggerRecalc()}}
function bindAdminInputs(){bindAdminNumber('adminIndexFactor',()=>adminSettings.indexFactor,v=>adminSettings.indexFactor=v||1);bindAdminNumber('adminFfShift',()=>adminSettings.ffShift,v=>adminSettings.ffShift=v||0);bindAdminNumber('adminWeekVroege',()=>adminSettings.weekdayShiftPct.Vroege,v=>adminSettings.weekdayShiftPct.Vroege=v||0);bindAdminNumber('adminWeekLate',()=>adminSettings.weekdayShiftPct.Late,v=>adminSettings.weekdayShiftPct.Late=v||0);bindAdminNumber('adminWeekNacht',()=>adminSettings.weekdayShiftPct.Nacht,v=>adminSettings.weekdayShiftPct.Nacht=v||0);bindAdminNumber('adminSatVroege',()=>adminSettings.saturdayShiftPct.Vroege,v=>adminSettings.saturdayShiftPct.Vroege=v||0);bindAdminNumber('adminSatLate',()=>adminSettings.saturdayShiftPct.Late,v=>adminSettings.saturdayShiftPct.Late=v||0);bindAdminNumber('adminSatNacht',()=>adminSettings.saturdayShiftPct.Nacht,v=>adminSettings.saturdayShiftPct.Nacht=v||0);bindAdminNumber('adminSunFactor',()=>adminSettings.sunFactor,v=>adminSettings.sunFactor=v||2);const reset=document.getElementById('adminResetBtn');if(reset){reset.onclick=()=>{localStorage.removeItem(ADMIN_STORE);adminSettings={ffShift:42.20,weekdayShiftPct:{none:0,Vroege:2.60,Late:8.60,Nacht:25.60},saturdayShiftPct:{none:0,Vroege:26.60,Late:46.60,Nacht:73.80},sunFactor:2,indexFactor:1};bindAdminInputs();triggerRecalc()}}}
function triggerRecalc(){if(typeof renderRows==='function')renderRows()}
// ======================================================
// ADMIN · UREN PER CODE
// Clean versie zonder add-on
// ======================================================

const DEFAULT_SMART_HOURS_VALUES = {
  FF: 7.5,
  Q: 7.5,
  I: 7.5,
  W: 7.5,
  RO: 7.5,
  FD: null,
  OU: null,
  S: 0,
  T: 0,
  IN: 0
};


function ensureSmartHoursValues() {
  if (typeof adminSettings === "undefined") {
    window.adminSettings = {};
  }

  if (!adminSettings.smartHoursValues) {
    adminSettings.smartHoursValues = { ...DEFAULT_SMART_HOURS_VALUES };
  } else {
    adminSettings.smartHoursValues = {
      ...DEFAULT_SMART_HOURS_VALUES,
      ...adminSettings.smartHoursValues
    };
  }
}


function getHoursMode(value) {
  if (value === null || value === "" || value === undefined) {
    return "manual";
  }

  if (parseNum(value) === 0) {
    return "zero";
  }

  return "auto";
}


function getHoursModeLabel(value) {
  const mode = getHoursMode(value);

  if (mode === "manual") return "Manueel";
  if (mode === "zero") return "0 uren";

  return "Auto";
}


window.getSmartHoursValueForCode = function(code) {
  ensureSmartHoursValues();

  if (!code) return undefined;

  if (
    adminSettings.smartHoursValues &&
    Object.prototype.hasOwnProperty.call(adminSettings.smartHoursValues, code)
  ) {
    return adminSettings.smartHoursValues[code];
  }

  if (typeof dayCodeRules !== "undefined" && dayCodeRules[code]) {
    return dayCodeRules[code].standardHours ?? "";
  }

  return undefined;
}


function renderSmartHoursValuesTable() {
  ensureSmartHoursValues();

  const container = document.getElementById("adminSmartHoursValuesTable");
  if (!container) return;

  if (typeof dayCodeRules === "undefined") return;

  const rows = Object.entries(dayCodeRules).map(([code, rule]) => {
    const value = adminSettings.smartHoursValues[code];
    const mode = getHoursMode(value);

    const displayValue =
      value === null || value === undefined
        ? ""
        : String(value).replace(".", ",");

    return `
      <div class="admin-hours-row">
        <div><strong>${code}</strong></div>
        <div>${rule.label || ""}</div>
        <div>
          <input 
            type="text"
            inputmode="decimal"
            data-smart-hour-code="${code}"
            value="${displayValue}"
            placeholder="manueel"
          >
        </div>
        <div>
          <span class="admin-hours-badge ${mode}">
            ${getHoursModeLabel(value)}
          </span>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <div class="admin-hours-row header">
      <div>Code</div>
      <div>Omschrijving</div>
      <div>Uren</div>
      <div>Gedrag</div>
    </div>
    ${rows}
  `;

  bindSmartHoursInputs();
}


function bindSmartHoursInputs() {
  document.querySelectorAll("[data-smart-hour-code]").forEach(input => {
    input.onchange = e => {
      const code = e.target.dataset.smartHourCode;
      const raw = e.target.value.trim();

      if (raw === "") {
        adminSettings.smartHoursValues[code] = null;
      } else {
        adminSettings.smartHoursValues[code] = parseNum(raw);
      }

      if (typeof saveAdminSettings === "function") {
        saveAdminSettings();
      }

      renderSmartHoursValuesTable();

      if (typeof renderRows === "function") {
        renderRows();
      }
    };
  });
}