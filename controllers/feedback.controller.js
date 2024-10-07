const feedbackService = require('../services/feedback.service')

// Обработка сообщения от пользователя
const handleFeedbackMessage = async (bot, msg) => {
	const chatId = msg.chat.id
	const userId = chatId
	let text = msg.caption || msg.text || '' // Используем caption для подписи файлов

	let fileType = null
	let fileLink = null

	// Проверяем наличие файлов в сообщении
	if (msg.document || msg.photo || msg.video || msg.voice) {
		let fileId

		if (msg.document) {
			fileId = msg.document.file_id
			fileType = msg.document.mime_type // Тип файла
		} else if (msg.photo) {
			fileId = msg.photo[msg.photo.length - 1].file_id
			fileType = 'image/jpeg' // Тип фото
		} else if (msg.video) {
			fileId = msg.video.file_id
			fileType = msg.video.mime_type
		} else if (msg.voice) {
			fileId = msg.voice.file_id
			fileType = 'audio/ogg' // Тип голосовых сообщений
		}

		try {
			// Получаем ссылку на файл через API Telegram
			fileLink = await bot.getFileLink(fileId)
		} catch (error) {
			console.error('Ошибка при получении ссылки на файл:', error)
			bot.sendMessage(chatId, 'Ошибка при обработке файла, попробуйте снова.')
			return
		}
	}

	const lastFeedback = await feedbackService.getLastOpenFeedback(userId)

	if (lastFeedback) {
		// Если есть открытая заявка, прикрепляем к ней новое сообщение или файл
		await feedbackService.appendToFeedback(
			lastFeedback.id,
			text,
			fileType,
			fileLink
		)
		bot.sendMessage(chatId, 'Ваше сообщение прикреплено к текущей заявке')
	} else {
		// Создаем новую заявку
		await feedbackService.createFeedback(userId, text, fileType, fileLink)
		bot.sendMessage(
			chatId,
			'Заявка получена! Вы можете писать дополнительные сообщения — они будут прикреплены к заявке.',
			{
				reply_markup: {
					inline_keyboard: [
						[{ text: 'Выйти из заявки', callback_data: 'exit_feedback' }],
					],
				},
			}
		)
		await feedbackService.notifyAdmins(bot, 'Поступила новая заявка!')
	}
}

// Обработка выхода из режима заявки
const handleExitFeedback = async (bot, chatId) => {
	bot.sendMessage(
		chatId,
		'Вы вышли из режима обратной связи. Можете продолжить использовать другие команды.'
	)
}

module.exports = {
	handleFeedbackMessage,
	handleExitFeedback,
}
