import React, { useState } from 'react';
import { useWeather } from '../hooks/useWeather';
import { SpotlightCard } from '../../../components/ui/SpotlightCard';
import { getWeatherCondition, DailyForecast } from '../../../services/weatherService';
import { RefreshCw, Droplets, Wind, AlertCircle } from 'lucide-react';

export const WeatherCard: React.FC = () => {
  const { data, loading, error, refetch } = useWeather();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500); // minimum rotation animation time
  };

  if (loading && !data) {
    return (
      <SpotlightCard style={{ padding: '24px', minHeight: '200px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '60%', height: '24px', background: 'var(--glass-bg-2)', borderRadius: '4px' }} className="fade-in" />
        <div style={{ width: '40%', height: '16px', background: 'var(--glass-bg-2)', borderRadius: '4px' }} className="fade-in" />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--glass-bg-2)', borderRadius: '50%' }} className="fade-in float" />
        </div>
      </SpotlightCard>
    );
  }

  if (error || !data) {
    return (
      <SpotlightCard style={{ padding: '24px', minHeight: '200px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <AlertCircle size={32} color="var(--danger-color)" style={{ marginBottom: '16px' }} />
        <h3 className="text-card-title">Weather Unavailable</h3>
        <p className="text-metadata" style={{ margin: '8px 0 16px' }}>Unable to fetch the latest VIT-AP weather.</p>
        <button 
          onClick={handleRefresh}
          style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--glass-border)', background: 'var(--glass-bg-2)', color: 'var(--text-primary)', cursor: 'pointer' }}
        >
          Retry
        </button>
      </SpotlightCard>
    );
  }

  const currentCondition = getWeatherCondition(data.current.weathercode, data.current.is_day === 1);
  const todayForecast = data.daily[0];

  const renderWeatherAnimation = () => {
    switch (currentCondition.type) {
      case 'clear':
        return data.current.is_day ? (
          <div className="spin-slow" style={{ fontSize: '4rem', filter: 'drop-shadow(0 0 20px rgba(255, 214, 10, 0.5))' }}>☀️</div>
        ) : (
          <div className="float" style={{ fontSize: '4rem', filter: 'drop-shadow(0 0 20px rgba(255, 255, 255, 0.3))' }}>🌙</div>
        );
      case 'cloudy':
        return <div className="drift" style={{ fontSize: '4rem', filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.2))' }}>☁️</div>;
      case 'rain':
        return <div className="float" style={{ fontSize: '4rem', filter: 'drop-shadow(0 0 15px rgba(10, 132, 255, 0.4))' }}>🌧️</div>;
      case 'thunderstorm':
        return <div className="float" style={{ fontSize: '4rem', filter: 'drop-shadow(0 0 25px rgba(94, 92, 230, 0.6))' }}>⛈️</div>;
      default:
        return <div className="float" style={{ fontSize: '4rem' }}>{currentCondition.icon}</div>;
    }
  };

  const getDayName = (dateStr: string, index: number) => {
    if (index === 0) return 'Today';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <SpotlightCard style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 className="text-section-title" style={{ fontSize: '1.2rem', marginBottom: '4px' }}>VIT-AP UNIVERSITY</h3>
          <p className="text-metadata text-secondary">Amaravati, Andhra Pradesh</p>
        </div>
        <button 
          onClick={handleRefresh}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px' }}
          title="Refresh weather"
        >
          <RefreshCw size={16} className={isRefreshing ? 'spin-slow' : ''} style={{ animationDuration: '1s' }} />
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0', gap: '24px' }}>
        {renderWeatherAnimation()}
        <div>
          <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>{Math.round(data.current.temperature)}°</div>
          <div className="text-body" style={{ color: 'var(--text-secondary)', marginTop: '8px', fontWeight: 600 }}>{currentCondition.text}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '24px', borderBottom: '1px solid var(--glass-border)' }}>
        <div className="text-metadata" style={{ display: 'flex', gap: '16px' }}>
          <span>H {Math.round(todayForecast.temperature_2m_max)}°</span>
          <span>L {Math.round(todayForecast.temperature_2m_min)}°</span>
        </div>
        <div className="text-metadata" style={{ display: 'flex', gap: '16px' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Droplets size={12} /> {data.current.humidity}%</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Wind size={12} /> {data.current.windspeed} km/h</span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px' }}>
        {data.daily.map((day: DailyForecast, i: number) => {
          const condition = getWeatherCondition(day.weathercode, true);
          return (
            <div key={day.time} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: i === 0 ? 1 : 0.6 }}>
              <span className="text-metadata">{getDayName(day.time, i)}</span>
              <span style={{ fontSize: '1.2rem' }}>{condition.icon}</span>
              <span className="text-metadata" style={{ fontWeight: 600 }}>{Math.round(day.temperature_2m_max)}°</span>
            </div>
          );
        })}
      </div>
    </SpotlightCard>
  );
};
