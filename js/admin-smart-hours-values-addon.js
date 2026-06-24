// admin-smart-hours-values-addon.js
// Veilige add-on: admin scroll fix + uren per code instelbaar + overzicht.
// Laad dit script NA admin.js en ui.js, maar VOOR app.js.

(function(){
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

  function clone(obj){
    try { return structuredClone(obj); }
    catch { return JSON.parse(JSON.stringify(obj)); }
  }

  function injectAdminScrollCss(){
    if(document.getElementById('adminScrollFixStyle')) return;
    const style = document.createElement('style');
    style.id = 'adminScrollFixStyle';
    style.textContent = `
      .sidebar{
        display:flex;
        flex-direction:column;
        height:100%;
      }
      .side-content{
        overflow-y:auto !important;
        overflow-x:hidden;
        min-height:0;
        max-height:100%;
      }
      #tab-admin{
        padding-bottom:24px;
      }
      .admin-hours-row{
        display:grid;
        grid-template-columns:70px 1fr 110px 110px;
        gap:8px;
        align-items:center;
        padding:6px 0;
        border-bottom:1px solid var(--bd,#d0d7de);
      }
      .admin-hours-row.header{
        font-weight:700;
        color:#334155;
      }
      .admin-hours-row input{
        width:100%;
      }
      .admin-hours-badge{
        display:inline-flex;
        justify-content:center;
        border-radius:999px;
        padding:4px 8px;
        font-size:.78rem;
        font-weight:700;
        background:#eef2ff;
        color:#1e3a8a;
      }
      .admin-hours-badge.zero{background:#f1f5f9;color:#475569;}
      .admin-hours-badge.manual{background:#fff7ed;color:#9a3412;}
      .admin-hours-badge.auto{background:#dcfce7;color:#166534;}
    `;
    document.head.appendChild(style);
  }

  function ensureSmartHoursValues(){
    if(typeof adminSettings === 'undefined') return;

    if(!adminSettings.smartHoursValues){
      adminSettings.smartHoursValues = clone(DEFAULT_SMART_HOURS_VALUES);
    } else {
      adminSettings.smartHoursValues = {
        ...clone(DEFAULT_SMART_HOURS_VALUES),
        ...adminSettings.smartHoursValues
      };
    }

    // Migratiepad: als er nog oude smartHoursRules aanwezig zijn, respecteer ze als fallback.
    if(adminSettings.smartHoursRules && !adminSettings._smartHoursValuesMigrated){
      const rules = adminSettings.smartHoursRules;
      if(Array.isArray(rules.auto)){
        rules.auto.forEach(code => {
          if(adminSettings.smartHoursValues[code] === undefined && typeof dayCodeRules !== 'undefined' && dayCodeRules[code]){
            adminSettings.smartHoursValues[code] = dayCodeRules[code].standardHours ?? 0;
          }
        });
      }
      if(Array.isArray(rules.manual)){
        rules.manual.forEach(code => adminSettings.smartHoursValues[code] = null);
      }
      if(Array.isArray(rules.zero)){
        rules.zero.forEach(code => adminSettings.smartHoursValues[code] = 0);
      }
      adminSettings._smartHoursValuesMigrated = true;
    }
  }

  function getHoursMode(value){
    if(value === null || value === '' || value === undefined) return 'manual';
    if(parseNum(value) === 0) return 'zero';
    return 'auto';
  }

  function getHoursModeLabel(value){
    const mode = getHoursMode(value);
    if(mode === 'manual') return 'Manueel';
    if(mode === 'zero') return '0 uren';
    return 'Auto';
  }

  function renderSmartHoursValuesTable(){
    ensureSmartHoursValues();
    const container = document.getElementById('adminSmartHoursValuesTable');
    if(!container || typeof dayCodeRules === 'undefined' || typeof adminSettings === 'undefined') return;

    const rows = Object.entries(dayCodeRules).map(([code, rule]) => {
      const value = adminSettings.smartHoursValues?.[code];
      const mode = getHoursMode(value);
      const displayValue = value === null || value === undefined ? '' : String(value).replace('.', ',');
      return `
        <div class="admin-hours-row">
          <div><strong>${code}</strong></div>
          <div>${rule.label || ''}</div>
          <div>
            <input type="text" inputmode="decimal" data-smart-hour-code="${code}" value="${displayValue}" placeholder="manueel">
          </div>
          <div><span class="admin-hours-badge ${mode}">${getHoursModeLabel(value)}</span></div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="admin-hours-row header">
        <div>Code</div>
        <div>Omschrijving</div>
        <div>Uren</div>
        <div>Gedrag</div>
      </div>
      ${rows}
    `;

    container.querySelectorAll('input[data-smart-hour-code]').forEach(input => {
      input.oninput = e => {
        const code = e.target.dataset.smartHourCode;
        const raw = e.target.value.trim();

        if(raw === ''){
          adminSettings.smartHoursValues[code] = null;
        } else {
          adminSettings.smartHoursValues[code] = parseNum(raw);
        }

        if(typeof saveAdminSettings === 'function') saveAdminSettings();
        renderSmartHoursValuesTable();
        if(typeof renderRows === 'function') renderRows();
      };
    });
  }

  function injectSmartHoursValuesCard(){
    if(document.getElementById('adminSmartHoursValuesCard')) return;
    const adminPanel = document.getElementById('tab-admin');
    if(!adminPanel) return;

    const card = document.createElement('div');
    card.className = 'card';
    card.id = 'adminSmartHoursValuesCard';
    card.innerHTML = `
      <h3>Admin · uren per code</h3>
      <div class="body">
        <div id="adminSmartHoursValuesTable"></div>
        <p class="hint">
          Leeg = manueel invullen<br>
          Getal = automatisch aantal uren<br>
          0 = altijd 0 uren
        </p>
      </div>
    `;
    adminPanel.appendChild(card);
    renderSmartHoursValuesTable();
  }

  window.getSmartHoursValueForCode = function(code){
    ensureSmartHoursValues();
    if(typeof adminSettings === 'undefined' || !adminSettings.smartHoursValues) return undefined;

    if(Object.prototype.hasOwnProperty.call(adminSettings.smartHoursValues, code)){
      return adminSettings.smartHoursValues[code];
    }

    if(typeof dayCodeRules !== 'undefined' && dayCodeRules[code]){
      return dayCodeRules[code].standardHours ?? '';
    }

    return undefined;
  };

  // Admin init/binding uitbreiden zonder bestaande adminfunctionaliteit weg te gooien.
  if(typeof bindAdminInputs === 'function'){
    const originalBindAdminInputs = bindAdminInputs;
    window.bindAdminInputs = function(){
      originalBindAdminInputs();
      ensureSmartHoursValues();
      injectAdminScrollCss();
      injectSmartHoursValuesCard();
      renderSmartHoursValuesTable();
    };
  }

  // Codekeuze-logica vervangen door smartHoursValues.
  if(typeof updateEntry === 'function'){
    window.updateEntry = function(e){
      const key = e.target.dataset.key;
      const field = e.target.dataset.field;

      if(!state.entries[key]){
        state.entries[key] = {code:'',hours:'',shiftRegime:'none',mask:false,lo:false,maskAmount:0,loAmount:0};
      }

      let entry = state.entries[key];

      if(field === 'mask' || field === 'lo'){
        entry[field] = e.target.checked;
        if(field === 'mask' && entry.mask) entry.lo = false;
        if(field === 'lo' && entry.lo) entry.mask = false;
      } else {
        entry[field] = e.target.value;
      }

      if(field === 'code'){
        const rule = dayCodeRules[entry.code];
        const configuredValue = getSmartHoursValueForCode(entry.code);
        entry.shiftRegime = 'none';

        if(!rule){
          entry.hours = '';
        } else if(configuredValue === null){
          entry.hours = '';
        } else if(configuredValue !== undefined){
          entry.hours = configuredValue;
        } else {
          entry.hours = rule.standardHours ?? '';
        }
      }

      renderRows();
    };
  }

  injectAdminScrollCss();
  ensureSmartHoursValues();

  // Als admin-panel al bestaat bij laden, direct tonen; anders gebeurt dit bij bindAdminInputs().
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', () => {
      injectAdminScrollCss();
      injectSmartHoursValuesCard();
      renderSmartHoursValuesTable();
    });
  } else {
    injectSmartHoursValuesCard();
    renderSmartHoursValuesTable();
  }
})();
