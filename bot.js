const TelegramBot = require('node-telegram-bot-api')
const sequelize = require('./models').sequelize
const { User, FAQ, Feedback, Task } = require('./models') // импорт модулей

require('dotenv').config()

const token = process.env.TOKEN_TELEGRAM_BOT
if (!token) {
	console.error('Ошибка: Токен для Telegram-бота не предоставлен!')
	process.exit(1)
}

const bot = new TelegramBot(token, { polling: true })
// Доделать команду /faq

// База данных
sequelize
	.sync()
	.then(() => console.log('База данных синхронизирована'))
	.catch(err => console.error('Ошибка подключения к базе данных:', err))

require('./routes/bot.routes')(bot)

//! Команда /start
bot.onText(/\/start/, async msg => {
	const chatId = msg.chat.id
	try {
		await User.findOrCreate({ where: { username: msg.chat.username } })
		bot.sendMessage(chatId, "Добро пожаловать на платформу 'Октагон'!")
	} catch (err) {
		console.error('Ошибка при создании пользователя:', err)
		bot.sendMessage(chatId, 'Произошла ошибка при регистрации.')
	}
})

bot.onText(/\/feedback/, msg => {
	const chatId = msg.chat.id
	bot.sendMessage(chatId, 'Напишите ваше сообщение для обратной связи')

	bot.once('message', async msg => {
		try {
			const feedback = await Feedback.create({
				userId: msg.from.id,
				message: msg.text,
			})
			bot.sendMessage(chatId, 'Заявка получена!')
			await notifyAdmins(feedback) // Уведомляем админов
		} catch (err) {
			console.error('Ошибка при создании обратной связи:', err)
			bot.sendMessage(chatId, 'Произошла ошибка при отправке обратной связи.')
		}
	})
})

async function notifyAdmins(feedback) {
	try {
		const admins = await User.findAll({ where: { role: 1 } })
		admins.forEach(admin => {
			bot.sendMessage(admin.id, `Новая заявка: ${feedback.message}`)
		})
	} catch (err) {
		console.error('Ошибка при уведомлении админов:', err)
	}
}

bot.onText(/\/tasks/, async msg => {
	try {
		const user = await User.findOne({ where: { username: msg.chat.username } })

		if (user && user.role === 1) {
			const tasks = await Task.findAll()
			tasks.forEach(task => {
				bot.sendMessage(
					msg.chat.id,
					`Задача #${task.id}: ${task.description} (Статус: ${task.status})`
				)
			})
		} else {
			bot.sendMessage(msg.chat.id, 'У вас нет прав для просмотра задач')
		}
	} catch (err) {
		console.error('Ошибка при получении задач:', err)
		bot.sendMessage(msg.chat.id, 'Произошла ошибка при получении задач.')
	}
})
