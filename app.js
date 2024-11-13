const linkDesploy = "https://hecho-en-peru-8n034rrxm-accordss-projects.vercel.app";

const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");
const session = require("express-session");
const bcryptjs = require("bcryptjs");

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
	cors({
		origin: linkDesploy, // El dominio de tu frontend
		methods: ["GET", "POST"], // Métodos permitidos
		allowedHeaders: ["Content-Type", "Authorization"], // Encabezados permitidos
	})
);

app.use(
	cors({
		origin: "*", // Permite cualquier dominio (recomendado solo en desarrollo)
	})
);

dotenv.config({ path: "./env/.env" });

app.use(express.static(path.join(__dirname, "public")));

app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			maxAge: 3600000,
			httpOnly: true,
			sameSite: "strict",
		},
	})
);
const connection = require("./database/db");

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

const port = process.env.PORT || 3000;

app.listen(port, function () {
	console.log(`Servidor creado en http://localhost:${port}`);
});

//Registro
app.post("/validar", async function (req, res) {
	const datos = req.body;

	let nombre = datos.Nombre;
	let apellido = datos.Apellido;
	let email = datos.Email;
	let contrasenia = datos.Contrasenia;

	let contraseniaHaash = await bcryptjs.hash(contrasenia, 8);

	let emailSearch = `SELECT email FROM usuarios WHERE email = "${email}" `;

	connection.query(emailSearch, function (err, rows) {
		if (err) {
			console.error("Error al consultar la base de datos:", err);
			return res.json({
				success: false,
				message: "Hubo un error en la base de datos al verificar el correo.",
			});
		} else {
			if (rows.length > 0) {
				return res.json({
					success: false,
					message: "Este correo electrónico ya está registrado.",
				});
			} else {
				let newConnection = `INSERT INTO usuarios (nombre, apellido, email, contrasenia)VALUES ('${nombre}', '${apellido}', '${email}', '${contraseniaHaash}')`;
				connection.query(newConnection, function (err, rows) {
					if (err) {
						console.error("Error en la inserción:", err);
						return res.json({
							success: false,
							message: "Hubo un error en el servidor.",
						});
					} else {
						return res.json({
							success: true,
							message: "Correo válido para el registro.",
						});
					}
				});
			}
		}
	});
});

//Login
app.post("/login", async (req, res) => {
	const datos = req.body;

	let email = datos.email;
	let contrasenia = datos.password;
	let passwordHaash = await bcryptjs.hash(contrasenia, 8);

	if (email && contrasenia) {
		connection.query("SELECT * FROM usuarios WHERE email = ?", [email], async (error, results) => {
			if (results.length == 0 || !(await bcryptjs.compare(contrasenia, results[0].contrasenia))) {
				return res.json({
					success: false,
					message: "Usuario y/o contraseña incorrectos",
				});
			} else {
				req.session.loggedin = true;
				req.session.usuario_id = results[0].usuario_id;
				req.session.Nombre = results[0].nombre;

				req.session.sesion_id = results[0].sesion_id;

				connection.query("INSERT INTO sesiones (usuario_id) VALUES (?)", [req.session.usuario_id], (err, resultado) => {
					if (err) {
						console.error("Error al insertar en sesiones:", err);
						return res.status(500).json({ success: false, message: "Error en el servidor" });
					}

					req.session.sesion_id = resultado.insertId;

					return res.json({
						success: true,
						message: "Inicio de sesión exitoso",
					});
				});
			}
		});
	}
});

//Home
app.get("/session", (req, res) => {
	if (req.session.loggedin) {
		return res.json({
			success: true,
			session: req.session,
		});
	} else {
		return res.json({
			success: false,
			message: "No has iniciado sesión",
		});
	}
});

//Logout
app.get("/logout", (req, res) => {
	const id_sesion = req.session.sesion_id;
	connection.query(`UPDATE sesiones SET fecha_fin = CURRENT_TIMESTAMP WHERE sesion_id = ${id_sesion}`);
	req.session.destroy(() => {
		res.redirect("/views/html.index");
	});
});

//Carrito
app.post("/carrito", (req, res) => {
	const datos = req.body;
	const id_usuario = req.session.usuario_id;
	const tituloProducto = datos.titulo;
	const precio = datos.precio;
	const cantidad = datos.cantidad;

	// Buscar el producto en la base de datos
	connection.query("SELECT * FROM productos WHERE nombre = ?", [tituloProducto], (error, results) => {
		if (error) {
			console.error("Error al buscar el producto:", error);
			return res.status(500).json({ error: "Error al buscar el producto" });
		}

		if (results.length > 0) {
			const productoID = results[0].producto_id;
			req.session.productoID = productoID;

			// Verificar si el usuario ya tiene un carrito
			connection.query("SELECT * FROM carrito WHERE usuario_id = ?", [id_usuario], (err, carritoResults) => {
				if (err) {
					console.error("Error al verificar el carrito:", err);
					return res.status(500).json({ error: "Error al verificar el carrito" });
				}

				if (carritoResults.length > 0) {
					const carritoID = carritoResults[0].carrito_id;
					req.session.carritoID = carritoID;

					// Verificar si el producto ya está en el carrito
					connection.query(
						"SELECT * FROM productos_carrito WHERE producto_id = ? AND carrito_id = ?",
						[productoID, carritoID],
						(err, productoCarritoResults) => {
							if (err) {
								console.error("Error al verificar el producto en el carrito:", err);
								return res.status(500).json({ error: "Error al verificar el producto en el carrito" });
							}

							if (productoCarritoResults.length > 0) {
								// Si el producto ya está en el carrito, actualizar la cantidad
								const cantidadTotal = productoCarritoResults[0].cantidad + cantidad;

								connection.query(
									"UPDATE productos_carrito SET cantidad = ? WHERE carrito_id = ? AND producto_id = ?",
									[cantidadTotal, carritoID, productoID],
									(e, r) => {
										if (e) {
											console.error("Error al actualizar el producto en el carrito:", e);
											return res.status(500).json({ error: "Error al actualizar el producto en el carrito" });
										}

										return res.json({
											titulo: tituloProducto,
											precio: precio,
											cantidad: cantidadTotal,
										});
									}
								);
							} else {
								// Si el producto no está en el carrito, agregarlo
								connection.query(
									"INSERT INTO productos_carrito (producto_id, carrito_id, cantidad) VALUES (?, ?, ?)",
									[productoID, carritoID, cantidad],
									(e, r) => {
										if (e) {
											console.error("Error al agregar el producto al carrito:", e);
											return res.status(500).json({ error: "Error al agregar el producto al carrito" });
										}

										return res.json({
											titulo: tituloProducto,
											precio: precio,
											cantidad: cantidad,
										});
									}
								);
							}
						}
					);
				} else {
					// Si no existe el carrito, crear uno nuevo y agregar el producto
					connection.query("INSERT INTO carrito (usuario_id) VALUES (?)", [id_usuario], (err, result) => {
						if (err) {
							console.error("Error al crear el carrito:", err);
							return res.status(500).json({ error: "Error al crear el carrito" });
						}

						const carritoID = result.insertId;
						req.session.carritoID = carritoID;

						// Agregar el producto al carrito
						connection.query(
							"INSERT INTO productos_carrito (producto_id, carrito_id, cantidad) VALUES (?, ?, ?)",
							[productoID, carritoID, cantidad],
							(e, r) => {
								if (e) {
									console.error("Error al agregar el producto al carrito:", e);
									return res.status(500).json({ error: "Error al agregar el producto al carrito" });
								}

								return res.json({
									titulo: tituloProducto,
									precio: precio,
									cantidad: cantidad,
								});
							}
						);
					});
				}
			});
		} else {
			return res.status(404).json({ error: "Producto no encontrado" });
		}
	});
});

app.post("/carrito/eliminar", (req, res) => {
	const nombreProducto = req.body.titulo;

	// Consulta para obtener el producto en el carrito
	connection.query(
		"SELECT p.producto_id, p.nombre AS titulo, p.precio, pc.cantidad FROM productos_carrito pc JOIN productos p ON pc.producto_id = p.producto_id WHERE p.nombre = ? AND pc.carrito_id = ?",
		[nombreProducto, req.session.carritoID],
		(error, results) => {
			if (error) {
				console.error("Error al buscar el producto en el carrito:", error);
				return res.status(500).json({ error: "Error al buscar el producto en el carrito" });
			}

			// Si se encuentra el producto
			if (results.length > 0) {
				const productoID = results[0].producto_id;
				let cantidad = results[0].cantidad;

				// Reducir la cantidad
				if (cantidad > 1) {
					cantidad--;

					// Actualizar la cantidad en la base de datos
					connection.query(
						"UPDATE productos_carrito SET cantidad = ? WHERE carrito_id = ? AND producto_id = ?",
						[cantidad, req.session.carritoID, productoID],
						(updateError) => {
							if (updateError) {
								console.error("Error al actualizar la cantidad:", updateError);
								return res.status(500).json({ error: "Error al actualizar la cantidad" });
							}
							return res.json({ message: "Cantidad actualizada", cantidad });
						}
					);
				} else {
					// Eliminar el producto si la cantidad es 1
					connection.query(
						"DELETE FROM productos_carrito WHERE producto_id = ? AND carrito_id = ?",
						[productoID, req.session.carritoID],
						(deleteError) => {
							if (deleteError) {
								console.error("Error al eliminar el producto:", deleteError);
								return res.status(500).json({ error: "Error al eliminar el producto" });
							}
							return res.json({ message: "Producto eliminado del carrito" });
						}
					);
				}
			} else {
				// Producto no encontrado en el carrito
				return res.status(404).json({ error: "Producto no encontrado en el carrito" });
			}
		}
	);
});

app.get("/carrito", (req, res) => {
	connection.query(
		"SELECT p.nombre AS titulo, p.precio, pc.cantidad FROM productos_carrito pc JOIN productos p ON pc.producto_id = p.producto_id WHERE pc.carrito_id = ?",
		[req.session.carritoID],
		(error, results) => {
			if (error) {
				return res.status(500).json({ error: "Error al obtener el carrito" });
			}
			res.json(results);
		}
	);
});
