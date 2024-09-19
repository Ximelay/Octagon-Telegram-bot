module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define('User', {
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
