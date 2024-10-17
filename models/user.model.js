module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define('User', {
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		telegramId: {
			type: DataTypes.BIGINT, // Telegram ID, который может быть большим числом
			allowNull: false,
			unique: true, // Telegram ID должен быть уникальным
		},
		username: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		role: {
			type: DataTypes.INTEGER,
			defaultValue: 0, // 0 - User, 1 - Admin
		},
	})

	return User
}
