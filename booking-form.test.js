// booking-form.test.js
// Unit тесты для формы бронирования

console.log('🧪 ЗАПУСК UNIT-ТЕСТОВ ДЛЯ ФУНКЦИИ F3.1\n');
console.log('='.repeat(60));

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runTest(testName, testFunction) {
  totalTests++;
  try {
    testFunction();
    passedTests++;
    console.log(`✅ PASS: ${testName}`);
    return true;
  } catch (error) {
    failedTests++;
    console.log(`❌ FAIL: ${testName}`);
    console.log(`   Ошибка: ${error.message}\n`);
    return false;
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

// Копируем функции валидации из компонента
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 11 && (cleaned[0] === '7' || cleaned[0] === '8');
};

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

// ===========================================
// БЛОК 1: Валидация Email
// ===========================================

console.log('\n📧 БЛОК 1: Валидация Email\n');

runTest('TC-EMAIL-001: Корректный email должен проходить валидацию', () => {
  assert(validateEmail('ivan@example.com') === true);
  assert(validateEmail('test.user@mail.ru') === true);
  assert(validateEmail('admin@scrolltool.ru') === true);
});

runTest('TC-EMAIL-002: Email без @ должен не проходить', () => {
  assert(validateEmail('ivangmail.com') === false);
});

runTest('TC-EMAIL-003: Email без домена должен не проходить', () => {
  assert(validateEmail('ivan@') === false);
  assert(validateEmail('ivan@com') === false);
});

runTest('TC-EMAIL-004: Email с пробелами должен не проходить', () => {
  assert(validateEmail('ivan @example.com') === false);
  assert(validateEmail('ivan@ example.com') === false);
});

runTest('TC-EMAIL-005: Пустая строка должна не проходить', () => {
  assert(validateEmail('') === false);
});

// ===========================================
// БЛОК 2: Валидация Телефона
// ===========================================

console.log('\n📱 БЛОК 2: Валидация Телефона\n');

runTest('TC-PHONE-001: Корректный телефон с 7 должен проходить', () => {
  assert(validatePhone('79991234567') === true);
  assert(validatePhone('+7 999 123-45-67') === true);
});

runTest('TC-PHONE-002: Корректный телефон с 8 должен проходить', () => {
  assert(validatePhone('89991234567') === true);
  assert(validatePhone('8 999 123 45 67') === true);
});

runTest('TC-PHONE-003: Телефон с меньше 11 цифр должен не проходить', () => {
  assert(validatePhone('7999123456') === false);
  assert(validatePhone('899') === false);
});

runTest('TC-PHONE-004: Телефон с больше 11 цифр должен не проходить', () => {
  assert(validatePhone('799912345678') === false);
});

runTest('TC-PHONE-005: Телефон не начинающийся с 7 или 8 должен не проходить', () => {
  assert(validatePhone('99991234567') === false);
  assert(validatePhone('39991234567') === false);
});

runTest('TC-PHONE-006: Пустая строка должна не проходить', () => {
  assert(validatePhone('') === false);
});

// ===========================================
// БЛОК 3: Форматирование Телефона
// ===========================================

console.log('\n🎨 БЛОК 3: Форматирование Телефона\n');

runTest('TC-FORMAT-001: Телефон должен форматироваться с 7', () => {
  const formatted = formatPhone('79991234567');
  assert(formatted === '+7 999 123-45-67', `Получено: "${formatted}"`);
});

runTest('TC-FORMAT-002: Телефон должен форматироваться с 8 → 7', () => {
  const formatted = formatPhone('89991234567');
  assert(formatted === '+7 999 123-45-67', `Получено: "${formatted}"`);
});

runTest('TC-FORMAT-003: Частичный ввод должен форматироваться', () => {
  assert(formatPhone('799') === '+7 99');
  assert(formatPhone('7999123') === '+7 999 123');
  assert(formatPhone('79991234') === '+7 999 123-4');
});

runTest('TC-FORMAT-004: Пустая строка должна вернуть пустую строку', () => {
  assert(formatPhone('') === '');
});

runTest('TC-FORMAT-005: Символы должны убираться при форматировании', () => {
  const formatted = formatPhone('+7 (999) 123-45-67');
  assert(formatted === '+7 999 123-45-67');
});

// ===========================================
// БЛОК 4: Валидация имени/фамилии
// ===========================================

console.log('\n👤 БЛОК 4: Валидация имени/фамилии\n');

const validateName = (value) => {
  if (!value.trim()) return false;
  if (value.trim().length < 2) return false;
  return true;
};

runTest('TC-NAME-001: Имя из 2+ символов должно проходить', () => {
  assert(validateName('Иван') === true);
  assert(validateName('Александр') === true);
  assert(validateName('Ли') === true);
});

runTest('TC-NAME-002: Имя из 1 символа должно не проходить', () => {
  assert(validateName('И') === false);
});

runTest('TC-NAME-003: Пустая строка должна не проходить', () => {
  assert(validateName('') === false);
  assert(validateName('   ') === false);
});

// ===========================================
// БЛОК 5: Логика формы
// ===========================================

console.log('\n📋 БЛОК 5: Логика формы\n');

const isFormValid = (formData) => {
  return (
    validateName(formData.firstName) &&
    validateName(formData.lastName) &&
    validateEmail(formData.email) &&
    validatePhone(formData.phone)
  );
};

runTest('TC-FORM-001: Полностью заполненная форма должна быть валидной', () => {
  const formData = {
    firstName: 'Иван',
    lastName: 'Петров',
    email: 'ivan@example.com',
    phone: '79991234567'
  };
  
  assert(isFormValid(formData) === true);
});

runTest('TC-FORM-002: Форма без имени должна быть невалидной', () => {
  const formData = {
    firstName: '',
    lastName: 'Петров',
    email: 'ivan@example.com',
    phone: '79991234567'
  };
  
  assert(isFormValid(formData) === false);
});

runTest('TC-FORM-003: Форма с некорректным email должна быть невалидной', () => {
  const formData = {
    firstName: 'Иван',
    lastName: 'Петров',
    email: 'ivangmail',
    phone: '79991234567'
  };
  
  assert(isFormValid(formData) === false);
});

runTest('TC-FORM-004: Форма с некорректным телефоном должна быть невалидной', () => {
  const formData = {
    firstName: 'Иван',
    lastName: 'Петров',
    email: 'ivan@example.com',
    phone: '123'
  };
  
  assert(isFormValid(formData) === false);
});

// ===========================================
// ИТОГИ ТЕСТИРОВАНИЯ
// ===========================================

console.log('\n' + '='.repeat(60));
console.log('📊 ИТОГИ ТЕСТИРОВАНИЯ F3.1');
console.log('='.repeat(60));
console.log(`\nВсего тестов: ${totalTests}`);
console.log(`✅ Пройдено: ${passedTests}`);
console.log(`❌ Провалено: ${failedTests}`);

const successRate = ((passedTests / totalTests) * 100).toFixed(1);
console.log(`\n📈 Процент успеха: ${successRate}%`);

if (failedTests === 0) {
  console.log('\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!');
  console.log('✅ Функция F3.1 готова к использованию');
} else {
  console.log('\n⚠️ ЕСТЬ ПРОВАЛЕННЫЕ ТЕСТЫ');
  console.log('❌ Требуется исправление ошибок');
}

console.log('\n' + '='.repeat(60));
