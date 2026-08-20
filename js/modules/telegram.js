// ⚙️ НАСТРОЙКА (когда заказчик даст бота):
// 1. Создай бота у @BotFather → получи токен
// 2. Узнай chat_id у @userinfobot
// 3. Вставь оба значения ниже — и заявки полетят в Telegram
const TG_CONFIG = {
  botToken: "8835545928:AAF0bDgZCw-mPWrPUt6SVtB7eTkloktujX8",
  chatId: "8605142108",
};

export async function sendToTelegram(data) {
  if (TG_CONFIG.botToken.startsWith("ВСТАВЬ")) {
    console.log("📨 Telegram не подключён. Заявка:", data);
    return false;
  }

  const text = Object.entries(data)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${TG_CONFIG.botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TG_CONFIG.chatId,
          text: `🚗 Новая заявка с сайта\n\n${text}`,
        }),
      },
    );
    return response.ok;
  } catch {
    return false;
  }
}
