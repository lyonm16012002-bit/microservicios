const db = require('../config/database');
const { FIELDS } = require('../models/jugador.model');

const SELECT = 'SELECT j.*, e.nombre AS equipo FROM jugadores j JOIN equipos e ON e.id = j.equipo_id';
const limpiar = (v) => (v === '' || v === undefined ? null : v);

module.exports = {
  findAll({ equipo_id, torneo_id, delegado } = {}) {
    const where = [], params = [];
    if (equipo_id) { where.push('j.equipo_id = ?'); params.push(equipo_id); }
    if (torneo_id) { where.push('j.torneo_id = ?'); params.push(torneo_id); }
    if (delegado) { where.push('j.delegado = ?'); params.push(delegado); }
    return db.prepare(`${SELECT}${where.length ? ' WHERE ' + where.join(' AND ') : ''} ORDER BY e.nombre, j.dorsal, j.apellido`).all(...params);
  },

  findById(id) { return db.prepare(`${SELECT} WHERE j.id = ?`).get(id); },

  create(d) {
    const cols = ['equipo_id', 'torneo_id', 'delegado', ...FIELDS].filter((c) => limpiar(d[c]) !== null);
    const info = db.prepare(`INSERT INTO jugadores (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`).run(...cols.map((c) => limpiar(d[c])));
    return this.findById(info.lastInsertRowid);
  },

  update(id, d) {
    db.prepare(`UPDATE jugadores SET ${FIELDS.map((f) => `${f} = ?`).join(', ')} WHERE id = ?`).run(...FIELDS.map((f) => limpiar(d[f])), id);
    return this.findById(id);
  },

  remove(id) { return db.prepare('DELETE FROM jugadores WHERE id = ?').run(id).changes; },
  contarPorEquipo(equipoId) { return db.prepare('SELECT COUNT(*) AS c FROM jugadores WHERE equipo_id = ?').get(equipoId).c; },

  documentoEnTorneo(torneoId, documento, excluirId = null) {
    return db.prepare('SELECT id FROM jugadores WHERE torneo_id = ? AND documento = ? AND id != ?').get(torneoId, documento, excluirId ?? -1);
  },

  dorsalEnEquipo(equipoId, dorsal, excluirId = null) {
    return db.prepare('SELECT id FROM jugadores WHERE equipo_id = ? AND dorsal = ? AND id != ?').get(equipoId, dorsal, excluirId ?? -1);
  }
};
