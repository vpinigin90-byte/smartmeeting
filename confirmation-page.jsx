import React from 'react';
import { Check, Calendar, Clock, User, Mail, Phone, MessageCircle } from 'lucide-react';

export default function ConfirmationPage({ bookingData }) {
  // Данные бронирования
  const {
    duration = 60,
    date = '15 апреля 2026, 14:00',
    formData = {
      firstName: 'Иван',
      lastName: 'Петров',
      email: 'ivan@example.com',
      phone: '+7 999 123-45-67',
      telegram: '@ivan',
      additionalParticipants: '',
      questions: ''
    }
  } = bookingData || {};

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
        maxWidth: '700px',
        width: '100%'
      }}>
        {/* Success Icon */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px',
          animation: 'scaleIn 0.5s ease-out'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 24px',
            background: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
          }}>
            <Check size={48} color="#10b981" strokeWidth={3} />
          </div>
          
          <h1 style={{
            fontSize: '42px',
            fontWeight: '800',
            color: 'white',
            marginBottom: '12px',
            letterSpacing: '-0.02em'
          }}>
            Встреча забронирована!
          </h1>
          
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.95)',
            fontWeight: '400'
          }}>
            Вся информация отправлена на ваш email
          </p>
        </div>

        {/* Booking Details Card */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          marginBottom: '24px',
          animation: 'slideUp 0.6s ease-out 0.2s backwards'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '24px',
            paddingBottom: '16px',
            borderBottom: '2px solid #f0f0f0'
          }}>
            Детали встречи
          </h2>

          {/* Meeting Info */}
          <div style={{
            display: 'grid',
            gap: '20px',
            marginBottom: '32px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#f8f9ff',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Calendar size={24} color="#667eea" />
              </div>
              <div>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '4px'
                }}>
                  Дата и время
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1a1a1a'
                }}>
                  {date}
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#f8f9ff',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Clock size={24} color="#667eea" />
              </div>
              <div>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '4px'
                }}>
                  Длительность
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1a1a1a'
                }}>
                  {duration} минут
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                background: '#f8f9ff',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <User size={24} color="#667eea" />
              </div>
              <div>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  marginBottom: '4px'
                }}>
                  Участник
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1a1a1a'
                }}>
                  {formData.firstName} {formData.lastName}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div style={{
            background: '#f8f9fa',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px'
          }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1a1a1a',
              marginBottom: '16px'
            }}>
              Ваши контакты
            </h3>

            <div style={{
              display: 'grid',
              gap: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Mail size={18} color="#666" />
                <span style={{ fontSize: '15px', color: '#1a1a1a' }}>
                  {formData.email}
                </span>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <Phone size={18} color="#666" />
                <span style={{ fontSize: '15px', color: '#1a1a1a' }}>
                  {formData.phone}
                </span>
              </div>

              {formData.telegram && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <MessageCircle size={18} color="#666" />
                  <span style={{ fontSize: '15px', color: '#1a1a1a' }}>
                    {formData.telegram}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Additional Participants */}
          {formData.additionalParticipants && (
            <div style={{
              background: '#f8f9fa',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '12px'
              }}>
                Дополнительные участники
              </h3>
              <div style={{
                fontSize: '15px',
                color: '#666'
              }}>
                {formData.additionalParticipants}
              </div>
            </div>
          )}

          {/* Questions */}
          {formData.questions && (
            <div style={{
              background: '#f8f9fa',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '12px'
              }}>
                Вопросы для обсуждения
              </h3>
              <div style={{
                fontSize: '15px',
                color: '#666',
                lineHeight: '1.6'
              }}>
                {formData.questions}
              </div>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          animation: 'slideUp 0.6s ease-out 0.4s backwards'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1a1a1a',
            marginBottom: '16px'
          }}>
            Что дальше?
          </h3>

          <div style={{
            display: 'grid',
            gap: '12px'
          }}>
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                background: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: '700',
                flexShrink: 0
              }}>
                1
              </div>
              <div style={{ fontSize: '15px', color: '#1a1a1a' }}>
                Вам придёт письмо с подтверждением на <strong>{formData.email}</strong>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <div style={{
                width: '24px',
                height: '24px',
                background: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: '700',
                flexShrink: 0
              }}>
                2
              </div>
              <div style={{ fontSize: '15px', color: '#1a1a1a' }}>
                Ссылка на встречу через МТС-Линк будет отправлена за 1 час до начала
              </div>
            </div>

            {formData.telegram && (
              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  background: '#10b981',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: '700',
                  flexShrink: 0
                }}>
                  3
                </div>
                <div style={{ fontSize: '15px', color: '#1a1a1a' }}>
                  Напоминание придёт в Telegram на {formData.telegram}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          gap: '12px',
          animation: 'slideUp 0.6s ease-out 0.6s backwards'
        }}>
          <button
            style={{
              flex: 1,
              padding: '16px',
              background: 'white',
              color: '#667eea',
              border: '2px solid white',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'transparent';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'white';
            }}
          >
            Добавить в календарь
          </button>

          <button
            onClick={() => window.location.href = '/'}
            style={{
              flex: 1,
              padding: '16px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '2px solid white',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.3)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
            }}
          >
            На главную
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
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
          outline: 2px solid white;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
