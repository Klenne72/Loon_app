// ======================================================
// NAVIGATIE / TABS
// ======================================================

document.querySelectorAll('.tab').forEach(btn => {
  btn.onclick = () => {

    document.querySelectorAll('.tab')
      .forEach(b => b.classList.remove('active'));

    document.querySelectorAll('.panel')
      .forEach(p => p.classList.remove('active'));

    btn.classList.add('active');

    const panel = document.getElementById('tab-' + btn.dataset.tab);
    if (panel) panel.classList.add('active');

    if (btn.dataset.tab === "admin") {
      if (typeof initSmartHoursAdmin === "function") {
        initSmartHoursAdmin();
      }
    }
  };
});


// ======================================================
// SIDEBAR CONTROL
// ======================================================
const sidebar = $('sidebar');
const app = $('app');
const resizer = $('resizer');
const sideWidth = $('sideWidth');


// Sidebar sluiten
function collapse() {
  sidebar.classList.add('collapsed');
  sideWidth.textContent = 'Sidebar: ingeklapt';
}

// Sidebar openen
function openSide() {
  sidebar.classList.remove('collapsed');
  sideWidth.textContent = 'Sidebar: ' + sidebar.offsetWidth + 'px';
}


// Knoppen
const btnCollapse = $('collapseBtn');
if (btnCollapse) btnCollapse.onclick = collapse;

const btnCollapse2 = $('collapseBtn2');
if (btnCollapse2) btnCollapse2.onclick = () =>
  sidebar.classList.contains('collapsed')
    ? openSide()
    : collapse();

const btnOpen = $('openBtn');
if (btnOpen) btnOpen.onclick = openSide;


// ======================================================
// SIDEBAR RESIZE
// ======================================================
let resizing = false;

if (resizer) {
  resizer.addEventListener('mousedown', () => {
    resizing = true;
    document.body.style.cursor = 'col-resize';
  });

  window.addEventListener('mouseup', () => {
    resizing = false;
    document.body.style.cursor = '';
  });

  window.addEventListener('mousemove', e => {
    if (!resizing || sidebar.classList.contains('collapsed')) return;

    let w = Math.max(350, Math.min(740, e.clientX));
    sidebar.style.width = w + 'px';

    if (sideWidth) {
      sideWidth.textContent = 'Sidebar: ' + w + 'px';
    }
  });
}
  
// ======================================================
// TOOLBAR ACTIES
// ======================================================

// fullscreen toggle
const btnFullscreen = $('fullscreenBtn');
if (btnFullscreen) btnFullscreen.onclick = () =>
  app.classList.toggle('fullscreen');

// reset maand
const btnReset = $('resetBtn');
if (btnReset) btnReset.onclick = () => {
  state.entries = {};
  renderRows();
};

// ======================================================
// INIT APP
// ======================================================
(function init(){

  load();

  if (typeof initAdmin === "function") initAdmin();
  if (typeof bindAdminInputs === "function") bindAdminInputs();

  const month = document.getElementById("month");
  if (month) month.value = state.month;

  const start = document.getElementById("start");
  if (start) start.value = state.startDate || "";

  const gul = document.getElementById("gul");
  if (gul) gul.value = String(state.gul).replace(".", ",");

  const pAmount = document.getElementById("pAmount");
  if (pAmount) pAmount.value = String(state.pAmount).replace(".", ",");

  renderCodePills();
  renderPluginControls();
  renderRows();
  renderLoonMatrix();

})();
``
