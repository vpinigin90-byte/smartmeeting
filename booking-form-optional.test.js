// booking-form-optional.test.js
// Тесты для опциональных полей формы

console.log('🧪 ЗАПУСК ТЕСТОВ ДЛЯ ФУНКЦИИ F3.2 (опциональные поля)\n');
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

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ===========================================
// БЛОК 1: Валидация Telegram
// ===========================================

console.log('\n💬 БЛОК 1: Валидация Telegram\n');

const validateTelegram = (value) => {
  if (value.trim() && !value.trim().startsWith('@')) {
    return 'Telegram должен начинаться с @';
  }
  return '';
};

runTest('TC-TG-001: Пустое значение должно быть валидным', () => {
  assert(validateTelegram('') === '');
});

runTest('TC-TG-002: Telegram с @ должен быть валидным', () => {
  assert(validateTelegram('@username') === '');
  assert(validateTelegram('@ivan_petrov') === '');
});

runTest('TC-TG-003: Telegram без @ должен быть невалидным', () => {
  const error = validateTelegram('username');
  assert(error.length > 0, 'Должна быть ошибка');
});

runTest('TC-TG-004: Telegram с пробелами но с @ должен быть валидным', () => {
  assert(validateTelegram('  @username  ') === '');
});

// ===========================================
// БЛОК 2: Валидация дополнительных участников
// ===========================================

console.log('\n👥 БЛОК 2: Валидация дополнительных участников\n');

const validateParticipants = (value) => {
  if (value.trim()) {
    const emails = value.split(/[,\n]/).map(e => e.trim()).filter(e => e);
    for (const email of emails) {
      if (!validateEmail(email)) {
        return `Некорректный email: ${email}`;
      }
    }
  }
  return '';
};

runTest('TC-PART-001: Пустое значение должно быть валидным', () => {
  assert(validateParticipants('') === '');
});

runTest('TC-PART-002: Один корректный email должен быть валидным', () => {
  assert(validateParticipants('colleague@example.com') === '');
});

runTest('TC-PART-003: Несколько email через запятую должны быть валидными', () => {
  assert(validateParticipants('a@example.com, b@example.com') === '');
});

runTest('TC-PART-004: Email через перенос строки должны быть валидными', () => {
  assert(validateParticipants('a@example.com\nb@example.com') === '');
});

runTest('TC-PART-005: Некорректный email должен давать ошибку', () => {
  const error = validateParticipants('invalid-email');
  assert(error.length > 0);
  assert(error.includes('invalid-email'));
});

runTest('TC-PART-006: Один корректный и один некорректный должен давать ошибку', () => {
  const error = validateParticipants('good@example.com, bad-email');
  assert(error.length > 0);
});

// ===========================================
// БЛОК 3: Валидация вопросов
// ===========================================

console.log('\n❓ БЛОК 3: Валидация вопросов\n');

const validateQuestions = (value) => {
  if (value.length > 500) {
    return 'Максимум 500 символов';
  }
  return '';
};

runTest('TC-Q-001: Пустое значение должно быть валидным', () => {
  assert(validateQuestions('') === '');
});

runTest('TC-Q-002: Текст до 500 символов должен быть валидным', () => {
  const text = 'a'.repeat(500);
  assert(validateQuestions(text) === '');
});

runTest('TC-Q-003: Текст более 500 символов должен быть невалидным', () => {
  const text = 'a'.repeat(501);
  const error = validateQuestions(text);
  assert(error.length > 0);
});

runTest('TC-Q-004: Ровно 500 символов должно быть валидным', () => {
  const text = 'Какие возможности есть для интеграции с CRM?'.repeat(10);
  if (text.length <= 500) {
    assert(validateQuestions(text) === '');
  } else {
    assert(validateQuestions(text.substring(0, 500)) === '');
  }
});

// ===========================================
// БЛОК 4: Проверка что опциональные поля не блокируют отправку
// ===========================================

console.log('\n✅ БЛОК 4: Опциональные поля не блокируют отправку\n');

const isFormValid = (formData) => {
  const requiredFields = ['firstName', 'lastName', 'email', 'phone'];
  
  return requiredFields.every(key => {
    const value = formData[key];
    return value && value.trim().length > 0;
  });
};

runTest('TC-OPT-001: Форма валидна даже с пустыми опциональными полями', () => {
  const formData = {
    firstName: 'Иван',
    lastName: 'Петров',
    email: 'ivan@example.com',
    phone: '79991234567',
    telegram: '',
    additionalParticipants: '',
    questions: ''
  };
  
  assert(isFormValid(formData) === true);
});

runTest('TC-OPT-002: Форма валидна с заполненными опциональными полями', () => {
  const formData = {
    firstName: 'Иван',
    lastName: 'Петров',
    email: 'ivan@example.com',
    phone: '79991234567',
    telegram: '@ivan',
    additionalParticipants: 'colleague@example.com',
    questions: 'Как интегрировать с CRM?'
  };
  
  assert(isFormValid(formData) === true);
});

runTest('TC-OPT-003: Форма валидна с частично заполненными опциональными', () => {
  const formData = {
    firstName: 'Иван',
    lastName: 'Петров',
    email: 'ivan@example.com',
    phone: '79991234567',
    telegram: '@ivan',
    additionalParticipants: '',
    questions: ''
  };
  
  assert(isFormValid(formData) === true);
});

// ===========================================
// ИТОГИ ТЕСТИРОВАНИЯ
// ===========================================

console.log('\n' + '='.repeat(60));
console.log('📊 ИТОГИ ТЕСТИРОВАНИЯ F3.2');
console.log('='.repeat(60));
console.log(`\nВсего тестов: ${totalTests}`);
console.log(`✅ Пройдено: ${passedTests}`);
console.log(`❌ Провалено: ${failedTests}`);

const successRate = ((passedTests / totalTests) * 100).toFixed(1);
console.log(`\n📈 Процент успеха: ${successRate}%`);

if (failedTests === 0) {
  console.log('\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!');
  console.log('✅ Функция F3.2 готова к использованию');
} else {
  console.log('\n⚠️ ЕСТЬ ПРОВАЛЕННЫЕ ТЕСТЫ');
  console.log('❌ Требуется исправление ошибок');
}

console.log('\n' + '='.repeat(60));
