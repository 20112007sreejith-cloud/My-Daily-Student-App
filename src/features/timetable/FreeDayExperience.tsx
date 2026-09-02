import React, { useEffect, useState } from 'react';
import { Coffee, Palmtree, Map, BatteryCharging } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassComponents';

export const FreeDayExperience: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [iconProps, setIconProps] = useState<{ icon: React.ReactNode, msg: string } | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour < 12) {
      setGreeting('Morning');
      setIconProps({ icon: (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'absolute', top: '-20px', left: '40%', width: '4px', height: '24px', background: 'var(--text-tertiary)', borderRadius: '2px', filter: 'blur(2px)', animation: 'float 3s ease-in-out infinite', opacity: 0.5 }} />
          <Coffee size={64} color="var(--accent-color)" strokeWidth={1.5} />
          <div style={{ width: '48px', height: '6px', background: 'var(--glass-border-strong)', borderRadius: '50%', marginTop: '4px' }} />
          <div style={{ position: 'absolute', top: '20%', left: '10%', animation: 'sakuraDrift 4s ease-in-out infinite', filter: 'none', width: '8px', height: '6px', background: 'var(--sakura-pink)', borderRadius: '10px 0' }} />
        </div>
      ), msg: "Quiet morning. Enjoy your tea 🍵" });
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Afternoon');
      setIconProps({ icon: (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Coffee size={64} color="var(--accent-color)" strokeWidth={1.5} />
          <div style={{ width: '48px', height: '6px', background: 'var(--glass-border-strong)', borderRadius: '50%', marginTop: '4px' }} />
          <div style={{ position: 'absolute', top: '40%', right: '15%', animation: 'sakuraDrift 5s ease-in-out infinite 1s', filter: 'none', width: '6px', height: '4px', background: 'var(--sakura-pink)', borderRadius: '10px 0' }} />
        </div>
      ), msg: "Clear afternoon. Find your focus 🌸" });
    } else if (hour >= 17 && hour < 20) {
      setGreeting('Evening');
      setIconProps({ icon: (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Coffee size={64} color="#b74a4a" strokeWidth={1.5} />
          <div style={{ width: '48px', height: '6px', background: 'var(--glass-border-strong)', borderRadius: '50%', marginTop: '4px' }} />
        </div>
      ), msg: "Evening approaches. Reflect on the day 🌅" });
    } else {
      setGreeting('Night');
      setIconProps({ icon: (
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Coffee size={64} color="#f0ece1" strokeWidth={1.5} />
          <div style={{ width: '48px', height: '6px', background: 'var(--glass-border-strong)', borderRadius: '50%', marginTop: '4px' }} />
        </div>
      ), msg: "Quiet night. Rest well 🌙" });
    }
  }, []);

  return (
    <div style={{ padding: '40px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <GlassCard elevated style={{
        padding: '60px 40px',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Celebration Banner */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          background: 'var(--accent-color)',
          padding: '4px',
          color: '#fff',
          fontSize: '12px',
          fontWeight: 'bold',
          letterSpacing: '2px',
          textAlign: 'center'
        }}>
          🎉 FREE DAY UNLOCKED
        </div>

        {/* Floating Interactive Object */}
        <div 
          className="free-day-object"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => {
            // Tiny click pulse
            const el = document.getElementById('free-day-icon');
            if (el) {
              el.style.transform = 'scale(0.8) rotate(-10deg)';
              setTimeout(() => {
                el.style.transform = 'scale(1) rotate(0deg)';
              }, 150);
            }
          }}
          style={{
            marginTop: '32px',
            transform: isHovered ? 'translateY(-10px) scale(1.05)' : 'translateY(0) scale(1)',
            filter: isHovered ? 'drop-shadow(0 20px 20px rgba(0,0,0,0.2))' : 'drop-shadow(0 10px 10px rgba(0,0,0,0.1))',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            cursor: 'pointer'
          }}
        >
          <div id="free-day-icon" style={{
            animation: 'float 6s ease-in-out infinite',
            transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            {iconProps?.icon}
          </div>
        </div>

        <div>
          <h2 className="text-large-title" style={{ marginBottom: '8px' }}>No Classes Today</h2>
          <p className="text-body text-secondary" style={{ fontSize: '1.1rem' }}>
            {iconProps?.msg}
          </p>
        </div>

        <div style={{
          marginTop: '16px',
          padding: '12px 24px',
          borderRadius: '20px',
          background: 'var(--glass-bg-1)',
          border: '1px solid var(--glass-border)'
        }}>
          <p className="text-metadata text-secondary">Enjoy your {greeting.toLowerCase()}!</p>
        </div>
      </GlassCard>
    </div>
  );
};
