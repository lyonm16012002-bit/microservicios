# ms-usuarios (puerto 3001)

**Responsabilidad:** autenticar, **emitir el JWT** y gestionar usuarios. Base de datos propia: `data/usuarios.db`.

| Método | Ruta | JWT | Rol |
|---|---|:---:|---|
| POST | `/auth/login` | ❌ | — |
| POST | `/auth/registro` (siempre crea un **delegado**) | ❌ | — |
| GET | `/auth/me` | ✅ | cualquiera |
| GET / POST | `/usuarios` | ✅ | admin |
| GET / PUT / DELETE | `/usuarios/:id` (PUT: usuario, nombre, rol, contraseña opcional) | ✅ | admin |

Roles: `admin` (organización de la liga) y `delegado` (representante de un equipo).
Reglas: usuario único (3-30 caracteres), contraseña mín. 6 guardada con bcrypt, nombre completo obligatorio al registrarse, nunca puede quedar el sistema sin administrador. Los usuarios iniciales se crean desde `.env` la primera vez (`config/seed.js`).

`npm start -w ms-usuarios`
