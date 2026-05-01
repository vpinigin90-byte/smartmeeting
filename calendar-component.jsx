import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export default function BookingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Названия месяцев и дней недели
  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  // Производственный календарь РФ 2026 - праздничные дни
  const holidays2026 = [
    // Новогодние каникулы
    '2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04',
    '2026-01-05', '2026-01-06', '2026-01-07', '2026-01-08',
    // День защитника Отечества
    '2026-02-23',
    // Международный женский день
    '2026-03-08',
    // Праздник Весны и Труда
    '2026-05-01',
    // День Победы
    '2026-05-09',
    // День России
    '2026-06-12',
    // День народного единства
    '2026-11-04'
  ];

  // Проверка, является ли день праздничным
  const isHoliday = (date) => {
    if (!date) return false;
    const dateStr = date.toISOString().split('T')[0];
    return holidays2026.includes(dateStr);
  };

  // Проверка, является ли день выходным (суббота или воскресенье)
  const isWeekend = (date) => {
    if (!date) return false;
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // 0 = воскресенье, 6 = суббота
  };

  // Получение дней месяца (все дни, включая выходные)
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Определяем день недели первого числа (0 = воскресенье, 1 = понедельник...)
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Добавляем пустые ячейки для выравнивания
    // Понедельник = 1, поэтому сдвигаем на (startingDayOfWeek - 1)
    // Если воскресенье (0), то сдвиг = 6
    const offset = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    for (let i = 0; i < offset; i++) {
      days.push(null);
    }
    
    // Добавляем ВСЕ дни месяца (включая выходные и праздники)
    for (let i = 1; i <= daysInMonth; i++) {
      const day = new Date(year, month, i);
      days.push(day);
    }
    
    return days;
  };

  // Проверка, является ли дата прошедшей
  const isPastDate = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    return date < today;
  };

  // Проверка, является ли дата сегодняшней
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Проверка, является ли дата выбранной
  const isSelected = (date) => {
    if (!date || !selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Обработчик выбора даты
  const handleDateSelect = (date) => {
    // Блокируем: null, прошедшие даты, СЕГОДНЯ (нужно время на подготовку), выходные, праздники
    if (!date || isPastDate(date) || isToday(date) || isWeekend(date) || isHoliday(date)) {
      return;
    }
    setSelectedDate(date);
  };

  // Переключение месяца (только вперёд)
  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const days = getDaysInMonth(currentDate);

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
            Выберите удобную дату для встречи
          </p>
        </div>

        {/* Календарь */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          animation: 'slideUp 0.6s ease-out 0.2s backwards'
        }}>
          {/* Хедер календаря с месяцем и годом */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '30px'
          }}>
            {/* Пустой div для выравнивания по центру */}
            <div style={{ width: '48px' }} />

            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#1a1a1a',
              margin: 0
            }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>

            <button
              onClick={goToNextMonth}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '12px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                color: '#333'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f0f0f0';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.transform = 'scale(1)';
              }}
              aria-label="Следующий месяц"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Названия дней недели */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px',
            marginBottom: '12px'
          }}>
            {dayNames.map((day) => (
              <div key={day} style={{
                textAlign: 'center',
                fontSize: '13px',
                fontWeight: '600',
                color: '#999',
                padding: '12px 8px'
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Сетка дней */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '8px'
          }}>
            {days.map((day, index) => {
              if (!day) {
                // Пустая ячейка для выравнивания
                return <div key={`empty-${index}`} />;
              }

              const past = isPastDate(day);
              const today = isToday(day);
              const selected = isSelected(day);
              const weekend = isWeekend(day);
              const holiday = isHoliday(day);
              
              // Определяем доступность для клика
              // ВАЖНО: Сегодня тоже заблокирован (нужно время на подготовку к встрече)
              const isDisabled = past || today || weekend || holiday;

              // Цветовая схема
              let backgroundColor = 'white';
              let textColor = '#1a1a1a';
              let borderColor = 'transparent';
              
              if (selected) {
                backgroundColor = '#667eea';
                textColor = 'white';
                borderColor = '#667eea';
              } else if (past) {
                backgroundColor = '#fafafa';
                textColor = '#d0d0d0';
              } else if (today) {
                // Сегодня: выделяем синей рамкой, но делаем заблокированным
                backgroundColor = '#f8f9ff';
                textColor = '#667eea';
                borderColor = '#667eea';
              } else if (holiday) {
                // Праздничные дни - светло-розовый/персиковый
                backgroundColor = '#fff0f0';
                textColor = '#cc6666';
              } else if (weekend) {
                // Выходные - светло-серый
                backgroundColor = '#f5f5f5';
                textColor = '#999';
              }

              return (
                <button
                  key={index}
                  onClick={() => handleDateSelect(day)}
                  disabled={isDisabled}
                  style={{
                    padding: '18px 8px',
                    borderRadius: '12px',
                    border: borderColor !== 'transparent' ? `2px solid ${borderColor}` : 'none',
                    background: backgroundColor,
                    color: textColor,
                    fontSize: '16px',
                    fontWeight: today || selected ? '700' : weekend || holiday ? '500' : '500',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    opacity: past ? 0.4 : (weekend || holiday || today) ? 0.7 : 1,
                    boxShadow: selected ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (!isDisabled && !selected) {
                      e.target.style.background = '#667eea';
                      e.target.style.color = 'white';
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isDisabled && !selected) {
                      e.target.style.background = backgroundColor;
                      e.target.style.color = textColor;
                      e.target.style.transform = 'scale(1)';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                  title={
                    today ? 'Сегодня (запись недоступна, выберите завтра или позже)' :
                    holiday ? 'Праздничный день' : 
                    weekend ? 'Выходной' : ''
                  }
                >
                  {day.getDate()}
                  {/* Индикатор праздника */}
                  {holiday && !past && (
                    <div style={{
                      position: 'absolute',
                      bottom: '4px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      background: '#ff6b6b'
                    }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Информация о выбранной дате */}
          {selectedDate && (
            <div style={{
              marginTop: '30px',
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '12px',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#666',
                margin: '0 0 8px 0',
                fontWeight: '500'
              }}>
                Выбранная дата:
              </p>
              <p style={{
                fontSize: '18px',
                color: '#1a1a1a',
                margin: 0,
                fontWeight: '600'
              }}>
                {selectedDate.toLocaleDateString('ru-RU', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              
              <button style={{
                marginTop: '16px',
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '15px',
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
              }}>
                Продолжить →
              </button>
            </div>
          )}

          {/* Легенда */}
          <div style={{
            marginTop: '24px',
            display: 'flex',
            gap: '16px',
            fontSize: '12px',
            color: '#666',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                border: '2px solid #667eea',
                background: '#f8f9ff'
              }} />
              Сегодня (недоступно)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                background: '#667eea'
              }} />
              Выбрано
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                background: '#f5f5f5'
              }} />
              Выходной
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                background: '#fff0f0'
              }} />
              Праздник
            </div>
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
