const { text } = require('express')
const faqController = require('../controllers/faq.controller')
const feedbackController = require('../controllers/feedback.controller')

// Состояние пользователя (feedback)
const userFeedbackState = {}

// Команда /faq
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
					[{ text: 'Обратная связь', callback_data: 'feedback' }], // Добавлена кнопка обратной связи
				],
			},
		}
		bot.sendMessage(chatId, 'Выберите тип поиска или обратную связь:', options)
	})

	// Обработка callback'ов
	bot.on('callback_query', async query => {
		const chatId = query.message.chat.id

		// Поиск по ключевому слову
		if (query.data === 'search_keyword') {
			await bot.answerCallbackQuery(query.id)
			bot.sendMessage(chatId, 'Введите ключевое слово для поиска:')
			bot.once('message', async msg => {
				const keyword = msg.text
				await faqController.handleFAQSearchByKeyword(bot, chatId, keyword)
			})
		}

		// Поиск по разделам
		if (query.data === 'search_sections') {
			await bot.answerCallbackQuery(query.id)
			await faqController.handleFAQSearchBySection(bot, chatId)
		}

		// Обратная связь
		if (query.data === 'feedback') {
			await bot.answerCallbackQuery(query.id)
			userFeedbackState[chatId] = true
			bot.sendMessage(
				chatId,
				'Перехожу в режим обратной связи. Отправьте ваше сообщение или файл.', {
					reply_markup: {
						inline_keyboard: [
							[{ text: 'Выйти из заявки', callback_data: 'exit_feedback' }],
						],
					},
				})
		}

		// Выбор раздела для поиска вопросов
		if (query.data.startsWith('section_')) {
			await bot.answerCallbackQuery(query.id)
			const section = query.data.split('_')[1]
			await faqController.handleFAQBySection(bot, chatId, section)
		}

		// Выбор вопроса по ID
		if (query.data.startsWith('faq_')) {
			await bot.answerCallbackQuery(query.id)
			const faqId = query.data.split('_')[1]
			await faqController.handleFAQByID(bot, chatId, faqId)
		}

		// Обработка кнопки "Назад"
		if (query.data === 'faq_back') {
			await bot.answerCallbackQuery(query.id)
			await faqController.handleFAQBack(bot, chatId)
		}

		// Обработка кнопки "Главное меню"
		if (query.data === 'main_menu') {
			await bot.answerCallbackQuery(query.id)
			bot.sendMessage(
				chatId,
				'Вы вернулись в главное меню. Можете продолжить использовать другие команды.'
			)
		}

		// Обработка выхода из режима обратной связи
		if (query.data === 'exit_feedback') {
			await bot.answerCallbackQuery(query.id)
			userFeedbackState[chatId] = false
			await feedbackController.handleExitFeedback(bot, chatId)
		}
	})

	// Команда /feedback (обратная связь может быть запущена также этой командой напрямую)
	bot.onText(/\/feedback/, msg => {
		const chatId = msg.chat.id
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
