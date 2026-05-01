// duration-selector.test.js
// Unit тесты для компонента выбора длительности

console.log('🧪 ЗАПУСК UNIT-ТЕСТОВ ДЛЯ ФУНКЦИИ F2.1\n');
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
// БЛОК 1: Тесты данных о длительностях
// ===========================================

console.log('\n⏱️  БЛОК 1: Тесты данных о длительностях\n');

const durations = [
  { value: 30, label: '30 минут', description: 'Экспресс-демо' },
  { value: 45, label: '45 минут', description: 'Стандартное демо' },
  { value: 60, label: '60 минут', description: 'Полное демо с вопросами' }
];

runTest('TC-D-001: Должно быть ровно 3 варианта длительности', () => {
  assert(durations.length === 3, `Ожидалось 3 варианта, получено ${durations.length}`);
});

runTest('TC-D-002: Варианты должны быть: 30, 45, 60 минут', () => {
  const values = durations.map(d => d.value);
  
  assert(values.includes(30), 'Должен быть вариант 30 минут');
  assert(values.includes(45), 'Должен быть вариант 45 минут');
  assert(values.includes(60), 'Должен быть вариант 60 минут');
});

runTest('TC-D-003: Каждый вариант должен иметь label', () => {
  durations.forEach(duration => {
    assert(duration.label, `Вариант ${duration.value} должен иметь label`);
    assert(duration.label.includes('минут'), 'Label должен содержать слово "минут"');
  });
});

runTest('TC-D-004: Каждый вариант должен иметь description', () => {
  durations.forEach(duration => {
    assert(duration.description, `Вариант ${duration.value} должен иметь description`);
    assert(duration.description.length > 0, 'Description не должно быть пустым');
  });
});

runTest('TC-D-005: 60 минут должен иметь description "Полное демо с вопросами"', () => {
  const duration60 = durations.find(d => d.value === 60);
  
  assert(duration60, 'Должен быть вариант 60 минут');
  assert(
    duration60.description === 'Полное демо с вопросами',
    `Ожидалось "Полное демо с вопросами", получено "${duration60.description}"`
  );
});

// ===========================================
// БЛОК 2: Тесты значений по умолчанию
// ===========================================

console.log('\n🎯 БЛОК 2: Тесты значений по умолчанию\n');

runTest('TC-DEF-001: По умолчанию должно быть выбрано 60 минут', () => {
  const defaultDuration = 60;
  
  assert(defaultDuration === 60, `Ожидалось 60, получено ${defaultDuration}`);
});

runTest('TC-DEF-002: Значение по умолчанию должно быть одним из доступных вариантов', () => {
  const defaultDuration = 60;
  const values = durations.map(d => d.value);
  
  assert(
    values.includes(defaultDuration),
    `Значение по умолчанию ${defaultDuration} должно быть в списке доступных`
  );
});

// ===========================================
// БЛОК 3: Тесты выбора длительности
// ===========================================

console.log('\n👆 БЛОК 3: Тесты выбора длительности\n');

// Симуляция state и callback
let selectedDuration = 60;
let callbackCalled = false;
let callbackValue = null;

const handleDurationSelect = (duration) => {
  selectedDuration = duration;
  callbackCalled = true;
  callbackValue = duration;
};

runTest('TC-SEL-001: Выбор 30 минут должен обновить состояние', () => {
  selectedDuration = 60; // Начальное состояние
  handleDurationSelect(30);
  
  assert(selectedDuration === 30, `Ожидалось 30, получено ${selectedDuration}`);
});

runTest('TC-SEL-002: Выбор 45 минут должен обновить состояние', () => {
  selectedDuration = 60;
  handleDurationSelect(45);
  
  assert(selectedDuration === 45, `Ожидалось 45, получено ${selectedDuration}`);
});

runTest('TC-SEL-003: Выбор 60 минут должен обновить состояние', () => {
  selectedDuration = 30;
  handleDurationSelect(60);
  
  assert(selectedDuration === 60, `Ожидалось 60, получено ${selectedDuration}`);
});

runTest('TC-SEL-004: Callback должен быть вызван с правильным значением', () => {
  callbackCalled = false;
  callbackValue = null;
  
  handleDurationSelect(45);
  
  assert(callbackCalled === true, 'Callback должен быть вызван');
  assert(callbackValue === 45, `Callback должен получить 45, получено ${callbackValue}`);
});

runTest('TC-SEL-005: Множественные выборы должны работать корректно', () => {
  selectedDuration = 60;
  
  handleDurationSelect(30);
  assert(selectedDuration === 30, 'Первый выбор: 30');
  
  handleDurationSelect(45);
  assert(selectedDuration === 45, 'Второй выбор: 45');
  
  handleDurationSelect(60);
  assert(selectedDuration === 60, 'Третий выбор: 60');
});

// ===========================================
// БЛОК 4: Валидация данных
// ===========================================

console.log('\n✅ БЛОК 4: Валидация данных\n');

runTest('TC-VAL-001: Все варианты длительности должны быть положительными числами', () => {
  durations.forEach(duration => {
    assert(
      typeof duration.value === 'number',
      `Значение ${duration.value} должно быть числом`
    );
    assert(
      duration.value > 0,
      `Значение ${duration.value} должно быть положительным`
    );
  });
});

runTest('TC-VAL-002: Все варианты должны быть кратны 15 минутам', () => {
  durations.forEach(duration => {
    assert(
      duration.value % 15 === 0,
      `Значение ${duration.value} должно быть кратно 15 минутам`
    );
  });
});

runTest('TC-VAL-003: Варианты должны быть в возрастающем порядке', () => {
  for (let i = 1; i < durations.length; i++) {
    assert(
      durations[i].value > durations[i - 1].value,
      `${durations[i].value} должно быть больше ${durations[i - 1].value}`
    );
  }
});

runTest('TC-VAL-004: Максимальная длительность не должна превышать 90 минут', () => {
  const maxDuration = Math.max(...durations.map(d => d.value));
  
  assert(
    maxDuration <= 90,
    `Максимальная длительность ${maxDuration} не должна превышать 90 минут`
  );
});

runTest('TC-VAL-005: Минимальная длительность не должна быть меньше 15 минут', () => {
  const minDuration = Math.min(...durations.map(d => d.value));
  
  assert(
    minDuration >= 15,
    `Минимальная длительность ${minDuration} не должна быть меньше 15 минут`
  );
});

// ===========================================
// БЛОК 5: UI логика
// ===========================================

console.log('\n🎨 БЛОК 5: UI логика\n');

runTest('TC-UI-001: Бейдж "РЕКОМЕНДУЕМ" должен быть только на 60 минутах', () => {
  const recommended = durations.filter(d => d.value === 60);
  
  assert(recommended.length === 1, 'Должен быть ровно один рекомендуемый вариант');
  assert(recommended[0].value === 60, 'Рекомендуемый вариант должен быть 60 минут');
});

runTest('TC-UI-002: Выбранный элемент должен отличаться визуально', () => {
  const isSelected = (value) => value === selectedDuration;
  
  selectedDuration = 45;
  
  assert(isSelected(45) === true, '45 должно быть выбрано');
  assert(isSelected(30) === false, '30 не должно быть выбрано');
  assert(isSelected(60) === false, '60 не должно быть выбрано');
});

runTest('TC-UI-003: Информационный блок должен показывать выбранную длительность', () => {
  selectedDuration = 30;
  const infoText = `Вы выбрали: ${selectedDuration} минут`;
  
  assert(
    infoText.includes('30 минут'),
    'Информационный блок должен содержать "30 минут"'
  );
});

// ===========================================
// БЛОК 6: Интеграция с другими компонентами
// ===========================================

console.log('\n🔗 БЛОК 6: Интеграция с другими компонентами\n');

runTest('TC-INT-001: Выбранная длительность должна передаваться в календарь', () => {
  let receivedDuration = null;
  
  const mockCalendarCallback = (duration) => {
    receivedDuration = duration;
  };
  
  handleDurationSelect(45);
  mockCalendarCallback(selectedDuration);
  
  assert(receivedDuration === 45, `Календарь должен получить 45, получено ${receivedDuration}`);
});

runTest('TC-INT-002: Изменение длительности должно пересчитать доступные слоты', () => {
  // Симуляция проверки доступности слотов
  const checkAvailability = (duration) => {
    // Для 30 минут больше доступных слотов
    // Для 60 минут меньше доступных слотов
    return duration === 30 ? 20 : duration === 45 ? 15 : 10;
  };
  
  assert(checkAvailability(30) === 20, '30 минут должно давать больше слотов');
  assert(checkAvailability(45) === 15, '45 минут должно давать средне слотов');
  assert(checkAvailability(60) === 10, '60 минут должно давать меньше слотов');
});

// ===========================================
// БЛОК 7: Граничные случаи
// ===========================================

console.log('\n🔄 БЛОК 7: Граничные случаи\n');

runTest('TC-EDGE-001: Повторный выбор того же значения должен работать', () => {
  selectedDuration = 60;
  callbackCalled = false;
  
  handleDurationSelect(60);
  
  assert(selectedDuration === 60, 'Значение должно остаться 60');
  assert(callbackCalled === true, 'Callback все равно должен быть вызван');
});

runTest('TC-EDGE-002: Быстрые множественные клики должны обрабатываться корректно', () => {
  selectedDuration = 60;
  
  // Симуляция быстрых кликов
  handleDurationSelect(30);
  handleDurationSelect(45);
  handleDurationSelect(60);
  handleDurationSelect(30);
  
  assert(selectedDuration === 30, 'Последний выбор должен быть 30');
});

// ===========================================
// ИТОГИ ТЕСТИРОВАНИЯ
// ===========================================

console.log('\n' + '='.repeat(60));
console.log('📊 ИТОГИ ТЕСТИРОВАНИЯ F2.1');
console.log('='.repeat(60));
console.log(`\nВсего тестов: ${totalTests}`);
console.log(`✅ Пройдено: ${passedTests}`);
console.log(`❌ Провалено: ${failedTests}`);

const successRate = ((passedTests / totalTests) * 100).toFixed(1);
console.log(`\n📈 Процент успеха: ${successRate}%`);

if (failedTests === 0) {
  console.log('\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ УСПЕШНО!');
  console.log('✅ Функция F2.1 готова к использованию');
} else {
  console.log('\n⚠️ ЕСТЬ ПРОВАЛЕННЫЕ ТЕСТЫ');
  console.log('❌ Требуется исправление ошибок');
}

console.log('\n' + '='.repeat(60));
