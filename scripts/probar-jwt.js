/**
 * Pruebas de seguridad JWT para mostrar en la presentación.
 * Requiere los servicios corriendo (npm start) y el .env configurado.
 * Uso:  npm run probar:jwt
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const jwt = require('jsonwebtoken');

const GATEWAY = `http://localhost:${process.env.GATEWAY_PORT || 3000}`;
const USUARIOS_DIRECTO = process.env.USUARIOS_URL || 'http://localhost:3001';
const COMPETENCIA_DIRECTO = process.env.COMPETENCIA_URL || 'http://localhost:3002';
const INSCRIPCIONES_DIRECTO = process.env.INSCRIPCIONES_URL || 'http://localhost:3003';
const SECRET = process.env.JWT_SECRET;

let fallos = 0;
const resultados = [];

async function llamar(base, metodo, ruta, { token, body } = {}) {
  const r = await fetch(base + ruta, {
    method: metodo,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  let data = null;
  try { data = await r.json(); } catch (e) { /* sin cuerpo */ }
  return { status: r.status, data };
}

async function caso(nombre, esperado, fn) {
  try {
    const { status, data } = await fn();
    const ok = status === esperado;
    if (!ok) fallos++;
    resultados.push({ ok, nombre, esperado, status, msg: (data && data.error) || '' });
  } catch (e) {
    fallos++;
    resultados.push({ ok: false, nombre, esperado, status: 'ERR', msg: e.message });
  }
}

const b64 = (s) => JSON.parse(Buffer.from(s, 'base64url').toString());

(async () => {
  if (!SECRET) { console.error('Falta JWT_SECRET en .env'); process.exit(1); }

  const login = (u, p) => llamar(GATEWAY, 'POST', '/api/auth/login', { body: { username: u, password: p } });
  const admin = await login(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD);
  const deleg = await login(process.env.DELEGADO_USERNAME, process.env.DELEGADO_PASSWORD);
  if (admin.status !== 200 || deleg.status !== 200) {
    console.error('No se pudo iniciar sesión con los usuarios del .env. ¿Están corriendo los servicios? ¿Cambiaste las claves después de crear la base? (npm run usuarios:reset)');
    process.exit(1);
  }
  const tokenAdmin = admin.data.token;
  const tokenDeleg = deleg.data.token;

  const expirado = jwt.sign({ sub: 1, username: 'x', role: 'admin' }, SECRET, { expiresIn: -60 });
  const otroSecreto = jwt.sign({ sub: 1, username: 'x', role: 'admin' }, 'secreto-falso', { expiresIn: '1h' });
  const [h, p, s] = tokenAdmin.split('.');
  const payloadFalso = Buffer.from(JSON.stringify({ ...b64(p), role: 'admin', username: 'hacker' })).toString('base64url');
  const alterado = `${h}.${payloadFalso}.${s}`; // payload modificado con la firma original

  console.log('\n=== ANATOMÍA DEL JWT (token del admin) ===');
  console.log('Header :', JSON.stringify(b64(h)));
  console.log('Payload:', JSON.stringify(b64(p)));
  console.log('Firma  :', s.slice(0, 20) + '...');

  // ---- Autenticación (¿quién eres?) ----
  await caso('Gateway: sin token', 401, () => llamar(GATEWAY, 'GET', '/api/torneos'));
  await caso('Gateway: token basura', 401, () => llamar(GATEWAY, 'GET', '/api/torneos', { token: 'abc.def.ghi' }));
  await caso('Gateway: payload alterado (firma no coincide)', 401, () => llamar(GATEWAY, 'GET', '/api/torneos', { token: alterado }));
  await caso('Gateway: token firmado con otro secreto', 401, () => llamar(GATEWAY, 'GET', '/api/torneos', { token: otroSecreto }));
  await caso('Gateway: token expirado', 401, () => llamar(GATEWAY, 'GET', '/api/torneos', { token: expirado }));
  await caso('Login con contraseña incorrecta', 401, () => login(process.env.ADMIN_USERNAME, 'incorrecta'));
  await caso('Gateway: token válido (admin)', 200, () => llamar(GATEWAY, 'GET', '/api/torneos', { token: tokenAdmin }));
  await caso('Gateway: resumen consolidado con token válido', 200, () => llamar(GATEWAY, 'GET', '/api/dashboard', { token: tokenAdmin }));
  await caso('Registro de delegado es público (llega a validar: 400)', 400, () => llamar(GATEWAY, 'POST', '/api/auth/registro', { body: {} }));

  // ---- Defensa en profundidad: saltarse el Gateway ----
  await caso('ms-usuarios directo (puerto 3001) sin token', 401, () => llamar(USUARIOS_DIRECTO, 'GET', '/usuarios'));
  await caso('ms-competencia directo (puerto 3002) sin token', 401, () => llamar(COMPETENCIA_DIRECTO, 'GET', '/torneos'));
  await caso('ms-inscripciones directo (puerto 3003) sin token', 401, () => llamar(INSCRIPCIONES_DIRECTO, 'GET', '/equipos'));
  await caso('ms-competencia directo con token alterado', 401, () => llamar(COMPETENCIA_DIRECTO, 'GET', '/torneos', { token: alterado }));
  await caso('ms-competencia directo con token válido', 200, () => llamar(COMPETENCIA_DIRECTO, 'GET', '/torneos', { token: tokenAdmin }));

  // ---- Autorización (¿qué puedes hacer?) ----
  await caso('Delegado puede LEER torneos', 200, () => llamar(GATEWAY, 'GET', '/api/torneos', { token: tokenDeleg }));
  await caso('Delegado SÍ puede inscribir (pasa la autorización; 400 por datos vacíos)', 400, () => llamar(GATEWAY, 'POST', '/api/inscripciones', { token: tokenDeleg, body: {} }));
  await caso('Delegado NO puede crear torneos (403)', 403, () => llamar(GATEWAY, 'POST', '/api/torneos', { token: tokenDeleg, body: {} }));
  await caso('Delegado NO puede editar torneos (403)', 403, () => llamar(GATEWAY, 'PUT', '/api/torneos/1', { token: tokenDeleg, body: { estado: 'En juego' } }));
  await caso('Delegado NO puede registrar partidos (403)', 403, () => llamar(GATEWAY, 'POST', '/api/partidos', { token: tokenDeleg, body: {} }));
  await caso('Delegado NO puede aprobar equipos (403)', 403, () => llamar(GATEWAY, 'PUT', '/api/equipos/1', { token: tokenDeleg, body: { estado: 'Aprobada' } }));
  await caso('Delegado NO puede eliminar jugadores (403)', 403, () => llamar(GATEWAY, 'DELETE', '/api/jugadores/1', { token: tokenDeleg }));
  await caso('Delegado NO puede ver usuarios (403)', 403, () => llamar(GATEWAY, 'GET', '/api/usuarios', { token: tokenDeleg }));
  await caso('Admin SÍ puede ver usuarios', 200, () => llamar(GATEWAY, 'GET', '/api/usuarios', { token: tokenAdmin }));

  console.log('\n=== RESULTADOS ===');
  for (const r of resultados) {
    console.log(`${r.ok ? '✔' : '✘'} ${r.nombre.padEnd(70)} esperado ${r.esperado} | obtenido ${r.status}${r.msg ? '  "' + r.msg + '"' : ''}`);
  }
  console.log(`\n${resultados.length - fallos}/${resultados.length} pruebas correctas`);
  process.exit(fallos ? 1 : 0);
})();
