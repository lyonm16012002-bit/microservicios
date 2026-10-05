const repo = require('../repositories/disciplina.repository');
const { SEED } = require('../models/disciplina.model');

// Crea las disciplinas iniciales (Futsal, Fútbol, Baloncesto, Voleibol, Balonmano) si la tabla está vacía.
function seedDisciplinas() {
  if (repo.count() > 0) return;
  SEED.forEach((d) => repo.create(d));
  console.log(`[ms-competencia] Disciplinas iniciales creadas: ${SEED.map((d) => d.nombre).join(', ')}`);
}

module.exports = seedDisciplinas;
