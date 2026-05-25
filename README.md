# 🏰 GrimLedger

Idle-/Management-RPG als Desktop-App. Alles läuft lokal — keine Online-Funktion nötig.

## 📥 EXE herunterladen (kein Setup nötig)

1. Geh zu **Actions** im GitHub Repository
2. Klicke auf den letzten erfolgreichen Build
3. Scrolle zu **Artifacts** → **GrimLedger-Windows** herunterladen
4. ZIP entpacken → `GrimLedger Setup X.X.X.exe` starten
5. Spielen!

---

## 🔧 Wie der Build funktioniert

Bei jedem Push auf `main` baut GitHub automatisch:
- Vite bündelt das React-Frontend
- electron-builder verpackt alles in eine Windows-EXE (NSIS-Installer)
- Die fertige EXE ist 30 Tage lang im "Artifacts"-Bereich herunterladbar

Kein Node.js lokal nötig!

---

## 📁 Projektstruktur

```
GrimLedger/
├── .github/workflows/build.yml   ← GitHub Actions: baut die EXE
├── electron/
│   ├── main.cjs                  ← Electron Hauptprozess
│   └── icon.png                  ← App-Icon
├── src/
│   ├── api/                      ← (Claude API — deaktiviert in EXE)
│   ├── components/
│   │   ├── hud/                  ← HUD, Tab-Navigation
│   │   ├── panels/               ← Alle 7 Spielbereiche
│   │   ├── tutorial/             ← Tutorial-Overlay
│   │   └── ui/                   ← Wiederverwendbare UI-Teile
│   ├── hooks/                    ← useGameLoop
│   ├── store/                    ← Zustand (Spielstand)
│   ├── systems/                  ← Tutorial-Definitionen
│   └── utils/                    ← Konstanten, Hilfsfunktionen
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🎮 Spielmechanik

| Tab | Beschreibung |
|-----|-------------|
| 🍺 Taverne | Helden einladen, passive Einnahmen |
| ⚖️ Laden | Weitere passive Einnahmen |
| ⚒️ Schmiede | Items herstellen & verkaufen |
| ⛓️ Verlies | Automatische Expeditionen |
| 💀 Gruft | Untote beschwören |
| ✨ Prestige | Neues Spiel+ mit dauerhaften Boni |
| 📜 Chronik | Spielstatistiken & Log |

**Prestige** schaltet sich frei bei Level 15 + 50.000 Gold (in einem Run). Jeder Prestige-Run gibt dauerhafte Multiplikatoren auf Gold, XP und Handwerk.
