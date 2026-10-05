const db = require('../config/database');
const { FIELDS } = require('../models/torneo.model');

const limpiar = (v) => (v === '' || v === undefined ? null : v);

// El torneo se devuelve junto con las reglas de su disciplina (las usa ms-inscripciones para validar plantillas)
const SELECT = `SELECT t.*, d.nombre AS disciplina, d.tipo_marcador, d.jugadores_min, d.jugadores_max
                FROM torneos t JOIN disciplinas d ON d.id = t.disciplina_id`;

module.exports = {
  findAll() { return db.prepare(`${SELECT} ORDER BY t.id DESC`).all(); },
  findById(id) { return db.prepare(`${SELECT} WHERE t.id = ?`).get(id); },

  findCombinacion(disciplinaId, rama, periodo, excluirId = null) {
    return db.prepare('SELECT id FROM torneos WHERE disciplina_id = ? AND rama = ? AND periodo = ? AND id != ?')
      .get(disciplinaId, rama, periodo, excluirId ?? -1);
  },

  create(d) {
    const cols = FIELDS.filter((f) => limpiar(d[f]) !== null);
    const info = db.prepare(`INSERT INTO torneos (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`).run(...cols.map((f) => limpiar(d[f])));
    return this.findById(info.lastInsertRowid);
  },

  update(id, d) {
    db.prepare(`UPDATE torneos SET ${FIELDS.map((f) => `${f} = ?`).join(', ')} WHERE id = ?`).run(...FIELDS.map((f) => limpiar(d[f])), id);
    return this.findById(id);
  },

  remove(id) { return db.prepare('DELETE FROM torneos WHERE id = ?').run(id).changes; }, // los partidos caen en cascada
  contarActivos() { return db.prepare("SELECT COUNT(*) AS c FROM torneos WHERE estado != 'Finalizado'").get().c; }
};
