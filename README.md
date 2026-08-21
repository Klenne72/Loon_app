# V10 fixed versie

### 🏗️ Applicatie Architectuur (Alle 9 JavaScript Modules)

Dit diagram toont hoe de 9 modules binnen je frontend-applicatie met elkaar verbonden zijn en hoe data door het systeem stroomt:

```mermaid
graph TD
    %% De Datalaag
    subgraph Data [Data & State]
        config[config.js<br>Vaste Brondata & Matrix]
        state[state.js<br>Dynamische Runtime State]
    end

    %% De Rekenlaag
    subgraph Rekenkern [Payroll Berekening]
        engine[engine.js<br>Payroll Engine]
        plugin[plugin.js<br>Plugin Basis / Runner]
        plugins[plugins.js<br>Specifieke Payroll Plugins]
    end

    %% De Beheer- & Helperlaag
    subgraph Helpers [Beheer & Utilities]
        admin[admin.js<br>Admin & Indexatie]
        utils[utils.js<br>Helpers: parseNum, nfmt]
    end

    %% De UI- & Applicatielaag
    subgraph UI [Applicatie & Weergave]
        app[app.js<br>App Initialisatie / Main]
        ui[ui.js<br>UI Renderers & Event Handlers]
    end

    %% INTERACTIES & VERBINDINGEN
    
    %% Data naar Engine
    config -->|Levert basistarieven| engine
    state -->|Levert actieve maand & GUL| engine
    
    %% Engine en zijn Plugins
    engine -->|Stuurt aan via| plugin
    plugin -->|Laadt| plugins
    plugins -->|Voeren berekening uit op| engine
    
    %% Admin Mutaties
    admin -->|Muteert/Indexeert| config
    admin -->|Slaat op in| LS[(LocalStorage)]
    admin -->|Wijzigt simulatie in| state

    %% Utilities ondersteuning
    utils -.->|Ondersteunt met parseNum/nfmt| engine
    utils -.->|Ondersteunt met parseNum| admin

    %% UI & App Flow
    app -->|Start applicatie op| state
    app -->|Initialiseert| ui
    ui -->|Triggert admin acties| admin
    ui -->|Leest resultaten uit| engine
    ui -->|Updatet| DOM[HTML Browser DOM]

    %% Styling voor GitHub leesbaarheid
    style config fill:#fffbe6,stroke:#d4b106,stroke-width:2px
    style state fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style engine fill:#f4f5f7,stroke:#333,stroke-width:2px
    style admin fill:#fff5f5,stroke:#cc0000,stroke-width:2px
    style DOM fill:#e6ffed,stroke:#28a745,stroke-width:2px
```

### 💡 Waarom dit diagram jouw documentatie krachtig maakt:
* **Groepering per verantwoordelijkheid:** Door de modules op te delen in *Data*, *Rekenkern*, *Helpers* en *UI*, ziet een lezer direct waar een bepaald stuk code thuishoort.
* **Zichtbare datastromen:** Je ziet precies hoe `utils.js` (met functies zoals `parseNum`) zowel de rekenengine als het adminpaneel ondersteunt.
* **Geen terminalcommando's nodig:** Je hoeft dit nooit lokaal te compileren. GitHub tekent dit live op basis van deze tekst.

Als je de documentatie nog verder wilt verrijken, kan ik voor de nieuwe modules (zoals **`state.js`** of **`utils.js`**) een korte beschrijving maken van welke functies erin horen te zitten. Wil je dat we de documentatie voor een specifieke module nog verder uitdiepen?


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


### 📊 Module Verbindingen (config.js)

Dit diagram toont hoe de data uit `config.js` als basis dient voor de applicatie, en hoe `admin.js` hierop inbrengt tijdens runtime:

```mermaid
graph TD
    %% Configuratie brondata
    subgraph config.js [config.js - Systeem Fundament]
        direction TB
        LBM[loonBaremaMatrix<br>Barema's 4 t/m 10]
        ER[extraRates<br>maskerPremie, loPremie]
        DCR[dayCodeRules<br>Regels voor S, FF, Q, I, W, enz.]
        DAS[DEFAULT_ADMIN_SETTINGS]
        
        %% Helpers binnen config
        formatMatrixCode[formatMatrixCode] --> buildLoonMatrixOptions[buildLoonMatrixOptions]
        LBM --> buildLoonMatrixOptions
        buildLoonMatrixOptions --> loonMatrix[loonMatrix Array]
    end

    %% Inkomende mutaties vanuit Admin
    subgraph admin.js [admin.js Module]
        applyIndexation[applyIndexation]
        simulateIndexation[simulateIndexation]
    end

    %% De interactie (De verbinding)
    applyIndexation -->|Muteert runtime waarden| LBM
    applyIndexation -->|Muteert runtime waarden| ER
    simulateIndexation -->|Leest factor voor berekening| LBM

    %% Uitgaande data naar de rest van de app
    loonMatrix -->|Gelezen door| UI[Payroll Engine / UI Renderers]
    DCR -->|Gelezen door| Engine[Berekenings-Plugins]

    %% Styling voor GitHub leesbaarheid
    style config.js fill:#f4f5f7,stroke:#333,stroke-width:2px
    style admin.js fill:#fff5f5,stroke:#cc0000,stroke-width:1px
    style loonMatrix fill:#e1f5fe,stroke:#0288d1,stroke-width:2px
```

### 🔍 Architectuur & Dataflow Analyse

Bij het documenteren van deze module zijn er drie belangrijke aspecten om te onthouden voor toekomstig onderhoud:

1. **Gedrag van de data (Muteerbaarheid):**
   * Hoewel de file start met `const`, zijn `loonBaremaMatrix` en `extraRates` objecten. In JavaScript betekent dit dat hun *inhoud* nog steeds aangepast kan worden. 
   * `admin.js` maakt hier actief gebruik van tijdens de **indexatie** (`applyIndexation`) om de uurlonen live te verhogen.

2. **De `loonMatrix` Backwards Compatibility Bridge:**
   * De functie `buildLoonMatrixOptions()` transformeert de overzichtelijke `loonBaremaMatrix` (een object) naar een platte array `loonMatrix` (bijv. `{ code: "S04", rate: 19.9596 }`).
   * **Belangrijk:** Deze transformatie gebeurt *éénmalig* bij het opstarten van de app. Als de admin daarna de loonmatrix indexeert, verandert de oude `loonMatrix`-array **niet automatisch** mee, tenzij de UI de functie `buildLoonMatrixOptions()` opnieuw triggert.

3. **Gekoppelde Plugins via `dayCodeRules`:**
   * De `calculation`-property in `dayCodeRules` (zoals `ff`, `basicWage`, `contextShift`) mapt direct naar de strings in `pluginMeta`. Dit stuurt de rekenengine van de app aan.

---

Als je wilt, kunnen we nu kijken naar de **Payroll Engine / Render module** (de module die `renderRows()` of de berekeningen uitvoert). Dat is de ontbrekende schakel die de cirkel tussen `config.js` en `admin.js` compleet maakt. Wil je die code hier delen?

### 📊 Module Verbindingen (engine.js)

Dit diagram visualiseert hoe `engine.js` als centrale verwerker fungeert. Het trekt data aan uit zowel `config.js` als `admin.js`, berekent de payroll en spuugt een resultaatobject uit:

```mermaid
graph TD
    %% Inkomende data stromen
    subgraph config.js [config.js]
        shiftPct[shiftPct.weekday / saturday]
    end

    subgraph admin.js [admin.js]
        adminSettings[adminSettings Overrides<br>indexFactor, sunFactor, shiftPct]
    end

    %% De Reken Engine Kern
    subgraph engine.js [engine.js - Payroll Engine]
        direction TB
        getBelgianHolidays[getBelgianHolidays<br>Berekent oa. Pasen] --> getDateContext[getDateContext]
        
        getDateContext -->|Bepaalt context| getShiftCalculation[getShiftCalculation]
        getShiftPctSource[getShiftPctSource] -->|Checkt admin overrides| getShiftCalculation
        
        usedRate[usedRate] -->|Checkt loonbron| getIndexFactorForMonth[getIndexFactorForMonth]
        
        getSeniorityPercentage[getSeniorityPercentage]
        
        newResult[newResult] -->|Genereert basis| runPlugin[runPlugin Runner]
    end

    %% Globale State interactie
    GS[(Globale State: state)] -->|Leest month, startDate, gul, pluginEnabled| engine.js
    getSelectedMatrixRate[getSelectedMatrixRate] -->|Externe Helper| usedRate

    %% Input van Config naar Engine
    shiftPct -->|Fallback data| getShiftPctSource
    
    %% Input van Admin naar Engine
    adminSettings -->|Live overschrijvingen| getShiftPctSource
    adminSettings -->|Live indexeringsfactor| getIndexFactorForMonth
    adminSettings -->|Zondagsfactor| getShiftCalculation

    %% Uitgaande data
    runPlugin -->|Levert op| Res[Resultaat Object<br>basisloon, ploegenpremie, dagtotaal, enz.]

    %% Styling voor GitHub leesbaarheid
    style engine.js fill:#f4f5f7,stroke:#333,stroke-width:2px
    style config.js fill:#fffbe6,stroke:#d4b106,stroke-width:1px
    style admin.js fill:#fff5f5,stroke:#cc0000,stroke-width:1px
    style Res fill:#e6ffed,stroke:#28a745,stroke-width:2px
```

### 🔍 Belangrijke Rekenlogica & Relaties

Wanneer je aanpassingen doet in de berekeningen, let dan goed op de volgende drie architectonische verbindingen:

1. **De Indexatie-Uitzondering (`usedRate`):**
   * Als een dagcoderegel de loonbron `matrix` heeft, wordt het basistarief vermenigvuldigd met de `indexFactor` uit `admin.js`.
   * Als de loonbron `gul` (Garantie Uur Loon) is, wordt de indexeringsfactor **bewust genegeerd** en valt de engine direct terug op `state.gul`.

2. **Dynamische Shift Toeslagen (`getShiftPctSource`):**
   * De engine kijkt altijd eerst of de beheerder in de UI de percentages heeft aangepast (`adminSettings.saturdayShiftPct` of `weekdayShiftPct`). Pas als die er *niet* zijn, valt de engine terug op de hardgecodeerde fabrieksinstellingen (`shiftPct`) uit `config.js`.

3. **Zondags- en Feestdagen-Multiplier:**
   * In `getShiftCalculation` worden het basisloon en de ploegenpremie automatisch vermenigvuldigd (standaard `×2.00`) zodra de datumcontext een zondag of feestdag is. Dit getal wordt dynamisch uit `adminSettings.sunFactor` getrokken.

4. **Plugin Structuur (`runPlugin`):**
   * De engine voert berekeningen modulair uit. Via `state.pluginEnabled` wordt per dag/code gecontroleerd welke plugin (zoals gedefinieerd in `pluginMeta` in de config) mag draaien om het `newResult`-object te vullen.

### 🏗️ Applicatie Architectuur (9 Modules)




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
