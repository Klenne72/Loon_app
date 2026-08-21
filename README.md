# V10 fixed versie

### 📊 Module Verbindingen

Hieronder zie je hoe deze frontend-module verbonden is met de rest van de applicatie:

```mermaid
graph LR
    %% Richting: LR = Left to Right (Links naar Rechts)
    
    %% Inkomende verbindingen (Wie gebruikt deze module?)
    Dashboard[Dashboard Page] --> |laadt in| MyModule(Mijn Nieuwe Module)
    Settings[Settings Page] --> |laadt in| MyModule

    %% Uitgaande verbindingen (Wat gebruikt deze module zelf?)
    MyModule --> |haalt data| UserAPI[User API Service]
    MyModule --> |formatteert| DateUtils[Date Utilities]
    
    %% Stijlen (Optioneel: geeft je eigen module een opvallende kleur)
    style MyModule fill:#f9f,stroke:#333,stroke-width:2px
```


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
