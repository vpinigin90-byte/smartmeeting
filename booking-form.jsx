import React, { useState } from 'react';
import { User, Mail, Phone } from 'lucide-react';

export default function BookingForm({ onSubmit, selectedDate, selectedDuration }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // Опциональные поля
    telegram: '',
    additionalParticipants: '',
    questions: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Валидация email
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Валидация телефона (российский формат)
  const validatePhone = (phone) => {
    // Убираем все символы кроме цифр
    const cleaned = phone.replace(/\D/g, '');
    // Проверяем что начинается с 7 или 8 и содержит 11 цифр
    return cleaned.length === 11 && (cleaned[0] === '7' || cleaned[0] === '8');
  };

  // Форматирование телефона
  const formatPhone = (value) => {
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length === 0) return '';
    
    let formatted = '+7 ';
    let digits = cleaned;
    
    // Если начинается с 7 или 8, пропускаем первую цифру
    if (cleaned[0] === '7' || cleaned[0] === '8') {
      digits = cleaned.slice(1);
    }
    
    // Форматируем: +7 999 123-45-67
    if (digits.length > 0) {
      formatted += digits.slice(0, 3); // 999
    }
    if (digits.length > 3) {
      formatted += ' ' + digits.slice(3, 6); // 123
    }
    if (digits.length > 6) {
      formatted += '-' + digits.slice(6, 8); // 45
    }
    if (digits.length > 8) {
      formatted += '-' + digits.slice(8, 10); // 67
    }
    
    return formatted;
  };

  // Валидация полей
  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'Введите имя';
        if (value.trim().length < 2) return 'Имя должно содержать минимум 2 символа';
        return '';
      
      case 'lastName':
        if (!value.trim()) return 'Введите фамилию';
        if (value.trim().length < 2) return 'Фамилия должна содержать минимум 2 символа';
        return '';
      
      case 'email':
        if (!value.trim()) return 'Введите email';
        if (!validateEmail(value)) return 'Введите корректный email';
        return '';
      
      case 'phone':
        if (!value.trim()) return 'Введите телефон';
        if (!validatePhone(value)) return 'Введите корректный телефон';
        return '';
      
      // Опциональные поля
      case 'telegram':
        if (value.trim() && !value.trim().startsWith('@')) {
          return 'Telegram должен начинаться с @';
        }
        return '';
      
      case 'additionalParticipants':
        if (value.trim()) {
          // Проверяем каждый email через запятую или перенос строки
          const emails = value.split(/[,\n]/).map(e => e.trim()).filter(e => e);
          for (const email of emails) {
            if (!validateEmail(email)) {
              return `Некорректный email: ${email}`;
            }
          }
        }
        return '';
      
      case 'questions':
        if (value.length > 500) {
          return 'Максимум 500 символов';
        }
        return '';
      
      default:
        return '';
    }
  };

  // Обработчик изменения поля
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    let newValue = value;
    
    // Форматируем телефон при вводе
    if (name === 'phone') {
      newValue = formatPhone(value);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Валидируем если поле уже было touched
    if (touched[name]) {
      const error = validateField(name, newValue);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  // Обработчик потери фокуса
  const handleBlur = (e) => {
    const { name, value } = e.target;
    
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  // Валидация всей формы
  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    
    setErrors(newErrors);
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phone: true
    });
    
    return Object.keys(newErrors).length === 0;
  };

  // Обработчик отправки формы
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (onSubmit) {
        onSubmit(formData);
      }
    }
  };

  // Проверка готовности формы (только обязательные поля)
  const isFormValid = () => {
    const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
    
    return requiredFields.every(key => {
      const value = formData[key];
      return value.trim() && !validateField(key, value);
    });
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
            Заполните контактную информацию
          </p>
        </div>

        {/* Карточка формы */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '40px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          animation: 'slideUp 0.6s ease-out 0.2s backwards'
        }}>
          {/* Информация о выборе */}
          {(selectedDate || selectedDuration) && (
            <div style={{
              marginBottom: '30px',
              padding: '16px',
              background: '#f8f9ff',
              borderRadius: '12px',
              border: '1px solid #e5e8ff'
            }}>
              <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                Вы выбрали:
              </div>
              {selectedDuration && (
                <div style={{ fontSize: '14px', color: '#667eea', fontWeight: '600' }}>
                  📅 Длительность: {selectedDuration} минут
                </div>
              )}
              {selectedDate && (
                <div style={{ fontSize: '14px', color: '#667eea', fontWeight: '600' }}>
                  🕐 Дата: {selectedDate}
                </div>
              )}
            </div>
          )}

          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#1a1a1a',
            marginBottom: '8px'
          }}>
            Ваши контактные данные
          </h2>
          
          <p style={{
            fontSize: '14px',
            color: '#666',
            marginBottom: '30px'
          }}>
            Все поля обязательны для заполнения
          </p>

          <form onSubmit={handleSubmit}>
            {/* Имя */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '8px'
              }}>
                Имя <span style={{ color: '#ff6b6b' }}>*</span>
              </label>
              
              <div style={{ position: 'relative' }}>
                <User 
                  size={20} 
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: errors.firstName && touched.firstName ? '#ff6b6b' : '#999'
                  }}
                />
                
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Иван"
                  autoComplete="given-name"
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    fontSize: '16px',
                    border: errors.firstName && touched.firstName 
                      ? '2px solid #ff6b6b' 
                      : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    if (!errors.firstName) {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }
                  }}
                  onBlurCapture={(e) => {
                    if (!errors.firstName) {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
              </div>
              
              {errors.firstName && touched.firstName && (
                <div style={{
                  marginTop: '6px',
                  fontSize: '13px',
                  color: '#ff6b6b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ⚠️ {errors.firstName}
                </div>
              )}
            </div>

            {/* Фамилия */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '8px'
              }}>
                Фамилия <span style={{ color: '#ff6b6b' }}>*</span>
              </label>
              
              <div style={{ position: 'relative' }}>
                <User 
                  size={20} 
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: errors.lastName && touched.lastName ? '#ff6b6b' : '#999'
                  }}
                />
                
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Петров"
                  autoComplete="family-name"
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    fontSize: '16px',
                    border: errors.lastName && touched.lastName 
                      ? '2px solid #ff6b6b' 
                      : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    if (!errors.lastName) {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }
                  }}
                  onBlurCapture={(e) => {
                    if (!errors.lastName) {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
              </div>
              
              {errors.lastName && touched.lastName && (
                <div style={{
                  marginTop: '6px',
                  fontSize: '13px',
                  color: '#ff6b6b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ⚠️ {errors.lastName}
                </div>
              )}
            </div>

            {/* Email */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '8px'
              }}>
                Email <span style={{ color: '#ff6b6b' }}>*</span>
              </label>
              
              <div style={{ position: 'relative' }}>
                <Mail 
                  size={20} 
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: errors.email && touched.email ? '#ff6b6b' : '#999'
                  }}
                />
                
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="ivan@example.com"
                  autoComplete="email"
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    fontSize: '16px',
                    border: errors.email && touched.email 
                      ? '2px solid #ff6b6b' 
                      : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    if (!errors.email) {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }
                  }}
                  onBlurCapture={(e) => {
                    if (!errors.email) {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
              </div>
              
              {errors.email && touched.email && (
                <div style={{
                  marginTop: '6px',
                  fontSize: '13px',
                  color: '#ff6b6b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ⚠️ {errors.email}
                </div>
              )}
            </div>

            {/* Телефон */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '8px'
              }}>
                Телефон <span style={{ color: '#ff6b6b' }}>*</span>
              </label>
              
              <div style={{ position: 'relative' }}>
                <Phone 
                  size={20} 
                  style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: errors.phone && touched.phone ? '#ff6b6b' : '#999'
                  }}
                />
                
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="+7 999 123-45-67"
                  autoComplete="tel"
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    fontSize: '16px',
                    border: errors.phone && touched.phone 
                      ? '2px solid #ff6b6b' 
                      : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    fontFamily: 'inherit'
                  }}
                  onFocus={(e) => {
                    if (!errors.phone) {
                      e.target.style.borderColor = '#667eea';
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                    }
                  }}
                  onBlurCapture={(e) => {
                    if (!errors.phone) {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }
                  }}
                />
              </div>
              
              {errors.phone && touched.phone && (
                <div style={{
                  marginTop: '6px',
                  fontSize: '13px',
                  color: '#ff6b6b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ⚠️ {errors.phone}
                </div>
              )}
              
              <div style={{
                marginTop: '6px',
                fontSize: '12px',
                color: '#999'
              }}>
                Формат: +7 999 123-45-67
              </div>
            </div>

            {/* Telegram */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '8px'
              }}>
                Telegram <span style={{ color: '#999', fontWeight: '400' }}>(необязательно)</span>
              </label>
              
              <input
                type="text"
                name="telegram"
                value={formData.telegram}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="@username"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  border: errors.telegram && touched.telegram 
                    ? '2px solid #ff6b6b' 
                    : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  if (!errors.telegram) {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }
                }}
                onBlurCapture={(e) => {
                  if (!errors.telegram) {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              
              {errors.telegram && touched.telegram && (
                <div style={{
                  marginTop: '6px',
                  fontSize: '13px',
                  color: '#ff6b6b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ⚠️ {errors.telegram}
                </div>
              )}
              
              <div style={{
                marginTop: '6px',
                fontSize: '12px',
                color: '#999'
              }}>
                Для уведомлений о встрече в Telegram
              </div>
            </div>

            {/* Дополнительные участники */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '8px'
              }}>
                Дополнительные участники <span style={{ color: '#999', fontWeight: '400' }}>(необязательно)</span>
              </label>
              
              <textarea
                name="additionalParticipants"
                value={formData.additionalParticipants}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="colleague@example.com, manager@example.com"
                rows={3}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  border: errors.additionalParticipants && touched.additionalParticipants 
                    ? '2px solid #ff6b6b' 
                    : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
                onFocus={(e) => {
                  if (!errors.additionalParticipants) {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }
                }}
                onBlurCapture={(e) => {
                  if (!errors.additionalParticipants) {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              
              {errors.additionalParticipants && touched.additionalParticipants && (
                <div style={{
                  marginTop: '6px',
                  fontSize: '13px',
                  color: '#ff6b6b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ⚠️ {errors.additionalParticipants}
                </div>
              )}
              
              <div style={{
                marginTop: '6px',
                fontSize: '12px',
                color: '#999'
              }}>
                Email коллег, которые присоединятся к встрече (через запятую)
              </div>
            </div>

            {/* Вопросы для обсуждения */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#1a1a1a',
                marginBottom: '8px'
              }}>
                Вопросы для обсуждения <span style={{ color: '#999', fontWeight: '400' }}>(необязательно)</span>
              </label>
              
              <textarea
                name="questions"
                value={formData.questions}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Укажите вопросы, которые хотите обсудить - это поможет нам подготовиться"
                rows={4}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  fontSize: '16px',
                  border: errors.questions && touched.questions 
                    ? '2px solid #ff6b6b' 
                    : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
                onFocus={(e) => {
                  if (!errors.questions) {
                    e.target.style.borderColor = '#667eea';
                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                  }
                }}
                onBlurCapture={(e) => {
                  if (!errors.questions) {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }
                }}
              />
              
              {errors.questions && touched.questions && (
                <div style={{
                  marginTop: '6px',
                  fontSize: '13px',
                  color: '#ff6b6b',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  ⚠️ {errors.questions}
                </div>
              )}
              
              <div style={{
                marginTop: '6px',
                fontSize: '12px',
                color: formData.questions.length > 450 ? '#ff6b6b' : '#999',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>Это поможет нам подготовиться к встрече</span>
                <span>{formData.questions.length} / 500</span>
              </div>
            </div>

            {/* Кнопка отправки */}
            <button
              type="submit"
              disabled={!isFormValid()}
              style={{
                width: '100%',
                padding: '16px',
                background: isFormValid() 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                  : '#d1d5db',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: isFormValid() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s ease',
                opacity: isFormValid() ? 1 : 0.6
              }}
              onMouseEnter={(e) => {
                if (isFormValid()) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (isFormValid()) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              {isFormValid() ? 'Забронировать встречу →' : 'Заполните все поля'}
            </button>
          </form>

          {/* Информация о конфиденциальности */}
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#f8f9fa',
            borderRadius: '12px',
            fontSize: '12px',
            color: '#666',
            textAlign: 'center'
          }}>
            🔒 Ваши данные защищены и не будут переданы третьим лицам
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

        input:focus {
          outline: none;
        }

        button:focus {
          outline: 2px solid #667eea;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}
