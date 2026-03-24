import { Link } from 'wouter';
import { Package, Truck, ChevronRight, FileText } from 'lucide-react';
import { categories, products } from '../data/products';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-remacle-navy to-remacle-navy-dark text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-remacle-green/20 text-green-300 text-sm px-3 py-1 rounded-full mb-6 border border-remacle-green/30">
              <Package size={14} />
              Catalogue béton préfabriqué
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Remacle France<br />
              <span className="text-green-300">Catalogue Pro</span>
            </h1>
            <p className="text-gray-300 text-lg mb-8">
              Fiches techniques des produits béton préfabriqué pour les agences
              Frans Bonhomme et Chausson Matériaux.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/catalogue"
                className="inline-flex items-center gap-2 bg-remacle-green hover:bg-remacle-green-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Voir le catalogue
                <ChevronRight size={18} />
              </Link>
              <Link
                href="/calculateur"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-6 py-3 rounded-lg transition-colors border border-white/20"
              >
                <Truck size={18} />
                Calculateur camion 25T
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-remacle-green py-4 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-8 text-white text-sm font-medium">
          <span>{categories.length} familles de produits</span>
          <span>{products.length} références</span>
          <span>Fiches techniques incluses</span>
          <span>Calculateur camion 25T intégré</span>
        </div>
      </section>

      {/* Categories grid */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-remacle-navy mb-2">Familles de produits</h2>
          <p className="text-gray-500 mb-8">Sélectionnez une famille pour accéder aux fiches produits</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map(cat => {
              const count = products.filter(p => p.categoryId === cat.id).length;
              return (
                <Link key={cat.id} href={`/catalogue/${cat.id}`}>
                  <div className={`rounded-xl border-2 p-5 hover:shadow-md transition-all duration-200 cursor-pointer group ${cat.color}`}>
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{cat.icon}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-white/60 ${cat.accentColor}`}>
                        {count} réf.
                      </span>
                    </div>
                    <h3 className={`font-bold text-base mb-1 ${cat.accentColor} group-hover:underline`}>
                      {cat.name}
                    </h3>
                    <p className="text-sm text-gray-600">{cat.description}</p>
                    <div className="flex items-center gap-1 mt-3 text-xs font-medium text-gray-500">
                      Voir les produits <ChevronRight size={14} />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Truck calculator promo */}
      <section className="py-8 px-4 bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="bg-remacle-navy rounded-2xl p-8 flex flex-col md:flex-row items-center gap-6">
            <div className="text-5xl">🚛</div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-bold text-white mb-2">Calculateur de remplissage camion 25T</h3>
              <p className="text-gray-300">
                Optimisez vos commandes : sélectionnez vos produits et calculez automatiquement
                le chargement optimal pour un camion 25 tonnes.
              </p>
            </div>
            <Link
              href="/calculateur"
              className="flex-shrink-0 inline-flex items-center gap-2 bg-remacle-green hover:bg-remacle-green-dark text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <Truck size={18} />
              Lancer le calculateur
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
