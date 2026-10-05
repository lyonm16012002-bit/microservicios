# api-gateway (puerto 3000)

**Responsabilidad:** ser la **única puerta de entrada**.

1. Sirve el panel web (`public/`): login con el logo de la Universidad de Manizales de fondo, panel de escritorio (menú lateral, tabla de posiciones, formulario de inscripción y gestión) con diseño futurista y animaciones (`css/futuro.css`).
2. `POST /api/auth/login` y `POST /api/auth/registro` son las únicas rutas públicas.
3. Todo lo demás pasa por `middleware/auth.js`, que valida el JWT (firma y expiración). Sin token válido responde **401** y la petición nunca llega a los microservicios.
4. Enruta con Axios (`services/proxy.service.js`): `/api/auth|usuarios` → ms-usuarios · `/api/disciplinas|torneos|partidos` → ms-competencia · `/api/inscripciones|equipos|jugadores` → ms-inscripciones.
5. `GET /api/dashboard` consolida datos de dos servicios en paralelo (`services/dashboard.service.js`).
6. Si un microservicio no responde, devuelve **503/504** con un mensaje claro.

El Gateway solo **autentica**; la **autorización por rol** la aplica cada microservicio, dueño de sus reglas.

`npm start -w api-gateway`
