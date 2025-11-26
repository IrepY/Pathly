import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRouteStore } from '../stores/routeStore';
import SearchForm from '../components/SearchForm';
import RouteResults from '../components/RouteResults';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { routes, isLoading, selectedRoute, setSelectedRoute } = useRouteStore();

  const handleSelectRoute = (route: any) => {
    setSelectedRoute(route);
    navigate('/route-details');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white py-16 px-4 shadow-lg">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl font-bold mb-4">🚌 Pathly - Okos Útvonaltervező</h2>
          <p className="text-xl text-blue-100 mb-2">
            Találd meg a leggyorsabb, legkényelmesebb útvonalat a közösségi közlekedésben
          </p>
          <p className="text-blue-200 text-lg">
            Optimalizált útvonalak, valós idejű frissítések, mentett kedvencek
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Villámgyors</h3>
            <p className="text-gray-600">Az optimális útvonalat másodpercek alatt találja meg.</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Személyre szabott</h3>
            <p className="text-gray-600">Válassz az optimalizálási stratégiák közül: leggyorsabb, legkevesebb átszállás vagy egyensúly.</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-4xl mb-3">⭐</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Mentett útvonalak</h3>
            <p className="text-gray-600">Mentsd el a gyakran használt útvonalaidat a gyors hozzáféréshez.</p>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-xl p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">🗺️ Útvonal keresése</h3>
          <SearchForm />
        </div>

        {/* Results Section */}
        {routes.length > 0 && (
          <div className="bg-white rounded-lg shadow-xl p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">
              📍 Talált útvonalak ({routes.length})
            </h3>
            <RouteResults
              routes={routes}
              isLoading={isLoading}
              onSelectRoute={handleSelectRoute}
            />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && routes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Még nincs keresés</h3>
            <p className="text-gray-600 text-lg">
              Adj meg egy kiindulási és végpontot az útvonal kereséséhez
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
