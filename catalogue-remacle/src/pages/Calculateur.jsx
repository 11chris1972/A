import { useState, useRef } from 'react';
import { Link } from 'wouter';
import {
  Truck, Plus, Minus, Trash2, ChevronRight, AlertTriangle,
  Package, FileDown, Search,
} from 'lucide-react';
import { products, categories, getCategoryById, truckConfig } from '../data/products';
import { useZone } from '../context/ZoneContext';
import {
  getTarifCamion,
  calcPrixBFA,
  BFA_RATES,
  BFA_LABELS,
  ZONES,
  GRUE_ZONES,
  ZONE_LABELS,
} from '../data/transport';

const TRUCK_MAX_KG = truckConfig.capaciteMaxKg;

function fmt(n, dec = 2) {
  if (n == null) return '—';
  return n.toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

// ─── Contact info for PDF ───────────────────────────────────────────────────
const CONTACT = {
  name: 'Christophe Decoster',
  title: 'Country Manager France',
  email: 'cdc@remacle.be',
  phone: '+32 (0)495 80 69 75',
  company: 'Remacle Béton S.A.',
  address: 'Rue sous la Ville 8',
  city: 'B-5150 Floriffoux (Belgique)',
  tel: '+32 (0)81 44 88 88',
  commercial: '+32 (0)81 44 88 75',
};

export default function Calculateur() {
  const { zone, setZone, truckType, setTruckType } = useZone();
  const printRef = useRef(null);

  // Cart: { productId, qty }[]
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQ, setSearchQ] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientRef, setClientRef] = useState('');

  // ─── Zone / truck helpers ───────────────────────────────────────────────
  const availableZones = truckType === 'grue' ? GRUE_ZONES : ZONES;

  function handleTruckTypeChange(val) {
    setTruckType(val);
    if (val === 'grue' && !GRUE_ZONES.includes(zone)) {
      setZone('Z3');
    }
  }

  // ─── Cart helpers ───────────────────────────────────────────────────────
  function addProduct(productId) {
    setCart(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        return prev.map(i => i.productId === productId ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { productId, qty: 1 }];
    });
  }

  function setQty(productId, qty) {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.productId !== productId));
    } else {
      setCart(prev => prev.map(i => i.productId === productId ? { ...i, qty } : i));
    }
  }

  function removeItem(productId) {
    setCart(prev => prev.filter(i => i.productId !== productId));
  }

  // ─── Calculations ───────────────────────────────────────────────────────
  const cartLines = cart.map(item => {
    const p = products.find(pr => pr.id === item.productId);
    if (!p) return null;

    const bfaRate = BFA_RATES[p.bfaCategory] ?? BFA_RATES.drainage;
    const diviseur = 1 - bfaRate;
    const hasPricing = p.prixNet != null;
    const tarifCamion = getTarifCamion(zone, truckType, p.volume);

    // Prix net total = prix net × quantité
    const prixNetTotal = hasPricing ? p.prixNet * item.qty : null;

    // Prix BFA unitaire = prix net / (1 - BFA%)
    const prixBFAUnit = hasPricing ? p.prixNet / diviseur : null;

    // Prix BFA total = prix net total / (1 - BFA%)
    const prixBFATotal = prixNetTotal != null ? prixNetTotal / diviseur : null;

    // Fraction camion par ligne
    const fractionTotal = p.fractionCamion != null ? p.fractionCamion * item.qty : null;

    // Poids total
    const poidsTotal = p.poids != null ? p.poids * item.qty : 0;

    return {
      ...item,
      product: p,
      bfaRate,
      diviseur,
      tarifCamion,
      prixNetTotal,
      prixBFAUnit,
      prixBFATotal,
      fractionTotal,
      poidsTotal,
    };
  }).filter(Boolean);

  // Totaux
  const totalPrixNet = cartLines.reduce((s, l) => s + (l.prixNetTotal ?? 0), 0);
  const totalPrixBFA = cartLines.reduce((s, l) => s + (l.prixBFATotal ?? 0), 0);
  const totalPoids = cartLines.reduce((s, l) => s + l.poidsTotal, 0);
  const totalFraction = cartLines.reduce((s, l) => s + (l.fractionTotal ?? 0), 0);

  // Nombre de camions (max entre poids et fraction)
  const camionsParPoids = totalPoids > 0 ? Math.ceil(totalPoids / TRUCK_MAX_KG) : 0;
  const camionsParFraction = totalFraction > 0 ? Math.ceil(totalFraction) : 0;
  const nbCamions = Math.max(camionsParPoids, camionsParFraction, cart.length > 0 ? 1 : 0);

  // Transport
  const tarifCamionZone = getTarifCamion(zone, truckType, null); // Use lourde by default for global
  const transportNet = tarifCamionZone != null ? tarifCamionZone * nbCamions : null;
  // BFA on transport: use drainage rate (15.25%) for transport
  const transportBFARate = BFA_RATES.drainage;
  const transportBFA = transportNet != null ? transportNet / (1 - transportBFARate) : null;

  // TOTAL OFFRE
  const totalOffre = totalPrixBFA + (transportBFA ?? 0);

  // ─── Product list ───────────────────────────────────────────────────────
  const availableProducts = products.filter(p => {
    if (p.prixNet == null) return false; // Skip items without pricing
    const matchCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const q = searchQ.toLowerCase();
    const matchSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.reference.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  // ─── PDF Export ─────────────────────────────────────────────────────────
  function handleExportPDF() {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Veuillez autoriser les popups pour exporter le PDF.');
      return;
    }

    const today = new Date().toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });

    const linesHTML = cartLines.map(l => `
      <tr>
        <td>${l.product.reference}</td>
        <td>${l.product.name}</td>
        <td class="center">${l.qty}</td>
        <td class="right">${fmt(l.product.prixNet)}&nbsp;&euro;</td>
        <td class="right">${fmt(l.prixNetTotal)}&nbsp;&euro;</td>
        <td class="center">${BFA_LABELS[l.product.bfaCategory] ?? '15,25%'}</td>
        <td class="right bold">${fmt(l.prixBFATotal)}&nbsp;&euro;</td>
      </tr>
    `).join('');

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Offre Remacle - ${clientName || 'Client'}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; font-size: 11px; color: #1a1a2e; padding: 20mm 15mm; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; border-bottom: 3px solid #2d5016; padding-bottom: 15px; }
    .logo-area h1 { font-size: 20px; color: #2d5016; margin-bottom: 2px; }
    .logo-area .sub { font-size: 10px; color: #666; }
    .client-area { text-align: right; }
    .client-area .label { font-size: 9px; color: #888; text-transform: uppercase; }
    .client-area .value { font-size: 12px; font-weight: bold; }
    .meta { display: flex; gap: 30px; margin-bottom: 15px; font-size: 10px; color: #555; }
    .meta strong { color: #1a1a2e; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th { background: #1a1a2e; color: white; padding: 6px 8px; text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; }
    td { padding: 5px 8px; border-bottom: 1px solid #e0e0e0; font-size: 10px; }
    tr:nth-child(even) td { background: #f8f9fa; }
    .right { text-align: right; }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .totals-table { width: 50%; margin-left: auto; }
    .totals-table td { border-bottom: 1px solid #ddd; padding: 4px 8px; }
    .totals-table .grand-total td { border-top: 2px solid #1a1a2e; border-bottom: none; font-size: 13px; font-weight: bold; color: #2d5016; padding-top: 8px; }
    .transport-row td { background: #f0f7ed !important; }
    .footer { margin-top: 30px; border-top: 2px solid #e0e0e0; padding-top: 15px; display: flex; justify-content: space-between; font-size: 9px; color: #666; }
    .footer .contact { line-height: 1.6; }
    .footer .contact strong { color: #1a1a2e; }
    .notes { margin-top: 15px; font-size: 9px; color: #888; border: 1px solid #e0e0e0; border-radius: 4px; padding: 10px; }
    @media print {
      body { padding: 10mm; }
      @page { margin: 10mm; size: A4 landscape; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-area">
      <h1>REMACLE B&Eacute;TON S.A.</h1>
      <div class="sub">Catalogue Pro &mdash; Offre de prix</div>
    </div>
    <div class="client-area">
      <div class="label">Client</div>
      <div class="value">${clientName || '—'}</div>
      ${clientRef ? `<div style="font-size:10px;color:#555;margin-top:2px;">R&eacute;f. : ${clientRef}</div>` : ''}
    </div>
  </div>

  <div class="meta">
    <div>Date : <strong>${today}</strong></div>
    <div>Zone : <strong>${ZONE_LABELS[zone]}</strong></div>
    <div>Livraison : <strong>${truckType === 'plateau' ? 'Camion Plateau' : 'Grue'}</strong></div>
    <div>Camions : <strong>${nbCamions}</strong></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>R&eacute;f.</th>
        <th>D&eacute;signation</th>
        <th class="center">Qt&eacute;</th>
        <th class="right">P.U. Net</th>
        <th class="right">Total Net</th>
        <th class="center">BFA</th>
        <th class="right">Total BFA</th>
      </tr>
    </thead>
    <tbody>
      ${linesHTML}
    </tbody>
  </table>

  <table class="totals-table">
    <tbody>
      <tr>
        <td>Total produits (net)</td>
        <td class="right">${fmt(totalPrixNet)}&nbsp;&euro;</td>
      </tr>
      <tr>
        <td>Total produits (BFA)</td>
        <td class="right bold">${fmt(totalPrixBFA)}&nbsp;&euro;</td>
      </tr>
      <tr class="transport-row">
        <td>Transport ${nbCamions} camion${nbCamions > 1 ? 's' : ''} ${zone} (net)</td>
        <td class="right">${fmt(transportNet)}&nbsp;&euro;</td>
      </tr>
      <tr class="transport-row">
        <td>Transport BFA (/ 0,8475)</td>
        <td class="right bold">${fmt(transportBFA)}&nbsp;&euro;</td>
      </tr>
      <tr class="grand-total">
        <td>TOTAL OFFRE TTC</td>
        <td class="right">${fmt(totalOffre)}&nbsp;&euro;</td>
      </tr>
    </tbody>
  </table>

  <div class="notes">
    <strong>Conditions :</strong> Prix HT hors taxe. Tarifs valables 30 jours.
    Transport inclus pour la zone ${zone}. BFA appliqu&eacute;e selon cat&eacute;gorie produit.
    Codes fournisseur : FB 51502 / CM 53454.
  </div>

  <div class="footer">
    <div class="contact">
      <strong>${CONTACT.name}</strong><br>
      ${CONTACT.title}<br>
      ${CONTACT.email}<br>
      ${CONTACT.phone}
    </div>
    <div class="contact" style="text-align:right;">
      <strong>${CONTACT.company}</strong><br>
      ${CONTACT.address}<br>
      ${CONTACT.city}<br>
      T&eacute;l : ${CONTACT.tel}<br>
      Service Commercial : ${CONTACT.commercial}
    </div>
  </div>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  }

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link href="/catalogue" className="hover:text-remacle-green">Catalogue</Link>
        <ChevronRight size={14} />
        <span className="text-remacle-navy font-medium">Calculateur d'offre</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-remacle-navy flex items-center gap-2">
          <Truck size={24} className="text-remacle-green" />
          Calculateur d'offre
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Sélectionnez les produits et quantités pour générer une offre de prix avec transport et BFA.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Product selector — left 3 cols */}
        <div className="lg:col-span-3 space-y-4">

          {/* Client info */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Nom du client</label>
                <input
                  type="text"
                  value={clientName}
                  onChange={e => setClientName(e.target.value)}
                  placeholder="Entreprise / Client"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-remacle-green"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1 block">Référence devis</label>
                <input
                  type="text"
                  value={clientRef}
                  onChange={e => setClientRef(e.target.value)}
                  placeholder="REF-2026-001"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-remacle-green"
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-remacle-green"
            >
              <option value="all">Toutes familles</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="flex-1 relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-remacle-green"
              />
            </div>
          </div>

          {/* Products table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Produits disponibles</span>
              <span className="text-xs text-gray-400">{availableProducts.length} produits</span>
            </div>
            <div className="divide-y divide-gray-100 max-h-[460px] overflow-y-auto">
              {availableProducts.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Package size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Aucun produit</p>
                </div>
              ) : (
                availableProducts.map(p => {
                  const inCart = cart.find(i => i.productId === p.id);
                  const bfaLabel = BFA_LABELS[p.bfaCategory] ?? '15,25%';
                  return (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-remacle-navy truncate">{p.name}</div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                          <span className="font-mono">{p.reference}</span>
                          {p.poids && (
                            <>
                              <span className="text-gray-300">|</span>
                              <span>{p.poids} kg</span>
                            </>
                          )}
                          <span className="text-gray-300">|</span>
                          <span>{fmt(p.prixNet)} €</span>
                          <span className="text-gray-300">|</span>
                          <span className="text-xs">BFA {bfaLabel}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => addProduct(p.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          inCart
                            ? 'bg-remacle-green/10 text-remacle-green border border-remacle-green/30'
                            : 'bg-remacle-green text-white hover:bg-remacle-green-dark'
                        }`}
                      >
                        <Plus size={13} />
                        {inCart ? `+1 (${inCart.qty})` : 'Ajouter'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Offer summary — right 2 cols */}
        <div className="lg:col-span-2 space-y-4" ref={printRef}>

          {/* Zone & truck selector for this offer */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Paramètres offre</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Zone</label>
                <select
                  value={zone}
                  onChange={e => setZone(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-remacle-green"
                >
                  {availableZones.map(z => (
                    <option key={z} value={z}>{ZONE_LABELS[z]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Livraison</label>
                <select
                  value={truckType}
                  onChange={e => handleTruckTypeChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-remacle-green"
                >
                  <option value="plateau">Camion Plateau</option>
                  <option value="grue">Grue</option>
                </select>
              </div>
            </div>
            {truckType === 'grue' && (
              <div className="mt-2 text-xs text-amber-600 bg-amber-50 rounded px-2 py-1.5 flex items-center gap-1.5">
                <AlertTriangle size={12} />
                Grue Z1–Z3 uniquement — Medium (≤10 000 L) ou Lourde (&gt;10 000 L)
              </div>
            )}
          </div>

          {/* Cart lines */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Lignes d'offre</span>
              {cart.length > 0 && (
                <button onClick={() => setCart([])} className="text-xs text-red-400 hover:text-red-600">
                  Tout vider
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Truck size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">Aucun produit ajouté</p>
                <p className="text-xs mt-1">Cliquez sur "Ajouter" à gauche</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {cartLines.map(line => (
                  <div key={line.productId} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-remacle-navy truncate">{line.product.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{line.product.reference}</div>
                      </div>
                      <button onClick={() => removeItem(line.productId)} className="text-gray-300 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      {/* Qty controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQty(line.productId, line.qty - 1)}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-gray-600"
                        >
                          <Minus size={12} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={line.qty}
                          onChange={e => setQty(line.productId, parseInt(e.target.value) || 1)}
                          className="w-14 text-center border border-gray-300 rounded text-sm py-0.5 font-mono focus:outline-none focus:ring-1 focus:ring-remacle-green"
                        />
                        <button
                          onClick={() => setQty(line.productId, line.qty + 1)}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-gray-600"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      {/* Line totals */}
                      <div className="text-right">
                        <div className="text-xs text-gray-400">
                          {fmt(line.product.prixNet)} × {line.qty} = {fmt(line.prixNetTotal)} € net
                        </div>
                        <div className="text-sm font-bold font-mono text-remacle-navy">
                          {fmt(line.prixBFATotal)} € <span className="text-xs font-normal text-gray-400">BFA</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          {cart.length > 0 && (
            <div className="bg-white rounded-xl border-2 border-remacle-green/30 p-5 space-y-3">
              <h3 className="font-bold text-remacle-navy text-sm">Récapitulatif offre</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Total produits (net)</span>
                  <span className="font-mono">{fmt(totalPrixNet)} €</span>
                </div>
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Total produits (BFA)</span>
                  <span className="font-mono">{fmt(totalPrixBFA)} €</span>
                </div>

                <div className="border-t border-gray-100 pt-2">
                  <div className="flex justify-between text-gray-500">
                    <span>
                      Transport {nbCamions} camion{nbCamions > 1 ? 's' : ''} {zone}
                      <span className="text-xs text-gray-400 ml-1">(net)</span>
                    </span>
                    <span className="font-mono">{fmt(transportNet)} €</span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>
                      Transport BFA
                      <span className="text-xs text-gray-400 ml-1">(/ 0,8475)</span>
                    </span>
                    <span className="font-mono">{fmt(transportBFA)} €</span>
                  </div>
                </div>

                <div className="flex justify-between text-gray-400 text-xs">
                  <span>Poids total : {totalPoids.toLocaleString('fr-FR')} kg ({(totalPoids / TRUCK_MAX_KG * 100).toFixed(0)}% capacité)</span>
                </div>

                <div className="flex justify-between items-end border-t-2 border-remacle-navy pt-3">
                  <span className="font-bold text-remacle-navy text-base">TOTAL OFFRE</span>
                  <span className="font-bold text-remacle-green text-xl font-mono">{fmt(totalOffre)} €</span>
                </div>
              </div>

              {/* Export button */}
              <button
                onClick={handleExportPDF}
                className="w-full flex items-center justify-center gap-2 bg-remacle-navy hover:bg-remacle-navy-light text-white font-semibold py-3 rounded-lg transition-colors text-sm mt-2"
              >
                <FileDown size={16} />
                Exporter PDF / Imprimer
              </button>
            </div>
          )}

          {/* Truck info */}
          {cart.length > 0 && (
            <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>Tarif camion {zone} :</span>
                <span className="font-mono">{fmt(tarifCamionZone)} € net</span>
              </div>
              <div className="flex justify-between">
                <span>Nb camions (poids) :</span>
                <span className="font-mono">{camionsParPoids}</span>
              </div>
              <div className="flex justify-between">
                <span>Nb camions (fraction) :</span>
                <span className="font-mono">{camionsParFraction}</span>
              </div>
              <div className="flex justify-between font-medium text-remacle-navy">
                <span>Nb camions retenu :</span>
                <span className="font-mono">{nbCamions}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
