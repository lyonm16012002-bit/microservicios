var api = (function () {
  var BASE = ''; // mismo origen (el Gateway sirve también el front-end)

  function getToken() { return localStorage.getItem('liga_token'); }

  function logout() {
    ['liga_token', 'liga_username', 'liga_nombre', 'liga_role'].forEach(function (k) { localStorage.removeItem(k); });
    window.location.href = 'index.html';
  }

  function guardarSesion(data) {
    localStorage.setItem('liga_token', data.token);
    localStorage.setItem('liga_username', data.username);
    localStorage.setItem('liga_nombre', data.nombre || '');
    localStorage.setItem('liga_role', data.role);
  }

  async function request(method, path, body, esPublica) {
    var headers = { 'Content-Type': 'application/json' };
    var token = getToken();
    if (token) headers['Authorization'] = 'Bearer ' + token;

    var res = await fetch(BASE + path, {
      method: method,
      headers: headers,
      body: body !== undefined ? JSON.stringify(body) : undefined
    });

    var data = null;
    try { data = await res.json(); } catch (e) { /* respuesta vacía */ }

    if (res.status === 401 && !esPublica) {
      logout();
      throw new Error('Sesión expirada, vuelve a iniciar sesión.');
    }
    if (!res.ok) throw new Error((data && data.error) || 'Ocurrió un error inesperado');
    return data;
  }

  return {
    login: function (username, password) { return request('POST', '/api/auth/login', { username: username, password: password }, true); },
    registro: function (datos) { return request('POST', '/api/auth/registro', datos, true); },
    guardarSesion: guardarSesion,
    get: function (path) { return request('GET', path); },
    post: function (path, body) { return request('POST', path, body); },
    put: function (path, body) { return request('PUT', path, body); },
    del: function (path) { return request('DELETE', path); },
    logout: logout,
    role: function () { return localStorage.getItem('liga_role'); },
    username: function () { return localStorage.getItem('liga_username'); },
    nombre: function () { return localStorage.getItem('liga_nombre'); },
    hasSession: function () { return !!getToken(); },
    requireLogin: function () { if (!getToken()) window.location.href = 'index.html'; }
  };
})();
