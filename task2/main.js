// Основная точка входа в скрипт
async function main() {
  try {
    // Обновление высоты содержимого
    postMessageWithContentHeight();

    // Отложенное отображение данных вызова
    delayShowChallengeData();

    // Получаем значения challenge и incident из DOM
    const challengeValue = document.getElementById('challenge')?.value;
    const incidentValue = document.getElementById('incident')?.value;

    // Устанавливаем статус выполнения
    setRunStatus('⧗'); // "Ожидание"

    // Запуск вызова (challenge)
    const challengeData = await runChallenge();

    // Успешное завершение вызова
    setRunStatus('✔'); // "Успешно"
    const token = challengeData.token;

    // Формируем результат
    const result = { ...challengeData, error: '' };

    // Отправка результата
    const response = await processResult(result);

    // Проверяем, мобильное ли устройство
    const isMobile = checkIfMobile();
    if (isMobile) {
      handleMobile(response);
    } else {
      handleWeb(response, token);
    }
  } catch (error) {
    handleError(error);
  }
}

// Проверяет, является ли устройство мобильным
function checkIfMobile() {
  const queryParams = new URLSearchParams(document.location.search);
  return queryParams.get('mode') === 'mobile';
}

// Обрабатывает результат и отправляет его на сервер
async function processResult(result) {
  return await sendCandidate(result);
}

// Обрабатывает ошибки, возникающие в процессе выполнения
function handleError(error) {
  console.error(error);
  setRunStatus('✖'); // "Ошибка"

  const errorDetails = {
    level: 'critical',
    build_ts: '2024-10-15T09:22:43.174Z',
    lib_version: '0.3.2',
    challenge_id: asString(document.getElementById('incident')?.value, 128),
    user_agent: asString(window.navigator.userAgent, 384),
    url: asString(window.location.href, 512),
    client_ts: new Date().toISOString(),
    message: asString(error.message || error, 256),
    stack_trace: asString(error.stack || '', 1024),
  };

  const errorPayload = {
    token: document.getElementById('challenge')?.value,
    fp: '',
    error: JSON.stringify(errorDetails),
  };

  // Отправляем ошибку на сервер
  processResult(errorPayload);
}

// Запускаем `main` после загрузки окна
window.addEventListener('load', main);
