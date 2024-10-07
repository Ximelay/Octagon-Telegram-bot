module.exports = (sequelize, DataTypes) => {
	const Task = sequelize.define('Task', {
		description: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		status: {
			type: DataTypes.STRING,
			defaultValue: 'pending', // Статус задачи (pending, completed)
		},
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false, // ID пользователя
		},
		adminId: {
			type: DataTypes.INTEGER,
			allowNull: true, // ID администратора
		},
		deadline: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	})

	Task.associate = function (models) {
		Task.belongsTo(models.User, { foreignKey: 'userId', as: 'creator' })
		Task.belongsTo(models.User, { foreignKey: 'adminId', as: 'admin' })
	}

	return Task
}
