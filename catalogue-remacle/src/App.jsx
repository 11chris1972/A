import { Route, Switch, Router, Redirect } from 'wouter';
import { ZoneProvider } from './context/ZoneContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Catalogue from './pages/Catalogue';
import ProductDetail from './pages/ProductDetail';
import Calculateur from './pages/Calculateur';

export default function App() {
  return (
    <ZoneProvider>
      <Router base="/A">
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <Switch>
              {/* Accueil → catalogue directement (pas de modale) */}
              <Route path="/">
                <Redirect to="/catalogue" />
              </Route>
              <Route path="/catalogue">
                <Catalogue />
              </Route>
              <Route path="/catalogue/:categoryId">
                {params => <Catalogue categoryId={params.categoryId} />}
              </Route>
              <Route path="/produit/:id">
                {params => <ProductDetail id={params.id} />}
              </Route>
              <Route path="/calculateur" component={Calculateur} />
              <Route>
                <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                  <h2 className="text-2xl font-bold text-remacle-navy mb-2">Page introuvable</h2>
                  <a href="/A/catalogue" className="text-remacle-green hover:underline">Retour au catalogue</a>
                </div>
              </Route>
            </Switch>
          </main>
          <Footer />
        </div>
      </Router>
    </ZoneProvider>
  );
}
