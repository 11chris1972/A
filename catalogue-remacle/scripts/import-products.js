#!/usr/bin/env node
/**
 * Import script : convertit le JSON brut du catalogue Remacle
 * en fichier products-raw.json exploitable par l'application.
 *
 * Usage :
 *   node scripts/import-products.js <fichier-source.json>
 *
 * Le fichier source doit contenir un tableau JSON d'objets avec :
 *   art_no, description, frac_camion, bfa_pct, prix_net_2026,
 *   weight_kg, dimensions (optionnel), volume (optionnel), etc.
 *
 * Les lignes dont prix_net_2026 est null sont traitées comme
 * des en-têtes de section et servent à déterminer la catégorie.
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Category mapping ────────────────────────────────────────────────────────
// Maps section header keywords to app categories
const SECTION_CATEGORY_MAP = [
  // Eau & stockage
  { keywords: ['CITERNE', 'EAU DE PLUIE', 'SYSTEME', 'FOSSE', 'SEPARATEUR', 'GRAISSAGE', 'STOCKAGE EAU'], category: 'eau' },
  // Regards & drainage
  { keywords: ['REGARD', 'BUSE', 'CHAMBRE', 'TUYAU', 'DRAIN', 'AVALOIR', 'CANIVEAU', 'GRILLE', 'TAMPON', 'CUNETTE', 'PUISARD'], category: 'regards' },
  // Construction
  { keywords: ['LINTEAU', 'HOURDIS', 'PLANCHER', 'POUTR', 'ENTREVOUS', 'APPUI', 'SEUIL', 'BLOC', 'AGGLO', 'PARPAING', 'MUR', 'FONDATION', 'CHAINAGE', 'PREFAB'], category: 'construction' },
  // Jardin
  { keywords: ['DALLE', 'GAZON', 'BORDURE', 'PAVE', 'JARDIN', 'TERRASSE', 'MOBILIER', 'BANC', 'JARDINIERE'], category: 'jardin' },
];

function detectCategory(sectionHeader) {
  const upper = sectionHeader.toUpperCase();
  for (const { keywords, category } of SECTION_CATEGORY_MAP) {
    if (keywords.some(kw => upper.includes(kw))) {
      return category;
    }
  }
  // Default: construction
  return 'construction';
}

function bfaPctToCategory(bfaPct) {
  if (bfaPct == null) return 'drainage';
  const rate = typeof bfaPct === 'string' ? parseFloat(bfaPct) : bfaPct;
  if (Math.abs(rate - 0.1525) < 0.005 || Math.abs(rate - 0.153) < 0.005) return 'drainage';
  if (Math.abs(rate - 0.06) < 0.005) return 'sec';
  if (Math.abs(rate - 0.03) < 0.005) return 'gazon';
  if (rate === 0) return 'caution';
  return 'drainage';
}

function parseDescription(desc) {
  if (!desc) return { name: '', description: '' };
  // Use first meaningful part as name, full as description
  return { name: desc.trim(), description: desc.trim() };
}

function parseDimensions(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const dims = {};
  if (raw.diametre || raw.diameter) dims.diametre = raw.diametre || raw.diameter;
  if (raw.longueur || raw.length) dims.longueur = raw.longueur || raw.length;
  if (raw.largeur || raw.width) dims.largeur = raw.largeur || raw.width;
  if (raw.hauteur || raw.height) dims.hauteur = raw.hauteur || raw.height;
  if (raw.epaisseur || raw.thickness) dims.epaisseur = raw.epaisseur || raw.thickness;
  return Object.keys(dims).length > 0 ? dims : null;
}

function run() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('Usage: node scripts/import-products.js <source.json>');
    console.error('');
    console.error('Le fichier source.json doit contenir un tableau JSON.');
    console.error('Chaque objet doit avoir au minimum :');
    console.error('  art_no        - numéro article (string)');
    console.error('  description   - description du produit');
    console.error('  prix_net_2026 - prix net € (number ou null pour en-têtes)');
    console.error('  frac_camion   - fraction camion (number ou null)');
    console.error('  bfa_pct       - taux BFA (0.1525, 0.06, 0.03, 0)');
    console.error('  weight_kg     - poids en kg (number)');
    console.error('');
    console.error('Les lignes avec prix_net_2026 = null sont des en-têtes de section');
    console.error('et servent à déterminer la catégorie des produits qui suivent.');
    process.exit(1);
  }

  const sourceFile = resolve(args[0]);
  const raw = JSON.parse(readFileSync(sourceFile, 'utf-8'));

  if (!Array.isArray(raw)) {
    console.error('Le fichier source doit contenir un tableau JSON []');
    process.exit(1);
  }

  console.log(`Lecture de ${raw.length} entrées...`);

  let currentCategory = 'eau';
  let currentSubcategory = '';
  const products = [];
  const ids = new Set();
  let sectionCount = 0;
  let productCount = 0;

  for (const item of raw) {
    const artNo = String(item.art_no ?? '').trim();
    const description = String(item.description ?? '').trim();
    const prixNet = item.prix_net_2026;

    // Section header detection: no art_no or no prix_net
    if (!artNo || prixNet == null || prixNet === '' || prixNet === 0) {
      if (description) {
        currentCategory = detectCategory(description);
        currentSubcategory = description;
        sectionCount++;
        console.log(`  Section: "${description}" → catégorie: ${currentCategory}`);
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

    const { name } = parseDescription(description);
    const dims = parseDimensions(item.dimensions);
    const fracCamion = item.frac_camion != null ? Number(item.frac_camion) : null;
    const bfaCat = bfaPctToCategory(item.bfa_pct);
    const poids = item.weight_kg != null ? Number(item.weight_kg) : null;
    const volume = item.volume != null ? Number(item.volume) : null;
    const unite = item.unite || 'pièce';

    products.push({
      id,
      categoryId: currentCategory,
      subcategory: currentSubcategory,
      name,
      reference: artNo,
      description: name,
      dimensions: dims,
      poids,
      volume,
      unite,
      bfaCategory: bfaCat,
      prixNet: Number(prixNet),
      fractionCamion: fracCamion,
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
