import { Link } from 'wouter';
import { FileText, Weight, Ruler } from 'lucide-react';

export default function ProductCard({ product, category }) {
  const dims = product.dimensions;
  const dimStr = dims
    ? Object.entries(dims)
        .map(([k, v]) => `${k === 'diametre' ? 'Ø' : k === 'longueur' ? 'L' : k === 'largeur' ? 'l' : k === 'hauteur' ? 'h' : k === 'epaisseur' ? 'e' : k}${v}`)
        .join(' × ')
    : null;

  return (
    <Link href={`/produit/${product.id}`}>
      <div className="bg-white rounded-xl border border-gray-200 hover:border-remacle-green hover:shadow-md transition-all duration-200 cursor-pointer group p-5">
        {/* Category badge */}
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
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          {product.poids && (
            <span className="flex items-center gap-1">
              <Weight size={12} />
              {product.poids} kg
            </span>
          )}
          {dimStr && (
            <span className="flex items-center gap-1">
              <Ruler size={12} />
              <span className="font-mono">{dimStr}</span>
            </span>
          )}
        </div>

        {/* Normes */}
        {product.normes && (
          <div className="flex flex-wrap gap-1 mt-3">
            {product.normes.map(n => (
              <span key={n} className="inline-block bg-remacle-navy/5 text-remacle-navy text-xs px-2 py-0.5 rounded font-mono">
                {n}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
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
