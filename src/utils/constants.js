// ─── GRIM LEDGER — Spielkonstanten ───────────────────────────────────────────

export const TICK_MS    = 200   // 5 ticks/sec — smooth production
export const SAVE_KEY   = 'grimleger-save'   // NEVER change this — changing it wipes all saves
export const REPO_OWNER = 'P3rc1v4l'
export const REPO_NAME  = 'GrimLedger'

// ── Ressourcen ────────────────────────────────────────────────────────────────
export const RESOURCES = {
  seelen:      { name: 'Seelen',       icon: '💀', color: 'text-purple-400',  rare: false },
  knochen:     { name: 'Knochen',      icon: '🦴', color: 'text-stone-400',   rare: false },
  blut:        { name: 'Blut',         icon: '🩸', color: 'text-red-500',     rare: false },
  schatten:    { name: 'Schatten',     icon: '🌑', color: 'text-slate-400',   rare: false },
  erinnerungen:{ name: 'Erinnerungen', icon: '🌀', color: 'text-blue-400',    rare: false },
  asche:       { name: 'Asche',        icon: '🌫️', color: 'text-zinc-400',    rare: false },
  wissen:      { name: 'Wissen',       icon: '📖', color: 'text-amber-400',   rare: false },
  albtraeume:  { name: 'Albträume',    icon: '👁️', color: 'text-violet-400',  rare: false },
  // Seltene Ressourcen
  leereFragmente:{ name: 'Leere-Fragmente', icon: '✦', color: 'text-cyan-400',   rare: true },
  gottloseEssenz: { name: 'Gottl. Essenz', icon: '⚗️', color: 'text-emerald-400', rare: true },
  // Prestige-Währung
  abyssMarken: { name: 'Abyss-Marken', icon: '⬡', color: 'text-rose-300',   rare: true },
}

// ── Gebäude ───────────────────────────────────────────────────────────────────
export const BUILDINGS = {
  seelenquelle: {
    name: 'Seelenquelle',   icon: '💀', unlockCost: null, startLevel: 1, maxLevel: 20,
    desc: 'Zieht verlorene Seelen aus dem Nichts.',
    upgradeCost: (l) => ({ seelen: Math.floor(15 * Math.pow(1.4, l)) }),
    produces: (l) => ({ seelen: 0.2 * l }),
  },
  knochenmuehle: {
    name: 'Knochenmühle',   icon: '🦴', unlockCost: { seelen: 50 }, startLevel: 0, maxLevel: 20,
    desc: 'Mahlt die Überreste Gefallener zu rohen Knochen.',
    upgradeCost: (l) => ({ seelen: Math.floor(40 * Math.pow(1.4, l)), knochen: Math.floor(10 * Math.pow(1.3, l)) }),
    produces: (l) => ({ knochen: 0.15 * l }),
  },
  blutAltar: {
    name: 'Blut-Altar',     icon: '🩸', unlockCost: { seelen: 120, knochen: 80 }, startLevel: 0, maxLevel: 20,
    desc: 'Ein uralter Altar, der Blutopfer annimmt.',
    upgradeCost: (l) => ({ seelen: Math.floor(100 * Math.pow(1.45, l)), blut: Math.floor(20 * Math.pow(1.3, l)) }),
    produces: (l) => ({ blut: 0.1 * l, seelen: 0.05 * l }),
  },
  nachtKathedrale: {
    name: 'Nacht-Kathedrale', icon: '⛪', unlockCost: { seelen: 500, blut: 200 }, startLevel: 0, maxLevel: 20,
    desc: 'Heilige Stätte des ewigen Dunkels.',
    upgradeCost: (l) => ({ seelen: Math.floor(400 * Math.pow(1.5, l)), schatten: Math.floor(30 * Math.pow(1.35, l)) }),
    produces: (l) => ({ schatten: 0.12 * l, albtraeume: 0.02 * l }),
  },
  gedaechtnisGewolbe: {
    name: 'Gedächtnis-Gewölbe', icon: '🌀', unlockCost: { seelen: 1200, schatten: 400 }, startLevel: 0, maxLevel: 20,
    desc: 'Bewahrt gestohlene Erinnerungen gefallener Wesen.',
    upgradeCost: (l) => ({ seelen: Math.floor(900 * Math.pow(1.5, l)), erinnerungen: Math.floor(50 * Math.pow(1.4, l)) }),
    produces: (l) => ({ erinnerungen: 0.08 * l, wissen: 0.03 * l }),
  },
  aschekammer: {
    name: 'Aschekammer',    icon: '🌫️', unlockCost: { seelen: 3000, asche: 500 }, startLevel: 0, maxLevel: 20,
    desc: 'Was verbrannte, verbrannte nicht vollständig.',
    upgradeCost: (l) => ({ seelen: Math.floor(2000 * Math.pow(1.55, l)), asche: Math.floor(100 * Math.pow(1.4, l)) }),
    produces: (l) => ({ asche: 0.1 * l, leereFragmente: 0.005 * l }),
  },
  leereSpalte: {
    name: 'Leere-Spalte',   icon: '✦', unlockCost: { seelen: 10000, leereFragmente: 50 }, startLevel: 0, maxLevel: 10,
    desc: 'Ein Riss in der Realität. Produziert das Unmögliche.',
    upgradeCost: (l) => ({ seelen: Math.floor(8000 * Math.pow(1.6, l)), leereFragmente: Math.floor(30 * Math.pow(1.5, l)) }),
    produces: (l) => ({ leereFragmente: 0.02 * l, gottloseEssenz: 0.003 * l }),
  },
}

// ── Forschung ─────────────────────────────────────────────────────────────────
// Drei Pfade: Produktion | Beschwörung | Korrumpierung
export const RESEARCH = {
  // ── Produktion ──────────────────────────────────────────────
  verdorbeneEffizienz: {
    name: 'Verdorbene Effizienz', icon: '⚙️', path: 'produktion',
    desc: 'Alle Gebäude produzieren 25% mehr.',
    cost: { wissen: 30, seelen: 200 },
    requires: [],
    effect: { globalProdMult: 1.25 },
  },
  blutresonanz: {
    name: 'Blutresonanz', icon: '🩸', path: 'produktion',
    desc: 'Blut-Altar produziert doppelt so viel.',
    cost: { wissen: 60, blut: 100 },
    requires: ['verdorbeneEffizienz'],
    effect: { buildingMult: { blutAltar: 2.0 } },
  },
  schattenMultiplikation: {
    name: 'Schattenmultiplikation', icon: '🌑', path: 'produktion',
    desc: 'Schatten-Produktion ×3. Schaltet Nacht-Kathedrale-Upgrades frei.',
    cost: { wissen: 120, schatten: 200 },
    requires: ['blutresonanz'],
    effect: { buildingMult: { nachtKathedrale: 3.0 } },
  },
  endloseBuchfuehrung: {
    name: 'Endlose Buchführung', icon: '📖', path: 'produktion',
    desc: 'Wissen-Produktion ×5. Offline-Zeit +12h.',
    cost: { wissen: 300, erinnerungen: 200 },
    requires: ['schattenMultiplikation'],
    effect: { buildingMult: { gedaechtnisGewolbe: 5.0 }, offlineBonus: 12 },
  },
  // ── Beschwörung ─────────────────────────────────────────────
  ersteBeschwoerung: {
    name: 'Erste Beschwörung', icon: '🔮', path: 'beschwoerung',
    desc: 'Schaltet Dämonen-Beschwörung frei.',
    cost: { wissen: 50, seelen: 300 },
    requires: [],
    effect: { unlockSummon: true },
  },
  dunklePakte: {
    name: 'Dunkle Pakte', icon: '📜', path: 'beschwoerung',
    desc: 'Beschwörungen kosten 30% weniger.',
    cost: { wissen: 100, blut: 150 },
    requires: ['ersteBeschwoerung'],
    effect: { summonCostMult: 0.7 },
  },
  waechterbindung: {
    name: 'Wächterbindung', icon: '⛓️', path: 'beschwoerung',
    desc: 'Beschwörte Wesen kämpfen 40% effektiver.',
    cost: { wissen: 200, schatten: 300, knochen: 400 },
    requires: ['dunklePakte'],
    effect: { combatMult: 1.4 },
  },
  verloreneGoetter: {
    name: 'Verlorene Götter', icon: '👁️', path: 'beschwoerung',
    desc: 'Schaltet Götter-Klasse in Beschwörung frei.',
    cost: { wissen: 500, gottloseEssenz: 20 },
    requires: ['waechterbindung'],
    effect: { unlockGodClass: true },
  },
  // ── Korrumpierung ───────────────────────────────────────────
  realitaetsriss: {
    name: 'Realitätsriss', icon: '💫', path: 'korrumpierung',
    desc: 'Schaltet Leere-Spalte frei. +10% alle Ressourcen.',
    cost: { wissen: 80, leereFragmente: 10 },
    requires: [],
    effect: { unlockBuilding: 'leereSpalte', globalProdMult: 1.1 },
  },
  korrumpierteWahrnehmung: {
    name: 'Korrumpierte Wahrnehmung', icon: '🌀', path: 'korrumpierung',
    desc: 'Albträume produzieren Seelen. Seelen ×1.5.',
    cost: { wissen: 150, albtraeume: 100 },
    requires: ['realitaetsriss'],
    effect: { albtraeumeToSeelen: true, buildingMult: { seelenquelle: 1.5 } },
  },
  gottloseEssenzSynthese: {
    name: 'Gottlose Synthese', icon: '⚗️', path: 'korrumpierung',
    desc: 'Gottlose Essenz produziert alle anderen Ressourcen leicht.',
    cost: { wissen: 400, gottloseEssenz: 30 },
    requires: ['korrumpierteWahrnehmung'],
    effect: { essenzSynthese: true },
  },
  aufstiegVorbereitung: {
    name: 'Aufstiegs-Vorbereitung', icon: '⬡', path: 'korrumpierung',
    desc: 'Abyss-Marken-Gewinn beim Aufstieg ×2.',
    cost: { wissen: 800, gottloseEssenz: 60 },
    requires: ['gottloseEssenzSynthese'],
    effect: { prestigeMarksMult: 2.0 },
  },
}

// ── Beschwörbare Wesen ────────────────────────────────────────────────────────
export const SUMMONS = {
  skelettWaechter: {
    name: 'Skelett-Wächter', icon: '💀', tier: 1,
    cost: { knochen: 30, seelen: 20 },
    stats: { hp: 50, atk: 8, def: 4, crit: 0.05 },
    desc: 'Ein einfacher, aber verlässlicher Knochensoldat.',
  },
  blutDaemon: {
    name: 'Blut-Dämon', icon: '🩸', tier: 2,
    cost: { blut: 60, seelen: 80 },
    stats: { hp: 120, atk: 20, def: 8, crit: 0.12 },
    desc: 'Aus geronnenem Blut geformt. Gierig nach mehr.',
    requires: ['ersteBeschwoerung'],
  },
  schattenlaeufer: {
    name: 'Schattenläufer', icon: '🌑', tier: 2,
    cost: { schatten: 80, seelen: 100 },
    stats: { hp: 80, atk: 35, def: 3, crit: 0.25 },
    desc: 'Trifft, bevor man ihn sieht.',
    requires: ['ersteBeschwoerung'],
  },
  traumverschlinger: {
    name: 'Traumverschlinger', icon: '👁️', tier: 3,
    cost: { albtraeume: 120, seelen: 200, leereFragmente: 5 },
    stats: { hp: 300, atk: 45, def: 20, crit: 0.15 },
    desc: 'Nährt sich von Angst und Schlaf.',
    requires: ['dunklePakte'],
  },
  gottlosesFragment: {
    name: 'Gottloses Fragment', icon: '✦', tier: 4,
    cost: { gottloseEssenz: 15, seelen: 500 },
    stats: { hp: 800, atk: 120, def: 50, crit: 0.20 },
    desc: 'Ein Splitter einer toten Gottheit.',
    requires: ['verloreneGoetter'],
  },
}

// ── Bosse ─────────────────────────────────────────────────────────────────────
export const BOSSES = [
  {
    id: 'vergessenesEcho',
    name: 'Vergessenes Echo',     icon: '🌀', tier: 1,
    hp: 500,  atk: 15, def: 5,
    unlockCost: { seelen: 200 },
    reward: { seelen: 150, knochen: 80, wissen: 20 },
    desc: 'Das Echo einer vergessenen Seele. Schwach, aber beharrlich.',
  },
  {
    id: 'blutProphet',
    name: 'Blut-Prophet',         icon: '🩸', tier: 2,
    hp: 2000, atk: 40, def: 15,
    unlockCost: { seelen: 1000, blut: 500 },
    reward: { seelen: 800, blut: 300, wissen: 80, leereFragmente: 2 },
    desc: 'Er weissagte seinen eigenen Untergang. Er hatte recht.',
  },
  {
    id: 'schattenfuerst',
    name: 'Schattenfürst',        icon: '🌑', tier: 3,
    hp: 8000, atk: 90, def: 35,
    unlockCost: { seelen: 5000, schatten: 2000 },
    reward: { seelen: 3000, schatten: 1000, wissen: 300, leereFragmente: 8 },
    desc: 'Herrscht über das Nichts zwischen den Welten.',
  },
  {
    id: 'archivarDerLeere',
    name: 'Archivar der Leere',   icon: '📖', tier: 4,
    hp: 50000, atk: 250, def: 100,
    unlockCost: { seelen: 30000, gottloseEssenz: 50 },
    reward: { seelen: 15000, gottloseEssenz: 30, wissen: 1500, abyssMarken: 5 },
    desc: 'Dein Vorgänger. Er scheiterte. Du wirst es auch.',
  },
]

// ── Prestige ──────────────────────────────────────────────────────────────────
export const PRESTIGE_THRESHOLD = {
  seelen: 50000,
  level: 10,
}

export const ASCENSION_BONUSES = [
  { label: '+25% Produktion',          prodMult: 1.25, marksMult: 1.0 },
  { label: '+25% Prod., Beschwörung ×1.5', prodMult: 1.25, summonMult: 1.5, marksMult: 1.0 },
  { label: '+50% Produktion',          prodMult: 1.50, marksMult: 1.0 },
  { label: '+50% Prod., neue Forschung', prodMult: 1.50, unlockResearch: true, marksMult: 1.5 },
  { label: 'Alles ×2',                 prodMult: 2.00, summonMult: 2.0, marksMult: 2.0 },
]

// ── Tagesquests Pool ──────────────────────────────────────────────────────────
export const QUEST_POOL = [
  { id: 'q1',  title: 'Seelenernte',    desc: 'Sammle 500 Seelen.',              type: 'seelen',      goal: 500,   reward: { seelen: 200, wissen: 10 } },
  { id: 'q2',  title: 'Blutopfer',      desc: 'Produziere 200 Blut.',            type: 'blut',        goal: 200,   reward: { blut: 100, seelen: 150 } },
  { id: 'q3',  title: 'Knochen mahlen', desc: 'Sammle 300 Knochen.',             type: 'knochen',     goal: 300,   reward: { knochen: 150, seelen: 100 } },
  { id: 'q4',  title: 'Schattenfall',   desc: 'Sammle 150 Schatten.',            type: 'schatten',    goal: 150,   reward: { schatten: 80, wissen: 15 } },
  { id: 'q5',  title: 'Forschung',      desc: 'Erforscht 1 neue Technologie.',   type: 'researched',  goal: 1,     reward: { wissen: 50, seelen: 300 } },
  { id: 'q6',  title: 'Beschwörung',    desc: 'Beschwöre 2 Wesen.',             type: 'summoned',    goal: 2,     reward: { seelen: 400, knochen: 200 } },
  { id: 'q7',  title: 'Bosskampf',      desc: 'Besiege einen Boss.',             type: 'bossKilled',  goal: 1,     reward: { seelen: 500, wissen: 40, leereFragmente: 3 } },
  { id: 'q8',  title: 'Gebäude-Ausbau', desc: 'Upgrade ein Gebäude.',            type: 'upgraded',    goal: 1,     reward: { seelen: 150, wissen: 20 } },
  { id: 'q9',  title: 'Wissensschatz',  desc: 'Sammle 100 Wissen.',              type: 'wissen',      goal: 100,   reward: { wissen: 60, seelen: 200 } },
  { id: 'q10', title: 'Albtraum',       desc: 'Erzeuge 50 Albträume.',           type: 'albtraeume',  goal: 50,    reward: { albtraeume: 30, seelen: 350 } },
]
export const DAILY_QUEST_COUNT = 3

export const MILESTONE_QUESTS = [
  { id: 'm1', title: 'Erste Schritte',     desc: '1.000 Seelen gesammelt.',    type: 'seelen',     goal: 1000,   reward: { wissen: 30 },                     once: true },
  { id: 'm2', title: 'Das Ledger erwacht', desc: '10.000 Seelen gesammelt.',   type: 'seelen',     goal: 10000,  reward: { wissen: 100, leereFragmente: 5 }, once: true },
  { id: 'm3', title: 'Aufstieg naht',      desc: '50.000 Seelen gesammelt.',   type: 'seelen',     goal: 50000,  reward: { abyssMarken: 1 },                 once: true },
  { id: 'm4', title: 'Erster Riss',        desc: 'Forsche erste Technologie.', type: 'researched', goal: 1,      reward: { wissen: 50 },                     once: true },
  { id: 'm5', title: 'Dunkelheit fällt',   desc: 'Beschwöre erstes Wesen.',    type: 'summoned',   goal: 1,      reward: { seelen: 200 },                    once: true },
]

// ── XP-Kurve ──────────────────────────────────────────────────────────────────
export const xpToNext = (l) => Math.floor(100 * Math.pow(1.5, l - 1))
