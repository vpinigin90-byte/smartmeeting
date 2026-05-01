import React, { useState } from 'react';

export default function DurationSelector({ onDurationChange }) {
  const [selectedDuration, setSelectedDuration] = useState(60); // По умолчанию 60 минут

  const durations = [
    { value: 30, label: '30 минут', description: 'Экспресс-демо' },
    { value: 45, label: '45 минут', description: 'Стандартное демо' },
    { value: 60, label: '60 минут', description: 'Полное демо с вопросами' }
  ];

  const handleDurationSelect = (duration) => {
    setSelectedDuration(duration);
    if (onDurationChange) {
      onDurationChange(duration);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%'
      }}>
        {/* Заголовок */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px',
          animation: 'fadeIn 0.6s ease-out'
        }}>
          <h1 style={{
            fontSize: '42px',
            fontWeight: '800',
            color: 'white',
            marginBottom: '12px',
            letterSpacing: '-0.02em'
          }}>
            Запись на демо Scrolltool
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: '400'
          }}>
            Выберите длительность встречи
          </p>
        </div>

        {/* Карточка выбора длительности */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          animation: 'slideUp 0.6s ease-out 0.2s backwards'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '8px',
            textAlign: 'center'
          }}>
            Сколько времени вам нужно?
          </h2>
          
          <p style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            Мы рекомендуем 60 минут для подробного знакомства с Scrolltool
          </p>

          {/* Кнопки выбора длительности */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {durations.map((duration) => {
              const isSelected = selectedDuration === duration.value;
              
              return (
                <button
                  key={duration.value}
                  onClick={() => handleDurationSelect(duration.value)}
                  style={{
                    padding: '24px',
                    borderRadius: '16px',
                    border: isSelected ? '3px solid #667eea' : '2px solid #e5e7eb',
                    background: isSelected ? '#f8f9ff' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    position: 'relative',
                    boxShadow: isSelected ? '0 8px 20px rgba(102, 126, 234, 0.2)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                >
                  {/* Иконка выбора */}
                  <div style={{
                    position: 'absolute',
                    top: '24px',
                    right: '24px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: isSelected ? '2px solid #667eea' : '2px solid #d1d5db',
                    background: isSelected ? '#667eea' : 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}>
                    {isSelected && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: 'white'
                      }} />
                    )}
                  </div>

                  <div style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: isSelected ? '#667eea' : '#1a1a1a',
                    marginBottom: '4px'
                  }}>
                    {duration.label}
                  </div>
                  
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    fontWeight: '400'
                  }}>
                    {duration.description}
                  </div>

                  {/* Бейдж "Рекомендуем" для 60 минут */}
                  {duration.value === 60 && (
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '20px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      letterSpacing: '0.5px'
                    }}>
                      РЕКОМЕНДУЕМ
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Кнопка продолжить */}
          <button
            style={{
              marginTop: '32px',
              width: '100%',
              padding: '16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            Продолжить к выбору даты →
          </button>

          {/* Информация о выбранной длительности */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: '12px',
            fontSize: '13px',
            color: '#666',
            textAlign: 'center'
          }}>
            Вы выбрали: <strong style={{ color: '#667eea' }}>{selectedDuration} минут</strong>
            <br />
            Встреча пройдет онлайн через МТС-Линк
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        * {
          box-sizing: border-box;
        }

        button:focus {
          outline: 2px solid #667eea;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
