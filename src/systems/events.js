// ─── EREIGNISSE ───────────────────────────────────────────────────────────────
// Events fire randomly every ~3-8 minutes. Player can accept or reject.

export const EVENTS = [
  // ── Positive ─────────────────────────────────────────────────────────────
  {
    id: 'evt_seelensturm',
    title: 'Seelensturm',
    icon: '🌪️',
    type: 'positive',
    desc: 'Ein Sturm aus dem Jenseits treibt Seelen direkt ins Ledger. Produktion für 60 Sekunden massiv erhöht.',
    effect: { buffType: 'prodMult', buffValue: 2.0, buffDuration: 60 },
    acceptLabel: 'Annehmen',
    rejectLabel: 'Ablehnen',
    rejectEffect: null,
  },
  {
    id: 'evt_vergessener_schatz',
    title: 'Vergessener Schatz',
    icon: '💎',
    type: 'positive',
    desc: 'Jemand hat ein uraltes Lager verfluchter Knochen hinterlassen. Du kannst es beanspruchen.',
    effect: { instant: { knochen: 200, seelen: 100 } },
    acceptLabel: 'Beanspruchen',
    rejectLabel: 'Ignorieren',
    rejectEffect: null,
  },
  {
    id: 'evt_blutregen',
    title: 'Blutregen',
    icon: '🩸',
    type: 'positive',
    desc: 'Blut regnet vom Himmel. Der Blut-Altar produziert für 90 Sekunden das Dreifache.',
    effect: { buffType: 'blutMult', buffValue: 3.0, buffDuration: 90 },
    acceptLabel: 'Ritual starten',
    rejectLabel: 'Ignorieren',
    rejectEffect: null,
  },
  {
    id: 'evt_dunkle_gabe',
    title: 'Dunkle Gabe',
    icon: '🎁',
    type: 'positive',
    desc: 'Eine unbekannte Macht schenkt dir Ressourcen. Woher sie kommen — besser nicht fragen.',
    effect: { instant: { wissen: 50, leereFragmente: 3, seelen: 300 } },
    acceptLabel: 'Annehmen',
    rejectLabel: 'Zurückweisen',
    rejectEffect: null,
  },

  // ── Negative ─────────────────────────────────────────────────────────────
  {
    id: 'evt_ledger_korruption',
    title: 'Ledger-Korruption',
    icon: '📕',
    type: 'negative',
    desc: 'Das Buch hat sich selbst teilweise ausgelöscht. Produktion sinkt für 45 Sekunden um 50%.',
    effect: { buffType: 'prodMult', buffValue: 0.5, buffDuration: 45 },
    acceptLabel: 'Hinnehmen',
    rejectLabel: 'Bekämpfen (100 Wissen)',
    rejectCost: { wissen: 100 },
    rejectEffect: null,  // nullifies the debuff if player can pay
  },
  {
    id: 'evt_seelenkollaps',
    title: 'Seelenkollaps',
    icon: '💔',
    type: 'negative',
    desc: 'Ein Teil der gesammelten Seelen entkommt. Du verlierst 10% deiner aktuellen Seelen.',
    effect: { lossFraction: { seelen: 0.10 } },
    acceptLabel: 'Akzeptieren',
    rejectLabel: 'Abwehren (200 Schatten)',
    rejectCost: { schatten: 200 },
    rejectEffect: null,
  },

  // ── Entscheidungen ─────────────────────────────────────────────────────────
  {
    id: 'evt_teufelspakt',
    title: 'Teufelspakt',
    icon: '😈',
    type: 'choice',
    desc: 'Ein Dämon bietet dir einen Pakt: +200% Produktion für 2 Minuten — aber du verlierst 30% deiner Knochen.',
    effect: { buffType: 'prodMult', buffValue: 3.0, buffDuration: 120, cost: { knochen: null, knochenFraction: 0.3 } },
    acceptLabel: 'Pakt eingehen',
    rejectLabel: 'Ablehnen',
    rejectEffect: null,
  },
  {
    id: 'evt_ritualversagen',
    title: 'Ritual-Versagen',
    icon: '🔥',
    type: 'choice',
    desc: 'Ein Ritual ist fehlgeschlagen. Du kannst 500 Blut opfern um Schlimmeres abzuwenden, oder den Schaden hinnehmen.',
    effect: { lossFraction: { seelen: 0.20 } },
    acceptLabel: 'Schaden hinnehmen',
    rejectLabel: 'Blut opfern (500)',
    rejectCost: { blut: 500 },
    rejectEffect: null,
  },
]

// Average interval between events in ms (randomized ±50%)
export const EVENT_INTERVAL_BASE_MS = 5 * 60 * 1000   // 5 minutes base
export const EVENT_INTERVAL_SPREAD  = 0.5              // ±50%
