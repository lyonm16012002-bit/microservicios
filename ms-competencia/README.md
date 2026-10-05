# ms-competencia (puerto 3002)

**Responsabilidad:** disciplinas (con sus reglas), torneos, partidos y **tabla de posiciones**. Base de datos propia: `data/competencia.db`. Las disciplinas iniciales (Futsal, Fútbol, Baloncesto, Voleibol, Balonmano) se crean al arrancar.

| Método | Ruta | JWT | Rol |
|---|---|:---:|---|
| GET | `/disciplinas`, `/torneos`, `/torneos/:id`, `/torneos/estadisticas`, `/partidos` | ✅ | cualquiera |
| GET | `/torneos/:id/posiciones` | ✅ | cualquiera |
| POST / PUT / DELETE | `/disciplinas`, `/torneos`, `/partidos` | ✅ | **admin** |
| DELETE | `/partidos/equipo/:equipoId` (uso interno) | ✅ | admin |

**Reglas de negocio (capa service):**
- Un torneo es disciplina + rama + periodo (`AAAA-1` o `AAAA-2`) y no se repite.
- Solo se programan partidos en torneos **En juego**; los dos equipos deben existir, ser del torneo y estar **aprobados** (se consulta a `ms-inscripciones` por HTTP).
- Un partido *Jugado* exige marcador válido según el deporte (`utils/reglas.js`): sin empates en baloncesto, sets 3-0/3-1/3-2 en voleibol.
- No puede haber dos partidos a la misma fecha y hora en la misma cancha ni con el mismo equipo.
- No se elimina un torneo con equipos inscritos ni una disciplina con torneos.
- La tabla se **calcula** desde los partidos jugados; no se guardan acumulados.

`npm start -w ms-competencia`
