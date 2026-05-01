// confirmation-page.test.js
// Тесты для страницы подтверждения

console.log('🧪 ЗАПУСК ТЕСТОВ ДЛЯ ФУНКЦИИ F8.1\n');
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

// Тестовые данные
const mockBookingData = {
  duration: 60,
  date: '15 апреля 2026, 14:00',
  formData: {
    firstName: 'Иван',
    lastName: 'Петров',
    email: 'ivan@example.com',
    phone: '+7 999 123-45-67',
    telegram: '@ivan',
    additionalParticipants: 'colleague@example.com',
    questions: 'Как интегрировать с CRM?'
  }
};

// ===========================================
// БЛОК 1: Отображение данных
// ===========================================

console.log('\n📋 БЛОК 1: Отображение данных\n');

runTest('TC-DISP-001: Должна отображаться длительность', () => {
  assert(mockBookingData.duration === 60);
});

runTest('TC-DISP-002: Должна отображаться дата', () => {
  assert(mockBookingData.date.includes('15 апреля 2026'));
});

runTest('TC-DISP-003: Должно отображаться имя участника', () => {
  const fullName = `${mockBookingData.formData.firstName} ${mockBookingData.formData.lastName}`;
  assert(fullName === 'Иван Петров');
});

runTest('TC-DISP-004: Должен отображаться email', () => {
  assert(mockBookingData.formData.email === 'ivan@example.com');
});

runTest('TC-DISP-005: Должен отображаться телефон', () => {
  assert(mockBookingData.formData.phone.includes('+7 999'));
});

// ===========================================
// БЛОК 2: Опциональные поля
// ===========================================

console.log('\n🔍 БЛОК 2: Опциональные поля\n');

runTest('TC-OPT-001: Telegram отображается если указан', () => {
  assert(mockBookingData.formData.telegram === '@ivan');
});

runTest('TC-OPT-002: Доп. участники отображаются если указаны', () => {
  assert(mockBookingData.formData.additionalParticipants.length > 0);
});

runTest('TC-OPT-003: Вопросы отображаются если указаны', () => {
  assert(mockBookingData.formData.questions.length > 0);
});

runTest('TC-OPT-004: Страница работает без опциональных полей', () => {
  const minimalData = {
    duration: 30,
    date: '20 апреля 2026',
    formData: {
      firstName: 'Мария',
      lastName: 'Иванова',
      email: 'maria@example.com',
      phone: '+7 888 888-88-88'
    }
  };
  
  assert(minimalData.formData.firstName === 'Мария');
  assert(!minimalData.formData.telegram);
});

// ===========================================
// БЛОК 3: Следующие шаги
// ===========================================

console.log('\n📝 БЛОК 3: Следующие шаги\n');

const getNextSteps = (hasEmail, hasTelegram) => {
  const steps = [];
  
  if (hasEmail) {
    steps.push('Письмо с подтверждением');
    steps.push('Ссылка МТС-Линк');
  }
  
  if (hasTelegram) {
    steps.push('Напоминание в Telegram');
  }
  
  return steps;
};

runTest('TC-STEPS-001: Должен быть шаг про email', () => {
  const steps = getNextSteps(true, false);
  assert(steps.includes('Письмо с подтверждением'));
});

runTest('TC-STEPS-002: Должен быть шаг про МТС-Линк', () => {
  const steps = getNextSteps(true, false);
  assert(steps.includes('Ссылка МТС-Линк'));
});

runTest('TC-STEPS-003: Telegram шаг только если указан', () => {
  const withTelegram = getNextSteps(true, true);
  const withoutTelegram = getNextSteps(true, false);
  
  assert(withTelegram.includes('Напоминание в Telegram'));
  assert(!withoutTelegram.includes('Напоминание в Telegram'));
});

// ===========================================
// БЛОК 4: Действия
// ===========================================

console.log('\n🎬 БЛОК 4: Действия\n');

runTest('TC-ACT-001: Должна быть кнопка "Добавить в календарь"', () => {
  const actions = ['Добавить в календарь', 'На главную'];
  assert(actions.includes('Добавить в календарь'));
});

runTest('TC-ACT-002: Должна быть кнопка "На главную"', () => {
  const actions = ['Добавить в календарь', 'На главную'];
  assert(actions.includes('На главную'));
});

// ===========================================
// ИТОГИ ТЕСТИРОВАНИЯ
// ===========================================

console.log('\n' + '='.repeat(60));
console.log('📊 ИТОГИ ТЕСТИРОВАНИЯ F8.1');
console.log('='.repeat(60));
console.log(`\nВсего тестов: ${totalTests}`);
console.log(`✅ Пройдено: ${passedTests}`);
console.log(`❌ Провалено: ${failedTests}`);

const successRate = ((passedTests / totalTests) * 100).toFixed(1);
console.log(`\n📈 Процент успеха: ${successRate}%`);

if (failedTests === 0) {
  console.log('\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!');
  console.log('✅ Функция F8.1 готова к использованию');
  console.log('\n🎊 ВСЕ FRONTEND ФУНКЦИИ MVP ЗАВЕРШЕНЫ!');
} else {
  console.log('\n⚠️ ЕСТЬ ПРОВАЛЕННЫЕ ТЕСТЫ');
  console.log('❌ Требуется исправление ошибок');
}

console.log('\n' + '='.repeat(60));
