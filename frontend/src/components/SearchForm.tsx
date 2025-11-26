import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useRouteStore } from '../stores/routeStore';
import { routeApi, RouteSearchRequest } from '../api/routes';
import { formatDuration, formatDistance } from '../utils/helpers';

const SearchForm: React.FC = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [optimization, setOptimization] = useState<'fastest' | 'least_transfers' | 'earliest_departure'>(
    'fastest'
  );
  const [departureTime, setDepartureTime] = useState('');
  const [error, setError] = useState('');

  const { setRoutes, setIsLoading, setError: setStoreError } = useRouteStore();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Input validation
    if (!origin || !destination) {
      setError('Kérlek adjál meg startot és célt');
      return;
    }

    setIsLoading(true);

    try {
      // Hardcoded coordinates for demo (normally would use geocoding API)
      const request: RouteSearchRequest = {
        originLat: 47.4979,
        originLon: 19.0402,
        destinationLat: 47.5,
        destinationLon: 19.05,
        optimization,
        departureTime: departureTime || new Date().toISOString(),
      };

      const result = await routeApi.search(request);
      setRoutes(result.routes || []);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Útvonal keresés sikertelen';
      setError(message);
      setStoreError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Indulási pont
          </label>
          <input
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Pl. Deák Ferenc tér"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Célállomás
          </label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Pl. Kossuth Lajos tér"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Optimalizálás
          </label>
          <select
            value={optimization}
            onChange={(e) =>
              setOptimization(
                e.target.value as 'fastest' | 'least_transfers' | 'earliest_departure'
              )
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="fastest">Leggyorsabb érkezés</option>
            <option value="least_transfers">Legkevesebb átszállás</option>
            <option value="earliest_departure">Legkorábbi indulás</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Indulási idő
          </label>
          <input
            type="datetime-local"
            value={departureTime}
            onChange={(e) => setDepartureTime(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && <div className="text-red-600 text-sm mb-4">{error}</div>}

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Útvonalak keresése
      </button>
    </form>
  );
};

export default SearchForm;
