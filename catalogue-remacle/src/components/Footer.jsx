export default function Footer() {
  return (
    <footer className="bg-remacle-navy-dark text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-3">Remacle France</h3>
            <p className="text-sm leading-relaxed">
              Catalogue produits béton préfabriqué pour les agences Frans Bonhomme et Chausson Matériaux.
            </p>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Catalogue</h3>
            <ul className="space-y-1 text-sm">
              <li>Regards de visite</li>
              <li>Buses et tuyaux</li>
              <li>Bordures et caniveaux</li>
              <li>Dalles et hourdis</li>
              <li>Murs et soutènement</li>
              <li>Fosses et cuves</li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-3">Outils</h3>
            <ul className="space-y-1 text-sm">
              <li>Calculateur remplissage camion 25T</li>
              <li>Fiches techniques produits</li>
            </ul>
            <p className="text-xs mt-4 text-gray-500">
              Usage interne — Données techniques uniquement.
              Pour les tarifs, contactez votre commercial Remacle.
            </p>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-6 pt-4 text-xs text-center">
          © {new Date().getFullYear()} Remacle France — Béton préfabriqué
        </div>
      </div>
    </footer>
  );
}
