const TelegramBot = require('node-telegram-bot-api')
const sequelize = require('./models').sequelize
const { User, Task } = require('./models') // импорт модулей

require('dotenv').config()

const token = process.env.TOKEN_TELEGRAM_BOT
if (!token) {
	console.error('Ошибка: Токен для Telegram-бота не предоставлен!')
	process.exit(1)
}

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
])

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

// Команда /tasks (для пользователей с правами администратора)
//// bot.onText(/\/tasks/, async msg => {
//// 	try {
//// 		const user = await User.findOne({ where: { username: msg.chat.username } })

//// 		if (user && user.role === 1) {
//// 			const tasks = await Task.findAll()
//// 			tasks.forEach(task => {
//// 				bot.sendMessage(
//// 					msg.chat.id,
//// 					`Задача #${task.id}: ${task.description} (Статус: ${task.status})`
//// 				)
//// 			})
//// 		} else {
//// 			bot.sendMessage(msg.chat.id, 'У вас нет прав для просмотра задач')
//// 		}
//// 	} catch (err) {
//// 		console.error('Ошибка при получении задач:', err)
//// 		bot.sendMessage(msg.chat.id, 'Произошла ошибка при получении задач.')
//// 	}
//// })
