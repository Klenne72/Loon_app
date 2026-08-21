# V10 fixed versie

### 📊 Module Verbindingen (admin.js)

Dit diagram toont hoe `admin.js` via UI-events communiceert met lokale opslag en externe functies binnen de frontend:

```mermaid
graph TD
    %% Gebruikersinteracties
    UI[HTML DOM / UI Events] -->|Wachtwoord & Inputs| admin.js
    
    subgraph admin.js [admin.js Module]
        initAdmin[initAdmin] --> loadAdminSettings[loadAdminSettings]
        initAdmin --> bindAdminInputs[bindAdminInputs]
        bindAdminInputs --> bindAdminNumber[bindAdminNumber]
        
        %% Indexatie flows
        simulateIndexation[simulateIndexation]
        applyIndexation[applyIndexation] --> saveIndexSnapshot[saveIndexSnapshot]
        resetIndexSimulation[resetIndexSimulation]
        renderIndexHistory[renderIndexHistory]
    end

    %% Externe Databronnen en State
    admin.js -->|JSON opslag| LS[(Browser LocalStorage: v9_admin_settings)]
    admin.js -->|Leest/Schrijft| GS[Globale State / Variabelen: state, loonBaremaMatrix, extraRates]

    %% Externe UI Render functies (Aanroepen)
    admin.js -->|Trigger herberekening| renderRows[renderRows]
    admin.js -->|Update UI Matrix| renderAdminLoonMatrix[renderAdminLoonMatrix]
    admin.js -->|Update UI Matrix| renderLoonMatrix[renderLoonMatrix]
    admin.js -->|Toon Index Info| renderCurrentIndexInfo[renderCurrentIndexInfo]

    %% Styling voor GitHub leesbaarheid
    style admin.js fill:#f4f5f7,stroke:#333,stroke-width:2px
    style LS fill:#e1f5fe,stroke:#0288d1,stroke-width:1px
    style GS fill:#fff3e0,stroke:#f57c00,stroke-width:1px
```

### 🔍 Belangrijke Afhankelijkheden (Dependencies)

Om te voorkomen dat deze module crasht, leunt `admin.js` op de aanwezigheid van de volgende **globale objecten en functies** elders in de code:

1. **Globale State & Data:**
   * `state`: Wordt gebruikt om simulatie-statussen (`indexSimulationActive`) bij te houden.
   * `loonBaremaMatrix` & `extraRates`: De loongegevens die door de indexatiefunctie worden overschreven.

2. **Externe Render Functies (Losgekoppeld via `typeof` checks):**
   * `renderRows()`: Wordt aangeroepen na wijzigingen om de hoofdtabellen te herberekenen.
   * `renderLoonMatrix()` & `renderAdminLoonMatrix()`: Updaten de visuele tabellen na een indexatie of simulatie.
   * `renderCurrentIndexInfo()`: Updatet de labels met de huidige indexatiedatum.

3. **Helper Functies:**
   * `parseNum()`: Nodig om komma-getallen uit de UI om te zetten naar JavaScript floats.
   * `nfmt()`: Nodig in de geschiedenistabel om de indexeringsfactor mooi af te ronden (4 decimalen).



Aangepast:
-indexatie van de loonmatrix toegepast
-historie van deze indexaties
config.js
│
├─ loonBaremaMatrix (basis)
├─ dagCodeRules
├─ DEFAULT_ADMIN_SETTINGS
└─ SMART_HOURS_DEFAULTS

state.js
│
├─ entries
├─ loonMatrix (actieve versie)
├─ indexSimulationActive
└─ indexFactor

storage.js
│
├─ save()
├─ load()
└─ saveAdminSettings()

admin.js
│
├─ indexatie
├─ premies
├─ smart hours
└─ historiek

engine.js
│
├─ calculateDay()
├─ ploegpremies
├─ ancienniteit
└─ dagtotalen

plugins.js
│
├─ basisloon
├─ FF
├─ context shift
└─ extra premies

ui.js
│
├─ renderRows()
├─ renderTotals()
├─ renderLoonMatrix()
└─ renderAdminLoonMatrix()
__ renderIndexatie

app.js
│
├─ init()
├─ tabs
├─ resizer
└─ event orchestration
