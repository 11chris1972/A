// ─── Zones disponibles ─────────────────────────────────────────────────────
export const ZONES = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5', 'Z6'];
export const GRUE_ZONES = ['Z1', 'Z2', 'Z3'];

export const ZONE_LABELS = {
  Z1: 'Z1 — ≤150 km',
  Z2: 'Z2 — ≤180 km',
  Z3: 'Z3 — ≤250 km',
  Z4: 'Z4 — ≤300 km',
  Z5: 'Z5 — ≤400 km',
  Z6: 'Z6 — ≤500 km',
};

// ─── Tarifs nets €/camion ──────────────────────────────────────────────────
/** Camion Plateau (toutes zones) */
export const PLATEAU_TARIFFS = {
  Z1: 295,
  Z2: 370,
  Z3: 480,
  Z4: 600,
  Z5: 800,
  Z6: 950,
};

/** Grue Medium — citernes ≤ 10 000 L — Z1-Z3 uniquement */
export const GRUE_MEDIUM_TARIFFS = {
  Z1: 621,
  Z2: 707,
  Z3: 838,
};

/** Grue Lourde — citernes > 10 000 L — Z1-Z3 uniquement */
export const GRUE_LOURDE_TARIFFS = {
  Z1: 721,
  Z2: 832,
  Z3: 988,
};

// ─── Taux BFA ──────────────────────────────────────────────────────────────
/** BFA drainage / eau pluviale */
export const BFA_DRAINAGE = 0.1525;
/** BFA gamme sèche */
export const BFA_SEC = 0.06;
/** BFA dalles gazon */
export const BFA_GAZON = 0.03;
/** Pas de BFA (cautions, etc.) */
export const BFA_ZERO = 0;

export const BFA_RATES = {
  drainage: BFA_DRAINAGE,
  sec: BFA_SEC,
  gazon: BFA_GAZON,
  caution: BFA_ZERO,
};

export const BFA_LABELS = {
  drainage: '15,25%',
  sec: '6%',
  gazon: '3%',
  caution: '0%',
};

// ─── Helpers de calcul ─────────────────────────────────────────────────────

/**
 * Retourne le tarif net €/camion selon la zone et le type de camion.
 * @param {string} zone       ex. 'Z3'
 * @param {'plateau'|'grue'} truckType
 * @param {number} [volume]   volume en litres (nécessaire pour Grue)
 * @returns {number|null}     null si la combinaison est invalide (ex. Grue en Z4+)
 */
export function getTarifCamion(zone, truckType, volume) {
  if (truckType === 'plateau') {
    return PLATEAU_TARIFFS[zone] ?? null;
  }
  // Grue : Z1-Z3 uniquement
  if (!GRUE_ZONES.includes(zone)) return null;
  const tariffs = (volume != null && volume <= 10000) ? GRUE_MEDIUM_TARIFFS : GRUE_LOURDE_TARIFFS;
  return tariffs[zone] ?? null;
}

/**
 * Calcule le transport par article.
 * transportParArticle = tarifCamion × fractionCamion
 */
export function calcTransportParArticle(tarifCamion, fractionCamion) {
  return tarifCamion * fractionCamion;
}

/**
 * Calcule le prix avec BFA (formule correcte).
 * prixBFA = (prixNet + transportParArticle) / (1 − bfaRate)
 */
export function calcPrixBFA(prixNet, transportParArticle, bfaRate) {
  return (prixNet + transportParArticle) / (1 - bfaRate);
}

/**
 * Calcule le tarif transport affiché avec BFA.
 * transportAvecBFA = tarifNetCamion / (1 − bfaRate)
 */
export function calcTransportAvecBFA(tarifNetCamion, bfaRate) {
  return tarifNetCamion / (1 - bfaRate);
}
