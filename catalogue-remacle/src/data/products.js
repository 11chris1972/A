// Catalogue produits Remacle France
// Chargement depuis products-raw.json (généré par scripts/import-products.js)
// Fallback sur les produits inline si le JSON est vide.

import rawProducts from './products-raw.json';

// ─── Catégories ─────────────────────────────────────────────────────────────
export const categories = [
  {
    id: 'eau',
    name: 'Eau & stockage',
    description: 'Citernes béton, cuves de rétention et fosses toutes eaux',
    icon: '💧',
    color: 'bg-blue-50 border-blue-200',
    accentColor: 'text-blue-700',
  },
  {
    id: 'regards',
    name: 'Regards & drainage',
    description: 'Regards de visite, buses et tuyaux béton pour réseaux d\'assainissement',
    icon: '⬡',
    color: 'bg-cyan-50 border-cyan-200',
    accentColor: 'text-cyan-700',
  },
  {
    id: 'construction',
    name: 'Construction',
    description: 'Bordures, caniveaux, dalles, hourdis et éléments de soutènement',
    icon: '🧱',
    color: 'bg-orange-50 border-orange-200',
    accentColor: 'text-orange-700',
  },
  {
    id: 'jardin',
    name: 'Jardin & aménagement',
    description: 'Éléments de voirie, mobilier béton et aménagement extérieur',
    icon: '🌿',
    color: 'bg-green-50 border-green-200',
    accentColor: 'text-green-700',
  },
];

// ─── Produits de démonstration (fallback si JSON vide) ──────────────────────
const DEMO_PRODUCTS = [
  {
    id: 'CIT-10000-T50',
    categoryId: 'eau',
    name: 'Citerne 10000 T50',
    reference: 'CIT-10000-T50',
    description: 'Citerne béton armé 10 000 litres, format T50.',
    dimensions: { longueur: 4000, largeur: 1600, hauteur: 1800 },
    poids: 7500,
    volume: 10000,
    unite: 'pièce',
    bfaCategory: 'drainage',
    prixNet: 663.89,
    fractionCamion: 0.2,
    normes: ['NF EN 12566-3'],
    caracteristiques: ['Béton C40/50 étanche', 'Capacité 10 000 L'],
    ficheTechnique: true,
    image: null,
  },
  {
    id: 'CIT-15000-OV',
    categoryId: 'eau',
    name: 'Citerne 15000 Ovale',
    reference: 'CIT-15000-OV',
    description: 'Citerne béton armé 15 000 litres, format ovale.',
    dimensions: { longueur: 5000, largeur: 2200, hauteur: 1700 },
    poids: 11500,
    volume: 15000,
    unite: 'pièce',
    bfaCategory: 'drainage',
    prixNet: 1477.44,
    fractionCamion: 1 / 3,
    normes: ['NF EN 12566-3'],
    caracteristiques: ['Béton C40/50 étanche', 'Format ovale'],
    ficheTechnique: true,
    image: null,
  },
  {
    id: 'CIT-20000-T60',
    categoryId: 'eau',
    name: 'Citerne 20000 T60',
    reference: 'CIT-20000-T60',
    description: 'Citerne béton armé 20 000 litres, format T60.',
    dimensions: { longueur: 6000, largeur: 2000, hauteur: 2000 },
    poids: 16000,
    volume: 20000,
    unite: 'pièce',
    bfaCategory: 'drainage',
    prixNet: 2007.20,
    fractionCamion: 0.5,
    normes: ['NF EN 12566-3'],
    caracteristiques: ['Béton C40/50 étanche', 'Capacité 20 000 L'],
    ficheTechnique: true,
    image: null,
  },
];

// ─── Export des produits ────────────────────────────────────────────────────
export const products = (rawProducts && rawProducts.length > 0) ? rawProducts : DEMO_PRODUCTS;

// ─── Config camion ──────────────────────────────────────────────────────────
export const truckConfig = {
  capaciteMaxKg: 25000,
  capaciteMaxPalettes: 20,
  longueurPlateau: 13600,
  largeurPlateau: 2400,
  hauteurMax: 3000,
};

// ─── Helpers ────────────────────────────────────────────────────────────────
export function getProductsByCategory(categoryId) {
  return products.filter(p => p.categoryId === categoryId);
}

export function getProductById(id) {
  return products.find(p => p.id === id);
}

export function getCategoryById(id) {
  return categories.find(c => c.id === id);
}

/** Get unique subcategories within a category */
export function getSubcategories(categoryId) {
  const subs = new Set();
  for (const p of products) {
    if (p.categoryId === categoryId && p.subcategory) {
      subs.add(p.subcategory);
    }
  }
  return [...subs];
}
