const mysql = require("mysql");

const connection = mysql.createConnection({
	host: process.env.DB_HOST,
	database: process.env.DB_DATABASE,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
});

connection.connect((error) => {
	if (error) {
		console.log("EL error de conexión es: " + error);
		return;
	}
	console.log("Conectado a la base de datos");
});

module.exports = connection;
