module.exports = {
	HOST: 'localhost',
	USER: 'octagon_us',
	PASSWORD: 'root',
	DB: 'octagon',
	dialect: 'mysql',
	pool: {
		max: 5,
		min: 0,
		acquire: 30000,
		idle: 10000,
	},
}
