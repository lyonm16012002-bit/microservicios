const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { DB_PATH } = require('./env');
const usuario = require('../models/usuario.model');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

// Base de datos PROPIA de este microservicio (ningún otro servicio accede a ella).
const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');
db.exec(usuario.SCHEMA);

module.exports = db;
