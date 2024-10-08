import pool from "../db.js";
const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const cors = require("cors");
app.use(cors());
app.use(express.json());

// Función `iniciarSesion` que maneja la lógica de autenticación
async function iniciarSesion(correo, contraseña) {
  const query = "SELECT correo, contraseña FROM usuario WHERE correo = $1";
  try {
    // Buscar el usuario por correo en la base de datos
    const result = await pool.query(query, [correo]);

    // Si no se encuentra el usuario
    if (result.rows.length === 0) {
      return { success: false, message: "Usuario no encontrado" };
    }

    // Verificar la contraseña sin encriptación
    const user = result.rows[0];
    if (contraseña !== user.contraseña) {
      return { success: false, message: "Contraseña incorrecta" };
    }

    // Si todo está correcto, login exitoso
    return { success: true, message: "Login exitoso" };
  } catch (error) {
    console.error("Error en el login:", error);
    return { success: false, message: "Error interno del servidor" };
  }
}

// Endpoint que utiliza la función `iniciarSesion`
app.post("/iniciarSesion", async (req, res) => {
  const { correo, contraseña } = req.body; // Recibir correo y contraseña del body

  // Verificar que se enviaron correo y contraseña
  if (!correo || !contraseña) {
    return res
      .status(400)
      .json({ message: "Correo y contraseña son requeridos" });
  }

  // Llamar a la función iniciarSesion
  const result = await iniciarSesion(correo, contraseña);

  // Responder dependiendo del resultado de iniciarSesion
  if (result.success) {
    return res.status(200).json({ message: result.message });
  } else {
    return res.status(401).json({ message: result.message });
  }
});

//REGISTRARSE
export const inscribirse = async (req, res) => {
  let { nombre, apellido, correo, telefono, contrasena, tipodoc, numerodoc } =
    req.body;

  try {
    const user = await pool.query(
      "INSERT INTO usuario (nombre, apellido, correo, telefono, contraseña, tipodoc, numerodoc) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [nombre, apellido, correo, telefono, contrasena, tipodoc, numerodoc]
    );

    return res.json(user.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error creating user" });
  }
};

// Función para inscribirse
app.post("/inscribirse", async (req, res) => {
  const { fecha, categoria, id_usuario, id_evento } = req.body;

  try {
    const query = `
          INSERT INTO inscripcion (fecha, categoria, preinscripcion, id_usuario, id_evento)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *;`; // Retorna la fila insertada

    const values = [fecha, categoria, 0, id_usuario, id_evento]; // preinscripcion = 0
    const result = await pool.query(query, values);

    res.status(201).json({
      message: "Inscripción exitosa",
      data: result.rows[0], // Envía la fila insertada como respuesta
    });
  } catch (error) {
    console.error("Error al inscribir:", error);
    res.status(500).json({ error: "Error al inscribir" });
  }
});

// Función para preinscribirse
app.post("/preInscribirse", async (req, res) => {
  const { fecha, categoria, id_usuario, id_evento } = req.body;

  try {
    const query = `
          INSERT INTO inscripcion (fecha, categoria, preinscripcion, id_usuario, id_evento)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *;`; // Retorna la fila insertada

    const values = [fecha, categoria, 1, id_usuario, id_evento]; // preinscripcion = 1
    const result = await pool.query(query, values);

    res.status(201).json({
      message: "Preinscripción exitosa",
      data: result.rows[0], // Envía la fila insertada como respuesta
    });
  } catch (error) {
    console.error("Error al preinscribir:", error);
    res.status(500).json({ error: "Error al preinscribir" });
  }
});

/*export const getAllUsers = async (req, res) => {
  //Connect to database
  const posts = await pool.query("SELECT * FROM usuario;");

  return res.json(posts);
};*/
