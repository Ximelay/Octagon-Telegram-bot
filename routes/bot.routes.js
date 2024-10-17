const { text } = require('express')
const faqController = require('../controllers/faq.controller')
const feedbackController = require('../controllers/feedback.controller')

const { User, Feedback } = require('../models')
const { where } = require('sequelize')

// Состояния пользователей
const userState = {
	faq: {},
	feedback: {},
	admin: {},
}

// Команда /faq
module.exports = bot => {
	bot.onText(/\/faq/, msg => {
		const chatId = msg.chat.id
		console.log(`Команда /faq от пользователя ${chatId}`)

		// Сбрасываем все состояния перед началом новой команды
		userState.faq[chatId] = null
		userState.feedback[chatId] = null // Сброс состояния обратной связи
		userState.admin[chatId] = null // Сброс состояния администратора

		userState.faq[chatId] = 'awaiting_keyword_or_section' // Устанавливаем состояние для пользователя
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
					[{ text: 'Обратная связь', callback_data: 'feedback' }],
				],
			},
		}
		bot.sendMessage(chatId, 'Выберите тип поиска или обратную связь:', options)
	})

	// Обработка всех callback'ов
	bot.on('callback_query', async query => {
		const chatId = query.message.chat.id
		console.log(`Callback от пользователя ${chatId}: ${query.data}`)

		await bot.answerCallbackQuery(query.id) // Не забываем об этом!

		if (userState.faq[chatId]) {
			// Проверка на поиск по ключевому слову
			if (query.data === 'search_keyword') {
				userState.faq[chatId] = 'awaiting_keyword'
				bot.sendMessage(chatId, 'Введите ключевое слово для поиска:')
				return
			}

			// Проверка на поиск по разделам
			if (query.data === 'search_sections') {
				await faqController.handleFAQSearchBySection(bot, chatId)
				return
			}

			// Проверка выбора раздела
			if (query.data.startsWith('section_')) {
				const section = query.data.split('_')[1]
				await faqController.handleFAQBySection(bot, chatId, section)
				return
			}

			// Проверка выбора вопроса
			if (query.data.startsWith('faq_')) {
				const faqId = query.data.split('_')[1]
				await faqController.handleFAQByID(bot, chatId, faqId)
				return
			}

			// Проверка кнопки "Назад"
			if (query.data === 'faq_back') {
				await faqController.handleFAQBack(bot, chatId)
				return
			}
		}

		// Логика для администратора
		if (userState.admin[chatId] === 'viewing_requests') {
			if (query.data.startsWith('view_feedback_')) {
				const feedbackId = query.data.split('_')[2]
				const feedback = await Feedback.findByPk(feedbackId)

				if (!feedback) {
					return bot.sendMessage(chatId, 'Ошибка: заявка не найдена.')
				}

				bot.sendMessage(
					chatId,
					`Введите сообщение для отправки пользователю заявки ID: ${feedbackId}`
				)
				userState.admin[chatId] = `awaiting_reply_${feedbackId}`
				return
			}
		}
	})

	// Обработка сообщения после команды /faq
	bot.on('message', async msg => {
		const chatId = msg.chat.id
		console.log(`Сообщение от пользователя ${chatId}: ${msg.text}`)

		// Если пользователь в режиме FAQ, обрабатываем его сообщение
		if (userState.faq[chatId] === 'awaiting_keyword') {
			const keyword = msg.text
			userState.faq[chatId] = null // Сбрасываем состояние после обработки
			await faqController.handleFAQSearchByKeyword(bot, chatId, keyword)
			return
		}

		// Проверяем, находится ли пользователь в режиме обратной связи
		if (userState.feedback[chatId]) {
			if (msg.text && !msg.text.startsWith('/')) {
				await feedbackController.handleFeedbackMessage(bot, msg)
				return
			} else if (msg.document || msg.photo || msg.video || msg.voice) {
				await feedbackController.handleFeedbackMessage(bot, msg)
				return
			}
		}

		// Проверяем состояние администратора
		if (
			userState.admin[chatId] &&
			userState.admin[chatId].startsWith('awaiting_reply_')
		) {
			const feedbackId = userState.admin[chatId].split('_')[2]
			const text = msg.text.slice(0, 32) // Ограничиваем длину текста
			const feedback = await Feedback.findByPk(feedbackId)

			if (!feedback) {
				userState.admin[chatId] = null
				return bot.sendMessage(chatId, 'Ошибка: заявка не найдена.')
			}

			// Отправляем сообщение пользователю
			bot.sendMessage(feedback.userId, `ID: ${feedbackId} - ${text}`)
			bot.sendMessage(chatId, 'Сообщение отправлено.')
			userState.admin[chatId] = null // Сбрасываем состояние
			return
		}
	})

	// Команда /feedback
	bot.onText(/\/feedback/, msg => {
		const chatId = msg.chat.id
		console.log(`Команда /feedback от пользователя ${chatId}`)

		// Сбрасываем состояния перед началом новой команды
		userState.faq[chatId] = null // Сброс состояния FAQ
		userState.admin[chatId] = null // Сброс состояния администратора

		userState.feedback[chatId] = true
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

	// Обработка callback для обратной связи
	bot.on('callback_query', async query => {
		const chatId = query.message.chat.id

		// Обратная связь
		if (query.data === 'feedback') {
			await bot.answerCallbackQuery(query.id)
			userState.feedback[chatId] = true
			bot.sendMessage(
				chatId,
				'Перехожу в режим обратной связи. Отправьте ваше сообщение или файл.',
				{
					reply_markup: {
						inline_keyboard: [
							[{ text: 'Выйти из заявки', callback_data: 'exit_feedback' }],
						],
					},
				}
			)
			return
		}

		// Обработка выхода из режима обратной связи
		if (query.data === 'exit_feedback') {
			await bot.answerCallbackQuery(query.id)
			userState.feedback[chatId] = false
			await feedbackController.handleExitFeedback(bot, chatId)
			return
		}
	})

	// Проверяем роль пользователя
	const checkAdmin = async telegramId => {
		const user = await User.findOne({ where: { telegramId } })
		return user && user.role === 1 // 1 - роль администратора
	}

	// Команда /view_requests
	bot.onText(/\/view_requests/, async msg => {
		const chatId = msg.chat.id
		const telegramId = msg.from.id
		const isAdmin = await checkAdmin(telegramId) // Проверяем роль по telegramId

		if (!isAdmin) {
			return bot.sendMessage(chatId, 'У вас нет прав для просмотра заявок.')
		}

		userState.admin[chatId] = 'viewing_requests' // Состояние администратора
		const feedbacks = await Feedback.findAll({ where: { status: 'open' } })

		if (feedbacks.length === 0) {
			userState.admin[chatId] = null // Сбрасываем состояние
			return bot.sendMessage(chatId, 'Нет открытых заявок.')
		}

		// Формируем кнопки
		const options = {
			reply_markup: {
				inline_keyboard: feedbacks.map(feedback => [
					{
						text: `Заявка ID: ${feedback.id}`,
						callback_data: `view_feedback_${feedback.id}`,
					},
				]),
			},
		}

		bot.sendMessage(chatId, 'Выберите заявку для просмотра:', options)
	})
}
