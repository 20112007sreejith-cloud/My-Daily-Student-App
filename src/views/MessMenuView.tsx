import React, { useState, useEffect } from 'react';
import { GlassCard, GlassButton } from '../components/ui/GlassComponents';
import { storageService } from '../services/storageService';
import { MessDay, Meal } from '../models/types';
import { parseMessMenuExcel } from '../services/messMenuService';
import { Upload, Calendar as CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export const MessMenuView: React.FC = () => {
  const [messData, setMessData] = useState<MessDay[]>([]);
  const [selectedType, setSelectedType] = useState<'vegNonVeg' | 'special'>('vegNonVeg');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const data = storageService.getMessMenu();
    setMessData(data);
    if (data.length > 0) {
      // Find today's menu, or default to the first one available
      const todayStr = format(new Date(), 'yyyy-MM-dd');
      const todayMenu = data.find(d => d.date === todayStr);
      setSelectedDate(todayMenu ? todayStr : data[0].date);
    }
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const parsedData = await parseMessMenuExcel(file);
      storageService.saveMessMenu(parsedData);
      setMessData(parsedData);
      if (parsedData.length > 0) setSelectedDate(parsedData[0].date);
    } catch (err) {
      console.error(err);
      alert('Failed to parse Mess Menu.');
    } finally {
      setIsUploading(false);
    }
  };

  const currentMenu = messData.find(d => d.date === selectedDate);
  const activeMeals: Meal[] = currentMenu ? currentMenu[selectedType] : [];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 className="text-large-title">Mess Menu</h2>
        <div>
          <input 
            type="file" 
            id="mess-upload" 
            accept=".xlsx, .xls" 
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <GlassButton onClick={() => document.getElementById('mess-upload')?.click()}>
            <Upload size={16} style={{ marginRight: '8px' }} />
            {isUploading ? 'Parsing...' : 'Import Excel'}
          </GlassButton>
        </div>
      </header>

      {messData.length === 0 && !isUploading ? (
        <GlassCard style={{ padding: '64px 32px', textAlign: 'center' }}>
          <h3 className="text-section-title" style={{ marginBottom: '16px' }}>Mess menu unavailable</h3>
          <p className="text-body text-secondary" style={{ marginBottom: '24px' }}>
            Upload the VIT-AP Mess Menu Excel file to view meals.
          </p>
          <GlassButton onClick={() => document.getElementById('mess-upload')?.click()}>
            Import Excel
          </GlassButton>
        </GlassCard>
      ) : (
        <>
          <div className="glass-panel" style={{ display: 'flex', padding: '8px', marginBottom: '24px' }}>
            <button
              onClick={() => setSelectedType('vegNonVeg')}
              style={{
                flex: 1, padding: '12px', borderRadius: '16px', border: 'none',
                background: selectedType === 'vegNonVeg' ? 'var(--glass-bg-3)' : 'transparent',
                color: selectedType === 'vegNonVeg' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: selectedType === 'vegNonVeg' ? 700 : 500,
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              VEG & NON-VEG
            </button>
            <button
              onClick={() => setSelectedType('special')}
              style={{
                flex: 1, padding: '12px', borderRadius: '16px', border: 'none',
                background: selectedType === 'special' ? 'var(--glass-bg-3)' : 'transparent',
                color: selectedType === 'special' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: selectedType === 'special' ? 700 : 500,
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              SPECIAL
            </button>
          </div>

          <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '8px' }}>
            {messData.sort((a,b) => a.date.localeCompare(b.date)).map(day => (
              <GlassCard 
                key={day.date} 
                elevated={selectedDate === day.date}
                style={{ 
                  padding: '12px 16px', 
                  cursor: 'pointer',
                  minWidth: '120px',
                  textAlign: 'center',
                  background: selectedDate === day.date ? 'var(--glass-bg-3)' : 'var(--glass-bg-1)'
                }}
                onClick={() => setSelectedDate(day.date)}
              >
                <p className="text-metadata">{format(parseISO(day.date), 'EEE')}</p>
                <p className="text-body" style={{ fontWeight: 600 }}>{format(parseISO(day.date), 'MMM d')}</p>
              </GlassCard>
            ))}
          </div>

          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeMeals.length > 0 ? activeMeals.map((meal, idx) => {
              const timings: Record<string, string> = {
                'BREAKFAST': '07:00 AM - 09:00 AM',
                'LUNCH': '12:00 PM - 02:00 PM',
                'SNACKS': '04:45 PM - 06:00 PM',
                'DINNER': '07:30 PM - 09:00 PM'
              };
              const timeString = timings[meal.type.toUpperCase()] || '';

              return (
                <GlassCard key={idx} style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 className="text-card-title" style={{ color: 'var(--accent-color)', margin: 0 }}>
                      {meal.type}
                    </h3>
                    {timeString && <span className="text-metadata" style={{ color: 'var(--text-secondary)' }}>{timeString}</span>}
                  </div>
                  
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {meal.items.map((item, i) => {
                      const lowerItem = item.toLowerCase();
                      let color = 'var(--text-primary)';
                      if (lowerItem.includes('chicken')) color = '#ff3b30'; // Red
                      else if (lowerItem.includes('paneer')) color = '#ff9500'; // Orange
                      else if (lowerItem.includes('egg') || lowerItem.includes('edd') || lowerItem.includes('omblet') || lowerItem.includes('omelet') || lowerItem.includes('omlet')) color = '#ffd60a'; // Yellow
                      else if (lowerItem.includes('mushroom')) color = '#34c759'; // Green
                      else if (lowerItem.includes('soy') || lowerItem.includes('soya')) color = '#af52de'; // Purple
                      else if (lowerItem.includes('lemon water')) color = '#a3e635'; // Lime green

                      return (
                        <li key={i} className="text-body" style={{ 
                          padding: '8px 0', 
                          borderBottom: i < meal.items.length - 1 ? '1px solid var(--glass-border)' : 'none',
                          color: color,
                          fontWeight: color !== 'var(--text-primary)' ? 600 : 400
                        }}>
                          {item}
                        </li>
                      );
                    })}
                  </ul>
                </GlassCard>
              );
            }) : (
              <GlassCard style={{ padding: '32px', textAlign: 'center' }}>
                <p className="text-body text-secondary">No meals found for this selection.</p>
              </GlassCard>
            )}
          </div>
        </>
      )}
    </div>
  );
};
