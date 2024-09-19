const faqController = require('../controllers/faq.controller')
const feedbackController = require('../controllers/feedback.controller')

// Состояние пользователя (feedback)
const userFeedbackState = {};

//! команда /faq
module.exports = bot => {
	bot.onText(/\/faq/, msg => {
		const chatId = msg.chat.id
		const options = {
			reply_markup: {
				inline_keyboard: [
					[
						{
							text: 'Поиск по ключевому слову',
							callback_data: 'search_keyword',
						},
					],
					[{ text: 'Поиск по разделам', callback_data: 'search_sections' }],
				],
			},
		}
		bot.sendMessage(chatId, 'Выберите тип поиска:', options)
	})

	// Обработка callback
	bot.on('callback_query', async query => {
		const chatId = query.message.chat.id

		if (query.data === 'search_keyword') {
			await bot.answerCallbackQuery(query.id)

			bot.sendMessage(chatId, 'Введите ключевое слово для поиска:')
			bot.once('message', async msg => {
				const keyword = msg.text
				await faqController.handleFAQSearchByKeyword(bot, chatId, keyword)
			})
		}

		if (query.data === 'search_sections') {
			await bot.answerCallbackQuery(query.id)
			await faqController.handleFAQSearchBySection(bot, chatId)
		}

		if (query.data.startsWith('section_')) {
			await bot.answerCallbackQuery(query.id)
			const section = query.data.split('_')[1]
			await faqController.handleFAQBySection(bot, chatId, section)
		}

		if (query.data.startsWith('faq_')) {
			await bot.answerCallbackQuery(query.id)
			const faqId = query.data.split('_')[1]
			await faqController.handleFAQByID(bot, chatId, faqId)
		}

		if (query.data === 'exit_feedback') {
			await bot.answerCallbackQuery(query.id)
			userFeedbackState[chatId] = false
			await feedbackController.handleExitFeedback(bot, chatId)
		}
	})

	// команда /feedback
	bot.onText(/\/feedback/, msg => {
		const chatId = msg.chat.id

		// Включаем режим обратной связи для пользователя
		userFeedbackState[chatId] = true
		bot.sendMessage(
			chatId,
			'Пожалуйста, отправьте ваше сообщение или файл для обратной связи.',
			{
				reply_markup: {
					inline_keyboard: [
						[{ text: 'Выйти из заявки', callback_data: 'exit_feedback' }],
					],
				},
			}
		)
	})

	// Обработка сообщений для обратной связи
	bot.on('message', async msg => {
		const chatId = msg.chat.id

		// Проверяем, находится ли пользователь в режиме обратной связи
		if (userFeedbackState[chatId]) {
			// Обрабатываем сообщение только если пользователь в режиме обратной связи
			if (msg.text && !msg.text.startsWith('/')) {
				await feedbackController.handleFeedbackMessage(bot, msg)
			} else if (msg.document || msg.photo || msg.video || msg.voice) {
				await feedbackController.handleFeedbackMessage(bot, msg)
			}
		}
	})
}
