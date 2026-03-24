import { Link, useLocation } from 'wouter';
import { Package, Truck, MapPin, ChevronDown } from 'lucide-react';
import { useZone } from '../context/ZoneContext';
import { ZONES, ZONE_LABELS, GRUE_ZONES } from '../data/transport';

export default function Header() {
  const [location] = useLocation();
  const { zone, setZone, truckType, setTruckType } = useZone();

  const navLinks = [
    { href: '/catalogue', label: 'Catalogue' },
    { href: '/calculateur', label: 'Calc. camion' },
  ];

  function handleTruckTypeChange(e) {
    const t = e.target.value;
    setTruckType(t);
    // Si on passe en Grue et que la zone actuelle n'est pas Z1-Z3, revenir à Z3
    if (t === 'grue' && !GRUE_ZONES.includes(zone)) {
      setZone('Z3');
    }
  }

  const availableZones = truckType === 'grue' ? GRUE_ZONES : ZONES;

  return (
    <header className="bg-remacle-navy shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">

          {/* Logo */}
          <Link href="/catalogue" className="flex items-center gap-3 group flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-remacle-green flex items-center justify-center">
              <Package size={20} className="text-white" />
            </div>
            <div className="leading-tight hidden sm:block">
              <div className="text-white font-bold text-base tracking-tight">Remacle France</div>
              <div className="text-green-300 text-xs font-medium">Catalogue Pro</div>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1">
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

          {/* Zone + Truck type selectors — permanent */}
          <div className="flex items-center gap-2 flex-shrink-0">

            {/* Zone selector */}
            <div className="flex items-center gap-1.5 bg-remacle-navy-light rounded-lg px-2.5 py-1.5 border border-white/10">
              <MapPin size={13} className="text-green-300 flex-shrink-0" />
              <label className="text-xs text-gray-400 hidden sm:block">Zone</label>
              <div className="relative">
                <select
                  value={zone}
                  onChange={e => setZone(e.target.value)}
                  className="appearance-none bg-transparent text-white text-sm font-semibold pr-5 focus:outline-none cursor-pointer"
                  title="Sélectionner la zone de livraison"
                >
                  {availableZones.map(z => (
                    <option key={z} value={z} className="bg-remacle-navy text-white">
                      {z}
                    </option>
                  ))}
                </select>
                <ChevronDown size={11} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Truck type selector */}
            <div className="flex items-center gap-1.5 bg-remacle-navy-light rounded-lg px-2.5 py-1.5 border border-white/10">
              <Truck size={13} className="text-green-300 flex-shrink-0" />
              <div className="relative">
                <select
                  value={truckType}
                  onChange={handleTruckTypeChange}
                  className="appearance-none bg-transparent text-white text-sm font-semibold pr-5 focus:outline-none cursor-pointer"
                  title="Type de camion"
                >
                  <option value="plateau" className="bg-remacle-navy text-white">Plateau</option>
                  <option value="grue" className="bg-remacle-navy text-white">Grue</option>
                </select>
                <ChevronDown size={11} className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Zone info bar — shown only when truck=grue and zone mismatch */}
      {truckType === 'grue' && (
        <div className="bg-amber-600/90 text-white text-xs text-center py-1 px-4">
          Grue disponible en Z1–Z3 uniquement — Medium (≤10 000 L) ou Lourde (&gt;10 000 L)
        </div>
      )}

      {/* Mobile nav */}
      <nav className="md:hidden border-t border-remacle-navy-light">
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
