import { useState } from 'react';
import { Link } from 'wouter';
import { Search, ChevronRight, Filter } from 'lucide-react';
import { categories, products, getCategoryById } from '../data/products';
import ProductCard from '../components/ProductCard';

export default function Catalogue({ categoryId }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(categoryId || 'all');

  const filtered = products.filter(p => {
    const matchCat = activeCategory === 'all' || p.categoryId === activeCategory;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      p.name.toLowerCase().includes(q) ||
      p.reference.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const currentCategory = activeCategory !== 'all' ? getCategoryById(activeCategory) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-remacle-green">Accueil</Link>
        <ChevronRight size={14} />
        <Link href="/catalogue" className="hover:text-remacle-green">Catalogue</Link>
        {currentCategory && (
          <>
            <ChevronRight size={14} />
            <span className="text-remacle-navy font-medium">{currentCategory.name}</span>
          </>
        )}
      </nav>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-56 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-remacle-navy">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Filter size={14} />
                Familles
              </h3>
            </div>
            <ul>
              <li>
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-100 flex items-center justify-between transition-colors ${
                    activeCategory === 'all'
                      ? 'bg-remacle-green/10 text-remacle-green font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>Tous les produits</span>
                  <span className="text-xs text-gray-400">{products.length}</span>
                </button>
              </li>
              {categories.map(cat => {
                const count = products.filter(p => p.categoryId === cat.id).length;
                return (
                  <li key={cat.id}>
                    <button
                      onClick={() => setActiveCategory(cat.id)}
                      className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-100 flex items-center justify-between transition-colors ${
                        activeCategory === cat.id
                          ? 'bg-remacle-green/10 text-remacle-green font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-xs text-gray-400">{count}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-remacle-navy">
                {currentCategory ? currentCategory.name : 'Tous les produits'}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {filtered.length} produit{filtered.length !== 1 ? 's' : ''}
              </p>
            </div>
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-remacle-green focus:border-transparent"
              />
            </div>
          </div>

          {/* Products grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  category={getCategoryById(product.categoryId)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <Package size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">Aucun produit trouvé</p>
              <p className="text-sm mt-1">Essayez d'autres critères de recherche</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
