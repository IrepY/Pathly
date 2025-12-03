import { useState, useRef, useEffect } from 'react';

interface Stop {
  id: number;
  name: string;
}

interface StopAutocompleteProps {
  value: string;
  onChange: (stop: string) => void;
  placeholder?: string;
  label?: string;
  icon?: string;
}

export default function StopAutocomplete({
  value,
  onChange,
  placeholder = 'Enter stop name',
  label = 'Stop',
  icon = '📍',
}: StopAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Stop[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch suggestions whenever search term changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchTerm.trim().length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/routes/stops/suggestions?search=${encodeURIComponent(searchTerm)}`);
        if (response.ok) {
          const data = await response.json();
          // Remove duplicates by name, keeping the first occurrence
          const uniqueStops = data.stops ? Array.from(
            new Map(data.stops.map((stop: Stop) => [stop.name, stop])).values()
          ) : [];
          setSuggestions(uniqueStops);
          setIsOpen(true);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (stop: Stop) => {
    setSearchTerm(stop.name);
    onChange(stop.name);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(newValue);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {icon} {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin h-5 w-5 text-blue-500">
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
          </div>
        )}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {suggestions.map((stop) => (
            <button
              key={stop.id}
              onClick={() => handleSelect(stop)}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
            >
              <div className="font-medium text-gray-900">{stop.name}</div>
            </button>
          ))}
        </div>
      )}

      {isOpen && searchTerm.trim().length >= 2 && suggestions.length === 0 && !loading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
          Nincs ilyen megálló: "{searchTerm}"
        </div>
      )}
    </div>
  );
}
