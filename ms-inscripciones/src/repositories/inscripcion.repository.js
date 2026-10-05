// REPOSITORY de la inscripción completa: equipo + jugadores se guardan en UNA transacción
// (o se guardan todos o no se guarda nada).
const db = require('../config/database');
const equipoRepo = require('./equipo.repository');
const jugadorRepo = require('./jugador.repository');

const guardar = db.transaction((equipo, jugadores) => {
  const creado = equipoRepo.create(equipo);
  const lista = jugadores.map((j) => jugadorRepo.create({ ...j, equipo_id: creado.id, torneo_id: creado.torneo_id, delegado: creado.delegado }));
  return { equipo: equipoRepo.findById(creado.id), jugadores: lista };
});

module.exports = {
  crearConJugadores: guardar,
  documentosEnTorneo(torneoId, documentos) {
    if (!documentos.length) return [];
    return db.prepare(`SELECT documento FROM jugadores WHERE torneo_id = ? AND documento IN (${documentos.map(() => '?').join(', ')})`)
      .all(torneoId, ...documentos).map((r) => r.documento);
  }
};
