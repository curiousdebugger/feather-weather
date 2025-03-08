"use client";

import { useState, useEffect, useRef } from "react";
import { debounce } from "lodash";

interface Location {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

interface SearchBarProps {
  onLocationSelect: (location: Location) => void;
}

export default function SearchBar({ onLocationSelect }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = async (input: string) => {
    if (input.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=5&appid=${process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY}`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      setSuggestions([]);
    }
    setIsLoading(false);
  };

  const debouncedFetchSuggestions = debounce(fetchSuggestions, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
    debouncedFetchSuggestions(value);
  };

  const handleLocationSelect = (location: Location) => {
    setQuery(
      `${location.name}${location.state ? `, ${location.state}` : ""}, ${
        location.country
      }`
    );
    setShowSuggestions(false);
    onLocationSelect(location);
  };

  return (
    <div
      ref={searchContainerRef}
      className="relative w-full max-w-md mx-auto mb-8 animate-fade-in"
      style={{ zIndex: 1000 }}
    >
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search for a city..."
          className="w-full px-4 py-3 text-gray-700 bg-white/95 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 search-input-focus glass relative z-50"
        />
        {isLoading && (
          <div className="absolute right-3 top-3 z-50">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          className="fixed w-full max-w-md mt-2 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-scale-in"
          style={{ zIndex: 1000 }}
        >
          <div className="stagger-fade-in divide-y divide-gray-100">
            {suggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.lat}-${suggestion.lon}-${index}`}
                onClick={() => handleLocationSelect(suggestion)}
                className="w-full px-4 py-3 text-left text-gray-700 hover:bg-blue-50/90 transition-all duration-200 hover:pl-6 flex items-center gap-2"
              >
                <span className="text-blue-500">📍</span>
                <div>
                  <span className="font-medium">{suggestion.name}</span>
                  <span className="text-gray-500">
                    {suggestion.state && `, ${suggestion.state}`}
                    {suggestion.country && `, ${suggestion.country}`}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
