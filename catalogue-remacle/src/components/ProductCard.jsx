import { Link } from 'wouter';
import { FileText, Weight, Ruler, Euro, AlertTriangle } from 'lucide-react';
import { useZone } from '../context/ZoneContext';
import {
  getTarifCamion,
  calcTransportParArticle,
  calcPrixBFA,
  BFA_RATES,
  BFA_LABELS,
} from '../data/transport';

export default function ProductCard({ product, category }) {
  const { zone, truckType } = useZone();

  const dims = product.dimensions;
  const dimStr = dims
    ? Object.entries(dims)
        .map(([k, v]) =>
          `${k === 'diametre' ? 'Ø' : k === 'longueur' ? 'L' : k === 'largeur' ? 'l' : k === 'hauteur' ? 'h' : k === 'epaisseur' ? 'e' : k}${v}`
        )
        .join(' × ')
    : null;

  // ─── Calcul prix ──────────────────────────────────────────────────────────
  const hasPricing = product.prixNet != null && product.fractionCamion != null;
  let prixBFA = null;
  let transportParArticle = null;
  let tarifInvalid = false;

  if (hasPricing) {
    const tarifCamion = getTarifCamion(zone, truckType, product.volume);
    if (tarifCamion === null) {
      tarifInvalid = true;
    } else {
      const bfaRate = BFA_RATES[product.bfaCategory] ?? BFA_RATES.drainage;
      transportParArticle = calcTransportParArticle(tarifCamion, product.fractionCamion);
      prixBFA = calcPrixBFA(product.prixNet, transportParArticle, bfaRate);
    }
  }

  return (
    <Link href={`/produit/${product.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 hover:border-remacle-green hover:shadow-md transition-all duration-200 cursor-pointer group p-5 h-full flex flex-col">

        {/* Category badge + ref */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
            {category?.name}
          </span>
          <span className="font-mono text-xs text-gray-400">{product.reference}</span>
        </div>

        {/* Product name */}
        <h3 className="font-semibold text-remacle-navy group-hover:text-remacle-green transition-colors mb-1 text-base">
          {product.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{product.description}</p>

        {/* Technical info */}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
          {product.poids && (
            <span className="flex items-center gap-1">
              <Weight size={12} />
              {product.poids} kg
            </span>
          )}
          {product.volume && (
            <span className="flex items-center gap-1 font-mono">
              {product.volume.toLocaleString('fr-FR')} L
            </span>
          )}
          {dimStr && (
            <span className="flex items-center gap-1">
              <Ruler size={12} />
              <span className="font-mono">{dimStr}</span>
            </span>
          )}
        </div>

        {/* Price block */}
        {hasPricing && (
          <div className="mt-auto pt-3 border-t border-gray-100">
            {tarifInvalid ? (
              <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 rounded px-2 py-1.5">
                <AlertTriangle size={12} />
                Grue non disponible en {zone}
              </div>
            ) : (
              <div className="flex items-end justify-between gap-2">
                <div>
                  <div className="text-xs text-gray-400">
                    Net {product.prixNet?.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
                    {transportParArticle != null && (
                      <span className="ml-1 text-gray-400">
                        + transp. {transportParArticle.toFixed(2)} €
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Euro size={13} className="text-remacle-green" />
                    <span className="font-bold text-remacle-navy text-base font-mono">
                      {prixBFA?.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-gray-500">€ BFA / {product.unite}</span>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                  product.bfaCategory === 'drainage' ? 'bg-blue-50 text-blue-600'
                    : product.bfaCategory === 'gazon' ? 'bg-green-50 text-green-600'
                    : product.bfaCategory === 'caution' ? 'bg-gray-50 text-gray-600'
                    : 'bg-orange-50 text-orange-600'
                }`}>
                  BFA {BFA_LABELS[product.bfaCategory] ?? '15,25%'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className={`flex items-center justify-between pt-3 ${hasPricing ? 'mt-3 border-t border-gray-50' : 'mt-auto border-t border-gray-100'}`}>
          <span className="text-xs text-gray-400">Unité : {product.unite}</span>
          {product.ficheTechnique && (
            <span className="flex items-center gap-1 text-xs text-remacle-green font-medium">
              <FileText size={12} />
              Fiche technique
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
