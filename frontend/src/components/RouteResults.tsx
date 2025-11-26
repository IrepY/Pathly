import React from 'react';
import { formatDuration, formatDistance, formatTime } from '../utils/helpers';

interface Route {
  id: string;
  legs: any[];
  totalDuration: number;
  totalDistance: number;
  transfers: number;
  departureTime: string;
  arrivalTime: string;
}

interface RouteResultsProps {
  routes: Route[];
  isLoading: boolean;
  onSelectRoute: (route: Route) => void;
}

const RouteResults: React.FC<RouteResultsProps> = ({ routes, isLoading, onSelectRoute }) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full"></div>
        </div>
        <p className="mt-4 text-gray-600">Útvonalak számítása...</p>
      </div>
    );
  }

  if (routes.length === 0) {
    return (
      <div className="text-center py-8 bg-white rounded-lg">
        <p className="text-gray-500">Nincs elérhető útvonal. Próbálj másik szállást választani.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {routes.length} útvonal talált
      </h2>

      {routes.map((route) => (
        <div
          key={route.id}
          onClick={() => onSelectRoute(route)}
          className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Indulás</p>
              <p className="text-lg font-semibold text-gray-800">
                {formatTime(new Date(route.departureTime))}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Érkezés</p>
              <p className="text-lg font-semibold text-gray-800">
                {formatTime(new Date(route.arrivalTime))}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Idő</p>
              <p className="text-lg font-semibold text-blue-600">
                {formatDuration(route.totalDuration)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600">Átszállások</p>
              <p className="text-lg font-semibold text-gray-800">{route.transfers}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Távolság: {formatDistance(route.totalDistance)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RouteResults;
