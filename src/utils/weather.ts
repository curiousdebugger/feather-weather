const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5";

interface OpenWeatherCurrent {
  main: {
    temp: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  timezone: number;
}

interface OpenWeatherForecast {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      humidity: number;
    };
    weather: Array<{
      main: string;
      icon: string;
    }>;
    wind: {
      speed: number;
    };
  }>;
}

export interface WeatherData {
  current: {
    temp: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  };
  forecast: Array<{
    date: string;
    temp: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    icon: string;
  }>;
  timezone: number; // Timezone offset in seconds from UTC
}

const kelvinToCelsius = (kelvin: number): number => {
  return Math.round(kelvin - 273.15);
};

const getDayName = (date: Date): string => {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
};

export const getWeatherData = async (
  lat: number,
  lon: number
): Promise<WeatherData> => {
  try {
    // Fetch current weather
    const currentResponse = await fetch(
      `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    const currentData = await currentResponse.json();
    console.log("API Response - Current Weather:", currentData); // Debug log

    // Fetch 5-day forecast
    const forecastResponse = await fetch(
      `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}`
    );
    const forecastData = await forecastResponse.json();

    // Process current weather
    const current = {
      temp: kelvinToCelsius(currentData.main.temp),
      humidity: currentData.main.humidity,
      windSpeed: Math.round(currentData.wind.speed * 3.6), // Convert m/s to km/h
      condition: currentData.weather[0].main,
      icon: getWeatherIcon(currentData.weather[0].icon),
    };

    // Process forecast data
    const forecast = forecastData.list
      .filter(
        (_: OpenWeatherForecast["list"][0], index: number) => index % 8 === 0
      ) // Get one reading per day
      .slice(0, 5) // Get only 5 days
      .map((day: OpenWeatherForecast["list"][0]) => ({
        date: getDayName(new Date(day.dt * 1000)),
        temp: kelvinToCelsius(day.main.temp),
        humidity: day.main.humidity,
        windSpeed: Math.round(day.wind.speed * 3.6), // Convert m/s to km/h
        condition: day.weather[0].main,
        icon: getWeatherIcon(day.weather[0].icon),
      }));

    return { current, forecast, timezone: currentData.timezone };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
};

// Convert OpenWeather icon codes to emoji
const getWeatherIcon = (code: string): string => {
  const iconMap: { [key: string]: string } = {
    "01d": "☀️",
    "01n": "🌙",
    "02d": "⛅",
    "02n": "☁️",
    "03d": "☁️",
    "03n": "☁️",
    "04d": "☁️",
    "04n": "☁️",
    "09d": "🌧️",
    "09n": "🌧️",
    "10d": "🌦️",
    "10n": "🌧️",
    "11d": "⛈️",
    "11n": "⛈️",
    "13d": "❄️",
    "13n": "❄️",
    "50d": "🌫️",
    "50n": "🌫️",
  };
  return iconMap[code] || "☁️";
};
