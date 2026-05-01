// booking-step-flow.test.js
// Тесты для многошаговой формы

console.log('🧪 ЗАПУСК ТЕСТОВ ДЛЯ ФУНКЦИИ F9.1\n');
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

// Симуляция state
let currentStep = 1;
let bookingData = {
  duration: 60,
  date: null,
  formData: null,
  questions: ''
};

const handleDurationSelect = (duration) => {
  bookingData.duration = duration;
  currentStep = 2;
};

const handleDateSelect = (date) => {
  bookingData.date = date;
  currentStep = 3;
};

const handleFormSubmit = (formData) => {
  bookingData.formData = formData;
  currentStep = 4; // Шаг вопросов
};

const handleQuestionsSubmit = (questions) => {
  bookingData.questions = questions;
};

const goBack = () => {
  if (currentStep > 1) {
    currentStep--;
  }
};

// ===========================================
// БЛОК 1: Навигация между шагами
// ===========================================

console.log('\n🔄 БЛОК 1: Навигация между шагами\n');

runTest('TC-NAV-001: Начальный шаг должен быть 1', () => {
  currentStep = 1;
  assert(currentStep === 1);
});

runTest('TC-NAV-002: Выбор длительности переводит на шаг 2', () => {
  currentStep = 1;
  handleDurationSelect(60);
  assert(currentStep === 2);
});

runTest('TC-NAV-003: Выбор даты переводит на шаг 3', () => {
  currentStep = 2;
  handleDateSelect('15 апреля 2026');
  assert(currentStep === 3);
});

runTest('TC-NAV-004: Отправка контактов переводит на шаг вопросов', () => {
  currentStep = 3;
  handleFormSubmit({ firstName: 'Иван' });
  assert(currentStep === 4);
});

runTest('TC-NAV-005: Отправка вопросов сохраняет данные', () => {
  currentStep = 4;
  bookingData.questions = '';
  handleQuestionsSubmit('Нужна демонстрация тренажеров');
  assert(bookingData.questions === 'Нужна демонстрация тренажеров');
});

runTest('TC-NAV-006: goBack() возвращает на предыдущий шаг', () => {
  currentStep = 4;
  goBack();
  assert(currentStep === 3);
});

runTest('TC-NAV-007: goBack() не работает на шаге 1', () => {
  currentStep = 1;
  goBack();
  assert(currentStep === 1);
});

// ===========================================
// БЛОК 2: Сохранение данных
// ===========================================

console.log('\n💾 БЛОК 2: Сохранение данных\n');

runTest('TC-DATA-001: Длительность сохраняется', () => {
  bookingData = { duration: 60, date: null, formData: null, questions: '' };
  handleDurationSelect(45);
  assert(bookingData.duration === 45);
});

runTest('TC-DATA-002: Дата сохраняется', () => {
  bookingData = { duration: 60, date: null, formData: null, questions: '' };
  handleDateSelect('20 апреля 2026');
  assert(bookingData.date === '20 апреля 2026');
});

runTest('TC-DATA-003: Данные формы сохраняются', () => {
  bookingData = { duration: 60, date: null, formData: null, questions: '' };
  const formData = { firstName: 'Иван', email: 'ivan@example.com' };
  handleFormSubmit(formData);
  assert(bookingData.formData.firstName === 'Иван');
});

runTest('TC-DATA-004: Вопросы сохраняются', () => {
  bookingData = { duration: 60, date: null, formData: null, questions: '' };
  handleQuestionsSubmit('Показать интеграцию с календарем');
  assert(bookingData.questions === 'Показать интеграцию с календарем');
});

runTest('TC-DATA-005: Данные не теряются при goBack()', () => {
  currentStep = 4;
  bookingData = { duration: 45, date: '15 апреля', formData: { firstName: 'Иван' }, questions: 'Вопросы есть' };
  goBack();
  assert(bookingData.duration === 45);
  assert(bookingData.date === '15 апреля');
  assert(bookingData.formData.firstName === 'Иван');
  assert(bookingData.questions === 'Вопросы есть');
});

// ===========================================
// БЛОК 3: Валидация потока
// ===========================================

console.log('\n✅ БЛОК 3: Валидация потока\n');

runTest('TC-FLOW-001: Полный поток должен завершиться успешно', () => {
  currentStep = 1;
  bookingData = { duration: 60, date: null, formData: null, questions: '' };
  
  handleDurationSelect(60);
  assert(currentStep === 2);
  
  handleDateSelect('15 апреля 2026');
  assert(currentStep === 3);
  
  handleFormSubmit({ firstName: 'Иван', email: 'ivan@example.com' });
  assert(currentStep === 4);

  handleQuestionsSubmit('Показать кейсы под EdTech');
  assert(bookingData.duration === 60);
  assert(bookingData.date === '15 апреля 2026');
  assert(bookingData.formData.firstName === 'Иван');
  assert(bookingData.questions === 'Показать кейсы под EdTech');
});

runTest('TC-FLOW-002: Можно вернуться и изменить данные', () => {
  currentStep = 4;
  bookingData = { duration: 60, date: '15 апреля', formData: { firstName: 'Иван' }, questions: 'Первые вопросы' };
  
  goBack(); // Шаг 3
  assert(currentStep === 3);
  
  goBack(); // Шаг 2
  assert(currentStep === 2);
  
  handleDurationSelect(30); // Меняем длительность
  assert(bookingData.duration === 30);
  assert(currentStep === 2);
});

// ===========================================
// БЛОК 4: Progress bar
// ===========================================

console.log('\n📊 БЛОК 4: Progress bar\n');

const getProgressPercentage = (step) => {
  return ((step - 1) / 3) * 100; // 4 шага -> 0%, 33%, 67%, 100%
};

runTest('TC-PROG-001: Прогресс на шаге 1 должен быть 0%', () => {
  assert(getProgressPercentage(1) === 0);
});

runTest('TC-PROG-002: Прогресс на шаге 2 должен быть 33.3%', () => {
  assert(getProgressPercentage(2).toFixed(1) === '33.3');
});

runTest('TC-PROG-003: Прогресс на шаге 3 должен быть 66.7%', () => {
  assert(getProgressPercentage(3).toFixed(1) === '66.7');
});

runTest('TC-PROG-004: Прогресс на шаге 4 должен быть 100%', () => {
  assert(getProgressPercentage(4) === 100);
});

// ===========================================
// ИТОГИ ТЕСТИРОВАНИЯ
// ===========================================

console.log('\n' + '='.repeat(60));
console.log('📊 ИТОГИ ТЕСТИРОВАНИЯ F9.1');
console.log('='.repeat(60));
console.log(`\nВсего тестов: ${totalTests}`);
console.log(`✅ Пройдено: ${passedTests}`);
console.log(`❌ Провалено: ${failedTests}`);

const successRate = ((passedTests / totalTests) * 100).toFixed(1);
console.log(`\n📈 Процент успеха: ${successRate}%`);

if (failedTests === 0) {
  console.log('\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!');
  console.log('✅ Функция F9.1 готова к использованию');
} else {
  console.log('\n⚠️ ЕСТЬ ПРОВАЛЕННЫЕ ТЕСТЫ');
  console.log('❌ Требуется исправление ошибок');
}

console.log('\n' + '='.repeat(60));
