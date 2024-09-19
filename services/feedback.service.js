const { Feedback, User } = require('../models')

// Получение последней активной заявки пользователя
const getLastOpenFeedback = async userId => {
	return await Feedback.findOne({
		where: {
			userId,
			status: 'open',
		},
		order: [['createdAt', 'DESC']],
	})
}

// Создание новой заявки
const createFeedback = async (userId, message, fileType = null, fileLink = null) => {
	return await Feedback.create({
		userId,
		message,
		file_type: fileType,
		file_link: fileLink,
	});
}

// Добавление сообщения к существующей заявке
const appendToFeedback = async (
	feedbackId,
	message,
	fileType = null,
	fileLink = null
) => {
	const feedback = await Feedback.findByPk(feedbackId)
	
	// Добавляем текст сообщения
	if (feedback.message) {
		feedback.message += `\n\n${message}`;
	} else {
		feedback.message = message;
	}

	// Сохраняем информацию о файле
	if (fileType && fileLink) {
		feedback.file_type = fileType;
		feedback.file_link = fileLink;
	}
	
	await feedback.save();
}

// Уведомление всех администраторов
const notifyAdmins = async (bot, message) => {
	const admins = await User.findAll({ where: { role: 1 } })
	admins.forEach(admin => {
		bot.sendMessage(admin.id, message)
	})
}

module.exports = {
	getLastOpenFeedback,
	createFeedback,
	appendToFeedback,
	notifyAdmins,
}
