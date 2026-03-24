import { Link, useLocation } from 'wouter';
import { Package, Truck, ChevronRight } from 'lucide-react';

export default function Header() {
  const [location] = useLocation();

  const navLinks = [
    { href: '/', label: 'Accueil' },
    { href: '/catalogue', label: 'Catalogue' },
    { href: '/calculateur', label: 'Calc. camion' },
  ];

  return (
    <header className="bg-remacle-navy shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-lg bg-remacle-green flex items-center justify-center">
              <Package size={20} className="text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-white font-bold text-base tracking-tight">Remacle France</div>
              <div className="text-green-300 text-xs font-medium">Catalogue Pro</div>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  location === link.href
                    ? 'bg-remacle-green text-white'
                    : 'text-gray-300 hover:text-white hover:bg-remacle-navy-light'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Truck shortcut */}
          <Link
            href="/calculateur"
            className="flex items-center gap-2 bg-remacle-green hover:bg-remacle-green-dark text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Truck size={16} />
            <span className="hidden md:inline">Remplissage camion</span>
          </Link>
        </div>
      </div>

      {/* Mobile nav */}
      <nav className="sm:hidden border-t border-remacle-navy-light">
        <div className="flex">
          {navLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 text-center py-2 text-xs font-medium transition-colors ${
                location === link.href
                  ? 'bg-remacle-green text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
