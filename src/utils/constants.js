// ─── GRIM LEDGER v1.0.0 — Spielkonstanten ────────────────────────────────────

export const TICK_MS  = 250          // 4 ticks/sec
export const SAVE_KEY = 'grimleger-save'  // NEVER change — wipes saves

// ── Ressourcen ────────────────────────────────────────────────────────────────
export const RES = {
  seelen:         { name: 'Seelen',          icon: '💀', hex: '#a855f7' },
  knochen:        { name: 'Knochen',         icon: '🦴', hex: '#a8a29e' },
  blut:           { name: 'Blut',            icon: '🩸', hex: '#ef4444' },
  schatten:       { name: 'Schatten',        icon: '🌑', hex: '#94a3b8' },
  erinnerungen:   { name: 'Erinnerungen',    icon: '🌀', hex: '#60a5fa' },
  asche:          { name: 'Asche',           icon: '🌫️', hex: '#a3a3a3' },
  wissen:         { name: 'Wissen',          icon: '📖', hex: '#f59e0b' },
  albtraeume:     { name: 'Albträume',       icon: '👁️', hex: '#c084fc' },
  leereFragmente: { name: 'Leere-Fragmente', icon: '✦',  hex: '#22d3ee' },
  gottloseEssenz: { name: 'Gottl. Essenz',   icon: '⚗️', hex: '#34d399' },
  abyssMarken:    { name: 'Abyss-Marken',    icon: '⬡',  hex: '#fb7185' },
}

// Keys for basic resources (not rare, not currency)
export const BASIC_RES  = ['seelen','knochen','blut','schatten','erinnerungen','asche','wissen','albtraeume']
export const RARE_RES   = ['leereFragmente','gottloseEssenz']
export const PRESTIGE_RES = ['abyssMarken']

// ── Gebäude ───────────────────────────────────────────────────────────────────
// unlockCost: null = starts built at level 1, otherwise must be purchased
export const BUILDINGS = {
  seelenquelle: {
    name: 'Seelenquelle', icon: '💀', maxLevel: 20, startLevel: 1,
    unlockCost: null,
    desc: 'Zieht verlorene Seelen aus dem Nichts.',
    upgradeCost: (l) => ({ seelen: Math.floor(15 * 1.4 ** l) }),
    produces:    (l) => ({ seelen: 0.2 * l }),
  },
  knochenmuehle: {
    name: 'Knochenmühle', icon: '🦴', maxLevel: 20, startLevel: 0,
    unlockCost: { seelen: 50 },
    desc: 'Mahlt die Überreste Gefallener zu rohen Knochen.',
    upgradeCost: (l) => ({ seelen: Math.floor(40 * 1.4 ** l), knochen: Math.floor(10 * 1.3 ** l) }),
    produces:    (l) => ({ knochen: 0.15 * l }),
  },
  blutAltar: {
    name: 'Blut-Altar', icon: '🩸', maxLevel: 20, startLevel: 0,
    unlockCost: { seelen: 120, knochen: 80 },
    desc: 'Ein uralter Altar der Blutopfer annimmt.',
    upgradeCost: (l) => ({ seelen: Math.floor(100 * 1.45 ** l), blut: Math.floor(20 * 1.3 ** l) }),
    produces:    (l) => ({ blut: 0.1 * l, seelen: 0.05 * l }),
  },
  nachtKathedrale: {
    name: 'Nacht-Kathedrale', icon: '⛪', maxLevel: 20, startLevel: 0,
    unlockCost: { seelen: 500, blut: 200 },
    desc: 'Heilige Stätte des ewigen Dunkels.',
    upgradeCost: (l) => ({ seelen: Math.floor(400 * 1.5 ** l), schatten: Math.floor(30 * 1.35 ** l) }),
    produces:    (l) => ({ schatten: 0.12 * l, albtraeume: 0.02 * l }),
  },
  gedaechtnisGewolbe: {
    name: 'Gedächtnis-Gewölbe', icon: '🌀', maxLevel: 20, startLevel: 0,
    unlockCost: { seelen: 1200, schatten: 400 },
    desc: 'Bewahrt gestohlene Erinnerungen gefallener Wesen.',
    upgradeCost: (l) => ({ seelen: Math.floor(900 * 1.5 ** l), erinnerungen: Math.floor(50 * 1.4 ** l) }),
    produces:    (l) => ({ erinnerungen: 0.08 * l, wissen: 0.03 * l }),
  },
  aschekammer: {
    name: 'Aschekammer', icon: '🌫️', maxLevel: 20, startLevel: 0,
    unlockCost: { seelen: 3000, asche: 500 },
    desc: 'Was verbrannte, verbrannte nicht vollständig.',
    upgradeCost: (l) => ({ seelen: Math.floor(2000 * 1.55 ** l), asche: Math.floor(100 * 1.4 ** l) }),
    produces:    (l) => ({ asche: 0.1 * l, leereFragmente: 0.005 * l }),
  },
  leereSpalte: {
    name: 'Leere-Spalte', icon: '✦', maxLevel: 10, startLevel: 0,
    unlockCost: { seelen: 10000, leereFragmente: 50 },
    desc: 'Ein Riss in der Realität. Produziert das Unmögliche.',
    upgradeCost: (l) => ({ seelen: Math.floor(8000 * 1.6 ** l), leereFragmente: Math.floor(30 * 1.5 ** l) }),
    produces:    (l) => ({ leereFragmente: 0.02 * l, gottloseEssenz: 0.003 * l }),
  },
}

// ── Forschung — 3 Pfade ───────────────────────────────────────────────────────
export const RESEARCH_PATHS = ['produktion', 'beschwoerung', 'korrumpierung']

export const RESEARCH = {
  // Produktion
  verdorbeneEffizienz: {
    name: 'Verdorbene Effizienz', icon: '⚙️', path: 'produktion',
    desc: 'Alle Gebäude produzieren 25% mehr.',
    cost: { wissen: 30, seelen: 200 }, requires: [],
    effect: { globalProdMult: 1.25 },
  },
  blutresonanz: {
    name: 'Blutresonanz', icon: '🩸', path: 'produktion',
    desc: 'Blut-Altar produziert doppelt so viel.',
    cost: { wissen: 60, blut: 100 }, requires: ['verdorbeneEffizienz'],
    effect: { buildingMult: { blutAltar: 2.0 } },
  },
  schattenMultiplikation: {
    name: 'Schattenmultiplikation', icon: '🌑', path: 'produktion',
    desc: 'Nacht-Kathedrale produziert dreimal so viel.',
    cost: { wissen: 120, schatten: 200 }, requires: ['blutresonanz'],
    effect: { buildingMult: { nachtKathedrale: 3.0 } },
  },
  endloseBuchfuehrung: {
    name: 'Endlose Buchführung', icon: '📖', path: 'produktion',
    desc: 'Gedächtnis-Gewölbe ×5. Offline-Zeit +12h.',
    cost: { wissen: 300, erinnerungen: 200 }, requires: ['schattenMultiplikation'],
    effect: { buildingMult: { gedaechtnisGewolbe: 5.0 }, offlineBonusH: 12 },
  },
  // Beschwörung
  ersteBeschwoerung: {
    name: 'Erste Beschwörung', icon: '🔮', path: 'beschwoerung',
    desc: 'Schaltet Dämonen-Beschwörung frei.',
    cost: { wissen: 50, seelen: 300 }, requires: [],
    effect: { unlockSummon: true },
  },
  dunklePakte: {
    name: 'Dunkle Pakte', icon: '📜', path: 'beschwoerung',
    desc: 'Beschwörungskosten -30%.',
    cost: { wissen: 100, blut: 150 }, requires: ['ersteBeschwoerung'],
    effect: { summonCostMult: 0.7 },
  },
  waechterbindung: {
    name: 'Wächterbindung', icon: '⛓️', path: 'beschwoerung',
    desc: 'Beschwörte Wesen kämpfen 40% effektiver.',
    cost: { wissen: 200, schatten: 300, knochen: 400 }, requires: ['dunklePakte'],
    effect: { combatMult: 1.4 },
  },
  verloreneGoetter: {
    name: 'Verlorene Götter', icon: '👁️', path: 'beschwoerung',
    desc: 'Schaltet Tier-4-Wesen frei.',
    cost: { wissen: 500, gottloseEssenz: 20 }, requires: ['waechterbindung'],
    effect: { unlockGodTier: true },
  },
  // Korrumpierung
  realitaetsriss: {
    name: 'Realitätsriss', icon: '💫', path: 'korrumpierung',
    desc: 'Schaltet Leere-Spalte frei. +10% alle Ressourcen.',
    cost: { wissen: 80, leereFragmente: 10 }, requires: [],
    effect: { unlockBuilding: 'leereSpalte', globalProdMult: 1.1 },
  },
  korrumpierteWahrnehmung: {
    name: 'Korrumpierte Wahrnehmung', icon: '🌀', path: 'korrumpierung',
    desc: 'Albträume → Seelen-Bonus. Seelenquelle ×1.5.',
    cost: { wissen: 150, albtraeume: 100 }, requires: ['realitaetsriss'],
    effect: { albtraeumeToSeelen: true, buildingMult: { seelenquelle: 1.5 } },
  },
  gottloseEssenzSynthese: {
    name: 'Gottlose Synthese', icon: '⚗️', path: 'korrumpierung',
    desc: 'Gottlose Essenz synthetisiert alle Ressourcen.',
    cost: { wissen: 400, gottloseEssenz: 30 }, requires: ['korrumpierteWahrnehmung'],
    effect: { essenzSynthese: true },
  },
  aufstiegVorbereitung: {
    name: 'Aufstiegs-Vorbereitung', icon: '⬡', path: 'korrumpierung',
    desc: 'Abyss-Marken-Gewinn beim Aufstieg ×2.',
    cost: { wissen: 800, gottloseEssenz: 60 }, requires: ['gottloseEssenzSynthese'],
    effect: { ascMarksMult: 2.0 },
  },
}

export const RESEARCH_TOTAL = Object.keys(RESEARCH).length  // 12

// ── Wesen ─────────────────────────────────────────────────────────────────────
export const SUMMONS = {
  skelettWaechter: {
    name: 'Skelett-Wächter', icon: '💀', tier: 1,
    cost: { knochen: 30, seelen: 20 }, requires: [],
    stats: { hp: 50, atk: 8, def: 4, crit: 0.05 },
    desc: 'Ein verlässlicher Knochensoldat.',
  },
  blutDaemon: {
    name: 'Blut-Dämon', icon: '🩸', tier: 2,
    cost: { blut: 60, seelen: 80 }, requires: ['ersteBeschwoerung'],
    stats: { hp: 120, atk: 20, def: 8, crit: 0.12 },
    desc: 'Aus geronnenem Blut geformt.',
  },
  schattenlaeufer: {
    name: 'Schattenläufer', icon: '🌑', tier: 2,
    cost: { schatten: 80, seelen: 100 }, requires: ['ersteBeschwoerung'],
    stats: { hp: 80, atk: 35, def: 3, crit: 0.25 },
    desc: 'Trifft bevor man ihn sieht.',
  },
  traumverschlinger: {
    name: 'Traumverschlinger', icon: '👁️', tier: 3,
    cost: { albtraeume: 120, seelen: 200, leereFragmente: 5 }, requires: ['dunklePakte'],
    stats: { hp: 300, atk: 45, def: 20, crit: 0.15 },
    desc: 'Nährt sich von Angst und Schlaf.',
  },
  gottlosesFragment: {
    name: 'Gottloses Fragment', icon: '✦', tier: 4,
    cost: { gottloseEssenz: 15, seelen: 500 }, requires: ['verloreneGoetter'],
    stats: { hp: 800, atk: 120, def: 50, crit: 0.20 },
    desc: 'Splitter einer toten Gottheit.',
  },
}

// ── Bosse ─────────────────────────────────────────────────────────────────────
export const BOSSES = [
  {
    id: 'vergessenesEcho', name: 'Vergessenes Echo', icon: '🌀', tier: 1,
    hp: 500, atk: 15, def: 5,
    unlockCost: { seelen: 200 },
    reward: { seelen: 150, knochen: 80, wissen: 20 },
    desc: 'Das Echo einer vergessenen Seele.',
  },
  {
    id: 'blutProphet', name: 'Blut-Prophet', icon: '🩸', tier: 2,
    hp: 2000, atk: 40, def: 15,
    unlockCost: { seelen: 1000, blut: 500 },
    reward: { seelen: 800, blut: 300, wissen: 80, leereFragmente: 2 },
    desc: 'Er weissagte seinen Untergang. Er hatte recht.',
  },
  {
    id: 'schattenfuerst', name: 'Schattenfürst', icon: '🌑', tier: 3,
    hp: 8000, atk: 90, def: 35,
    unlockCost: { seelen: 5000, schatten: 2000 },
    reward: { seelen: 3000, schatten: 1000, wissen: 300, leereFragmente: 8 },
    desc: 'Herrscher des Nichts zwischen den Welten.',
  },
  {
    id: 'archivarDerLeere', name: 'Archivar der Leere', icon: '📖', tier: 4,
    hp: 50000, atk: 250, def: 100,
    unlockCost: { seelen: 30000, gottloseEssenz: 50 },
    reward: { seelen: 15000, gottloseEssenz: 30, wissen: 1500, abyssMarken: 5 },
    desc: 'Dein Vorgänger. Er scheiterte.',
  },
]

// ── Aufstieg ──────────────────────────────────────────────────────────────────
export const ASCENSION_REQ = { seelen: 50000, level: 10 }

// Progressive bonuses per ascension count (0-indexed by count-1)
export const ASCENSION_BONUSES = [
  { label: '+25% Produktion',                   prodMult: 1.25 },
  { label: '+50% Produktion',                   prodMult: 1.50 },
  { label: '+50% Prod. + Kampf ×1.5',           prodMult: 1.50, combatMult: 1.5 },
  { label: '+100% Produktion',                  prodMult: 2.00 },
  { label: '+100% Prod. + alle Boni ×1.5',      prodMult: 2.00, allMult: 1.5 },
]

// ── Tagesquests ───────────────────────────────────────────────────────────────
// type must match either: a key in resources{} OR a key in stats{}
export const QUEST_POOL = [
  { id: 'q_seelen',    title: 'Seelenernte',    desc: 'Sammle 500 Seelen.',            type: 'seelen',     goal: 500,  reward: { seelen: 200, wissen: 10 } },
  { id: 'q_blut',      title: 'Blutopfer',      desc: 'Produziere 200 Blut.',          type: 'blut',       goal: 200,  reward: { blut: 100, seelen: 150 } },
  { id: 'q_knochen',   title: 'Knochen mahlen', desc: 'Sammle 300 Knochen.',           type: 'knochen',    goal: 300,  reward: { knochen: 150, seelen: 100 } },
  { id: 'q_schatten',  title: 'Schattenfall',   desc: 'Sammle 150 Schatten.',          type: 'schatten',   goal: 150,  reward: { schatten: 80, wissen: 15 } },
  { id: 'q_wissen',    title: 'Wissensschatz',  desc: 'Sammle 100 Wissen.',            type: 'wissen',     goal: 100,  reward: { wissen: 60, seelen: 200 } },
  { id: 'q_albtraum',  title: 'Albtraum',       desc: 'Erzeuge 50 Albträume.',         type: 'albtraeume', goal: 50,   reward: { albtraeume: 30, seelen: 350 } },
  { id: 'q_research',  title: 'Forscher',       desc: 'Erforsche eine Technologie.',   type: 'researched', goal: 1,    reward: { wissen: 50, seelen: 300 } },
  { id: 'q_summon',    title: 'Beschwörung',    desc: 'Beschwöre 2 Wesen.',            type: 'summoned',   goal: 2,    reward: { seelen: 400, knochen: 200 } },
  { id: 'q_boss',      title: 'Bosskampf',      desc: 'Besiege einen Boss.',           type: 'bossKilled', goal: 1,    reward: { seelen: 500, wissen: 40, leereFragmente: 3 } },
  { id: 'q_upgrade',   title: 'Gebäude-Ausbau', desc: 'Upgrade ein Gebäude.',          type: 'upgraded',   goal: 1,    reward: { seelen: 150, wissen: 20 } },
]
export const DAILY_QUEST_COUNT = 3

// Milestones: type must be a key in totalCollected{} OR stats{}
export const MILESTONES = [
  { id: 'm_seelen_1k',  title: 'Erste Schritte',     desc: '1.000 Seelen gesammelt.',    type: 'seelen',     goal: 1000,   reward: { wissen: 30 } },
  { id: 'm_seelen_10k', title: 'Das Ledger erwacht',  desc: '10.000 Seelen gesammelt.',   type: 'seelen',     goal: 10000,  reward: { wissen: 100, leereFragmente: 5 } },
  { id: 'm_seelen_50k', title: 'Aufstieg naht',       desc: '50.000 Seelen gesammelt.',   type: 'seelen',     goal: 50000,  reward: { abyssMarken: 1 } },
  { id: 'm_research_1', title: 'Erster Riss',         desc: 'Erste Technologie erforscht.',type: 'researched', goal: 1,     reward: { wissen: 50 } },
  { id: 'm_summon_1',   title: 'Dunkelheit fällt',    desc: 'Erstes Wesen beschworen.',   type: 'summoned',   goal: 1,      reward: { seelen: 200 } },
  { id: 'm_boss_1',     title: 'Erster Sieg',         desc: 'Ersten Boss besiegt.',       type: 'bossKilled', goal: 1,      reward: { wissen: 100, seelen: 500 } },
  { id: 'm_ascend_1',   title: 'Ewiger Aufstieg',     desc: 'Ersten Aufstieg vollzogen.', type: 'ascensions', goal: 1,      reward: { abyssMarken: 2 } },
]

// ── Achievements ──────────────────────────────────────────────────────────────
// type must match: a key in totalCollected{} OR a key in stats{}
export const ACHIEVEMENTS = [
  { id: 'a_s100',   icon: '💀', title: 'Erste Ernte',           desc: '100 Seelen.',         type: 'seelen',      goal: 100,         prodBonus: 0.01, label: '+1% Produktion' },
  { id: 'a_s1k',    icon: '💀', title: 'Seelensammler',         desc: '1.000 Seelen.',        type: 'seelen',      goal: 1000,        prodBonus: 0.02, label: '+2% Produktion' },
  { id: 'a_s10k',   icon: '💀', title: 'Archivar',              desc: '10.000 Seelen.',       type: 'seelen',      goal: 10000,       prodBonus: 0.05, label: '+5% Produktion' },
  { id: 'a_s100k',  icon: '💀', title: 'Seelenherr',            desc: '100.000 Seelen.',      type: 'seelen',      goal: 100000,      prodBonus: 0.10, label: '+10% Produktion' },
  { id: 'a_u1',     icon: '🏛️', title: 'Erster Stein',          desc: '1 Upgrade.',           type: 'upgraded',    goal: 1,           prodBonus: 0.00, label: 'Ehre genügt' },
  { id: 'a_u10',    icon: '🏛️', title: 'Baumeister',            desc: '10 Upgrades.',         type: 'upgraded',    goal: 10,          prodBonus: 0.03, label: '+3% Produktion' },
  { id: 'a_u50',    icon: '🏛️', title: 'Architekt des Bösen',   desc: '50 Upgrades.',         type: 'upgraded',    goal: 50,          prodBonus: 0.05, label: '+5% Produktion' },
  { id: 'a_r1',     icon: '📜', title: 'Wissbegierig',          desc: '1 Forschung.',         type: 'researched',  goal: 1,           prodBonus: 0.02, label: '+2% Produktion' },
  { id: 'a_r5',     icon: '📜', title: 'Gelehrter',             desc: '5 Forschungen.',       type: 'researched',  goal: 5,           prodBonus: 0.05, label: '+5% Produktion' },
  { id: 'a_r_all',  icon: '📜', title: 'Meister des Wissens',   desc: 'Alle Technologien.',   type: 'researched',  goal: 12,          prodBonus: 0.15, label: '+15% Produktion' },
  { id: 'a_sum1',   icon: '🔮', title: 'Beschwörer',            desc: '1 Wesen.',             type: 'summoned',    goal: 1,           prodBonus: 0.02, label: '+2% Produktion' },
  { id: 'a_sum10',  icon: '🔮', title: 'Herr der Toten',        desc: '10 Wesen.',            type: 'summoned',    goal: 10,          prodBonus: 0.05, label: '+5% Produktion' },
  { id: 'a_b1',     icon: '⚔️', title: 'Erste Trophäe',         desc: '1 Boss besiegt.',      type: 'bossKilled',  goal: 1,           prodBonus: 0.05, label: '+5% Produktion' },
  { id: 'a_b_all',  icon: '⚔️', title: 'Bezwinger der Dunklen', desc: 'Alle Bosse besiegt.',  type: 'bossKilled',  goal: 4,           prodBonus: 0.15, label: '+15% Produktion' },
  { id: 'a_asc1',   icon: '⬡',  title: 'Aufgestiegener',        desc: '1 Aufstieg.',          type: 'ascensions',  goal: 1,           prodBonus: 0.10, label: '+10% Produktion' },
  { id: 'a_asc5',   icon: '⬡',  title: 'Ewiger Archivar',       desc: '5 Aufstiege.',         type: 'ascensions',  goal: 5,           prodBonus: 0.25, label: '+25% Produktion' },
  { id: 'a_t1h',    icon: '⏱️', title: 'Eingeweiht',            desc: '1h gespielt.',         type: 'playTime',    goal: 3_600_000,   prodBonus: 0.01, label: '+1% Produktion' },
  { id: 'a_t10h',   icon: '⏱️', title: 'Besessen',              desc: '10h gespielt.',        type: 'playTime',    goal: 36_000_000,  prodBonus: 0.03, label: '+3% Produktion' },
]

// ── Ereignisse ────────────────────────────────────────────────────────────────
export const EVENTS = [
  {
    id: 'seelensturm', title: 'Seelensturm', icon: '🌪️', kind: 'positive',
    desc: 'Ein Sturm aus dem Jenseits treibt Seelen ins Ledger. Produktion ×2 für 60s.',
    accept: { buff: { type: 'prodMult', value: 2.0, duration: 60 } },
    acceptLabel: 'Annehmen', rejectLabel: 'Ablehnen', rejectCost: null,
  },
  {
    id: 'vergessener_schatz', title: 'Vergessener Schatz', icon: '💎', kind: 'positive',
    desc: 'Ein uraltes Lager verfluchter Ressourcen.',
    accept: { instant: { knochen: 200, seelen: 100 } },
    acceptLabel: 'Beanspruchen', rejectLabel: 'Ignorieren', rejectCost: null,
  },
  {
    id: 'dunkle_gabe', title: 'Dunkle Gabe', icon: '🎁', kind: 'positive',
    desc: 'Eine unbekannte Macht schenkt dir Ressourcen.',
    accept: { instant: { wissen: 50, leereFragmente: 3, seelen: 300 } },
    acceptLabel: 'Annehmen', rejectLabel: 'Zurückweisen', rejectCost: null,
  },
  {
    id: 'ledger_korruption', title: 'Ledger-Korruption', icon: '📕', kind: 'negative',
    desc: 'Das Buch löscht sich. Produktion ×0.5 für 45s.',
    accept: { buff: { type: 'prodMult', value: 0.5, duration: 45 } },
    acceptLabel: 'Hinnehmen', rejectLabel: 'Bekämpfen (100 Wissen)',
    rejectCost: { wissen: 100 },
  },
  {
    id: 'seelenkollaps', title: 'Seelenkollaps', icon: '💔', kind: 'negative',
    desc: 'Du verlierst 10% deiner aktuellen Seelen.',
    accept: { lossFrac: { seelen: 0.10 } },
    acceptLabel: 'Akzeptieren', rejectLabel: 'Abwehren (200 Schatten)',
    rejectCost: { schatten: 200 },
  },
  {
    id: 'teufelspakt', title: 'Teufelspakt', icon: '😈', kind: 'choice',
    desc: 'Produktion ×3 für 2min — kostet 30% deiner Knochen.',
    accept: { buff: { type: 'prodMult', value: 3.0, duration: 120 }, lossFrac: { knochen: 0.3 } },
    acceptLabel: 'Pakt eingehen', rejectLabel: 'Ablehnen', rejectCost: null,
  },
  {
    id: 'ritualversagen', title: 'Ritual-Versagen', icon: '🔥', kind: 'choice',
    desc: 'Ein Ritual schlug fehl. Nimm 20% Seelenverlust oder zahle 500 Blut.',
    accept: { lossFrac: { seelen: 0.20 } },
    acceptLabel: 'Schaden hinnehmen', rejectLabel: 'Blut opfern (500)',
    rejectCost: { blut: 500 },
  },
]

export const EVENT_MIN_MS = 3 * 60 * 1000   // 3 min minimum
export const EVENT_MAX_MS = 8 * 60 * 1000   // 8 min maximum

// ── XP ────────────────────────────────────────────────────────────────────────
export const xpToNext = (l) => Math.floor(100 * 1.5 ** (l - 1))

// ── Tutorial-Schritte ─────────────────────────────────────────────────────────
export const TUTORIAL = [
  {
    title: '📖 Willkommen in GrimLedger',
    body: 'Du hast ein verfluchtes Buch gefunden — das Grim Ledger. Es sammelt Seelen, Knochen, Blut. Dein Ziel: wachsen, aufsteigen, die Realität korrumpieren.\n\nDas Ledger läuft automatisch. Du entscheidest, wohin du investierst.',
    hint: 'Navigiere zu "Gebäude" →',
    goTo: 'gebaeude',
  },
  {
    title: '🏛️ Die Seelenquelle',
    body: 'Die Seelenquelle läuft bereits auf Stufe 1 und produziert Seelen pro Sekunde — automatisch, auch offline.\n\nKlicke "⬆️ Upgrade" um sie auf Stufe 2 zu bringen.',
    hint: 'Upgrade die Seelenquelle',
    goTo: null,
  },
  {
    title: '📜 Forschung',
    body: 'Drei Forschungspfade schalten neue Fähigkeiten frei:\n⚙️ Produktion — mehr Ressourcen\n🔮 Beschwörung — Wesen für Kämpfe\n💫 Korrumpierung — seltene Ressourcen\n\nStarte mit "Verdorbene Effizienz" wenn du 30 Wissen hast.',
    hint: 'Sammle Wissen durch Gebäude',
    goTo: 'forschung',
  },
  {
    title: '🔮 Wesen & Bosse',
    body: 'Nach der Forschung "Erste Beschwörung" kannst du Wesen rufen. Diese kämpfen automatisch gegen Bosse.\n\nBosse bringen seltene Belohnungen und Wissen.',
    hint: 'Erforsche "Erste Beschwörung"',
    goTo: 'beschwoerung',
  },
  {
    title: '⬡ Aufstieg',
    body: 'Bei Level 10 und 50.000 Seelen kannst du aufsteigen. Dein Fortschritt wird zurückgesetzt — aber du bekommst permanente Abyss-Marken.\n\nJeder Aufstieg macht dich dauerhaft stärker.',
    hint: 'Das Grim Ledger gehört dir. 🏴',
    goTo: null,
    last: true,
  },
]
