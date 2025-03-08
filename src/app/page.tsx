"use client";

import { useState, useEffect, useCallback } from "react";
import { WeatherData, getWeatherData } from "@/utils/weather";
import SearchBar from "@/components/SearchBar";
import WeatherScene from "@/components/WeatherScene";

interface Location {
  name: string;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}

export default function Home() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(0); // 0 represents current day
  const [isCelsius, setIsCelsius] = useState(true);
  const [isNight, setIsNight] = useState(false);

  const convertTemp = (celsius: number) => {
    if (isCelsius) return celsius;
    return Math.round((celsius * 9) / 5 + 32);
  };

  const updateTimeOfDay = (timezone: number) => {
    const localTime = new Date();
    const utc = localTime.getTime() + localTime.getTimezoneOffset() * 60000;
    const locationTime = new Date(utc + 1000 * timezone);
    const hours = locationTime.getHours();
    setIsNight(hours < 6 || hours >= 18); // Night time between 6 PM and 6 AM
  };

  const fetchWeatherData = useCallback(async (lat: number, lon: number) => {
    try {
      setLoading(true);
      const data = await getWeatherData(lat, lon);
      setWeatherData(data);
      updateTimeOfDay(data.timezone);
      setError(null);
    } catch (err) {
      setError("Failed to fetch weather data. Please try again later.");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchCurrentLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await fetchWeatherData(latitude, longitude);
          },
          (err) => {
            setError(
              "Unable to get your location. Please use the search bar to find a location."
            );
            setLoading(false);
            console.error("Geolocation error:", err);
          }
        );
      } else {
        setError(
          "Geolocation is not supported by your browser. Please use the search bar to find a location."
        );
        setLoading(false);
      }
    };

    fetchCurrentLocation();
  }, [fetchWeatherData]);

  const handleLocationSelect = async (location: Location) => {
    setCurrentLocation(location);
    await fetchWeatherData(location.lat, location.lon);
  };

  const handleDaySelect = (index: number) => {
    setSelectedDay(index);
  };

  const getDisplayWeather = () => {
    if (!weatherData) return null;

    if (selectedDay === 0) {
      return {
        dayName: "Today",
        temp: convertTemp(weatherData.current.temp),
        condition: weatherData.current.condition,
        humidity: weatherData.current.humidity,
        windSpeed: weatherData.current.windSpeed,
        icon: weatherData.current.icon,
      };
    }

    const day = weatherData.forecast[selectedDay - 1];
    return {
      dayName: day.date,
      temp: convertTemp(day.temp),
      condition: day.condition,
      humidity: day.humidity || "N/A",
      windSpeed: day.windSpeed || "N/A",
      icon: day.icon,
    };
  };

  const getWeatherCondition = (weatherData: WeatherData) => {
    if (selectedDay === 0) {
      const condition = weatherData.current.condition.toLowerCase();
      console.log("Raw weather condition:", condition);
      return condition;
    }
    return weatherData.forecast[selectedDay - 1].condition.toLowerCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      {weatherData && (
        <WeatherScene
          condition={getWeatherCondition(weatherData)}
          isNight={isNight}
        />
      )}
      <main className="relative min-h-screen p-4 md:p-8" style={{ zIndex: 1 }}>
        <div className="relative max-w-4xl mx-auto">
          <div className="logo-container">
            <h1 className="logo text-white animate-float">Feather Weather</h1>
          </div>

          <SearchBar onLocationSelect={handleLocationSelect} />

          {error ? (
            <div
              className="relative bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-8 animate-fade-in body-font"
              role="alert"
            >
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          ) : null}

          {weatherData && (
            <div className="relative space-y-8 animate-fade-in">
              {currentLocation && (
                <div className="text-white text-center mb-4 animate-float">
                  <h2 className="text-2xl font-semibold title-font tracking-tight">
                    {currentLocation.name}
                    {currentLocation.state && `, ${currentLocation.state}`}
                    {currentLocation.country && `, ${currentLocation.country}`}
                  </h2>
                </div>
              )}

              {/* Weather Card */}
              {getDisplayWeather() && (
                <div className="glass rounded-3xl p-8 mb-8 transform hover:scale-[1.02] transition-all duration-300 relative">
                  <button
                    onClick={() => setIsCelsius(!isCelsius)}
                    className="absolute top-6 right-6 bg-white/25 hover:bg-white/30 text-white px-4 py-2 rounded-full transition-all duration-300 body-font text-sm flex items-center gap-2 backdrop-blur-sm border border-white/20 shadow-lg"
                  >
                    <span
                      className={
                        isCelsius ? "opacity-100 font-semibold" : "opacity-50"
                      }
                    >
                      °C
                    </span>
                    <div className="w-8 h-4 bg-black/20 rounded-full relative mx-1">
                      <div
                        className={`absolute w-3 h-3 bg-white rounded-full top-0.5 transition-all duration-300 ${
                          isCelsius ? "left-0.5" : "left-[18px]"
                        }`}
                      ></div>
                    </div>
                    <span
                      className={
                        !isCelsius ? "opacity-100 font-semibold" : "opacity-50"
                      }
                    >
                      °F
                    </span>
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="text-white">
                      <div className="text-2xl font-semibold text-white bg-white/10 inline-block px-4 py-1 rounded-full title-font tracking-wide mb-3">
                        {getDisplayWeather()?.dayName}
                      </div>
                      <div className="text-7xl font-light mb-4 animate-float title-font tracking-tight">
                        {getDisplayWeather()?.temp}°{isCelsius ? "C" : "F"}
                      </div>
                      <div className="text-3xl mb-4 animate-fade-in title-font">
                        {getDisplayWeather()?.condition}
                      </div>
                      <div className="space-y-3 body-font">
                        <p className="text-lg">
                          Humidity: {getDisplayWeather()?.humidity}%
                        </p>
                        <p className="text-lg">
                          Wind Speed: {getDisplayWeather()?.windSpeed} km/h
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="text-9xl animate-weather-icon">
                        {getDisplayWeather()?.icon}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5-Day Forecast */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 stagger-fade-in">
                <div
                  onClick={() => handleDaySelect(0)}
                  className={`glass rounded-2xl p-6 text-white text-center hover-scale cursor-pointer transition-all duration-300 ${
                    selectedDay === 0 ? "ring-2 ring-white" : ""
                  }`}
                >
                  <div className="text-lg font-medium mb-2 title-font">
                    Today
                  </div>
                  <div className="text-4xl mb-3 animate-weather-icon">
                    {weatherData.current.icon}
                  </div>
                  <div className="text-2xl mb-1 title-font tracking-tight">
                    {convertTemp(weatherData.current.temp)}°
                    {isCelsius ? "C" : "F"}
                  </div>
                  <div className="text-sm body-font">
                    {weatherData.current.condition}
                  </div>
                </div>

                {weatherData.forecast.map((day, index) => (
                  <div
                    key={index}
                    onClick={() => handleDaySelect(index + 1)}
                    className={`glass rounded-2xl p-6 text-white text-center hover-scale cursor-pointer transition-all duration-300 ${
                      selectedDay === index + 1 ? "ring-2 ring-white" : ""
                    }`}
                  >
                    <div className="text-lg font-medium mb-2 title-font">
                      {day.date}
                    </div>
                    <div className="text-4xl mb-3 animate-weather-icon">
                      {day.icon}
                    </div>
                    <div className="text-2xl mb-1 title-font tracking-tight">
                      {convertTemp(day.temp)}°{isCelsius ? "C" : "F"}
                    </div>
                    <div className="text-sm body-font">{day.condition}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
