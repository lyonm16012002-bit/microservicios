# Guía de sustentación — Liga UManizales

Material de apoyo para la presentación (Etapa 2, DevOps – WebApps). Proyecto de **LEO MONTES** y su grupo.

---

## 1. Cómo se relaciona con el archivo de referencia

El archivo entregado (`Liga UManizales PRO`, en `docs/referencia_agusto.zip`) era una sola página con los datos guardados en el navegador (`localStorage`). Se convirtió en un sistema real manteniendo **su misma pantalla y funciones**:

| En el archivo de referencia | En este proyecto |
|---|---|
| Selector de deporte (Fútbol, Baloncesto, Voleibol) | Selector de disciplina: **Futsal**, Fútbol, Baloncesto, Voleibol y Balonmano (el administrador puede agregar más) |
| Tabla `Equipo · PJ · GF · GC · DG · Pts` con logo y botón X | **Igual** (con escudos de iniciales, barra de puntos y además PG/PE/PP), calculada por el servidor. Las columnas cambian según el deporte: GF/GC (goles), PF/PC (puntos), SF/SC (sets) |
| "Agregar equipo" (solo un nombre) | **Formulario de inscripción**: equipo + lista de jugadores con documento, nombres, **carrera, facultad y EPS** |
| "Registrar partido" (equipos, goles, fecha) | **Igual** (solo administrador), con hora y validación según el deporte |
| "Partidos" (historial con X para borrar) | **Igual**, más los próximos partidos |
| Borrar un resultado: había que **revertir a mano** los puntos | La tabla se **calcula desde los partidos**: al borrar o corregir un resultado se actualiza sola |
| Datos en `localStorage` (cada persona ve lo suyo) | Bases de datos en el servidor, con **login, roles y JWT** |
| Todos hacen todo | El administrador gestiona; el delegado inscribe y consulta |
| Pantalla de celular (una sola columna) | **Diseño de escritorio**: menú lateral, tarjetas de cristal, pestañas de deporte y animaciones, con la paleta del logo (azul `#09234a`, dorado `#e7aa62`) |
| Sin identidad institucional | Login con el **logo de la Universidad de Manizales** de fondo (`api-gateway/public/img/logo-um.png`) |

## 2. Modelo de datos

| Microservicio | Tabla | Campos principales |
|---|---|---|
| ms-usuarios | users | username, nombre, password_hash (bcrypt), role (`admin` / `delegado`) |
| ms-competencia | disciplinas | nombre, tipo_marcador (goles / puntos / sets), jugadores_min, jugadores_max |
| ms-competencia | torneos | nombre, disciplina, rama (Masculino / Femenino / Mixto), periodo (2026-2), estado, cupo_equipos, cierre_inscripcion |
| ms-competencia | partidos | torneo, jornada, equipo_local_id, equipo_visitante_id, fecha, hora, lugar, estado, marcador_local, marcador_visitante |
| ms-inscripciones | equipos | torneo_id, nombre, facultad que representa, contacto del delegado, estado (Pendiente / Aprobada / Rechazada), delegado |
| ms-inscripciones | jugadores | equipo, **documento, nombre, apellido, carrera, facultad, EPS**, semestre, dorsal, posición, teléfono |

El **número de jugadores** de cada equipo no se guarda: se cuenta (`numero_jugadores`), así nunca se desincroniza.

Como cada servicio tiene su propia base de datos, no hay llaves foráneas entre servicios: `partidos` guarda ids de equipos y `equipos` guarda el id del torneo. Esa coherencia se verifica **por HTTP en la capa service**.

## 3. Las 7 preguntas del profesor, respondidas para este proyecto

**1. ¿Qué problema solucionan?**
La organización de la liga deportiva universitaria: inscripciones sin control (plantillas incompletas, estudiantes en dos equipos), tabla de posiciones calculada a mano con reglas distintas por deporte y ausencia de permisos.

**2. ¿Quiénes son los usuarios?**
- **Administrador** (organización de la liga): crea torneos, aprueba equipos, programa partidos, registra resultados y gestiona usuarios.
- **Delegado de equipo**: se registra, inscribe su equipo con sus jugadores y consulta torneos y posiciones. Solo ve a sus propios jugadores.

**3. ¿Qué información necesitan almacenar?**
Ver la tabla del modelo de datos (sección 2): usuarios, disciplinas, torneos, partidos, equipos y jugadores (con documento, carrera, facultad y EPS).

**4. ¿Qué microservicios van a desarrollar?**
`ms-usuarios` (autenticación y JWT), `ms-competencia` (disciplinas, torneos, partidos y posiciones) y `ms-inscripciones` (equipos y jugadores), más el `api-gateway` como punto de entrada.

**5. ¿Qué endpoints tendrá?**
Ver la tabla de la sección 7 del README.

**6. ¿Qué es JWT?**
Un token firmado (`header.payload.signature`) que el servidor entrega tras el login. Contiene la identidad y el rol del usuario y una fecha de expiración. La firma, hecha con un secreto que solo conocen los servicios, permite detectar cualquier alteración. Se envía en cada petición como `Authorization: Bearer <token>` y los servicios lo validan sin consultar la base de datos.
*Demostración:* `npm run probar:jwt` muestra el header y payload reales y prueba token ausente, alterado, expirado y válido.

**7. ¿Diferencia entre autenticación y autorización?**
Autenticación = *verificar quién eres* (login y validación del JWT → falla con 401). Autorización = *verificar qué puedes hacer* según tu rol (falla con 403).
*Ejemplo del proyecto:* un delegado tiene un token perfectamente válido (autenticado), pero `PUT /api/equipos/1` (aprobar un equipo) o `POST /api/partidos` le devuelven 403: solo el administrador puede.

## 4. Preguntas que el profesor podría hacer

- **¿Por qué el Gateway y los servicios validan el JWT?** Si alguien llama directo al puerto de un servicio se saltaría el Gateway. Cada servicio no confía ciegamente en quien lo llama (probado con `probar:jwt`).
- **¿Qué hace cada capa y qué pasa si una hace el trabajo de otra?** Ver la tabla de capas del README. Ejemplo: si el controller escribiera SQL, cambiar de SQLite a PostgreSQL obligaría a tocar todos los controllers.
- **¿Por qué una base de datos por servicio?** Independencia: se puede cambiar, escalar o desplegar uno sin afectar a los demás. El costo es perder llaves foráneas y JOINs entre servicios.
- **¿Cómo se comunican los servicios?** Por HTTP con Axios, reenviando el JWT del usuario. Ejemplos: `ms-competencia` pregunta a `ms-inscripciones` si un equipo existe y está aprobado antes de programar un partido; `ms-inscripciones` pregunta a `ms-competencia` por el estado del torneo y el máximo de jugadores del deporte.
- **¿Qué pasa si un microservicio se cae?** El resto sigue funcionando; el Gateway responde 503 en lo afectado, y un borrado entre servicios se cancela completo para no dejar datos huérfanos.
- **¿Por qué la tabla de posiciones no se guarda?** Para que nunca se desincronice: se calcula desde los partidos jugados. La referencia guardaba acumulados y tenía que "revertirlos" a mano al borrar un resultado.
- **¿Cómo se evita que un estudiante juegue en dos equipos?** Se guarda el documento junto al torneo con un índice único y la regla se valida en el service.
- **¿Dónde se guarda la contraseña?** Solo como hash bcrypt, nunca en texto plano.
- **¿Quién puede registrarse?** Cualquiera puede crear una cuenta, pero siempre como delegado; el rol administrador no se puede obtener desde el registro.
- **¿Por qué modificaron la estructura de carpetas del ejemplo?** Se respetó la pedida y se añadieron `config/`, `middleware/`, `utils/` y `clients/`, con la justificación en el README (sección 5.3).
- **¿Cuáles son las debilidades?** Ver README, sección 11.

## 5. Demostración sugerida (5–7 minutos)

1. **Login** con el logo de la universidad. Crear una cuenta de delegado.
2. Como administrador: ver la **tabla de posiciones** por deporte (cambiar entre Futsal, Voleibol y Baloncesto).
3. Como delegado: llenar el **formulario de inscripción** con jugadores (carrera, facultad, EPS). Mostrar el rechazo de un documento repetido.
4. Como administrador: **aprobar** el equipo, **registrar un partido** y ver cómo se actualiza la tabla; **borrar** el resultado y ver que se recalcula.
5. Mostrar que el delegado **no tiene** botones de editar/eliminar y que el servidor también responde 403.
6. Terminal: `npm run probar:jwt` (23/23) y, si hay tiempo, cerrar un microservicio para mostrar el 503.

## 6. Checklist de entrega

- [ ] Nombres reales de los integrantes en el README (sección 3)
- [ ] `.env` creado localmente (**no** subido al repositorio)
- [ ] Repositorio en GitHub con una rama por integrante y todo unido en `main`
- [ ] `npm install && npm start` funciona desde cero en otro computador
- [ ] `npm run probar:jwt` muestra 23/23 (capturas para el PowerPoint)
- [ ] PowerPoint con las 7 preguntas + pruebas del JWT (hay capturas listas en `docs/capturas/`)
- [ ] Demo ensayada, con capturas o video de respaldo
- [ ] Cada integrante puede explicar **todas** las capas, no solo su servicio
