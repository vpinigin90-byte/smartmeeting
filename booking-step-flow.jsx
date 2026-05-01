import React, { useState } from 'react';
import { ChevronLeft, Check } from 'lucide-react';

export default function BookingStepFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [questionsDraft, setQuestionsDraft] = useState('');
  const [bookingData, setBookingData] = useState({
    duration: 60,
    date: null,
    formData: null,
    questions: ''
  });

  const steps = [
    { number: 1, title: 'Длительность', description: 'Выберите время встречи' },
    { number: 2, title: 'Дата и время', description: 'Выберите удобную дату' },
    { number: 3, title: 'Контакты', description: 'Заполните контактные данные' },
    { number: 4, title: 'Вопросы', description: 'Добавьте вопросы к встрече' }
  ];

  // Обработчики переходов
  const handleDurationSelect = (duration) => {
    setBookingData(prev => ({ ...prev, duration }));
    setCurrentStep(2);
  };

  const handleDateSelect = (date) => {
    setBookingData(prev => ({ ...prev, date }));
    setCurrentStep(3);
  };

  const handleFormSubmit = (formData) => {
    setBookingData(prev => ({ ...prev, formData }));
    setCurrentStep(4);
  };

  const handleQuestionsSubmit = () => {
    setBookingData(prev => {
      const nextData = { ...prev, questions: questionsDraft.trim() };
      // Здесь будет отправка на сервер и переход к подтверждению
      console.log('Booking completed:', nextData);
      return nextData;
    });
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Progress Bar */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          animation: 'fadeIn 0.4s ease-out'
        }}>
          {/* Step Indicators */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            position: 'relative'
          }}>
            {/* Progress Line */}
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '0',
              right: '0',
              height: '3px',
              background: '#e5e7eb',
              zIndex: 0
            }}>
              <div style={{
                height: '100%',
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>

            {/* Step Circles */}
            {steps.map((step) => {
              const isCompleted = currentStep > step.number;
              const isCurrent = currentStep === step.number;
              
              return (
                <div key={step.number} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: 1,
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: isCompleted ? '#667eea' : isCurrent ? '#667eea' : 'white',
                    border: isCurrent || isCompleted ? 'none' : '3px solid #e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '700',
                    color: isCompleted || isCurrent ? 'white' : '#999',
                    transition: 'all 0.3s ease',
                    boxShadow: isCurrent ? '0 4px 12px rgba(102, 126, 234, 0.3)' : 'none'
                  }}>
                    {isCompleted ? <Check size={20} /> : step.number}
                  </div>
                  
                  <div style={{
                    marginTop: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: isCurrent ? '#667eea' : isCompleted ? '#1a1a1a' : '#999'
                    }}>
                      {step.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current Step Description */}
          <div style={{
            textAlign: 'center',
            marginTop: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#666'
            }}>
              Шаг {currentStep} из {steps.length}: {steps[currentStep - 1].description}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          minHeight: '500px',
          position: 'relative'
        }}>
          {/* Back Button */}
          {currentStep > 1 && (
            <button
              onClick={goBack}
              style={{
                position: 'absolute',
                top: '24px',
                left: '24px',
                background: 'transparent',
                border: 'none',
                color: '#667eea',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '8px 12px',
                borderRadius: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f8f9ff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
              }}
            >
              <ChevronLeft size={16} />
              Назад
            </button>
          )}

          {/* Step Content */}
          <div style={{
            paddingTop: currentStep > 1 ? '40px' : '0'
          }}>
            {/* Step 1: Duration */}
            {currentStep === 1 && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#1a1a1a',
                  marginBottom: '12px',
                  textAlign: 'center'
                }}>
                  Сколько времени вам нужно?
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: '#666',
                  marginBottom: '32px',
                  textAlign: 'center'
                }}>
                  Выберите длительность демонстрации
                </p>

                {/* Duration Options */}
                {[
                  { value: 30, label: '30 минут', desc: 'Экспресс-демо' },
                  { value: 45, label: '45 минут', desc: 'Стандартное демо' },
                  { value: 60, label: '60 минут', desc: 'Полное демо с вопросами', recommended: true }
                ].map((duration) => {
                  const isSelected = bookingData.duration === duration.value;
                  
                  return (
                    <button
                      key={duration.value}
                      onClick={() => handleDurationSelect(duration.value)}
                      style={{
                        width: '100%',
                        padding: '20px',
                        marginBottom: '16px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #667eea' : '2px solid #e5e7eb',
                        background: isSelected ? '#f8f9ff' : 'white',
                        cursor: 'pointer',
                        textAlign: 'left',
                        position: 'relative',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.target.style.borderColor = '#667eea';
                          e.target.style.transform = 'translateY(-2px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.target.style.borderColor = '#e5e7eb';
                          e.target.style.transform = 'translateY(0)';
                        }
                      }}
                    >
                      {duration.recommended && (
                        <div style={{
                          position: 'absolute',
                          top: '-8px',
                          left: '16px',
                          background: 'linear-gradient(135deg, #667eea, #764ba2)',
                          color: 'white',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}>
                          РЕКОМЕНДУЕМ
                        </div>
                      )}
                      
                      <div style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: isSelected ? '#667eea' : '#1a1a1a',
                        marginBottom: '4px'
                      }}>
                        {duration.label}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: '#666'
                      }}>
                        {duration.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 2: Calendar */}
            {currentStep === 2 && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#1a1a1a',
                  marginBottom: '12px',
                  textAlign: 'center'
                }}>
                  Выберите удобную дату
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: '#666',
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  Длительность: <strong>{bookingData.duration} минут</strong>
                </p>

                {/* Placeholder for Calendar Component */}
                <div style={{
                  padding: '40px',
                  border: '2px dashed #e5e7eb',
                  borderRadius: '12px',
                  textAlign: 'center',
                  color: '#999'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                  <div style={{ fontSize: '16px', marginBottom: '24px' }}>
                    Здесь будет компонент календаря
                  </div>
                  <button
                    onClick={() => handleDateSelect('15 апреля 2026, 14:00')}
                    style={{
                      padding: '12px 24px',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Выбрать дату (для демо)
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Contacts */}
            {currentStep === 3 && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#1a1a1a',
                  marginBottom: '12px',
                  textAlign: 'center'
                }}>
                  Ваши контактные данные
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: '#666',
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  {bookingData.date} • {bookingData.duration} минут
                </p>

                {/* Placeholder for Form Component */}
                <div style={{
                  padding: '40px',
                  border: '2px dashed #e5e7eb',
                  borderRadius: '12px',
                  textAlign: 'center',
                  color: '#999'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                  <div style={{ fontSize: '16px', marginBottom: '24px' }}>
                    Здесь будет форма контактных данных
                  </div>
                  <button
                    onClick={() => handleFormSubmit({
                      firstName: 'Иван',
                      lastName: 'Петров',
                      email: 'ivan@example.com',
                      phone: '+7 999 123-45-67'
                    })}
                    style={{
                      padding: '12px 24px',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Продолжить к вопросам
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Questions */}
            {currentStep === 4 && (
              <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                <h2 style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#1a1a1a',
                  marginBottom: '12px',
                  textAlign: 'center'
                }}>
                  Вопросы для обсуждения
                </h2>
                <p style={{
                  fontSize: '16px',
                  color: '#666',
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  Добавьте вопросы после контактов, чтобы команда подготовила релевантное демо
                </p>

                <div style={{
                  padding: '28px',
                  border: '2px dashed #e5e7eb',
                  borderRadius: '12px'
                }}>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1a1a1a',
                    marginBottom: '10px'
                  }}>
                    Есть ли конкретные вопросы к встрече? <span style={{ color: '#999', fontWeight: '400' }}>(необязательно)</span>
                  </label>

                  <textarea
                    value={questionsDraft}
                    onChange={(e) => setQuestionsDraft(e.target.value)}
                    placeholder="Например: как создать интерактивный тренажер и встроить его на сайт"
                    rows={5}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      fontSize: '15px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '12px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      marginBottom: '16px'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />

                  <div style={{
                    fontSize: '12px',
                    color: '#999',
                    marginBottom: '18px'
                  }}>
                    {questionsDraft.length} / 1000
                  </div>

                  <button
                    onClick={handleQuestionsSubmit}
                    style={{
                      width: '100%',
                      padding: '12px 24px',
                      background: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Забронировать (для демо)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary Panel (показывается на шагах 2, 3 и 4) */}
        {currentStep > 1 && (
          <div style={{
            marginTop: '24px',
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            animation: 'slideUp 0.4s ease-out'
          }}>
            <div style={{
              fontSize: '13px',
              color: '#666',
              marginBottom: '12px',
              fontWeight: '600'
            }}>
              Ваш выбор:
            </div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div style={{
                padding: '8px 16px',
                background: '#f8f9ff',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#667eea',
                fontWeight: '600'
              }}>
                ⏱️ {bookingData.duration} минут
              </div>
              {bookingData.date && (
                <div style={{
                  padding: '8px 16px',
                  background: '#f8f9ff',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#667eea',
                  fontWeight: '600'
                }}>
                  📅 {bookingData.date}
                </div>
              )}
              {bookingData.questions && (
                <div style={{
                  padding: '8px 16px',
                  background: '#f8f9ff',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#667eea',
                  fontWeight: '600'
                }}>
                  ❓ Вопросы добавлены
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
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
