#!/usr/bin/env node
/**
 * Import script : convertit le JSON brut du catalogue Remacle
 * en fichier products-raw.json exploitable par l'application.
 *
 * Usage :
 *   node scripts/import-products.js <fichier-source.json>
 *
 * Format source attendu :
 *   art_no           - numéro article (string numérique) OU en-tête de section (texte)
 *   description      - description du produit
 *   dimension        - dimensions en string (ex: "30x30", "223")
 *   height_cm        - hauteur en cm (string)
 *   weight_kg        - poids en kg (string ou number)
 *   per_pallet       - quantité par palette
 *   frac_camion      - fraction camion (number ou null)
 *   bfa_pct          - taux BFA (0.1525, 0.06, 0.03, 0)
 *   prix_net_2026    - prix net € (number ou null → prix sur demande)
 *   zones            - objet avec tarifs par zone (optionnel)
 *
 * Les lignes avec art_no non-numérique sont des en-têtes de section.
 * Les produits avec art_no numérique et prix_net_2026=null conservent prixNet: null.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Category mapping ────────────────────────────────────────────────────────
// Maps section header keywords to app categories (first match wins)
const SECTION_CATEGORY_MAP = [
  // Eau & stockage
  {
    keywords: [
      'CITERNE', 'EAU DE PLUIE', 'TEMPO+', 'FILTRE', 'ANNEAU', 'PUITS',
      'INFILTRATION', 'BASSIN', 'CAVE', 'FOSSE', 'GRAISSAGE', 'DEBOURBEUR',
      'SEPTIQUE', 'SANICLAIR', 'DEGRAISSEUR', 'SEPARATEUR', 'EPURATION', 'CAUTION',
    ],
    category: 'eau',
  },
  // Regards & drainage
  {
    keywords: ['CHAMBRE', 'REGARD', 'BUSE', 'TUYAU', 'DRAIN', 'AVALOIR', 'GRILLE', 'CADRE', 'CUNETTE', 'PUISARD', 'TAMPON'],
    category: 'regards',
  },
  // Jardin & aménagement
  {
    keywords: ['TRADIVIN', 'DALLE GAZON', 'JARDIN', 'TERRASSE', 'MOBILIER', 'BANC', 'JARDINIERE', 'PAVE', 'GAZON'],
    category: 'jardin',
  },
  // Construction
  {
    keywords: [
      'LINTEAU', 'HOURDIS', 'PLANCHER', 'POUTR', 'ENTREVOUS', 'APPUI', 'SEUIL',
      'BLOC', 'AGGLO', 'PARPAING', 'MUR', 'FONDATION', 'CHAINAGE', 'PREFAB',
      'ASSELET', 'DISTANCEUR', 'COUVRE', 'ASPIRATEUR', 'FUMEE', 'MARCHE',
      'ESCALIER', 'BORDURE', 'ELEMENT', 'CLOTURE', 'DALLE', 'L ELEMENT',
    ],
    category: 'construction',
  },
];

function detectCategory(sectionHeader) {
  const upper = sectionHeader.toUpperCase();
  for (const { keywords, category } of SECTION_CATEGORY_MAP) {
    if (keywords.some(kw => upper.includes(kw))) {
      return category;
    }
  }
  return null; // null = keep current category (sub-header)
}

function bfaPctToCategory(bfaPct) {
  if (bfaPct == null) return 'drainage';
  const rate = typeof bfaPct === 'string' ? parseFloat(bfaPct) : bfaPct;
  if (rate === 0) return 'caution';
  if (Math.abs(rate - 0.1525) < 0.005 || Math.abs(rate - 0.153) < 0.005) return 'drainage';
  if (Math.abs(rate - 0.06) < 0.005) return 'sec';
  if (Math.abs(rate - 0.03) < 0.005) return 'gazon';
  return 'drainage';
}

function parseDimension(dimStr, heightCm) {
  if (!dimStr && !heightCm) return null;
  const dims = {};
  if (dimStr) {
    const str = String(dimStr).trim();
    // Formats: "LxlxH", "Lxl", "diameter" (single number)
    const parts = str.split(/[xX×]/);
    if (parts.length >= 3) {
      const [l, la, h] = parts.map(p => parseFloat(p));
      if (!isNaN(l)) dims.longueur = l;
      if (!isNaN(la)) dims.largeur = la;
      if (!isNaN(h)) dims.hauteur = h;
    } else if (parts.length === 2) {
      const [l, la] = parts.map(p => parseFloat(p));
      if (!isNaN(l)) dims.longueur = l;
      if (!isNaN(la)) dims.largeur = la;
    } else {
      const d = parseFloat(str);
      if (!isNaN(d)) dims.diametre = d;
    }
  }
  if (heightCm) {
    const h = parseFloat(String(heightCm));
    if (!isNaN(h) && !dims.hauteur) dims.hauteur = h;
  }
  return Object.keys(dims).length > 0 ? dims : null;
}

function run() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node scripts/import-products.js <source.json>');
    process.exit(1);
  }

  const sourceFile = resolve(args[0]);
  const raw = JSON.parse(readFileSync(sourceFile, 'utf-8'));

  if (!Array.isArray(raw)) {
    console.error('Le fichier source doit contenir un tableau JSON []');
    process.exit(1);
  }

  console.log(`Lecture de ${raw.length} entrées...`);

  // Initial category: first products are CHAMBRE DE VISITE (regards)
  let currentCategory = 'regards';
  let currentSubcategory = '';
  const products = [];
  const ids = new Set();
  let sectionCount = 0;
  let productCount = 0;

  for (const item of raw) {
    const artNo = String(item.art_no ?? '').trim();
    const description = String(item.description ?? '').trim();
    const prixNet = item.prix_net_2026;

    // Section header: art_no is non-numeric text
    if (!/^\d+$/.test(artNo)) {
      if (artNo) {
        const detectedCategory = detectCategory(artNo);
        if (detectedCategory !== null) {
          currentCategory = detectedCategory;
        }
        currentSubcategory = artNo;
        sectionCount++;
        console.log(`  Section: "${artNo}" → catégorie: ${currentCategory}`);
      }
      continue;
    }

    // Deduplicate IDs
    let id = artNo;
    if (ids.has(id)) {
      let suffix = 2;
      while (ids.has(`${artNo}-${suffix}`)) suffix++;
      id = `${artNo}-${suffix}`;
    }
    ids.add(id);

    const dims = parseDimension(item.dimension, item.height_cm);
    const fracCamion = item.frac_camion != null ? Number(item.frac_camion) : null;
    const bfaCat = bfaPctToCategory(item.bfa_pct);
    const poids = item.weight_kg != null ? Number(item.weight_kg) : null;
    const volume = item.volume != null ? Number(item.volume) : null;
    const unite = item.unite || 'pièce';
    const name = description || artNo;

    // Override category for DALLE GAZON products regardless of section
    let categoryId = currentCategory;
    if (description.toUpperCase().includes('DALLE GAZON')) {
      categoryId = 'jardin';
    }

    products.push({
      id,
      categoryId,
      subcategory: currentSubcategory,
      name,
      reference: artNo,
      description: name,
      dimensions: dims,
      poids,
      volume,
      unite,
      bfaCategory: bfaCat,
      prixNet: prixNet != null && prixNet !== '' ? Number(prixNet) : null,
      fractionCamion: fracCamion,
      perPallet: item.per_pallet != null ? Number(item.per_pallet) : null,
      normes: [],
      caracteristiques: [],
      ficheTechnique: false,
      image: null,
    });
    productCount++;
  }

  // Write output
  const outFile = resolve(__dirname, '../src/data/products-raw.json');
  writeFileSync(outFile, JSON.stringify(products, null, 2), 'utf-8');

  console.log('');
  console.log(`Terminé : ${productCount} produits importés dans ${sectionCount} sections.`);
  console.log(`Fichier : ${outFile}`);
  console.log('');
  console.log('Catégories :');
  const catCounts = {};
  for (const p of products) {
    catCounts[p.categoryId] = (catCounts[p.categoryId] || 0) + 1;
  }
  for (const [cat, count] of Object.entries(catCounts)) {
    console.log(`  ${cat}: ${count} produits`);
  }
}

run();
