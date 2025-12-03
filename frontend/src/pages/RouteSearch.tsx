import { useState } from 'react';
import StopAutocomplete from '../components/StopAutocomplete';

export default function RouteSearchPage() {
  const [origin, setOrigin] = useState({
    name: 'Keleti pályaudvar',
  });

  const [destination, setDestination] = useState({
    name: 'Deák Ferenc tér',
  });

  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getTypeColor = (type) => {
    const colors = {
      metro: 'bg-red-500',
      tram: 'bg-yellow-500',
      bus: 'bg-blue-500',
      rail: 'bg-purple-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const getTypeLabel = (type) => {
    const labels = {
      metro: '🚇 Metro',
      tram: '🚊 Tram',
      bus: '🚌 Bus',
      rail: '🚆 Rail',
    };
    return labels[type] || type;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRoutes([]);

    try {
      const response = await fetch('/api/routes/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originName: origin.name,
          destinationName: destination.name,
          maxTransfers: 3,
          preferredTypes: ['metro', 'tram', 'bus'],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.routes?.length > 0) {
        setRoutes(data.routes);
      } else {
        setError('No routes found. Try different locations.');
      }
    } catch (err) {
      console.error('Route search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRoute = async (route) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to save routes');
        return;
      }

      const response = await fetch('/api/routes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          originName: origin.name,
          destinationName: destination.name,
          notes: `${route.name} - ${route.duration} mins`,
          routeData: route,
        }),
      });

      if (response.ok) {
        alert('Route saved successfully!');
      } else {
        alert('Failed to save route');
      }
    } catch (err) {
      console.error('Error saving route:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🚀 Find Your Route</h1>
          <p className="text-gray-600">Search for transit routes across Budapest</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Search Form */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <div className="space-y-4">
                <StopAutocomplete
                  value={origin.name}
                  onChange={(name) => setOrigin({ ...origin, name })}
                  placeholder="Enter origin stop"
                  label="From"
                  icon="📍"
                />

                <StopAutocomplete
                  value={destination.name}
                  onChange={(name) => setDestination({ ...destination, name })}
                  placeholder="Enter destination stop"
                  label="To"
                  icon="🎯"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 transition-all"
                >
                  {loading ? '🔍 Searching...' : '🔍 Search Routes'}
                </button>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {routes.length > 0 && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                    Found {routes.length} route{routes.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">
            {routes.length > 0 ? (
              <div className="space-y-4">
                {routes.map((route, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 border-l-4 border-blue-500"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`${getTypeColor(route.type)} text-white px-3 py-1 rounded-full text-sm font-semibold`}
                          >
                            {getTypeLabel(route.type)}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900">{route.name}</h3>
                        </div>

                        {route.notes && (
                          <p className="text-sm text-gray-600 mb-3">{route.notes}</p>
                        )}

                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="bg-blue-50 p-3 rounded">
                            <div className="text-gray-600 text-xs">Duration</div>
                            <div className="font-bold text-gray-900">
                              {formatDuration(route.duration)}
                            </div>
                          </div>
                          <div className="bg-blue-50 p-3 rounded">
                            <div className="text-gray-600 text-xs">Distance</div>
                            <div className="font-bold text-gray-900">
                              {route.distance ? `${route.distance.toFixed(1)} km` : 'N/A'}
                            </div>
                          </div>
                          <div className="bg-blue-50 p-3 rounded">
                            <div className="text-gray-600 text-xs">Transfers</div>
                            <div className="font-bold text-gray-900">{route.transfers}</div>
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-gray-600">
                          <div className="font-semibold mb-1">Stops:</div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{route.stops[0]?.name}</span>
                            <span className="text-gray-400">→</span>
                            <span className="font-medium">
                              {route.stops[route.stops.length - 1]?.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSaveRoute(route)}
                        className="ml-4 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        💾 Mentés
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : !loading && routes.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-600 text-lg mb-4">Kezdj keresni, hogy megtaláld az elérhető útvonalakat</p>
                <div className="text-6xl mb-4">🗺️</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
