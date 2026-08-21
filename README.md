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
