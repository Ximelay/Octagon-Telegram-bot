module.exports = (sequelize, DataTypes) => {
	const Task = sequelize.define('Task', {
		description: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		status: {
			type: DataTypes.STRING,
			defaultValue: 'pending', // Статус задачи (pending, completed и т.д.)
		},
		userId: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		deadline: {
			type: DataTypes.DATE,
			allowNull: true,
		},
	})

	return Task
}
