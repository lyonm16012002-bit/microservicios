const db = require('../config/database');
const { FIELDS } = require('../models/partido.model');

const limpiar = (v) => (v === '' || v === undefined ? null : v);

module.exports = {
  findAll(torneoId) {
    if (torneoId) return db.prepare('SELECT * FROM partidos WHERE torneo_id = ? ORDER BY fecha DESC, hora DESC, id DESC').all(torneoId);
    return db.prepare('SELECT * FROM partidos ORDER BY fecha DESC, hora DESC, id DESC').all();
  },

  findById(id) { return db.prepare('SELECT * FROM partidos WHERE id = ?').get(id); },

  // Partidos con resultado de un torneo (base de la tabla de posiciones)
  jugadosDeTorneo(torneoId) {
    return db.prepare("SELECT * FROM partidos WHERE torneo_id = ? AND estado = 'Jugado' ORDER BY fecha DESC, hora DESC, id DESC").all(torneoId);
  },

  programadosDeTorneo(torneoId) {
    return db.prepare("SELECT * FROM partidos WHERE torneo_id = ? AND estado = 'Programado' ORDER BY fecha ASC, hora ASC, id ASC").all(torneoId);
  },

  // ¿Ya hay otro partido activo a esa fecha y hora en la misma cancha, o con alguno de los dos equipos?
  findChoque({ fecha, hora, lugar, local, visitante }, excluirId = null) {
    return db.prepare(
      `SELECT id FROM partidos
        WHERE fecha = ? AND hora = ? AND estado IN ('Programado','Jugado') AND id != ?
          AND ((? IS NOT NULL AND lugar = ?)
               OR equipo_local_id IN (?, ?) OR equipo_visitante_id IN (?, ?))`
    ).get(fecha, hora, excluirId ?? -1, lugar ?? null, lugar ?? null, local, visitante, local, visitante);
  },

  create(d) {
    const cols = FIELDS.filter((f) => limpiar(d[f]) !== null);
    const info = db.prepare(`INSERT INTO partidos (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`).run(...cols.map((f) => limpiar(d[f])));
    return this.findById(info.lastInsertRowid);
  },

  update(id, d) {
    db.prepare(`UPDATE partidos SET ${FIELDS.map((f) => `${f} = ?`).join(', ')} WHERE id = ?`).run(...FIELDS.map((f) => limpiar(d[f])), id);
    return this.findById(id);
  },

  remove(id) { return db.prepare('DELETE FROM partidos WHERE id = ?').run(id).changes; },
  removeByEquipo(equipoId) { return db.prepare('DELETE FROM partidos WHERE equipo_local_id = ? OR equipo_visitante_id = ?').run(equipoId, equipoId).changes; },
  contarProgramados(hoy) { return db.prepare("SELECT COUNT(*) AS c FROM partidos WHERE estado = 'Programado' AND fecha >= ?").get(hoy).c; }
};
