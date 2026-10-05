// REPOSITORY: solo SQL.
const db = require('../config/database');

const SELECT = `SELECT e.*, (SELECT COUNT(*) FROM jugadores j WHERE j.equipo_id = e.id) AS numero_jugadores FROM equipos e`;
const limpiar = (v) => (v === '' || v === undefined ? null : v);

module.exports = {
  findAll({ torneo_id, estado } = {}) {
    const where = [], params = [];
    if (torneo_id) { where.push('e.torneo_id = ?'); params.push(torneo_id); }
    if (estado) { where.push('e.estado = ?'); params.push(estado); }
    return db.prepare(`${SELECT}${where.length ? ' WHERE ' + where.join(' AND ') : ''} ORDER BY e.torneo_id DESC, e.nombre`).all(...params);
  },

  findById(id) { return db.prepare(`${SELECT} WHERE e.id = ?`).get(id); },

  create(d) {
    const cols = ['torneo_id', 'nombre', 'facultad', 'telefono_contacto', 'correo_contacto', 'estado', 'observaciones', 'delegado'].filter((c) => limpiar(d[c]) !== null);
    const info = db.prepare(`INSERT INTO equipos (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`).run(...cols.map((c) => limpiar(d[c])));
    return this.findById(info.lastInsertRowid);
  },

  update(id, d) {
    db.prepare('UPDATE equipos SET nombre = ?, facultad = ?, telefono_contacto = ?, correo_contacto = ?, estado = ?, observaciones = ? WHERE id = ?')
      .run(d.nombre, d.facultad, limpiar(d.telefono_contacto), limpiar(d.correo_contacto), d.estado, limpiar(d.observaciones), id);
    return this.findById(id);
  },

  remove(id) { return db.prepare('DELETE FROM equipos WHERE id = ?').run(id).changes; }, // sus jugadores caen en cascada

  nombreExiste(torneoId, nombre, excluirId = null) {
    return db.prepare('SELECT id FROM equipos WHERE torneo_id = ? AND nombre = ? COLLATE NOCASE AND id != ?').get(torneoId, nombre, excluirId ?? -1);
  },

  contarActivosPorTorneo(torneoId) {
    return db.prepare("SELECT COUNT(*) AS c FROM equipos WHERE torneo_id = ? AND estado != 'Rechazada'").get(torneoId).c;
  },

  estadisticas() {
    return {
      equiposInscritos: db.prepare("SELECT COUNT(*) AS c FROM equipos WHERE estado != 'Rechazada'").get().c,
      equiposPendientes: db.prepare("SELECT COUNT(*) AS c FROM equipos WHERE estado = 'Pendiente'").get().c,
      jugadoresInscritos: db.prepare('SELECT COUNT(*) AS c FROM jugadores').get().c
    };
  }
};
