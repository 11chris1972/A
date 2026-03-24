import { Link } from 'wouter';
import { ChevronRight, Weight, Ruler, FileText, CheckCircle, Package, ArrowLeft, Plus } from 'lucide-react';
import { getProductById, getCategoryById } from '../data/products';

export default function ProductDetail({ id, onAddToTruck }) {
  const product = getProductById(id);
  const category = product ? getCategoryById(product.categoryId) : null;

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-remacle-green">Accueil</Link>
        <ChevronRight size={14} />
        <Link href="/catalogue" className="hover:text-remacle-green">Catalogue</Link>
        <ChevronRight size={14} />
        <Link href={`/catalogue/${category?.id}`} className="hover:text-remacle-green">
          {category?.name}
        </Link>
        <ChevronRight size={14} />
        <span className="text-remacle-navy font-medium">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main info */}
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
                  <div className="font-bold text-remacle-navy font-mono">{product.volume.toLocaleString()} L</div>
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
          {product.normes && (
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
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Add to truck calculator */}
          <div className="bg-remacle-navy rounded-xl p-5 text-white">
            <div className="text-4xl mb-3">🚛</div>
            <h3 className="font-bold mb-2">Calculateur camion</h3>
            <p className="text-sm text-gray-300 mb-4">
              Ajoutez ce produit au calculateur de remplissage camion 25T pour optimiser votre commande.
            </p>
            <Link
              href={`/calculateur?product=${product.id}`}
              className="w-full flex items-center justify-center gap-2 bg-remacle-green hover:bg-remacle-green-dark text-white font-semibold py-2.5 rounded-lg transition-colors text-sm"
            >
              <Plus size={16} />
              Ajouter au calculateur
            </Link>
          </div>

          {/* No pricing notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Tarifs sur demande.</strong> Ce catalogue présente uniquement les données
              techniques des produits. Pour toute demande de prix, contactez votre commercial Remacle.
            </p>
          </div>

          {/* Back button */}
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
