// admin-smart-hours-addon.js
// Voeg dit script toe NA admin.js en ui.js, maar VOOR app.js.
// Het breidt je bestaande admin uit met configureerbare slimme uren per code.

(function(){
  const DEFAULT_SMART_HOURS={
    auto:['FF','Q','I','W','RO'],
    manual:['FD','OU'],
    zero:['S','T','IN']
  };

  function parseCodeList(value){
    return String(value||'')
      .split(',')
      .map(x=>x.trim().toUpperCase())
      .filter(Boolean);
  }

  function ensureSmartHoursSettings(){
    if(typeof adminSettings==='undefined') return;
    if(!adminSettings.smartHoursRules){
      adminSettings.smartHoursRules=structuredClone(DEFAULT_SMART_HOURS);
    }else{
      adminSettings.smartHoursRules={
        ...DEFAULT_SMART_HOURS,
        ...adminSettings.smartHoursRules
      };
    }
  }

  function injectSmartHoursAdminCard(){
    if(document.getElementById('adminSmartHoursCard')) return;
    const adminPanel=document.getElementById('tab-admin');
    if(!adminPanel) return;

    const div=document.createElement('div');
    div.className='card';
    div.id='adminSmartHoursCard';
    div.innerHTML=`
      <h3>Admin · slimme uren per code</h3>
      <div class="body">
        <label>Automatisch uren invullen</label>
        <input type="text" id="adminAutoHoursCodes" placeholder="FF,Q,I,W,RO">
        <p class="hint">Codes in deze lijst krijgen automatisch hun standaarduren.</p>

        <label>Manueel uren invullen</label>
        <input type="text" id="adminManualHoursCodes" placeholder="FD,OU">
        <p class="hint">Codes in deze lijst blijven leeg zodat de gebruiker uren invult.</p>

        <label>Altijd 0 uren</label>
        <input type="text" id="adminZeroHoursCodes" placeholder="S,T,IN">
        <p class="hint">Codes in deze lijst worden automatisch op 0 uren gezet.</p>
      </div>
    `;
    adminPanel.appendChild(div);
  }

  function bindText(id,getter,setter){
    const el=document.getElementById(id);
    if(!el) return;
    el.value=getter();
    el.oninput=e=>{
      setter(e.target.value);
      if(typeof saveAdminSettings==='function') saveAdminSettings();
      if(typeof renderRows==='function') renderRows();
    };
  }

  function bindSmartHoursInputs(){
    ensureSmartHoursSettings();
    if(typeof adminSettings==='undefined'||!adminSettings.smartHoursRules) return;

    bindText('adminAutoHoursCodes',
      ()=>adminSettings.smartHoursRules.auto.join(','),
      v=>adminSettings.smartHoursRules.auto=parseCodeList(v)
    );

    bindText('adminManualHoursCodes',
      ()=>adminSettings.smartHoursRules.manual.join(','),
      v=>adminSettings.smartHoursRules.manual=parseCodeList(v)
    );

    bindText('adminZeroHoursCodes',
      ()=>adminSettings.smartHoursRules.zero.join(','),
      v=>adminSettings.smartHoursRules.zero=parseCodeList(v)
    );
  }

  window.getSmartHoursRules=function(){
    ensureSmartHoursSettings();
    if(typeof adminSettings==='undefined'||!adminSettings.smartHoursRules) return DEFAULT_SMART_HOURS;
    return {
      auto:Array.isArray(adminSettings.smartHoursRules.auto)?adminSettings.smartHoursRules.auto:DEFAULT_SMART_HOURS.auto,
      manual:Array.isArray(adminSettings.smartHoursRules.manual)?adminSettings.smartHoursRules.manual:DEFAULT_SMART_HOURS.manual,
      zero:Array.isArray(adminSettings.smartHoursRules.zero)?adminSettings.smartHoursRules.zero:DEFAULT_SMART_HOURS.zero
    };
  };

  // Bestaande bindAdminInputs uitbreiden zonder de oude functionaliteit te breken.
  if(typeof bindAdminInputs==='function'){
    const originalBindAdminInputs=bindAdminInputs;
    window.bindAdminInputs=function(){
      originalBindAdminInputs();
      injectSmartHoursAdminCard();
      bindSmartHoursInputs();
    };
  }

  // Bestaande updateEntry overschrijven met dezelfde basislogica + smartHoursRules.
  if(typeof updateEntry==='function'){
    window.updateEntry=function(e){
      const key=e.target.dataset.key,field=e.target.dataset.field;
      if(!state.entries[key]) state.entries[key]={code:'',hours:'',shiftRegime:'none',mask:false,lo:false,maskAmount:0,loAmount:0};
      let entry=state.entries[key];

      if(field==='mask'||field==='lo'){
        entry[field]=e.target.checked;
        if(field==='mask'&&entry.mask) entry.lo=false;
        if(field==='lo'&&entry.lo) entry.mask=false;
      }else{
        entry[field]=e.target.value;
      }

      if(field==='code'){
        const rule=dayCodeRules[entry.code];
        const smart=getSmartHoursRules();
        entry.shiftRegime='none';

        if(!rule){
          entry.hours='';
        }else if(smart.auto.includes(entry.code)){
          entry.hours=rule.standardHours??'';
        }else if(smart.manual.includes(entry.code)){
          entry.hours='';
        }else if(smart.zero.includes(entry.code)){
          entry.hours=0;
        }else{
          entry.hours=rule.standardHours??'';
        }
      }

      renderRows();
    };
  }

  ensureSmartHoursSettings();
  injectSmartHoursAdminCard();
})();
