const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const { DB_PATH } = require('./env');

fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

// Base de datos PROPIA de ms-inscripciones.
const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');
db.exec(require('../models/equipo.model').SCHEMA);
db.exec(require('../models/jugador.model').SCHEMA);

module.exports = db;
