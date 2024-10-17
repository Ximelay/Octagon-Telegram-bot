const express = require('express')
const TelegramBot = require('node-telegram-bot-api')
const sequelize = require('./models').sequelize
const { User, Task } = require('./models') // импорт модулей

require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000

const token = process.env.TOKEN_TELEGRAM_BOT
if (!token) {
	console.error('Ошибка: Токен для Telegram-бота не предоставлен!')
	process.exit(1)
}

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const bot = new TelegramBot(token, { polling: true })

// База данных
sequelize
	.sync()
	.then(() => console.log('База данных синхронизирована'))
	.catch(err => console.error('Ошибка подключения к базе данных:', err))

// Импорт маршрутов бота
require('./routes/bot.routes')(bot)

// Установка команд
bot.setMyCommands([
	{ command: '/start', description: 'Начать работу с ботом' },
	{ command: '/faq', description: 'Часто задаваемые вопросы' },
	{ command: '/feedback', description: 'Оставить обратную связь' },
	{ command: '/view_requests', description: 'Для админов' },
])

//! Команда /start
bot.onText(/\/start/, async msg => {
	const chatId = msg.chat.id
	const username = msg.from.username || 'неизвестно' // Если username отсутствует
	const telegramId = msg.from.id // Получаем telegramId

	try {
		// Находим или создаем пользователя
		const [user, created] = await User.findOrCreate({
			where: { username },
			defaults: {
				telegramId, // Передаем telegramId
				role: 0, // Устанавливаем роль по умолчанию
			},
		})

		if (created) {
			bot.sendMessage(chatId, "Добро пожаловать на платформу 'Октагон'!")
		} else {
			bot.sendMessage(chatId, "Вы уже зарегистрированы на платформе 'Октагон'!")
		}
	} catch (err) {
		console.error('Ошибка при создании пользователя:', err)
		bot.sendMessage(chatId, 'Произошла ошибка при регистрации.')
	}
})

app.listen(PORT, async () => {
	try {
		await sequelize.authenticate()
		console.log(`Сервер запущен на порту ${PORT}`)
	} catch (error) {
		console.error('Ошибка соединения с БД:', error)
	}
})
