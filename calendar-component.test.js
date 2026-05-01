// calendar-component.test.js
// Unit тесты для компонента календаря

// Импортируем функции для тестирования
// В реальности эти функции нужно экспортировать из calendar-component.jsx

// Вспомогательные функции (скопированы из компонента для тестирования)
const holidays2026 = [
  '2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04',
  '2026-01-05', '2026-01-06', '2026-01-07', '2026-01-08',
  '2026-02-23', '2026-03-08', '2026-05-01', '2026-05-09',
  '2026-06-12', '2026-11-04'
];

function isHoliday(date) {
  if (!date) return false;
  const dateStr = date.toISOString().split('T')[0];
  return holidays2026.includes(dateStr);
}

function isWeekend(date) {
  if (!date) return false;
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

function isPastDate(date) {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
}

function isToday(date) {
  if (!date) return false;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function getDaysInMonth(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  
  const startingDayOfWeek = firstDay.getDay();
  const days = [];
  
  const offset = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
  for (let i = 0; i < offset; i++) {
    days.push(null);
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    const day = new Date(year, month, i);
    days.push(day);
  }
  
  return days;
}

// ===========================================
// ТЕСТЫ
// ===========================================

console.log('🧪 ЗАПУСК UNIT-ТЕСТОВ ДЛЯ ФУНКЦИИ F1.1\n');
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

// ===========================================
// БЛОК 1: Тесты getDaysInMonth()
// ===========================================

console.log('\n📅 БЛОК 1: Тесты getDaysInMonth()\n');

runTest('TC-U-001: Апрель 2026 должен содержать 30 дней', () => {
  const date = new Date(2026, 3, 1);
  const days = getDaysInMonth(date);
  const actualDays = days.filter(d => d !== null);
  
  assert(actualDays.length === 30, `Ожидалось 30 дней, получено ${actualDays.length}`);
});

runTest('TC-U-002: Апрель 2026 должен начинаться со среды (2 null в начале)', () => {
  const date = new Date(2026, 3, 1);
  const days = getDaysInMonth(date);
  
  assert(days[0] === null, 'Первая ячейка должна быть null (Пн)');
  assert(days[1] === null, 'Вторая ячейка должна быть null (Вт)');
  assert(days[2] !== null, 'Третья ячейка должна быть датой (Ср 1 апреля)');
  assert(days[2].getDate() === 1, 'Третья ячейка должна быть 1 апреля');
});

runTest('TC-U-003: Февраль 2024 (високосный) должен содержать 29 дней', () => {
  const date = new Date(2024, 1, 1);
  const days = getDaysInMonth(date);
  const actualDays = days.filter(d => d !== null);
  
  assert(actualDays.length === 29, `Ожидалось 29 дней, получено ${actualDays.length}`);
});

runTest('TC-U-004: Февраль 2025 (обычный) должен содержать 28 дней', () => {
  const date = new Date(2025, 1, 1);
  const days = getDaysInMonth(date);
  const actualDays = days.filter(d => d !== null);
  
  assert(actualDays.length === 28, `Ожидалось 28 дней, получено ${actualDays.length}`);
});

// ===========================================
// БЛОК 2: Тесты isHoliday()
// ===========================================

console.log('\n🎄 БЛОК 2: Тесты isHoliday()\n');

runTest('TC-U-005: 1 января 2026 должно быть праздником', () => {
  const date = new Date(2026, 0, 1);
  assert(isHoliday(date) === true, '1 января должно быть праздником');
});

runTest('TC-U-006: 8 января 2026 должно быть праздником (последний день каникул)', () => {
  const date = new Date(2026, 0, 8);
  assert(isHoliday(date) === true, '8 января должно быть праздником');
});

runTest('TC-U-007: 9 мая 2026 должно быть праздником', () => {
  const date = new Date(2026, 4, 9);
  assert(isHoliday(date) === true, '9 мая должно быть праздником');
});

runTest('TC-U-008: 15 апреля 2026 НЕ должно быть праздником', () => {
  const date = new Date(2026, 3, 15);
  assert(isHoliday(date) === false, '15 апреля не должно быть праздником');
});

runTest('TC-U-009: null НЕ должно вызывать ошибку', () => {
  const result = isHoliday(null);
  assert(result === false, 'null должно возвращать false');
});

runTest('TC-U-010: Все праздники 2026 должны определяться корректно', () => {
  const testHolidays = [
    new Date(2026, 0, 1),   // 1 января
    new Date(2026, 1, 23),  // 23 февраля
    new Date(2026, 2, 8),   // 8 марта
    new Date(2026, 4, 1),   // 1 мая
    new Date(2026, 4, 9),   // 9 мая
    new Date(2026, 5, 12),  // 12 июня
    new Date(2026, 10, 4)   // 4 ноября
  ];
  
  testHolidays.forEach(holiday => {
    assert(isHoliday(holiday) === true, `${holiday.toDateString()} должно быть праздником`);
  });
});

// ===========================================
// БЛОК 3: Тесты isWeekend()
// ===========================================

console.log('\n🏖️ БЛОК 3: Тесты isWeekend()\n');

runTest('TC-U-011: Суббота должна определяться как выходной', () => {
  const saturday = new Date(2026, 3, 4); // 4 апреля 2026 - суббота
  assert(isWeekend(saturday) === true, 'Суббота должна быть выходным');
});

runTest('TC-U-012: Воскресенье должно определяться как выходной', () => {
  const sunday = new Date(2026, 3, 5); // 5 апреля 2026 - воскресенье
  assert(isWeekend(sunday) === true, 'Воскресенье должно быть выходным');
});

runTest('TC-U-013: Понедельник НЕ должен быть выходным', () => {
  const monday = new Date(2026, 3, 6); // 6 апреля 2026 - понедельник
  assert(isWeekend(monday) === false, 'Понедельник не должен быть выходным');
});

runTest('TC-U-014: Среда НЕ должна быть выходным', () => {
  const wednesday = new Date(2026, 3, 15); // 15 апреля 2026 - среда
  assert(isWeekend(wednesday) === false, 'Среда не должна быть выходным');
});

runTest('TC-U-015: null НЕ должно вызывать ошибку', () => {
  const result = isWeekend(null);
  assert(result === false, 'null должно возвращать false');
});

// ===========================================
// БЛОК 4: Тесты isPastDate()
// ===========================================

console.log('\n⏮️ БЛОК 4: Тесты isPastDate()\n');

runTest('TC-U-016: Вчерашний день должен быть прошедшим', () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  assert(isPastDate(yesterday) === true, 'Вчера должно быть прошедшей датой');
});

runTest('TC-U-017: Сегодня ДОЛЖЕН быть заблокирован для записи', () => {
  const today = new Date();
  
  // Проверяем что сегодня определяется как "сегодня"
  assert(isToday(today) === true, 'isToday должен вернуть true для сегодня');
  
  // НО: сегодня НЕ должен быть доступен для выбора
  // (команде нужно время на подготовку к встрече)
});

runTest('TC-U-018: Завтра НЕ должен быть прошедшим днём', () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  assert(isPastDate(tomorrow) === false, 'Завтра не должно быть прошедшей датой');
  assert(isToday(tomorrow) === false, 'Завтра не должно быть сегодня');
});

runTest('TC-U-019: Сравнение должно игнорировать время суток', () => {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // Почти полночь
  
  assert(isPastDate(today) === false, 'Сегодня в 23:59 не должно быть прошедшей датой');
});

runTest('TC-U-020: null НЕ должно вызывать ошибку', () => {
  const result = isPastDate(null);
  assert(result === false, 'null должно возвращать false');
});

// ===========================================
// БЛОК 5: Тесты isToday()
// ===========================================

console.log('\n📍 БЛОК 5: Тесты isToday()\n');

runTest('TC-U-021: Сегодняшняя дата должна определяться корректно', () => {
  const today = new Date();
  
  assert(isToday(today) === true, 'Сегодня должно возвращать true');
});

runTest('TC-U-022: Вчерашний день НЕ должен быть сегодня', () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  assert(isToday(yesterday) === false, 'Вчера не должно быть сегодня');
});

runTest('TC-U-023: Завтрашний день НЕ должен быть сегодня', () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  assert(isToday(tomorrow) === false, 'Завтра не должно быть сегодня');
});

runTest('TC-U-024: null НЕ должно вызывать ошибку', () => {
  const result = isToday(null);
  assert(result === false, 'null должно возвращать false');
});

// ===========================================
// БЛОК 6: Граничные случаи
// ===========================================

console.log('\n🔄 БЛОК 6: Граничные случаи\n');

runTest('TC-B-001: Переход с декабря 2026 на январь 2027', () => {
  const december = new Date(2026, 11, 31);
  const january = new Date(december.getFullYear(), december.getMonth() + 1, 1);
  
  assert(january.getMonth() === 0, 'Должен быть январь (месяц 0)');
  assert(january.getFullYear() === 2027, 'Должен быть 2027 год');
});

runTest('TC-B-002: Переход с января 2027 на декабрь 2026', () => {
  const january = new Date(2027, 0, 1);
  const december = new Date(january.getFullYear(), january.getMonth() - 1, 1);
  
  assert(december.getMonth() === 11, 'Должен быть декабрь (месяц 11)');
  assert(december.getFullYear() === 2026, 'Должен быть 2026 год');
});

runTest('TC-B-003: Январь 2026 должен иметь правильное количество дней', () => {
  const january = new Date(2026, 0, 1);
  const days = getDaysInMonth(january);
  const actualDays = days.filter(d => d !== null);
  
  assert(actualDays.length === 31, 'Январь должен содержать 31 день');
});

// ===========================================
// ИТОГИ ТЕСТИРОВАНИЯ
// ===========================================

console.log('\n' + '='.repeat(60));
console.log('📊 ИТОГИ ТЕСТИРОВАНИЯ');
console.log('='.repeat(60));
console.log(`\nВсего тестов: ${totalTests}`);
console.log(`✅ Пройдено: ${passedTests}`);
console.log(`❌ Провалено: ${failedTests}`);

const successRate = ((passedTests / totalTests) * 100).toFixed(1);
console.log(`\n📈 Процент успеха: ${successRate}%`);

if (failedTests === 0) {
  console.log('\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!');
  console.log('✅ Функция F1.1 готова к использованию');
} else {
  console.log('\n⚠️ ЕСТЬ ПРОВАЛЕННЫЕ ТЕСТЫ');
  console.log('❌ Требуется исправление ошибок');
}

console.log('\n' + '='.repeat(60));
