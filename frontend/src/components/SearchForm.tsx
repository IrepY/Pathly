import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useRouteStore } from '../stores/routeStore';
import { routeApi, RouteSearchRequest, Stop } from '../api/routes';
import { formatDuration, formatDistance } from '../utils/helpers';

const SearchForm: React.FC = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [optimization, setOptimization] = useState<'fastest' | 'least_transfers' | 'earliest_departure'>(
    'fastest'
  );
  const [departureTime, setDepartureTime] = useState('');
  const [error, setError] = useState('');
  
  const [originSuggestions, setOriginSuggestions] = useState<Stop[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<Stop[]>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestSuggestions, setShowDestSuggestions] = useState(false);

  const { setRoutes, setIsLoading, setError: setStoreError } = useRouteStore();
  
  const originInputRef = useRef<HTMLInputElement>(null);
  const destInputRef = useRef<HTMLInputElement>(null);

  // Fetch stop suggestions for origin
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (origin.length >= 2) {
        try {
          const result = await routeApi.getStopSuggestions(origin);
          setOriginSuggestions(result.stops || []);
          setShowOriginSuggestions(true);
        } catch (err) {
          console.error('Error fetching suggestions:', err);
        }
      } else {
        setOriginSuggestions([]);
        setShowOriginSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [origin]);

  // Fetch stop suggestions for destination
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (destination.length >= 2) {
        try {
          const result = await routeApi.getStopSuggestions(destination);
          setDestSuggestions(result.stops || []);
          setShowDestSuggestions(true);
        } catch (err) {
          console.error('Error fetching suggestions:', err);
        }
      } else {
        setDestSuggestions([]);
        setShowDestSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [destination]);

  const handleSelectOrigin = (stop: Stop) => {
    setOrigin(stop.name);
    setShowOriginSuggestions(false);
  };

  const handleSelectDestination = (stop: Stop) => {
    setDestination(stop.name);
    setShowDestSuggestions(false);
  };

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
      const request: RouteSearchRequest = {
        originName: origin.trim(),
        destinationName: destination.trim(),
        optimization,
        departureTime: departureTime || new Date().toISOString(),
      };

      const result = await routeApi.search(request);
      setRoutes(result.routes || []);
      
      if (!result.success) {
        setError('Nincs elérhető útvonal ezen a vonalon.');
        setStoreError('Nincs elérhető útvonal');
      }
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
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Indulási pont
          </label>
          <input
            ref={originInputRef}
            type="text"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            onFocus={() => origin.length >= 2 && setShowOriginSuggestions(true)}
            placeholder="Pl. Deák Ferenc tér"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {showOriginSuggestions && originSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 z-10">
              {originSuggestions.map((stop) => (
                <button
                  key={stop.id}
                  type="button"
                  onClick={() => handleSelectOrigin(stop)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0"
                >
                  {stop.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Célállomás
          </label>
          <input
            ref={destInputRef}
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onFocus={() => destination.length >= 2 && setShowDestSuggestions(true)}
            placeholder="Pl. Kossuth Lajos tér"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {showDestSuggestions && destSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mt-1 z-10">
              {destSuggestions.map((stop) => (
                <button
                  key={stop.id}
                  type="button"
                  onClick={() => handleSelectDestination(stop)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 border-b last:border-b-0"
                >
                  {stop.name}
                </button>
              ))}
            </div>
          )}
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
