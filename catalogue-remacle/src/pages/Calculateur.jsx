import { useState, useEffect } from 'react';
import { Link, useSearch } from 'wouter';
import { Truck, Plus, Minus, Trash2, ChevronRight, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import { products, categories, getCategoryById, truckConfig } from '../data/products';

const TRUCK_MAX_KG = truckConfig.capaciteMaxKg; // 25 000 kg

function TruckVisual({ loadPercent, weightPercent }) {
  const barColor =
    weightPercent > 95 ? 'bg-red-500' :
    weightPercent > 80 ? 'bg-orange-400' :
    'bg-remacle-green';

  return (
    <div className="relative w-full h-16 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
      <div
        className={`absolute left-0 top-0 h-full transition-all duration-500 ${barColor} opacity-80`}
        style={{ width: `${Math.min(loadPercent, 100)}%` }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-bold text-remacle-navy text-sm z-10">
          {weightPercent.toFixed(1)}% de la capacité
        </span>
      </div>
    </div>
  );
}

export default function Calculateur() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const preselectedProductId = params.get('product');

  // Cart: { productId, qty }[]
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQ, setSearchQ] = useState('');

  // Pre-add product from URL param
  useEffect(() => {
    if (preselectedProductId) {
      const p = products.find(p => p.id === preselectedProductId);
      if (p) {
        setCart([{ productId: p.id, qty: 1 }]);
        setSelectedCategory(p.categoryId);
      }
    }
  }, [preselectedProductId]);

  // ─── Cart helpers ─────────────────────────────────────────────────────
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

  // ─── Calculations ─────────────────────────────────────────────────────
  const cartDetails = cart.map(item => {
    const p = products.find(pr => pr.id === item.productId);
    return {
      ...item,
      product: p,
      totalKg: p ? p.poids * item.qty : 0,
    };
  });

  const totalKg = cartDetails.reduce((sum, i) => sum + i.totalKg, 0);
  const totalPieces = cart.reduce((sum, i) => sum + i.qty, 0);
  const weightPercent = (totalKg / TRUCK_MAX_KG) * 100;
  const remaining = TRUCK_MAX_KG - totalKg;
  const isOverload = totalKg > TRUCK_MAX_KG;

  // ─── Product list ──────────────────────────────────────────────────────
  const availableProducts = products.filter(p => {
    const matchCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const q = searchQ.toLowerCase();
    const matchSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.reference.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-remacle-green">Accueil</Link>
        <ChevronRight size={14} />
        <span className="text-remacle-navy font-medium">Calculateur camion 25T</span>
      </nav>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-remacle-navy flex items-center gap-2">
          <Truck size={24} className="text-remacle-green" />
          Calculateur de remplissage camion 25T
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Sélectionnez vos produits et quantités pour calculer le chargement optimal.
          Capacité max : {TRUCK_MAX_KG.toLocaleString()} kg.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Product selector — left 3 cols */}
        <div className="lg:col-span-3 space-y-4">
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
            <input
              type="text"
              placeholder="Rechercher un produit..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-remacle-green"
            />
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
                  return (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-remacle-navy truncate">{p.name}</div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                          <span className="font-mono">{p.reference}</span>
                          <span className="text-gray-300">|</span>
                          <span>{p.poids} kg/{p.unite}</span>
                          {p.dimensions?.diametre && (
                            <>
                              <span className="text-gray-300">|</span>
                              <span className="font-mono">Ø{p.dimensions.diametre}</span>
                            </>
                          )}
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

        {/* Load summary — right 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          {/* Truck gauge */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="text-2xl">🚛</div>
              <div>
                <div className="font-bold text-remacle-navy text-sm">Camion 25T</div>
                <div className="text-xs text-gray-500">Capacité : {TRUCK_MAX_KG.toLocaleString()} kg</div>
              </div>
            </div>

            <TruckVisual loadPercent={weightPercent} weightPercent={weightPercent} />

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Chargé</div>
                <div className={`font-bold font-mono text-lg ${isOverload ? 'text-red-600' : 'text-remacle-navy'}`}>
                  {totalKg.toLocaleString()} kg
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Disponible</div>
                <div className={`font-bold font-mono text-lg ${isOverload ? 'text-red-600' : 'text-remacle-green'}`}>
                  {isOverload ? '−' : ''}{Math.abs(remaining).toLocaleString()} kg
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Pièces</div>
                <div className="font-bold font-mono text-lg text-remacle-navy">{totalPieces}</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500 mb-1">Taux charge</div>
                <div className={`font-bold font-mono text-lg ${isOverload ? 'text-red-600' : weightPercent > 80 ? 'text-orange-500' : 'text-remacle-navy'}`}>
                  {weightPercent.toFixed(0)}%
                </div>
              </div>
            </div>

            {/* Alert */}
            {isOverload ? (
              <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                <span><strong>Surcharge !</strong> Le chargement dépasse la capacité maximale de {TRUCK_MAX_KG.toLocaleString()} kg. Réduisez les quantités.</span>
              </div>
            ) : weightPercent > 90 ? (
              <div className="mt-3 flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-700">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                <span><strong>Presque plein.</strong> Chargement optimal atteint.</span>
              </div>
            ) : cart.length > 0 ? (
              <div className="mt-3 flex items-start gap-2 bg-green-50 border border-green-200 rounded-lg p-3 text-xs text-green-700">
                <CheckCircle size={14} className="flex-shrink-0 mt-0.5" />
                <span>Chargement valide. Capacité restante : {remaining.toLocaleString()} kg.</span>
              </div>
            ) : null}
          </div>

          {/* Cart items */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Chargement</span>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-xs text-red-400 hover:text-red-600"
                >
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
                {cartDetails.map(({ productId, qty, product, totalKg: itemKg }) => (
                  <div key={productId} className="px-4 py-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-remacle-navy truncate">{product?.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{product?.reference}</div>
                      </div>
                      <button
                        onClick={() => removeItem(productId)}
                        className="text-gray-300 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      {/* Qty controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setQty(productId, qty - 1)}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-gray-600"
                        >
                          <Minus size={12} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={qty}
                          onChange={e => setQty(productId, parseInt(e.target.value) || 1)}
                          className="w-12 text-center border border-gray-300 rounded text-sm py-0.5 font-mono focus:outline-none focus:ring-1 focus:ring-remacle-green"
                        />
                        <button
                          onClick={() => setQty(productId, qty + 1)}
                          className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 text-gray-600"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      {/* Item weight */}
                      <div className="text-right">
                        <div className="text-xs font-mono font-semibold text-remacle-navy">{itemKg.toLocaleString()} kg</div>
                        <div className="text-xs text-gray-400">{((itemKg / TRUCK_MAX_KG) * 100).toFixed(1)}% camion</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
