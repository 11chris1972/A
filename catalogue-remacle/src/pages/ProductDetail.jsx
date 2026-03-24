import { Link } from 'wouter';
import {
  ChevronRight, Weight, Ruler, FileText, CheckCircle,
  Package, ArrowLeft, Plus, Euro, Truck, AlertTriangle, Info,
} from 'lucide-react';
import { getProductById, getCategoryById } from '../data/products';
import { useZone } from '../context/ZoneContext';
import {
  getTarifCamion,
  calcTransportParArticle,
  calcPrixBFA,
  calcTransportAvecBFA,
  BFA_RATES,
  BFA_LABELS,
  ZONES,
  GRUE_ZONES,
  ZONE_LABELS,
  PLATEAU_TARIFFS,
  GRUE_MEDIUM_TARIFFS,
  GRUE_LOURDE_TARIFFS,
} from '../data/transport';

function fmt(n, dec = 2) {
  return n?.toLocaleString('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

export default function ProductDetail({ id }) {
  const product = getProductById(id);
  const category = product ? getCategoryById(product.categoryId) : null;
  const { zone, setZone, truckType, setTruckType } = useZone();

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Package size={48} className="mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Produit introuvable</h2>
        <Link href="/catalogue" className="text-remacle-green hover:underline text-sm">
          Retour au catalogue
        </Link>
      </div>
    );
  }

  const dims = product.dimensions;
  const hasPricing = product.prixNet != null && product.fractionCamion != null;
  const bfaRate = BFA_RATES[product.bfaCategory] ?? BFA_RATES.drainage;
  const diviseur = 1 - bfaRate;

  // Calcul pour la zone courante
  const tarifCamion = hasPricing ? getTarifCamion(zone, truckType, product.volume) : null;
  const tarifInvalid = hasPricing && tarifCamion === null;
  const transportParArticle = tarifCamion != null ? calcTransportParArticle(tarifCamion, product.fractionCamion) : null;
  const prixBFA = transportParArticle != null ? calcPrixBFA(product.prixNet, transportParArticle, bfaRate) : null;
  const transportAvecBFA = tarifCamion != null ? calcTransportAvecBFA(tarifCamion, bfaRate) : null;

  // Table comparatif toutes zones
  const zonesForTable = truckType === 'grue' ? GRUE_ZONES : ZONES;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/catalogue" className="hover:text-remacle-green">Catalogue</Link>
        <ChevronRight size={14} />
        <Link href={`/catalogue/${category?.id}`} className="hover:text-remacle-green">
          {category?.name}
        </Link>
        <ChevronRight size={14} />
        <span className="text-remacle-navy font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ── Main info ───────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Title card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="inline-block bg-gray-100 text-gray-600 text-xs font-medium px-2 py-0.5 rounded mb-2">
                  {category?.name}
                </span>
                <h1 className="text-2xl font-bold text-remacle-navy">{product.name}</h1>
              </div>
              <span className="font-mono text-sm text-gray-400 bg-gray-50 px-3 py-1 rounded border border-gray-200 flex-shrink-0">
                {product.reference}
              </span>
            </div>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Technical specs */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-bold text-remacle-navy mb-4 flex items-center gap-2">
              <Ruler size={16} className="text-remacle-green" />
              Caractéristiques techniques
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
              {product.poids && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Poids unitaire</div>
                  <div className="font-bold text-remacle-navy font-mono">{product.poids} kg</div>
                </div>
              )}
              {product.volume && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">Volume</div>
                  <div className="font-bold text-remacle-navy font-mono">{product.volume.toLocaleString('fr-FR')} L</div>
                </div>
              )}
              {dims && Object.entries(dims).map(([key, val]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1 capitalize">
                    {key === 'diametre' ? 'Diamètre int.' :
                     key === 'longueur' ? 'Longueur' :
                     key === 'largeur' ? 'Largeur' :
                     key === 'hauteur' ? 'Hauteur' :
                     key === 'epaisseur' ? 'Épaisseur' : key}
                  </div>
                  <div className="font-bold text-remacle-navy font-mono">
                    {key === 'diametre' ? `Ø${val}` : val} mm
                  </div>
                </div>
              ))}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs text-gray-500 mb-1">Unité</div>
                <div className="font-bold text-remacle-navy">{product.unite}</div>
              </div>
            </div>

            {product.caracteristiques && (
              <>
                <h3 className="font-semibold text-remacle-navy text-sm mb-3">Points clés</h3>
                <ul className="space-y-2">
                  {product.caracteristiques.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle size={15} className="text-remacle-green flex-shrink-0 mt-0.5" />
                      {c}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Normes */}
          {product.normes && product.normes.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-remacle-navy mb-3 flex items-center gap-2">
                <FileText size={16} className="text-remacle-green" />
                Normes et certifications
              </h2>
              <div className="flex flex-wrap gap-2">
                {product.normes.map(n => (
                  <span
                    key={n}
                    className="font-mono text-sm bg-remacle-navy/5 border border-remacle-navy/15 text-remacle-navy px-3 py-1.5 rounded-lg"
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Prix comparatif toutes zones */}
          {hasPricing && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="font-bold text-remacle-navy mb-1 flex items-center gap-2">
                <Euro size={16} className="text-remacle-green" />
                Grille tarifaire — {truckType === 'plateau' ? 'Camion Plateau' : 'Grue'}
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Prix net fournisseur : <strong className="font-mono">{fmt(product.prixNet)} €</strong>
                {' '}— Fraction camion : <strong className="font-mono">{(product.fractionCamion * 100).toFixed(1)} %</strong>
                {' '}— BFA {BFA_LABELS[product.bfaCategory] ?? '15,25%'} (diviseur {fmt(diviseur, 4)})
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide">
                      <th className="text-left pb-2 font-semibold">Zone</th>
                      <th className="text-right pb-2 font-semibold">Tarif camion</th>
                      <th className="text-right pb-2 font-semibold">Transport/art.</th>
                      <th className="text-right pb-2 font-semibold">Net + Transp.</th>
                      <th className="text-right pb-2 font-semibold text-remacle-navy">Prix BFA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {zonesForTable.map(z => {
                      const tarif = getTarifCamion(z, truckType, product.volume);
                      if (tarif === null) return null;
                      const transp = calcTransportParArticle(tarif, product.fractionCamion);
                      const prix = calcPrixBFA(product.prixNet, transp, bfaRate);
                      const isActive = z === zone;
                      return (
                        <tr
                          key={z}
                          className={`border-b border-gray-100 cursor-pointer hover:bg-remacle-green/5 transition-colors ${
                            isActive ? 'bg-remacle-green/10' : ''
                          }`}
                          onClick={() => setZone(z)}
                          title={`Sélectionner ${z}`}
                        >
                          <td className="py-2.5 font-medium text-remacle-navy">
                            {isActive && <span className="inline-block w-1.5 h-1.5 rounded-full bg-remacle-green mr-1.5 align-middle" />}
                            {ZONE_LABELS[z]}
                          </td>
                          <td className="py-2.5 text-right font-mono text-gray-600">{fmt(tarif)} €</td>
                          <td className="py-2.5 text-right font-mono text-gray-600">{fmt(transp)} €</td>
                          <td className="py-2.5 text-right font-mono text-gray-600">{fmt(product.prixNet + transp)} €</td>
                          <td className={`py-2.5 text-right font-mono font-bold ${isActive ? 'text-remacle-green' : 'text-remacle-navy'}`}>
                            {fmt(prix)} €
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                <Info size={13} className="flex-shrink-0 mt-0.5 text-gray-400" />
                <span>
                  Formule : Prix BFA = (Prix Net + Transport/article) / {fmt(diviseur, 4)}.
                  Cliquez sur une ligne pour changer de zone.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Prix courant */}
          {hasPricing && (
            <div className="bg-white rounded-xl border-2 border-remacle-green/30 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-remacle-navy text-sm">Prix {zone}</h3>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  product.bfaCategory === 'drainage' ? 'bg-blue-50 text-blue-600'
                    : product.bfaCategory === 'gazon' ? 'bg-green-50 text-green-600'
                    : product.bfaCategory === 'caution' ? 'bg-gray-50 text-gray-600'
                    : 'bg-orange-50 text-orange-600'
                }`}>
                  BFA {BFA_LABELS[product.bfaCategory] ?? '15,25%'}
                </span>
              </div>

              {tarifInvalid ? (
                <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-3">
                  <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>Grue non disponible en {zone}. Choisissez Z1–Z3 ou passez en mode Plateau.</span>
                </div>
              ) : (
                <>
                  <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between text-gray-500">
                      <span>Prix net</span>
                      <span className="font-mono">{fmt(product.prixNet)} €</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Transport / article</span>
                      <span className="font-mono">+ {fmt(transportParArticle)} €</span>
                    </div>
                    <div className="flex justify-between text-gray-500 border-t border-gray-100 pt-2">
                      <span>Net + Transport</span>
                      <span className="font-mono">{fmt((product.prixNet ?? 0) + (transportParArticle ?? 0))} €</span>
                    </div>
                    <div className="flex justify-between text-gray-400 text-xs">
                      <span>÷ {fmt(diviseur, 4)}</span>
                    </div>
                    <div className="flex justify-between items-end border-t border-gray-200 pt-2">
                      <span className="font-semibold text-remacle-navy">Prix BFA</span>
                      <div className="text-right">
                        <span className="font-bold text-remacle-green text-xl font-mono">{fmt(prixBFA)} €</span>
                        <div className="text-xs text-gray-400">/ {product.unite}</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 border-t border-gray-100 pt-3">
                    Transport camion {truckType === 'plateau' ? 'plateau' : product.volume != null && product.volume <= 10000 ? 'grue medium' : 'grue lourde'} :
                    <span className="font-mono ml-1 text-remacle-navy">{fmt(tarifCamion)} €</span>
                    {transportAvecBFA != null && (
                      <span className="ml-1 text-gray-400">→ {fmt(transportAvecBFA)} € avec BFA</span>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Add to truck calculator */}
          <div className="bg-remacle-navy rounded-xl p-5 text-white">
            <div className="text-3xl mb-2">🚛</div>
            <h3 className="font-bold mb-1 text-sm">Calculateur camion</h3>
            <p className="text-xs text-gray-300 mb-3">
              Ajoutez ce produit au calculateur de remplissage 25T.
            </p>
            <Link
              href={`/calculateur?product=${product.id}`}
              className="w-full flex items-center justify-center gap-2 bg-remacle-green hover:bg-remacle-green-dark text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              <Plus size={15} />
              Ajouter au calculateur
            </Link>
          </div>

          {/* Back */}
          <Link
            href={`/catalogue/${category?.id}`}
            className="flex items-center gap-2 text-sm text-remacle-green hover:text-remacle-green-dark font-medium"
          >
            <ArrowLeft size={14} />
            Retour à {category?.name}
          </Link>
        </div>
      </div>
    </div>
  );
}
