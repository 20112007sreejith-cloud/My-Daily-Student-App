import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';

interface DateTimePickerProps {
  initialDate?: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

export const DateTimePicker: React.FC<DateTimePickerProps> = ({ initialDate, onSelect, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(initialDate || new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());
  
  // Time state
  const [hour, setHour] = useState(initialDate ? initialDate.getHours() : 12);
  const [minute, setMinute] = useState(initialDate ? initialDate.getMinutes() : 0);

  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const startDay = monthStart.getDay(); // 0 = Sunday
  const blanks = Array.from({ length: startDay }).map((_, i) => i);

  const handleDayClick = (day: Date) => {
    const newDate = new Date(day);
    newDate.setHours(hour);
    newDate.setMinutes(minute);
    setSelectedDate(newDate);
    onSelect(newDate);
  };

  // Scroll logic for time picker
  const handleScroll = (e: React.UIEvent<HTMLDivElement>, setter: (val: number) => void, itemsCount: number) => {
    const el = e.currentTarget;
    const itemHeight = 40;
    const index = Math.round(el.scrollTop / itemHeight);
    if (index >= 0 && index < itemsCount) {
      setter(index);
      
      // Update selected date with new time
      const newDate = new Date(selectedDate);
      if (itemsCount === 24) newDate.setHours(index);
      else newDate.setMinutes(index);
      
      setSelectedDate(newDate);
      onSelect(newDate);
    }
  };

  useEffect(() => {
    // Initial scroll position
    if (hourRef.current) hourRef.current.scrollTop = hour * 40;
    if (minuteRef.current) minuteRef.current.scrollTop = minute * 40;
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '8px' }}>
      {/* Calendar Section */}
      <div style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <button 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
          >
            <ChevronLeft size={20} />
          </button>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
            <div key={d} className="text-metadata" style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>{d}</div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
          {blanks.map(b => <div key={`blank-${b}`} />)}
          {daysInMonth.map(day => {
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            return (
              <button
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                style={{
                  height: '32px',
                  width: '32px',
                  margin: '0 auto',
                  borderRadius: '50%',
                  border: 'none',
                  background: isSelected ? 'var(--accent-color)' : 'transparent',
                  color: isSelected ? '#fff' : isTodayDate ? 'var(--accent-color)' : 'var(--text-primary)',
                  fontWeight: isSelected || isTodayDate ? 600 : 400,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--glass-border)', width: '100%' }} />

      {/* Scrolling Time Section */}
      <div style={{ display: 'flex', gap: '8px', height: '160px', position: 'relative', justifyContent: 'center' }}>
        {/* Selection overlay */}
        <div style={{ 
          position: 'absolute', 
          top: '60px', 
          left: '50%', 
          transform: 'translateX(-50%)',
          width: '140px', 
          height: '40px', 
          background: 'rgba(0,122,255,0.1)', 
          borderRadius: '8px',
          pointerEvents: 'none'
        }} />

        {/* Hours Wheel */}
        <div 
          ref={hourRef}
          onScroll={(e) => handleScroll(e, setHour, 24)}
          style={{ 
            height: '100%', 
            width: '60px', 
            overflowY: 'auto', 
            scrollSnapType: 'y mandatory',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE
            padding: '60px 0' // padding to allow first/last items to reach center
          }}
          className="no-scrollbar"
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <div 
              key={i} 
              style={{ 
                height: '40px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                scrollSnapAlign: 'center',
                color: hour === i ? 'var(--accent-color)' : 'var(--text-secondary)',
                fontWeight: hour === i ? 600 : 400,
                fontSize: hour === i ? '1.2rem' : '1rem',
                transition: 'all 0.2s'
              }}
            >
              {i.toString().padStart(2, '0')}
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: 'var(--text-primary)' }}>:</div>

        {/* Minutes Wheel */}
        <div 
          ref={minuteRef}
          onScroll={(e) => handleScroll(e, setMinute, 60)}
          style={{ 
            height: '100%', 
            width: '60px', 
            overflowY: 'auto', 
            scrollSnapType: 'y mandatory',
            scrollbarWidth: 'none',
            padding: '60px 0'
          }}
          className="no-scrollbar"
        >
          {Array.from({ length: 60 }).map((_, i) => (
            <div 
              key={i} 
              style={{ 
                height: '40px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                scrollSnapAlign: 'center',
                color: minute === i ? 'var(--accent-color)' : 'var(--text-secondary)',
                fontWeight: minute === i ? 600 : 400,
                fontSize: minute === i ? '1.2rem' : '1rem',
                transition: 'all 0.2s'
              }}
            >
              {i.toString().padStart(2, '0')}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
