module.exports = (sequelize, DataTypes) => {
	const FAQ = sequelize.define('FAQ', {
		question: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		answer: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		section: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	})
	return FAQ
}
