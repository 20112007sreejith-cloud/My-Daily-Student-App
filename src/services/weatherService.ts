export interface DailyForecast {
  time: string;
  weathercode: number;
  temperature_2m_max: number;
  temperature_2m_min: number;
}

export interface WeatherData {
  current: {
    temperature: number;
    weathercode: number;
    humidity: number;
    windspeed: number;
    is_day: number;
  };
  daily: DailyForecast[];
  lastUpdated: string;
}

// Map WMO codes to human readable conditions and icons
export const getWeatherCondition = (code: number, isDay: boolean = true) => {
  // WMO Weather interpretation codes (WW)
  switch (code) {
    case 0: return { text: 'Clear', icon: isDay ? '☀️' : '🌙', type: 'clear' };
    case 1: 
    case 2: return { text: 'Partly Cloudy', icon: isDay ? '⛅' : '☁️', type: 'cloudy' };
    case 3: return { text: 'Overcast', icon: '☁️', type: 'cloudy' };
    case 45: 
    case 48: return { text: 'Fog', icon: '🌫️', type: 'cloudy' };
    case 51:
    case 53:
    case 55: return { text: 'Drizzle', icon: '🌧️', type: 'rain' };
    case 61:
    case 63:
    case 65: return { text: 'Rain', icon: '🌧️', type: 'rain' };
    case 71:
    case 73:
    case 75:
    case 77: return { text: 'Snow', icon: '❄️', type: 'cloudy' }; // Rare for AP, but mapped
    case 80:
    case 81:
    case 82: return { text: 'Showers', icon: '🌦️', type: 'rain' };
    case 95:
    case 96:
    case 99: return { text: 'Thunderstorm', icon: '⛈️', type: 'thunderstorm' };
    default: return { text: 'Unknown', icon: '☁️', type: 'cloudy' };
  }
};

const CACHE_KEY = 'vitap_weather_cache';
const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 mins

export const weatherService = {
  fetchVITAPWeather: async (): Promise<WeatherData> => {
    // Check cache
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < CACHE_DURATION_MS) {
          return parsed.data;
        }
      } catch (e) {
        // Cache invalid, proceed to fetch
      }
    }

    // Coordinates for VIT-AP University
    const lat = 16.4971;
    const lon = 80.5007;

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=Asia%2FKolkata&forecast_days=5`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch weather');
    }

    const data = await response.json();
    
    // Normalize data
    const dailyForecasts: DailyForecast[] = [];
    for (let i = 0; i < 5; i++) {
      dailyForecasts.push({
        time: data.daily.time[i],
        weathercode: data.daily.weather_code[i],
        temperature_2m_max: data.daily.temperature_2m_max[i],
        temperature_2m_min: data.daily.temperature_2m_min[i]
      });
    }

    const normalizedData: WeatherData = {
      current: {
        temperature: data.current.temperature_2m,
        weathercode: data.current.weather_code,
        humidity: data.current.relative_humidity_2m,
        windspeed: data.current.wind_speed_10m,
        is_day: data.current.is_day
      },
      daily: dailyForecasts,
      lastUpdated: new Date().toISOString()
    };

    // Save to cache
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      data: normalizedData
    }));

    return normalizedData;
  }
};
