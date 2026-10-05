// REPOSITORY: única capa que habla SQL con la base de datos. No conoce HTTP ni reglas de negocio.
const db = require('../config/database');

const PUBLIC_COLUMNS = 'id, username, nombre, role'; // nunca se expone password_hash

module.exports = {
  count() {
    return db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
  },

  countByRole(role) {
    return db.prepare('SELECT COUNT(*) AS c FROM users WHERE role = ?').get(role).c;
  },

  findByUsername(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  },

  findById(id) {
    return db.prepare(`SELECT ${PUBLIC_COLUMNS} FROM users WHERE id = ?`).get(id);
  },

  findAll() {
    return db.prepare(`SELECT ${PUBLIC_COLUMNS} FROM users ORDER BY username`).all();
  },

  create({ username, nombre, passwordHash, role }) {
    const info = db.prepare('INSERT INTO users (username, nombre, password_hash, role) VALUES (?, ?, ?, ?)')
      .run(username, nombre || null, passwordHash, role);
    return this.findById(info.lastInsertRowid);
  },

  // Si passwordHash viene vacío, la contraseña actual NO se modifica.
  update(id, { username, nombre, role, passwordHash }) {
    if (passwordHash) {
      db.prepare('UPDATE users SET username = ?, nombre = ?, role = ?, password_hash = ? WHERE id = ?').run(username, nombre || null, role, passwordHash, id);
    } else {
      db.prepare('UPDATE users SET username = ?, nombre = ?, role = ? WHERE id = ?').run(username, nombre || null, role, id);
    }
    return this.findById(id);
  },

  remove(id) {
    return db.prepare('DELETE FROM users WHERE id = ?').run(id).changes;
  }
};
