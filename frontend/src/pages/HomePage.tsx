import React, { useEffect } from 'react';
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
    <div>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Pathly - Okos Útvonaltervező</h2>
          <p className="text-xl text-blue-100">
            Találd meg a legjobb útvonalat a közösségi közlekedésben
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <SearchForm />

        {routes.length > 0 && (
          <RouteResults
            routes={routes}
            isLoading={isLoading}
            onSelectRoute={handleSelectRoute}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
