// REPOSITORY: solo SQL.
const db = require('../config/database');
const { FIELDS } = require('../models/disciplina.model');

const limpiar = (v) => (v === '' || v === undefined ? null : v);

module.exports = {
  count() { return db.prepare('SELECT COUNT(*) AS c FROM disciplinas').get().c; },
  findAll() { return db.prepare('SELECT * FROM disciplinas ORDER BY nombre').all(); },
  findById(id) { return db.prepare('SELECT * FROM disciplinas WHERE id = ?').get(id); },
  findByNombre(nombre) { return db.prepare('SELECT * FROM disciplinas WHERE nombre = ? COLLATE NOCASE').get(nombre); },

  create(d) {
    const info = db.prepare(`INSERT INTO disciplinas (${FIELDS.join(', ')}) VALUES (${FIELDS.map(() => '?').join(', ')})`)
      .run(...FIELDS.map((f) => limpiar(d[f])));
    return this.findById(info.lastInsertRowid);
  },

  update(id, d) {
    db.prepare(`UPDATE disciplinas SET ${FIELDS.map((f) => `${f} = ?`).join(', ')} WHERE id = ?`).run(...FIELDS.map((f) => limpiar(d[f])), id);
    return this.findById(id);
  },

  remove(id) { return db.prepare('DELETE FROM disciplinas WHERE id = ?').run(id).changes; },
  contarTorneos(id) { return db.prepare('SELECT COUNT(*) AS c FROM torneos WHERE disciplina_id = ?').get(id).c; }
};
