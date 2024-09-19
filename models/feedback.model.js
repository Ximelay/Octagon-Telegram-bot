module.exports = (sequelize, DataTypes) => {
	const Feedback = sequelize.define('Feedback', {
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		message: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		status: {
			type: DataTypes.STRING,
			defaultValue: 'open',
		},
		file_type: {
			type: DataTypes.STRING,
			allowNull: true, // Поле может быть пустым, если файла нет
		},
		file_link: {
			type: DataTypes.TEXT,
			allowNull: true, // Поле может быть пустым, если файла нет
		},
	})

	return Feedback
}
