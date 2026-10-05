# ms-inscripciones (puerto 3003)

**Responsabilidad:** el **formulario de inscripción**: equipos inscritos en cada torneo y su plantilla (documento, nombres, **carrera, facultad y EPS**). Base de datos propia: `data/inscripciones.db`. `torneo_id` referencia a un torneo de otro microservicio, por eso no hay `FOREIGN KEY`: el torneo se valida por HTTP (`clients/competencia.client.js`).

| Método | Ruta | JWT | Rol |
|---|---|:---:|---|
| POST | `/inscripciones` (equipo + jugadores en una transacción) | ✅ | cualquiera |
| GET | `/equipos`, `/equipos/:id`, `/equipos/estadisticas` | ✅ | cualquiera (contacto oculto a terceros) |
| PUT / DELETE | `/equipos/:id` (aprobar, rechazar, editar, eliminar) | ✅ | **admin** |
| GET | `/jugadores`, `/jugadores/:id` | ✅ | admin: todos · delegado: solo los suyos |
| POST | `/jugadores` | ✅ | admin o delegado dueño del equipo |
| PUT / DELETE | `/jugadores/:id` | ✅ | **admin** |

**Reglas de negocio (capa service):** inscripciones solo con el torneo abierto (el admin puede saltarlo); cupo de equipos; nombre de equipo único por torneo; plantilla entre 1 y el máximo del deporte (el mínimo se exige al aprobar); un documento solo en un equipo por torneo; dorsal único en el equipo; campos obligatorios por jugador. Al eliminar un equipo, primero se limpian sus partidos en `ms-competencia`.

`npm start -w ms-inscripciones`
