const Sequelize = require('sequelize')
const dbConfig = require('../config/db.config')

// Инициализация Sequelize
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
	host: dbConfig.HOST,
	dialect: dbConfig.dialect,
	pool: {
		max: dbConfig.pool.max,
		min: dbConfig.pool.min,
		acquire: dbConfig.pool.acquire,
		idle: dbConfig.pool.idle,
	},
})

// Импорт моделей
const User = require('./user.model')(sequelize, Sequelize.DataTypes)
const FAQ = require('./faq.model')(sequelize, Sequelize.DataTypes)
const Feedback = require('./feedback.model')(sequelize, Sequelize.DataTypes)
const Task = require('./task.model')(sequelize, Sequelize.DataTypes)

// Экспортируем объект базы данных
const db = {
	User,
	FAQ,
	Feedback,
	Task,
	sequelize,
	Sequelize,
}

module.exports = db
