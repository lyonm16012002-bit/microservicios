api.requireLogin();

var main = document.getElementById('mainContent');

/* =====================================================================
   Utilidades
   ===================================================================== */
function isAdmin() { return api.role() === 'admin'; }
function anyone() { return true; }
function nobody() { return false; }

function esc(v) {
  return String(v === null || v === undefined ? '' : v).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

// Convierte un valor (número o texto) en un argumento seguro para un atributo onclick="...".
function jsArg(value) {
  return JSON.stringify(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '\\u003c');
}

function badge(valor) {
  var ok = ['Aprobada', 'En juego', 'Jugado'];
  var bad = ['Rechazada', 'Cancelado'];
  var neutral = ['Finalizado'];
  var cls = ok.indexOf(valor) >= 0 ? 'badge-ok' : bad.indexOf(valor) >= 0 ? 'badge-bad' : neutral.indexOf(valor) >= 0 ? 'badge-neutral' : 'badge-warn';
  return '<span class="badge ' + cls + '">' + esc(valor) + '</span>';
}

var TIPOS = { goles: 'Goles', puntos: 'Puntos', sets: 'Sets' };
var ROLES = { admin: 'Administrador', delegado: 'Delegado de equipo' };

/* ---------- Iconos (SVG de línea) ---------- */
var ICONS = {
  liga: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  inscribir: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9zM12 11v6M9 14h6"/>',
  equipos: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  jugadores: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c2.7.3 5 2.5 5 5.8"/>',
  partidos: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  torneos: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  disciplinas: '<circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/>',
  dashboard: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  usuarios: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  futbol: '<circle cx="12" cy="12" r="9"/><path d="M12 8l3.5 2.5-1.3 4h-4.4l-1.3-4zM12 3v5M20.5 9.5l-5 1M17.5 19l-3.3-4.5M6.5 19l3.3-4.5M3.5 9.5l5 1"/>',
  basquet: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18M5.5 5.5c3.5 3 3.5 10 0 13M18.5 5.5c-3.5 3-3.5 10 0 13"/>',
  voley: '<circle cx="12" cy="12" r="9"/><path d="M12 3c0 5-3 8-8.5 9M12 3c4 1.5 7 4.5 8.5 9M3.5 12c4 .5 8 3 9.5 8.8M20.5 12c-4 0-8 2-10.5 6"/>'
};
function icon(name) {
  return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || ICONS.disciplinas) + '</svg>';
}
function iconoDeporte(nombre) {
  var n = (nombre || '').toLowerCase();
  if (n.indexOf('baloncesto') >= 0) return 'basquet';
  if (n.indexOf('voleibol') >= 0) return 'voley';
  return 'futbol';
}

/* ---------- Escudos con iniciales (color según el nombre) ---------- */
var GRADIENTES = [
  'linear-gradient(135deg,#2a62ff,#6a45e8)', 'linear-gradient(135deg,#10b981,#0e7490)', 'linear-gradient(135deg,#f59e0b,#d97706)',
  'linear-gradient(135deg,#ec4899,#be185d)', 'linear-gradient(135deg,#06b6d4,#1d4ed8)', 'linear-gradient(135deg,#8b5cf6,#6d28d9)'
];
function escudo(nombre) {
  nombre = String(nombre || '?');
  var palabras = nombre.trim().split(/\s+/);
  var ini = (palabras[0][0] + (palabras[1] ? palabras[1][0] : '')).toUpperCase();
  var h = 0; for (var i = 0; i < nombre.length; i++) h = (h * 31 + nombre.charCodeAt(i)) >>> 0;
  return '<span class="escudo" style="background:' + GRADIENTES[h % GRADIENTES.length] + '">' + esc(ini) + '</span>';
}

/* ---------- Avisos (toast) ---------- */
function toast(msg, tipo) {
  var box = document.getElementById('toasts');
  var t = document.createElement('div');
  t.className = 'toast ' + (tipo || '');
  t.textContent = msg;
  box.appendChild(t);
  setTimeout(function () { t.classList.add('out'); setTimeout(function () { t.remove(); }, 400); }, 4200);
}

/* ---------- Animación de números ---------- */
function animarNumeros(raiz) {
  (raiz || document).querySelectorAll('.num[data-to]').forEach(function (el) {
    var destino = Number(el.dataset.to) || 0, inicio = performance.now(), dur = 1000;
    function paso(t) {
      var p = Math.min(1, (t - inicio) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(destino * e);
      if (p < 1) requestAnimationFrame(paso); else el.textContent = destino;
    }
    requestAnimationFrame(paso);
  });
}

/* ---------- Pintar una vista (reinicia la animación de entrada) ---------- */
function setPage(titulo, subtitulo) {
  document.getElementById('pageTitle').textContent = titulo;
  document.getElementById('pageSub').textContent = subtitulo || '';
}
function show(html) {
  main.classList.remove('view');
  void main.offsetWidth;
  main.classList.add('view');
  main.innerHTML = html;
  animarNumeros(main);
}
function loader() { show('<div class="loader"><i></i></div>'); }

/* =====================================================================
   Listas de referencia (torneos, equipos, disciplinas)
   ===================================================================== */
var refs = { torneos: [], equipos: [], disciplinas: [] };
var REF_ENDPOINT = { torneos: '/api/torneos', equipos: '/api/equipos', disciplinas: '/api/disciplinas' };

async function loadRefs(names) {
  await Promise.all((names || []).map(async function (n) { refs[n] = await api.get(REF_ENDPOINT[n]); }));
}
function refItem(source, id) { return refs[source].find(function (x) { return x.id === id; }); }
function torneoNombre(id) { var t = refItem('torneos', id); return t ? t.nombre : '#' + id; }
function equipoNombre(id) { var e = refItem('equipos', id); return e ? e.nombre : '#' + id; }

/* =====================================================================
   Definición de las secciones
   ===================================================================== */
var NAV = [
  { key: 'liga', label: 'Liga' },
  { key: 'inscribir', label: 'Inscribir equipo' },
  { key: 'equipos', label: 'Equipos' },
  { key: 'jugadores', label: 'Jugadores' },
  { key: 'partidos', label: 'Partidos' },
  { key: 'torneos', label: 'Torneos' },
  { key: 'disciplinas', label: 'Disciplinas' },
  { key: 'dashboard', label: 'Resumen' },
  { key: 'usuarios', label: 'Usuarios', admin: true }
];

var RESOURCES = {
  disciplinas: {
    label: 'Disciplinas', endpoint: '/api/disciplinas', pk: 'id', refs: [],
    columns: [
      { key: 'nombre', label: 'Disciplina' },
      { key: 'tipo_marcador', label: 'Marcador', render: function (r) { return TIPOS[r.tipo_marcador]; } },
      { key: 'jugadores_min', label: 'Mín. jugadores' },
      { key: 'jugadores_max', label: 'Máx. jugadores' },
      { key: 'descripcion', label: 'Descripción' }
    ],
    fields: [
      { name: 'nombre', label: 'Nombre', type: 'text', required: true },
      { name: 'tipo_marcador', label: 'Cómo se cuenta el marcador', type: 'select', required: true, options: [
        { value: 'goles', label: 'Goles (fútbol, futsal, balonmano)' },
        { value: 'puntos', label: 'Puntos (baloncesto)' },
        { value: 'sets', label: 'Sets (voleibol)' }] },
      { name: 'jugadores_min', label: 'Mínimo de jugadores por equipo', type: 'number', required: true },
      { name: 'jugadores_max', label: 'Máximo de jugadores por equipo', type: 'number', required: true },
      { name: 'descripcion', label: 'Descripción', type: 'textarea', full: true }
    ],
    canCreate: isAdmin, canEdit: isAdmin, canDelete: isAdmin
  },

  torneos: {
    label: 'Torneos', endpoint: '/api/torneos', pk: 'id', refs: ['disciplinas'],
    columns: [
      { key: 'nombre', label: 'Torneo' },
      { key: 'disciplina', label: 'Disciplina' },
      { key: 'rama', label: 'Rama' },
      { key: 'periodo', label: 'Periodo' },
      { key: 'estado', label: 'Estado' },
      { key: 'cupo_equipos', label: 'Cupo' },
      { key: 'cierre_inscripcion', label: 'Cierre inscripción' }
    ],
    fields: [
      { name: 'nombre', label: 'Nombre del torneo', type: 'text', required: true, full: true },
      { name: 'disciplina_id', label: 'Disciplina', type: 'ref', source: 'disciplinas', optionLabel: function (d) { return d.nombre; }, required: true },
      { name: 'rama', label: 'Rama', type: 'select', required: true, options: ['Masculino', 'Femenino', 'Mixto'] },
      { name: 'periodo', label: 'Periodo (ej: 2026-2)', type: 'text', required: true, placeholder: '2026-2' },
      { name: 'estado', label: 'Estado', type: 'select', options: ['Inscripciones abiertas', 'En juego', 'Finalizado'] },
      { name: 'cupo_equipos', label: 'Cupo de equipos', type: 'number' },
      { name: 'cierre_inscripcion', label: 'Cierre de inscripciones', type: 'date' },
      { name: 'fecha_inicio', label: 'Fecha de inicio', type: 'date' },
      { name: 'observaciones', label: 'Observaciones', type: 'textarea', full: true }
    ],
    canCreate: isAdmin, canEdit: isAdmin, canDelete: isAdmin
  },

  equipos: {
    label: 'Equipos inscritos', endpoint: '/api/equipos', pk: 'id', refs: ['torneos'],
    columns: [
      { key: 'torneo_id', label: 'Torneo', render: function (r) { return torneoNombre(r.torneo_id); } },
      { key: 'nombre', label: 'Equipo' },
      { key: 'facultad', label: 'Facultad / programa' },
      { key: 'numero_jugadores', label: 'Jugadores' },
      { key: 'estado', label: 'Estado' },
      { key: 'delegado', label: 'Delegado' }
    ],
    fields: [
      { name: 'nombre', label: 'Nombre del equipo', type: 'text', required: true },
      { name: 'facultad', label: 'Facultad / programa que representa', type: 'text', required: true },
      { name: 'telefono_contacto', label: 'Teléfono de contacto', type: 'text' },
      { name: 'correo_contacto', label: 'Correo de contacto', type: 'email' },
      { name: 'estado', label: 'Estado de la inscripción', type: 'select', required: true, options: ['Pendiente', 'Aprobada', 'Rechazada'] },
      { name: 'observaciones', label: 'Observaciones', type: 'textarea', full: true }
    ],
    canCreate: nobody, // los equipos se crean con el formulario "Inscribir equipo"
    canEdit: isAdmin, canDelete: isAdmin,
    extraActions: function (row) {
      if (!isAdmin() || row.estado !== 'Pendiente') return '';
      return '<button class="btn btn-ok btn-sm" onclick="quickEstado(' + row.id + ', \'Aprobada\', \'equipos\')">Aprobar</button>' +
             '<button class="btn btn-ghost btn-sm" onclick="quickEstado(' + row.id + ', \'Rechazada\', \'equipos\')">Rechazar</button>';
    }
  },

  jugadores: {
    label: 'Jugadores', endpoint: '/api/jugadores', pk: 'id', refs: ['equipos', 'torneos'],
    columns: [
      { key: 'equipo', label: 'Equipo' },
      { key: 'documento', label: 'Documento' },
      { key: 'nombre', label: 'Nombre' },
      { key: 'apellido', label: 'Apellido' },
      { key: 'carrera', label: 'Carrera' },
      { key: 'facultad', label: 'Facultad' },
      { key: 'eps', label: 'EPS' },
      { key: 'dorsal', label: 'Dorsal' }
    ],
    fields: [
      { name: 'equipo_id', label: 'Equipo', type: 'ref', source: 'equipos', required: true, createOnly: true, full: true,
        filter: function (e) { return isAdmin() || e.delegado === api.username(); },
        optionLabel: function (e) { return e.nombre + ' (' + torneoNombre(e.torneo_id) + ')'; } },
      { name: 'documento', label: 'Documento de identidad', type: 'text', required: true },
      { name: 'nombre', label: 'Nombres', type: 'text', required: true },
      { name: 'apellido', label: 'Apellidos', type: 'text', required: true },
      { name: 'carrera', label: 'Carrera', type: 'text', required: true },
      { name: 'facultad', label: 'Facultad', type: 'text', required: true },
      { name: 'semestre', label: 'Semestre', type: 'number' },
      { name: 'eps', label: 'EPS', type: 'text', required: true, list: 'listaEps' },
      { name: 'dorsal', label: 'Dorsal', type: 'number' },
      { name: 'posicion', label: 'Posición', type: 'text' },
      { name: 'telefono', label: 'Teléfono', type: 'text' }
    ],
    canCreate: anyone, canEdit: isAdmin, canDelete: isAdmin
  },

  partidos: {
    label: 'Partidos', endpoint: '/api/partidos', pk: 'id', refs: ['torneos', 'equipos'],
    columns: [
      { key: 'torneo_id', label: 'Torneo', render: function (r) { return torneoNombre(r.torneo_id); } },
      { key: 'jornada', label: 'Jornada' },
      { key: 'fecha', label: 'Fecha' },
      { key: 'hora', label: 'Hora' },
      { key: 'equipo_local_id', label: 'Local', render: function (r) { return equipoNombre(r.equipo_local_id); } },
      { key: 'marcador', label: 'Marcador', render: function (r) { return r.marcador_local === null ? null : r.marcador_local + ' - ' + r.marcador_visitante; } },
      { key: 'equipo_visitante_id', label: 'Visitante', render: function (r) { return equipoNombre(r.equipo_visitante_id); } },
      { key: 'lugar', label: 'Lugar' },
      { key: 'estado', label: 'Estado' }
    ],
    fields: [
      { name: 'torneo_id', label: 'Torneo (debe estar "En juego")', type: 'ref', source: 'torneos', required: true, createOnly: true, full: true,
        filter: function (t) { return t.estado === 'En juego'; }, optionLabel: function (t) { return t.nombre; } },
      { name: 'jornada', label: 'Jornada', type: 'number' },
      { name: 'estado', label: 'Estado', type: 'select', options: ['Programado', 'Jugado', 'Aplazado', 'Cancelado'] },
      { name: 'equipo_local_id', label: 'Equipo local', type: 'ref', source: 'equipos', required: true, optionLabel: function (e) { return e.nombre; }, filter: function () { return false; } },
      { name: 'equipo_visitante_id', label: 'Equipo visitante', type: 'ref', source: 'equipos', required: true, optionLabel: function (e) { return e.nombre; }, filter: function () { return false; } },
      { name: 'fecha', label: 'Fecha', type: 'date', required: true },
      { name: 'hora', label: 'Hora', type: 'time', required: true },
      { name: 'lugar', label: 'Lugar / cancha', type: 'text', full: true },
      { name: 'marcador_local', label: 'Marcador local (si está Jugado)', type: 'number' },
      { name: 'marcador_visitante', label: 'Marcador visitante (si está Jugado)', type: 'number' },
      { name: 'observaciones', label: 'Observaciones', type: 'textarea', full: true }
    ],
    canCreate: isAdmin, canEdit: isAdmin, canDelete: isAdmin
  },

  usuarios: {
    label: 'Usuarios', endpoint: '/api/usuarios', pk: 'id', refs: [],
    columns: [
      { key: 'username', label: 'Usuario' },
      { key: 'nombre', label: 'Nombre completo' },
      { key: 'role', label: 'Rol', render: function (r) { return ROLES[r.role]; } }
    ],
    fields: [
      { name: 'username', label: 'Usuario', type: 'text', required: true },
      { name: 'nombre', label: 'Nombre completo', type: 'text' },
      { name: 'role', label: 'Rol', type: 'select', required: true, options: [{ value: 'admin', label: 'Administrador' }, { value: 'delegado', label: 'Delegado de equipo' }] },
      { name: 'password', label: 'Contraseña (mín. 6 caracteres; al editar, vacía = no cambiarla)', type: 'password', full: true }
    ],
    canCreate: isAdmin, canEdit: isAdmin, canDelete: isAdmin
  }
};

/* =====================================================================
   Navegación
   ===================================================================== */
function buildNav() {
  var nav = document.getElementById('sideNav');
  nav.innerHTML = NAV.filter(function (n) { return !n.admin || isAdmin(); }).map(function (n, i) {
    return '<button data-section="' + n.key + '" style="animation-delay:' + (0.15 + i * 0.05) + 's">' + icon(n.key) + '<span>' + esc(n.label) + '</span></button>';
  }).join('');
  nav.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) go(b.dataset.section);
  });
}

function go(section) {
  document.querySelectorAll('#sideNav button').forEach(function (b) {
    b.classList.toggle('active', b.dataset.section === section);
  });
  if (section === 'liga') return renderLiga();
  if (section === 'dashboard') return renderDashboard();
  if (section === 'inscribir') return renderInscribir();
  return renderResource(section);
}

function showError(err) {
  setPage('Ocurrió un problema', '');
  show('<div class="card"><p class="note">' + esc(err.message) + '</p><button class="btn btn-gold" onclick="go(\'liga\')">Volver a la liga</button></div>');
}

/* =====================================================================
   Resumen
   ===================================================================== */
async function renderDashboard() {
  setPage('Resumen', 'Vista general de la liga');
  loader();
  try {
    var s = await api.get('/api/dashboard');
    var max = Math.max(s.torneosActivos, s.partidosProgramados, s.equiposInscritos, s.equiposPendientes, s.jugadoresInscritos, 1);
    function card(n, label) {
      return '<div class="stat"><div class="label">' + esc(label) + '</div><div class="num" data-to="' + n + '">0</div>' +
             '<div class="bar"><i style="--w:' + Math.max(8, Math.round(n / max * 100)) + '%"></i></div></div>';
    }
    show(
      '<p class="note">Bienvenido, <strong style="color:#fff">' + esc(api.nombre() || api.username()) + '</strong>. ' +
        (isAdmin() ? 'Administras la liga: torneos, equipos, resultados y usuarios.' : 'Desde aquí inscribes tu equipo y consultas torneos y posiciones.') + '</p>' +
      '<div class="stats">' +
        card(s.torneosActivos, 'Torneos activos') +
        card(s.partidosProgramados, 'Partidos programados') +
        card(s.equiposInscritos, 'Equipos inscritos') +
        (isAdmin() ? card(s.equiposPendientes, 'Equipos por aprobar') : '') +
        card(s.jugadoresInscritos, 'Jugadores inscritos') +
      '</div>' +
      '<div class="form-actions">' +
        '<button class="btn btn-gold" onclick="go(\'inscribir\')">Inscribir un equipo</button>' +
        '<button class="btn btn-ghost" onclick="go(\'liga\')">Ver tabla de posiciones</button>' +
      '</div>');
  } catch (err) { showError(err); }
}

/* =====================================================================
   Vista "Liga": deporte -> tabla -> inscribir -> registrar partido -> partidos
   ===================================================================== */
var ORDEN_DEPORTES = ['Futsal', 'Fútbol', 'Baloncesto', 'Voleibol'];
var ligaState = { disciplinaId: null, torneoId: null };

function ordenarDisciplinas(lista) {
  return lista.slice().sort(function (a, b) {
    var ia = ORDEN_DEPORTES.indexOf(a.nombre), ib = ORDEN_DEPORTES.indexOf(b.nombre);
    if (ia < 0) ia = 99; if (ib < 0) ib = 99;
    return ia - ib || a.nombre.localeCompare(b.nombre, 'es');
  });
}

async function renderLiga() {
  setPage('Liga UManizales', 'Tabla de posiciones, inscripciones y resultados');
  loader();
  try {
    await loadRefs(['disciplinas', 'torneos']);
    var discs = ordenarDisciplinas(refs.disciplinas);
    if (!discs.length) { show('<div class="card"><p class="note">No hay disciplinas creadas.</p></div>'); return; }
    if (!discs.some(function (d) { return d.id === ligaState.disciplinaId; })) ligaState.disciplinaId = discs[0].id;

    var torneos = refs.torneos.filter(function (t) { return t.disciplina_id === ligaState.disciplinaId; });
    if (!torneos.some(function (t) { return t.id === ligaState.torneoId; })) ligaState.torneoId = torneos.length ? torneos[0].id : null;

    show(
      '<div class="toolbar"><div class="tabs" id="deporte">' +
        discs.map(function (d) {
          return '<button class="tab' + (d.id === ligaState.disciplinaId ? ' active' : '') + '" data-id="' + d.id + '">' + icon(iconoDeporte(d.nombre)) + esc(d.nombre) + '</button>';
        }).join('') + '</div>' +
        (torneos.length ? '<select id="torneoSel" class="sel">' + torneos.map(function (t) {
          return '<option value="' + t.id + '"' + (t.id === ligaState.torneoId ? ' selected' : '') + '>' + esc(t.rama + ' · ' + t.periodo + ' (' + t.estado + ')') + '</option>';
        }).join('') + '</select>' : '') +
      '</div><div id="ligaBox"></div>');

    document.getElementById('deporte').addEventListener('click', function (e) {
      var b = e.target.closest('.tab'); if (!b) return;
      ligaState.disciplinaId = Number(b.dataset.id); ligaState.torneoId = null; renderLiga();
    });
    var ts = document.getElementById('torneoSel');
    if (ts) ts.addEventListener('change', function (e) { ligaState.torneoId = Number(e.target.value); cargarLiga(); });

    if (ligaState.torneoId) cargarLiga();
    else document.getElementById('ligaBox').innerHTML = '<div class="card"><p class="note">Todavía no hay torneos de esta disciplina.' +
      (isAdmin() ? ' Créalo en la sección <button class="link-btn" onclick="go(\'torneos\')">Torneos</button>.' : '') + '</p></div>';
  } catch (err) { showError(err); }
}

function kpi(label, valor, pct) {
  var esNum = typeof valor === 'number';
  return '<div class="stat"><div class="label">' + esc(label) + '</div>' +
    (esNum ? '<div class="num" data-to="' + valor + '">0</div>' : '<div class="num txt">' + esc(valor) + '</div>') +
    '<div class="bar"><i style="--w:' + pct + '%"></i></div></div>';
}

async function cargarLiga() {
  var box = document.getElementById('ligaBox');
  box.innerHTML = '<div class="loader"><i></i></div>';
  try {
    var d = await api.get('/api/torneos/' + ligaState.torneoId + '/posiciones');
    var pendientes = isAdmin() ? await api.get('/api/equipos?torneo_id=' + ligaState.torneoId + '&estado=Pendiente') : [];
    var L = d.etiquetas, t = d.torneo;
    var pref = { goles: 'G', puntos: 'P', sets: 'S' }[t.tipo_marcador];
    var conEmpates = t.tipo_marcador === 'goles';
    var maxPts = Math.max.apply(null, d.tabla.map(function (f) { return f.puntos; }).concat([1]));
    var jugados = Math.round(d.tabla.reduce(function (a, f) { return a + f.pj; }, 0) / 2);
    var total = d.tabla.reduce(function (a, f) { return a + f.favor; }, 0);
    var lider = d.tabla.length && d.tabla[0].pj > 0 ? d.tabla[0].equipo : '—';

    setPage(t.nombre, t.disciplina + ' · ' + t.rama + ' · ' + t.periodo + ' — ' + t.estado);

    var filas = d.tabla.map(function (f, i) {
      return '<tr class="' + (f.posicion === 1 && f.pj > 0 ? 'lider' : '') + '" style="animation-delay:' + (0.15 + i * 0.07) + 's">' +
        '<td><span class="pos-badge">' + f.posicion + '</span></td>' +
        '<td class="t"><span class="team">' + escudo(f.equipo) + esc(f.equipo) + '</span></td>' +
        '<td class="num">' + f.pj + '</td><td class="num">' + f.pg + '</td>' + (conEmpates ? '<td class="num">' + f.pe + '</td>' : '') + '<td class="num">' + f.pp + '</td>' +
        '<td class="num">' + f.favor + '</td><td class="num">' + f.contra + '</td>' +
        '<td class="num ' + (f.dif > 0 ? 'dif-pos' : f.dif < 0 ? 'dif-neg' : '') + '">' + (f.dif > 0 ? '+' : '') + f.dif + '</td>' +
        '<td><div class="pts">' + f.puntos + '</div><div class="ptsbar"><i style="--w:' + Math.round(f.puntos / maxPts * 100) + '%"></i></div></td>' +
        '<td>' + (isAdmin() ? '<button class="x" title="Eliminar equipo" onclick="quitarEquipo(' + f.equipo_id + ')">✕</button>' : '') + '</td></tr>';
    }).join('');

    var opciones = d.tabla.map(function (f) { return '<option value="' + f.equipo_id + '">' + esc(f.equipo) + '</option>'; }).join('');
    var hoy = new Date(), iso = hoy.getFullYear() + '-' + String(hoy.getMonth() + 1).padStart(2, '0') + '-' + String(hoy.getDate()).padStart(2, '0');

    var registrar = '';
    if (isAdmin()) {
      if (t.estado === 'En juego') {
        registrar = '<div class="card"><h3><span class="dot"></span>Registrar partido</h3>' +
          '<div class="field-grid" style="grid-template-columns:minmax(0,1fr)">' +
            '<div><label>Equipo local</label><select id="eq1">' + opciones + '</select></div>' +
            '<div><label>Equipo visitante</label><select id="eq2">' + opciones + '</select></div></div>' +
          '<div class="field-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));margin-top:.9rem">' +
            '<div><label>Marcador local</label><input id="g1" type="number" min="0" placeholder="' + pref + '1"></div>' +
            '<div><label>Marcador visita</label><input id="g2" type="number" min="0" placeholder="' + pref + '2"></div>' +
            '<div><label>Fecha</label><input id="fechaP" type="date" value="' + iso + '"></div>' +
            '<div><label>Hora</label><input id="horaP" type="time" value="12:00"></div></div>' +
          '<div class="form-actions"><button class="btn btn-primary btn-block" id="btnRegistrar" onclick="registrarPartido()">Registrar resultado</button></div>' +
          '<div class="msg-err" id="regMsg"></div></div>';
      } else {
        registrar = '<div class="card"><h3><span class="dot"></span>Registrar partido</h3><p class="note">Este torneo está en estado «' + esc(t.estado) + '». Para registrar partidos debe estar «En juego».</p>' +
          (t.estado === 'Inscripciones abiertas' ? '<button class="btn btn-primary btn-block" onclick="iniciarTorneo(' + t.id + ')">Iniciar torneo</button><div class="msg-err" id="regMsg"></div>' : '') + '</div>';
      }
    }

    var pend = '';
    if (isAdmin() && pendientes.length) {
      pend = '<div class="card"><h3><span class="dot"></span>Inscripciones pendientes <span class="badge badge-warn" style="margin-left:auto">' + pendientes.length + '</span></h3>' +
        pendientes.map(function (e) {
          return '<div class="pend"><div><b>' + esc(e.nombre) + '</b><small>' + e.numero_jugadores + ' jugador(es) · ' + esc(e.facultad) + '</small></div><div class="actions-cell">' +
            '<button class="btn btn-ok btn-sm" onclick="quickEstado(' + e.id + ', \'Aprobada\', \'liga\')">Aprobar</button>' +
            '<button class="btn btn-ghost btn-sm" onclick="quickEstado(' + e.id + ', \'Rechazada\', \'liga\')">Rechazar</button></div></div>';
        }).join('') + '</div>';
    }

    function partido(p, jugado, i) {
      return '<div class="match" style="animation-delay:' + (0.2 + i * 0.06) + 's"><div class="l">' + esc(p.local) + '</div>' +
        '<div class="score' + (jugado ? '' : ' vs') + '">' + (jugado ? p.marcador_local + ' — ' + p.marcador_visitante : 'VS') + '</div>' +
        '<div class="v">' + esc(p.visitante) + '</div>' +
        (isAdmin() ? '<button class="x" title="Eliminar partido" onclick="quitarPartido(' + p.id + ')">✕</button>' : '<span></span>') +
        '<div class="meta">Jornada ' + esc(p.jornada) + ' · ' + esc(p.fecha) + (jugado ? '' : ' ' + esc(p.hora)) + (p.lugar ? ' · ' + esc(p.lugar) : '') + '</div></div>';
    }

    box.innerHTML =
      '<div class="stats">' +
        kpi('Equipos', d.tabla.length, 60) + kpi('Partidos jugados', jugados, 70) + kpi(TIPOS[t.tipo_marcador] + ' anotados', total, 80) + kpi('Líder', lider, 100) +
      '</div>' +
      '<div class="grid-liga">' +
        '<div class="card"><h2><span class="dot"></span>Tabla de posiciones</h2>' +
          (d.tabla.length ? '<div class="table-wrap"><table class="standings"><thead><tr><th>#</th><th class="t">Equipo</th><th>PJ</th><th>PG</th>' + (conEmpates ? '<th>PE</th>' : '') + '<th>PP</th>' +
            '<th>' + L.favor + '</th><th>' + L.contra + '</th><th>' + L.dif + '</th><th>Pts</th><th></th></tr></thead><tbody>' + filas + '</tbody></table></div>'
            : '<p class="note">Aún no hay equipos aprobados en este torneo.</p>') +
        '</div>' +
        '<div class="stack">' +
          '<div class="card lift"><h3><span class="dot"></span>Inscribir equipo</h3><p class="note">Registra tu equipo con su lista de jugadores: nombre, carrera, facultad y EPS.</p>' +
            '<button class="btn btn-gold btn-block" onclick="irAInscribir(' + t.id + ')">Inscribir equipo</button></div>' +
          registrar + pend +
        '</div>' +
      '</div>' +
      '<div class="two-col" style="margin-top:1.2rem">' +
        '<div class="card"><h2><span class="dot"></span>Resultados</h2>' + (d.resultados.length ? d.resultados.map(function (p, i) { return partido(p, true, i); }).join('') : '<p class="note">Sin partidos jugados.</p>') + '</div>' +
        '<div class="card"><h2><span class="dot"></span>Próximos partidos</h2>' + (d.proximos.length ? d.proximos.map(function (p, i) { return partido(p, false, i); }).join('') : '<p class="note">Sin partidos programados.</p>') + '</div>' +
      '</div>';
    animarNumeros(box);
  } catch (err) { box.innerHTML = '<div class="card"><div class="msg-err">' + esc(err.message) + '</div></div>'; }
}

async function registrarPartido() {
  var msg = document.getElementById('regMsg');
  msg.textContent = '';
  var g1 = document.getElementById('g1').value, g2 = document.getElementById('g2').value;
  if (!document.getElementById('eq1').value || !document.getElementById('eq2').value || g1 === '' || g2 === '') { msg.textContent = 'Elige los dos equipos y escribe el marcador.'; return; }
  try {
    await api.post('/api/partidos', {
      torneo_id: ligaState.torneoId, estado: 'Jugado',
      equipo_local_id: Number(document.getElementById('eq1').value), equipo_visitante_id: Number(document.getElementById('eq2').value),
      marcador_local: Number(g1), marcador_visitante: Number(g2),
      fecha: document.getElementById('fechaP').value, hora: document.getElementById('horaP').value || '12:00'
    });
    toast('Resultado registrado', 'ok');
    cargarLiga();
  } catch (err) { msg.textContent = err.message; }
}

async function iniciarTorneo(id) {
  try { await api.put('/api/torneos/' + id, { estado: 'En juego' }); toast('Torneo iniciado', 'ok'); renderLiga(); }
  catch (err) { var m = document.getElementById('regMsg'); if (m) m.textContent = err.message; }
}
async function quitarEquipo(id) {
  if (!confirm('¿Eliminar este equipo con sus jugadores y partidos?')) return;
  try { await api.del('/api/equipos/' + id); toast('Equipo eliminado', 'ok'); cargarLiga(); } catch (err) { toast(err.message, 'err'); }
}
async function quitarPartido(id) {
  if (!confirm('¿Eliminar este partido?')) return;
  try { await api.del('/api/partidos/' + id); toast('Partido eliminado', 'ok'); cargarLiga(); } catch (err) { toast(err.message, 'err'); }
}
async function quickEstado(id, estado, donde) {
  try {
    await api.put('/api/equipos/' + id, { estado: estado });
    toast('Equipo ' + estado.toLowerCase(), 'ok');
    if (donde === 'liga') cargarLiga(); else renderResource('equipos');
  } catch (err) { toast(err.message, 'err'); }
}
async function irAInscribir(torneoId) {
  document.querySelectorAll('#sideNav button').forEach(function (b) { b.classList.toggle('active', b.dataset.section === 'inscribir'); });
  await renderInscribir();
  var sel = document.getElementById('insTorneo');
  if (sel && Array.prototype.some.call(sel.options, function (o) { return o.value === String(torneoId); })) {
    sel.value = String(torneoId);
    elegirTorneoInscripcion();
  }
}

/* =====================================================================
   Listados con crear / editar / eliminar
   ===================================================================== */
async function renderResource(key) {
  var res = RESOURCES[key];
  setPage(res.label, 'Gestiona los registros de ' + res.label.toLowerCase());
  loader();
  try {
    await loadRefs(res.refs);
    var rows = await api.get(res.endpoint);
    show(
      '<div class="toolbar"><div class="search">' + icon('search') + '<input type="text" id="searchBox" placeholder="Buscar..."></div>' +
        (res.canCreate() ? '<button class="btn btn-gold" id="newBtn">+ Nuevo registro</button>' : '') +
      '</div>' +
      '<div class="card"><div class="table-wrap"><table><thead><tr>' + res.columns.map(function (c) { return '<th>' + esc(c.label) + '</th>'; }).join('') + '<th></th></tr></thead><tbody id="tableBody"></tbody></table></div></div>');

    var body = document.getElementById('tableBody');
    function pintar(filtro) {
      var q = (filtro || '').toLowerCase();
      var vistas = rows.filter(function (r) { return !q || JSON.stringify(r).toLowerCase().indexOf(q) >= 0; });
      if (!vistas.length) { body.innerHTML = '<tr class="empty-row"><td colspan="' + (res.columns.length + 1) + '">Sin registros</td></tr>'; return; }
      body.innerHTML = vistas.map(function (r, i) {
        var celdas = res.columns.map(function (c) {
          var v = c.render ? c.render(r) : r[c.key];
          if (v === null || v === undefined || v === '') return '<td>—</td>';
          return '<td>' + (c.key === 'estado' ? badge(v) : esc(v)) + '</td>';
        }).join('');
        var pk = r[res.pk];
        var acciones = (res.extraActions ? res.extraActions(r) : '');
        if (res.canEdit()) acciones += '<button class="btn btn-ghost btn-sm" onclick="openModal(\'' + key + '\', ' + jsArg(pk) + ')">Editar</button>';
        if (res.canDelete()) acciones += '<button class="btn btn-danger btn-sm" onclick="deleteRow(\'' + key + '\', ' + jsArg(pk) + ')">Eliminar</button>';
        return '<tr style="animation-delay:' + Math.min(i, 20) * 0.03 + 's">' + celdas + '<td><div class="actions-cell">' + acciones + '</div></td></tr>';
      }).join('');
    }
    pintar('');
    document.getElementById('searchBox').addEventListener('input', function (e) { pintar(e.target.value); });
    if (res.canCreate()) document.getElementById('newBtn').addEventListener('click', function () { openModal(key, null); });
  } catch (err) { showError(err); }
}

async function deleteRow(key, pk) {
  var res = RESOURCES[key];
  if (!confirm('¿Eliminar este registro? Esta acción no se puede deshacer.')) return;
  try { await api.del(res.endpoint + '/' + pk); toast('Registro eliminado', 'ok'); renderResource(key); }
  catch (err) { toast(err.message, 'err'); }
}

/* =====================================================================
   Modal de crear / editar
   ===================================================================== */
var modalCtx = null;

function optionsHTML(f, valor) {
  var lista;
  if (f.type === 'ref') {
    lista = refs[f.source].filter(f.filter || anyone).map(function (x) { return { value: x.id, label: f.optionLabel(x) }; });
  } else {
    lista = (f.options || []).map(function (o) { return typeof o === 'object' ? o : { value: o, label: o }; });
  }
  return '<option value="">—</option>' + lista.map(function (o) {
    return '<option value="' + esc(o.value) + '"' + (String(o.value) === String(valor) ? ' selected' : '') + '>' + esc(o.label) + '</option>';
  }).join('');
}

function fieldHTML(f, valor) {
  var id = 'f_' + f.name, req = f.required ? ' required' : '', input;
  if (f.type === 'select' || f.type === 'ref') {
    input = '<select id="' + id + '" name="' + f.name + '"' + req + '>' + optionsHTML(f, valor) + '</select>';
  } else if (f.type === 'textarea') {
    input = '<textarea id="' + id + '" name="' + f.name + '" rows="2">' + esc(valor) + '</textarea>';
  } else {
    input = '<input type="' + f.type + '" id="' + id + '" name="' + f.name + '"' + req +
      (f.type === 'number' ? ' step="any"' : '') +
      (f.type === 'password' ? ' autocomplete="new-password"' : '') +
      (f.list ? ' list="' + f.list + '"' : '') +
      (f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : '') +
      ' value="' + esc(f.type === 'password' ? '' : valor) + '">';
  }
  return '<div class="' + (f.full ? 'full' : '') + '"><label for="' + id + '">' + esc(f.label) + '</label>' + input + '</div>';
}

// En "Partidos", los equipos disponibles dependen del torneo elegido (solo los aprobados de ese torneo).
function enlazarEquiposDelTorneo(registro) {
  var selTorneo = document.getElementById('f_torneo_id');
  function llenar(torneoId, local, visitante) {
    var equipos = refs.equipos.filter(function (e) { return e.torneo_id === torneoId && e.estado === 'Aprobada'; });
    [['f_equipo_local_id', local], ['f_equipo_visitante_id', visitante]].forEach(function (par) {
      var el = document.getElementById(par[0]);
      el.innerHTML = '<option value="">—</option>' + equipos.map(function (e) {
        return '<option value="' + e.id + '"' + (String(e.id) === String(par[1]) ? ' selected' : '') + '>' + esc(e.nombre) + '</option>';
      }).join('');
    });
  }
  if (selTorneo) {
    selTorneo.addEventListener('change', function () { llenar(Number(selTorneo.value), '', ''); });
    llenar(Number(selTorneo.value) || 0, '', '');
  } else {
    llenar(registro.torneo_id, registro.equipo_local_id, registro.equipo_visitante_id);
  }
}

async function openModal(key, pk) {
  var res = RESOURCES[key];
  var editando = pk !== null;
  try {
    await loadRefs(res.refs);
    var registro = editando ? await api.get(res.endpoint + '/' + pk) : {};
    modalCtx = { key: key, pk: pk, editando: editando };
    document.getElementById('modalTitle').textContent = (editando ? 'Editar ' : 'Nuevo registro — ') + res.label.toLowerCase();
    document.getElementById('modalError').textContent = '';
    document.getElementById('modalFields').innerHTML = res.fields
      .filter(function (f) { return !(f.createOnly && editando); })
      .map(function (f) { return fieldHTML(f, registro[f.name]); }).join('');
    if (key === 'partidos') enlazarEquiposDelTorneo(registro);
    document.getElementById('modalOverlay').classList.add('open');
  } catch (err) { toast(err.message, 'err'); }
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('open');
  modalCtx = null;
}

document.getElementById('modalCancel').addEventListener('click', closeModal);
document.getElementById('modalOverlay').addEventListener('click', function (e) { if (e.target === this) closeModal(); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
document.getElementById('modalForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  if (!modalCtx) return;
  var res = RESOURCES[modalCtx.key], errorEl = document.getElementById('modalError');
  errorEl.textContent = '';
  var body = {};
  for (var i = 0; i < res.fields.length; i++) {
    var f = res.fields[i];
    if (f.createOnly && modalCtx.editando) continue;
    var el = document.getElementById('f_' + f.name);
    var v = el.value.trim();
    if (v === '') { v = null; }
    else if (f.type === 'number' || f.type === 'ref') { v = Number(v); }
    if (f.required && v === null) { errorEl.textContent = 'Completa el campo: ' + f.label; return; }
    body[f.name] = v;
  }
  try {
    var key = modalCtx.key;
    if (modalCtx.editando) await api.put(res.endpoint + '/' + modalCtx.pk, body);
    else await api.post(res.endpoint, body);
    closeModal();
    toast('Guardado correctamente', 'ok');
    renderResource(key);
  } catch (err) { errorEl.textContent = err.message; }
});

/* =====================================================================
   Formulario de inscripción de equipo (con jugadores)
   ===================================================================== */
var inscripcionTorneo = null;

function jugadorRowHTML(n) {
  function campo(clase, label, tipo, extra) {
    return '<div><label>' + label + '</label><input class="' + clase + '" type="' + (tipo || 'text') + '"' + (extra || '') + '></div>';
  }
  return '<div class="jugador-row">' +
    '<div class="jr-head"><span><span class="n jr-num">' + n + '</span>Jugador</span>' +
      '<button type="button" class="btn btn-danger btn-sm" onclick="quitarJugador(this)">Quitar</button></div>' +
    '<div class="grid-form">' +
      campo('pj-documento', 'Documento *') + campo('pj-nombre', 'Nombres *') + campo('pj-apellido', 'Apellidos *') +
      campo('pj-carrera', 'Carrera *') + campo('pj-facultad', 'Facultad *') +
      campo('pj-eps', 'EPS *', 'text', ' list="listaEps"') +
      campo('pj-semestre', 'Semestre', 'number', ' min="1" max="14"') + campo('pj-dorsal', 'Dorsal', 'number', ' min="0" max="99"') + campo('pj-posicion', 'Posición') +
    '</div></div>';
}

function actualizarContador() {
  var filas = document.querySelectorAll('#jugadoresBox .jugador-row');
  filas.forEach(function (f, i) { f.querySelector('.jr-num').textContent = i + 1; });
  var c = document.getElementById('insCount');
  var t = inscripcionTorneo;
  var n = filas.length;
  c.className = 'counter';
  if (!t) { c.textContent = 'Jugadores: ' + n; return; }
  c.textContent = 'Jugadores: ' + n + ' (mín. ' + t.jugadores_min + ' · máx. ' + t.jugadores_max + ')';
  c.classList.add(n > t.jugadores_max ? 'high' : n < t.jugadores_min ? 'low' : 'ok');
  document.getElementById('addJugador').disabled = n >= t.jugadores_max;
}

function agregarJugador() {
  var box = document.getElementById('jugadoresBox');
  box.insertAdjacentHTML('beforeend', jugadorRowHTML(box.children.length + 1));
  actualizarContador();
}
function quitarJugador(btn) {
  var box = document.getElementById('jugadoresBox');
  if (box.children.length <= 1) return;
  btn.closest('.jugador-row').remove();
  actualizarContador();
}

function elegirTorneoInscripcion() {
  var id = Number(document.getElementById('insTorneo').value);
  inscripcionTorneo = refItem('torneos', id) || null;
  var info = document.getElementById('insInfo');
  if (!inscripcionTorneo) { info.style.display = 'none'; actualizarContador(); return; }
  var t = inscripcionTorneo;
  info.style.display = '';
  info.innerHTML = '<strong>' + esc(t.disciplina) + '</strong> · ' + esc(t.rama) + ' · ' + esc(t.periodo) +
    '<br>Plantilla: mínimo <strong>' + t.jugadores_min + '</strong> y máximo <strong>' + t.jugadores_max + '</strong> jugadores · Cupo: ' + t.cupo_equipos + ' equipos' +
    (t.cierre_inscripcion ? ' · Cierre de inscripciones: ' + esc(t.cierre_inscripcion) : '');
  actualizarContador();
}

async function renderInscribir() {
  setPage('Inscribir equipo', 'Completa los datos del equipo y de cada jugador. Queda pendiente hasta que la organización lo apruebe.');
  loader();
  try {
    await loadRefs(['torneos']);
    var abiertos = refs.torneos.filter(function (t) { return isAdmin() || t.estado === 'Inscripciones abiertas'; });
    if (!abiertos.length) {
      show('<div class="card"><p class="note">No hay torneos con inscripciones abiertas en este momento.</p></div>');
      return;
    }
    show(
      '<form id="insForm" novalidate>' +
        '<div class="card form-card"><h3><span class="dot"></span>1. Torneo y equipo</h3>' +
          '<div class="grid-form">' +
            '<div class="wide"><label for="insTorneo">Torneo *</label><select id="insTorneo"><option value="">— Selecciona un torneo —</option>' +
              abiertos.map(function (t) { return '<option value="' + t.id + '">' + esc(t.nombre) + (t.estado !== 'Inscripciones abiertas' ? ' (' + esc(t.estado) + ')' : '') + '</option>'; }).join('') +
            '</select></div>' +
            '<div><label for="insNombre">Nombre del equipo *</label><input id="insNombre" type="text"></div>' +
            '<div><label for="insFacultad">Facultad o programa que representa *</label><input id="insFacultad" type="text"></div>' +
            '<div><label for="insTel">Teléfono del delegado *</label><input id="insTel" type="text"></div>' +
            '<div><label for="insCorreo">Correo del delegado</label><input id="insCorreo" type="email"></div>' +
          '</div>' +
          '<div class="info-line" id="insInfo" style="display:none;"></div>' +
        '</div>' +
        '<div class="card form-card"><h3><span class="dot"></span>2. Jugadores <span class="counter" id="insCount">Jugadores: 0</span></h3>' +
          '<div id="jugadoresBox"></div>' +
          '<button type="button" class="btn btn-ghost" id="addJugador">+ Agregar jugador</button>' +
        '</div>' +
        '<div class="error-msg" id="insError"></div><div class="ok-msg" id="insOk"></div>' +
        '<div class="form-actions"><button type="submit" class="btn btn-gold">Enviar inscripción</button></div>' +
      '</form>');

    inscripcionTorneo = null;
    document.getElementById('insTorneo').addEventListener('change', elegirTorneoInscripcion);
    document.getElementById('addJugador').addEventListener('click', agregarJugador);
    document.getElementById('insForm').addEventListener('submit', enviarInscripcion);
    agregarJugador();
  } catch (err) { showError(err); }
}

async function enviarInscripcion(e) {
  e.preventDefault();
  var errorEl = document.getElementById('insError'), okEl = document.getElementById('insOk');
  errorEl.textContent = ''; okEl.textContent = '';
  var v = function (id) { return document.getElementById(id).value.trim(); };
  var torneoId = Number(v('insTorneo'));
  if (!torneoId) { errorEl.textContent = 'Selecciona el torneo.'; return; }

  var jugadores = Array.prototype.map.call(document.querySelectorAll('#jugadoresBox .jugador-row'), function (fila) {
    var g = function (c) { return fila.querySelector('.' + c).value.trim(); };
    return {
      documento: g('pj-documento'), nombre: g('pj-nombre'), apellido: g('pj-apellido'), carrera: g('pj-carrera'),
      facultad: g('pj-facultad'), eps: g('pj-eps'), semestre: g('pj-semestre'), dorsal: g('pj-dorsal'), posicion: g('pj-posicion')
    };
  });

  try {
    var r = await api.post('/api/inscripciones', {
      torneo_id: torneoId, nombre: v('insNombre'), facultad: v('insFacultad'),
      telefono_contacto: v('insTel'), correo_contacto: v('insCorreo'), jugadores: jugadores
    });
    okEl.innerHTML = 'Inscripción enviada: <strong>' + esc(r.equipo.nombre) + '</strong> con ' + r.jugadores.length + ' jugador(es). Quedó <strong>Pendiente</strong> de aprobación. ' +
      '<button type="button" class="btn btn-ghost btn-sm" onclick="go(\'equipos\')">Ver equipos</button>';
    toast('Inscripción enviada', 'ok');
    document.getElementById('insForm').querySelectorAll('input').forEach(function (i) { i.value = ''; });
    document.getElementById('jugadoresBox').innerHTML = '';
    agregarJugador();
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  } catch (err) {
    errorEl.textContent = err.message;
    toast(err.message, 'err');
    errorEl.scrollIntoView({ block: 'center' });
  }
}

/* =====================================================================
   Arranque
   ===================================================================== */
var nombreUsuario = api.nombre() || api.username() || '-';
document.getElementById('userLabel').textContent = nombreUsuario;
document.getElementById('avatar').textContent = nombreUsuario.trim().charAt(0).toUpperCase();
document.getElementById('roleBadge').textContent = ROLES[api.role()] || api.role();
buildNav();
go('liga');
