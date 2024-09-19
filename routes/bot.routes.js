const faqController = require('../controllers/faq.controller');

module.exports = (bot) => {
  // команда /faq
  bot.onText(/\/faq/, msg => {
    const chatID = msg.chat.id;
    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Поиск по ключевому слову', callback_data: 'search_keyword' }],
          [{ text: 'Поиск по разделам', callback_data: 'search_sections'}]
        ]
      }
    };
    bot.sendMessage(chatID, 'Выберите тип поиска:', options);
  });

  // Обработка callback
  bot.on('callback_query', async query => {
    const chatId = query.message.chat.id;

    if (query.data === 'search_keyword') {
      await bot.answerCallbackQuery(query.id)

      bot.sendMessage(chatId, 'Введите ключевое слово для поиска:');
      bot.once('message', async msg => {
        const keyword = msg.text;
        await faqController.handleFAQSearchByKeyword(bot, chatId, keyword); 
      });
    }

    if (query.data === 'search_sections') {
      await bot.answerCallbackQuery(query.id)
      await faqController.handleFAQSearchBySection(bot, chatId);
    }

    if (query.data.startsWith('section_')) {
      await bot.answerCallbackQuery(query.id)
      const section = query.data.split('_')[1];
      await faqController.handleFAQBySection(bot, chatId, section);
    }

    if (query.data.startsWith('faq_')) {
      await bot.answerCallbackQuery(query.id)
      const faqId = query.data.split('_')[1];
      await faqController.handleFAQByID(bot, chatId, faqId)
    }
  });
};