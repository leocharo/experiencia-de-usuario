// ══════════════════════════════════════════════════════════════════
// admin.js  —  Firebase Auth + Firestore para usuarios.
//              localStorage para gestión de contenido del muro.
// ══════════════════════════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, deleteDoc }
    from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut }
    from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyC7zx9CreT58V1AWTq7pMoS_ps65mXf-9Y",
    authDomain: "mis-manos-hablaran-44e17.firebaseapp.com",
    projectId: "mis-manos-hablaran-44e17",
    storageBucket: "mis-manos-hablaran-44e17.firebasestorage.app",
    messagingSenderId: "637462888639",
    appId: "1:637462888639:web:c4070137237c211dbd460a"
};

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

// ── localStorage keys ────────────────────────────────────────────
const SOLICITUDES_KEY = 'solicitudes_muro';

let cachedUsers           = {};
let currentUserIdToDelete = null;

// ════════════════════════════════════════════════════════════════
// AUTH CHECK
// ════════════════════════════════════════════════════════════════
onAuthStateChanged(auth, async (user) => {
    const loadingEl = document.getElementById('auth-loading');
    const contentEl = document.getElementById('dashboard-content');
    if (!user) { window.location.href = 'index.html'; return; }
    try {
        const userDoc = await getDoc(doc(db, 'perfiles', user.uid));
        if (userDoc.exists() && userDoc.data().rol === 'admin') {
            if (loadingEl) loadingEl.style.display = 'none';
            if (contentEl) contentEl.style.display = 'flex';
            // Registrar inicio de sesión del admin en los logs
            const adminData = userDoc.data();
            window.registrarLoginLog({
                uid:      user.uid,
                username: adminData.username || 'Admin',
                email:    user.email || adminData.email || '',
                rol:      'admin'
            });
            loadAdminData();
        } else {
            window.location.href = 'index.html';
        }
    } catch (error) {
        window.location.href = 'index.html';
    }
});

// ════════════════════════════════════════════════════════════════
// USUARIOS (Firestore)
// ════════════════════════════════════════════════════════════════
async function loadAdminData() {
    const listBody = document.getElementById('users-list');
    if (!listBody) return;
    try {
        const querySnapshot = await getDocs(collection(db, 'perfiles'));
        listBody.innerHTML = '';
        let stats = { total: 0, levelsSum: 0, finished: 0 };

        querySnapshot.forEach((docSnap) => {
            const user = docSnap.data();
            if (user.rol === 'admin') return;
            const id = docSnap.id;
            cachedUsers[id] = user;

            const nivel = user.nivel4_completado ? 4 :
                          user.nivel3_completado ? 3 :
                          user.nivel2_completado ? 2 : 1;

            stats.total++;
            stats.levelsSum += nivel;
            if (user.nivel4_completado) stats.finished++;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${user.username || 'Estudiante'}</strong></td>
                <td>${user.email || ''}</td>
                <td><span class="badge">Nivel ${nivel}</span></td>
                <td>
                    <button class="btn btn-view" onclick="verDetalles('${id}')">Vista</button>
                    <button class="btn btn-success" style="background:#10b981;color:white;" onclick="abrirMenuEmail('${id}')">📧 Aviso</button>
                    <button class="btn btn-danger" onclick="confirmarEliminar('${id}')">Eliminar</button>
                </td>`;
            listBody.appendChild(row);
        });

        document.getElementById('stat-total-users').textContent = stats.total;
        document.getElementById('stat-avg-level').textContent   = stats.total > 0 ? (stats.levelsSum / stats.total).toFixed(1) : '0';
        document.getElementById('stat-completed').textContent   = stats.finished;
    } catch (e) {
        console.error('Error cargando usuarios:', e);
    }
}

// Búsqueda
const searchInput = document.getElementById('admin-search');
if (searchInput) {
    searchInput.addEventListener('input', function() {
        const term = this.value.toLowerCase();
        document.querySelectorAll('#users-list tr').forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
        });
    });
}

const refreshBtn = document.getElementById('refresh-btn');
if (refreshBtn) refreshBtn.addEventListener('click', loadAdminData);

// Ver detalles
window.verDetalles = function(id) {
    const user    = cachedUsers[id];
    const nameEl  = document.getElementById('modal-user-name');
    const detailEl= document.getElementById('levels-details-container');
    if (!user) return;
    if (nameEl)   nameEl.textContent = user.username || 'Estudiante';
    if (detailEl) {
        detailEl.innerHTML = `
            <p style="margin-top:10px;color:#64748b;font-size:13px;">Correo: ${user.email || 'N/A'}</p>
            <div style="margin-top:16px;text-align:left;">
                <p style="font-size:13px;">Nivel 1: ${user.nivel1_completado ? '✅' : '⏳'}</p>
                <p style="font-size:13px;">Nivel 2: ${user.nivel2_completado ? '✅' : '⏳'}</p>
                <p style="font-size:13px;">Nivel 3: ${user.nivel3_completado ? '✅' : '⏳'}</p>
                <p style="font-size:13px;">Nivel 4: ${user.nivel4_completado ? '✅' : '⏳'}</p>
            </div>`;
    }
    document.getElementById('view-modal').classList.add('active');
};

// Eliminar usuario
window.confirmarEliminar = function(id) {
    currentUserIdToDelete = id;
    document.getElementById('delete-modal').classList.add('active');
};

const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
        if (!currentUserIdToDelete) return;
        try {
            await deleteDoc(doc(db, 'perfiles', currentUserIdToDelete));
            currentUserIdToDelete = null;
            window.closeModals();
            loadAdminData();
        } catch (e) {
            alert('Error al eliminar usuario.');
        }
    });
}

// ════════════════════════════════════════════════════════════════
// EMAIL JS
// ════════════════════════════════════════════════════════════════
let selectedUserEmail = null;
let selectedUserName  = null;

emailjs.init('Au9kUY26dgMboudTk');

window.abrirMenuEmail = function(id) {
    const user = cachedUsers[id];
    if (!user) return;
    selectedUserEmail = user.email;
    selectedUserName  = user.username || 'Estudiante';
    const targetText  = document.getElementById('email-target-user');
    if (targetText) targetText.textContent = 'Enviar aviso a: ' + selectedUserName;
    document.getElementById('email-modal').classList.add('active');
};

window.enviarAvisoPorTipo = async function(tipo) {
    if (!selectedUserEmail) { alert('No se ha seleccionado destinatario.'); return; }
    const templateIDs = {
        inactividad: 'template_69ol06r',
        progreso:    'template_bvfb1je'
    };
    try {
        await emailjs.send('service_khetf14', templateIDs[tipo], {
            to_name:  selectedUserName,
            to_email: selectedUserEmail,
            message:  tipo === 'inactividad' ? 'Te extrañamos en el curso.' : '¡Sigue así, ya casi terminas!'
        });
        alert('✉️ Correo enviado con éxito a ' + selectedUserEmail);
        window.closeModals();
    } catch (error) {
        console.error('Error EmailJS:', error);
        alert('Error al enviar el correo. Revisa la consola.');
    }
};

// ════════════════════════════════════════════════════════════════
// GESTIÓN DE SOLICITUDES DE CONTENIDO (localStorage)
// ════════════════════════════════════════════════════════════════

function getSolicitudes() {
    try { return JSON.parse(localStorage.getItem(SOLICITUDES_KEY) || '[]'); }
    catch (e) { return []; }
}

function saveSolicitudes(arr) {
    localStorage.setItem(SOLICITUDES_KEY, JSON.stringify(arr));
}

// ── Cargar solicitudes pendientes ────────────────────────────────
window.cargarRevisionesMuro = function() {
    const tbody = document.getElementById('lista-revision-muro');
    if (!tbody) return;

    const todas      = getSolicitudes();
    const pendientes = todas.filter(s => s.estado === 'pendiente');

    // Actualizar badge de nav
    const badge = document.getElementById('badge-solicitudes');
    if (badge) {
        badge.textContent   = pendientes.length > 0 ? pendientes.length : '';
        badge.style.display = pendientes.length > 0 ? 'inline-block' : 'none';
    }

    tbody.innerHTML = '';

    if (!pendientes.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:#94a3b8;">
            ✅ No hay solicitudes pendientes en este momento.
        </td></tr>`;
        return;
    }

    pendientes.forEach(data => {
        const tipoLabel = data.tipo === 'video/youtube' ? '▶️ YouTube' :
                          data.tipo && data.tipo.indexOf('image') === 0 ? '🖼️ Imagen' :
                          '🎬 Video';

        // Preview del contenido
        let preview = '';
        if (data.tipo === 'video/youtube' && data.archivoURL) {
            const embedUrl = getYouTubeEmbedUrl(data.archivoURL);
            if (embedUrl) {
                preview = `<div style="position:relative;width:160px;aspect-ratio:16/9;border-radius:6px;overflow:hidden;margin-bottom:4px;">
                    <iframe src="${embedUrl}" style="width:100%;height:100%;border:none;" allowfullscreen></iframe>
                </div>`;
            }
        } else if (data.archivoURL && data.archivoURL.startsWith('data:video')) {
            preview = `<video src="${data.archivoURL}" style="width:160px;border-radius:6px;max-height:90px;" controls></video>`;
        }

        const contenidoTexto = data.titulo || data.texto || data.nombreArchivo || '—';
        const fechaStr = data.fecha ? new Date(data.fecha).toLocaleDateString('es-MX', {
            day:'2-digit', month:'short', year:'numeric'
        }) : '';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <strong>${data.profesorNombre || 'Creador'}</strong>
                <div style="font-size:11px;color:#94a3b8;">${data.profesorEmail || ''}</div>
            </td>
            <td>
                ${preview}
                <div style="font-size:13px;color:#475569;max-width:220px;">${contenidoTexto}</div>
                <div style="font-size:11px;color:#94a3b8;margin-top:2px;">${data.tema || ''} ${data.nivel ? '· Nivel ' + data.nivel : ''}</div>
                <div style="font-size:11px;color:#94a3b8;">${fechaStr}</div>
            </td>
            <td><span class="badge">${tipoLabel}</span></td>
            <td>
                <div style="display:flex;flex-direction:column;gap:6px;">
                    <button class="btn btn-success" onclick="cambiarEstado('${data.id}', 'aceptado')">✅ Aprobar</button>
                    <button class="btn btn-reject" onclick="pedirComentarioRechazo('${data.id}')">❌ Rechazar</button>
                </div>
            </td>`;
        tbody.appendChild(tr);
    });
};

// ── Aprobar / Rechazar ────────────────────────────────────────────
window.cambiarEstado = function(id, nuevoEstado, comentario = '') {
    const todas = getSolicitudes();
    const idx   = todas.findIndex(s => s.id === id);
    if (idx === -1) return;

    todas[idx].estado          = nuevoEstado;
    todas[idx].comentarioAdmin = comentario;
    todas[idx].fechaResolucion = new Date().toISOString();
    saveSolicitudes(todas);

    window.cargarRevisionesMuro();
    window.cargarMuro();

    const msg = nuevoEstado === 'aceptado' ?
        '✅ Publicación aprobada y publicada en el muro' :
        '❌ Publicación rechazada';
    showToast(msg);
};

// Pedir comentario antes de rechazar
window.pedirComentarioRechazo = function(id) {
    const comentario = prompt('(Opcional) Escribe un comentario para el creador sobre por qué se rechaza:') || '';
    window.cambiarEstado(id, 'rechazado', comentario);
};

// ── Cargar muro (aprobados) ───────────────────────────────────────
window.cargarMuro = function() {
    const grid     = document.getElementById('muro-grid');
    const statsBar = document.getElementById('muro-stats-bar');
    if (!grid) return;

    const todas     = getSolicitudes();
    // Solo mostrar aprobadas que NO estén en la papelera (soft-delete)
    const aprobadas = todas.filter(s => s.estado === 'aceptado' && !s.eliminado);

    // Stats
    if (statsBar) {
        const ytCount    = aprobadas.filter(p => p.tipo === 'video/youtube').length;
        const videoCount = aprobadas.filter(p => p.tipo && p.tipo.indexOf('video') === 0 && p.tipo !== 'video/youtube').length;
        statsBar.innerHTML = `
            <div class="muro-stat-pill">📋 ${aprobadas.length} publicaciones</div>
            <div class="muro-stat-pill">▶️ ${ytCount} YouTube</div>
            <div class="muro-stat-pill">🎬 ${videoCount} videos</div>`;
    }

    grid.innerHTML = '';

    if (!aprobadas.length) {
        grid.innerHTML = `<div class="muro-empty">
            <div class="icon">📭</div>
            <p style="font-weight:600;">No hay publicaciones aprobadas aún.</p>
            <p style="font-size:13px;margin-top:8px;">Aprueba publicaciones en "Pubs. Pendientes".</p>
        </div>`;
        return;
    }

    aprobadas.forEach(data => {
        const card  = document.createElement('div');
        card.className = 'muro-card';

        const fecha = data.fecha ? new Date(data.fecha).toLocaleDateString('es-MX', {
            day:'2-digit', month:'short', year:'numeric'
        }) : '';

        const tipoLabel = data.tipo === 'video/youtube' ? '▶️ YouTube' : '🎬 Video';

        let mediaHTML = '';
        if (data.tipo === 'video/youtube' && data.archivoURL) {
            const embedUrl = getYouTubeEmbedUrl(data.archivoURL);
            if (embedUrl) {
                mediaHTML = `<div class="muro-yt-wrap">
                    <iframe src="${embedUrl}" allowfullscreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
                    </iframe>
                </div>`;
            }
        } else if (data.archivoURL && data.archivoURL.startsWith('data:video')) {
            mediaHTML = `<div style="background:#000;padding:8px 0;">
                <video src="${data.archivoURL}" controls style="width:100%;max-height:280px;"></video>
            </div>`;
        }

        card.innerHTML = `
            <div class="muro-card-header">
                <div>
                    <div class="muro-card-profesor">👤 ${data.profesorNombre || 'Creador'}</div>
                    <div class="muro-card-fecha">${fecha}</div>
                </div>
                <span class="chip-type">${tipoLabel}</span>
            </div>
            <div class="muro-card-body">
                ${mediaHTML}
                ${data.titulo ? `<p style="font-weight:600;font-size:14px;margin-top:8px;">${data.titulo}</p>` : ''}
                ${data.tipo === 'video/youtube' && data.archivoURL
                    ? `<a href="${data.archivoURL}" target="_blank" style="font-size:12px;color:#2563eb;">🔗 Abrir en YouTube</a>`
                    : ''}
            </div>
            <div class="muro-card-footer">
                <span style="font-size:12px;color:#94a3b8;">ID: ${(data.id || '').slice(-6)}</span>
                <button class="btn-delete-muro" onclick="confirmarEliminarMuro('${data.id}')">🗑️ Eliminar</button>
            </div>`;
        grid.appendChild(card);
    });
};

// El botón confirm-delete-muro-btn es gestionado por el bloque
// de Papelera de Reciclaje (soft-delete) más abajo.
let postToDelete = null;

window.confirmarEliminarMuro = function(id) {
    postToDelete = id;
    document.getElementById('delete-muro-modal').classList.add('active');
};

// ── Helpers ───────────────────────────────────────────────────────
function getYouTubeEmbedUrl(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m) return `https://www.youtube.com/embed/${m[1]}`;
    }
    return null;
}

function showToast(msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent  = msg;
    t.className    = 'toast show';
    setTimeout(() => { t.className = 'toast'; }, 3500);
}

// ════════════════════════════════════════════════════════════════
// GESTIÓN DE ROLES  —  Firestore
// Solo existen dos roles de usuario: "usuario" y "creador"
// ════════════════════════════════════════════════════════════════

window.cargarTablaRoles = async function () {
    const tbody = document.getElementById('roles-list');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:#94a3b8;">Cargando...</td></tr>';

    try {
        const { getDocs: _getDocs, collection: _col } = await import(
            'https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js'
        );
        const snap = await _getDocs(_col(db, 'perfiles'));
        tbody.innerHTML = '';

        snap.forEach(docSnap => {
            const u   = docSnap.data();
            const uid = docSnap.id;
            if (u.rol === 'admin') return;

            const rolEfectivo = u.rol || 'usuario';
            const rolLabel = rolEfectivo === 'creador'
                ? '<span class="badge" style="background:#f0fdf4;color:#16a34a;">🎨 Creador</span>'
                : '<span class="badge" style="background:#eff6ff;color:#2563eb;">👤 Usuario</span>';

            const esCreador = rolEfectivo === 'creador';

            const tr = document.createElement('tr');
            tr.setAttribute('data-uid', uid);
            tr.innerHTML = `
                <td><strong>${u.username || 'Sin nombre'}</strong></td>
                <td style="font-size:13px;color:#64748b;">${u.email || ''}</td>
                <td>${rolLabel}</td>
                <td>
                    <button class="btn" style="background:${esCreador ? '#fef2f2' : '#f0fdf4'};color:${esCreador ? '#dc2626' : '#16a34a'};border:1px solid ${esCreador ? '#fecaca' : '#bbf7d0'};"
                        onclick="cambiarRol('${uid}','${esCreador ? 'usuario' : 'creador'}')">
                        ${esCreador ? '❌ Quitar Creador' : '✅ Dar Creador'}
                    </button>
                </td>`;
            tbody.appendChild(tr);
        });

        // Búsqueda local
        const searchInput = document.getElementById('roles-search');
        if (searchInput) {
            searchInput.oninput = function () {
                const term = this.value.toLowerCase();
                tbody.querySelectorAll('tr').forEach(row => {
                    row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
                });
            };
        }
    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:20px;color:#ef4444;">Error al cargar usuarios.</td></tr>';
        console.error('cargarTablaRoles:', e);
    }
};

window.cambiarRol = async function (uid, nuevoRol) {
    try {
        const { doc: _doc, updateDoc } = await import(
            'https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js'
        );
        await updateDoc(_doc(db, 'perfiles', uid), { rol: nuevoRol });
        showToast(`✅ Rol actualizado a "${nuevoRol}"`);
        window.cargarTablaRoles();
    } catch (e) {
        console.error('cambiarRol:', e);
        showToast('❌ Error al actualizar el rol. Revisa la consola.');
    }
};

// ════════════════════════════════════════════════════════════════
// PAPELERA DE RECICLAJE  —  localStorage (soft delete)
// El admin puede marcar publicaciones como eliminadas y recuperarlas.
// ════════════════════════════════════════════════════════════════

window.cargarPapelera = function () {
    const tbody = document.getElementById('papelera-list');
    if (!tbody) return;

    const todas     = getSolicitudes();
    const eliminadas = todas.filter(s => s.eliminado === true);

    if (!eliminadas.length) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:30px;color:#94a3b8;">
            ✅ La papelera está vacía.
        </td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    eliminadas.forEach(data => {
        const tipoLabel = data.tipo === 'video/youtube' ? '▶️ YouTube' :
                          data.tipo && data.tipo.indexOf('image') === 0 ? '🖼️ Imagen' : '🎬 Video';
        const fechaEliminado = data.fechaEliminado
            ? new Date(data.fechaEliminado).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' })
            : '—';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>
                <strong>${data.profesorNombre || 'Creador'}</strong>
                <div style="font-size:11px;color:#94a3b8;">${data.profesorEmail || ''}</div>
            </td>
            <td style="font-size:13px;color:#475569;max-width:200px;">${data.titulo || data.texto || '—'}</td>
            <td><span class="badge">${tipoLabel}</span></td>
            <td style="font-size:12px;color:#94a3b8;">${fechaEliminado}</td>
            <td style="display:flex;gap:6px;flex-wrap:wrap;">
                <button class="btn btn-success" onclick="restaurarPublicacion('${data.id}')">♻️ Restaurar</button>
                <button class="btn btn-danger" onclick="eliminarDefinitivo('${data.id}')">🗑️ Borrar</button>
            </td>`;
        tbody.appendChild(tr);
    });
};

window.restaurarPublicacion = function (id) {
    const todas = getSolicitudes();
    const idx   = todas.findIndex(s => s.id === id);
    if (idx === -1) return;
    delete todas[idx].eliminado;
    delete todas[idx].fechaEliminado;
    todas[idx].estado = 'aceptado';
    saveSolicitudes(todas);
    showToast('♻️ Publicación restaurada al muro');
    window.cargarPapelera();
    window.cargarMuro();
};

window.eliminarDefinitivo = function (id) {
    if (!confirm('⚠️ ¿Borrar permanentemente? Esta acción no se puede deshacer.')) return;
    const todas    = getSolicitudes();
    const filtradas = todas.filter(s => s.id !== id);
    saveSolicitudes(filtradas);
    showToast('🗑️ Publicación eliminada permanentemente');
    window.cargarPapelera();
};

// El confirm-delete-muro-btn original usa hard-delete.
// Lo reemplazamos por soft-delete (mover a papelera).
// ─ El bloque original en línea ya no se usa; este lo sobreescribe.
const _muroSoftBtn = document.getElementById('confirm-delete-muro-btn');
if (_muroSoftBtn) {
    // Clonar nodo para eliminar listeners previos
    const clone = _muroSoftBtn.cloneNode(true);
    _muroSoftBtn.parentNode.replaceChild(clone, _muroSoftBtn);
    clone.addEventListener('click', () => {
        if (!postToDelete) return;
        const todas = getSolicitudes();
        const idx   = todas.findIndex(s => s.id === postToDelete);
        if (idx !== -1) {
            todas[idx].eliminado      = true;
            todas[idx].fechaEliminado = new Date().toISOString();
        }
        saveSolicitudes(todas);
        postToDelete = null;
        window.closeModals();
        window.cargarMuro();
        showToast('🗑️ Publicación movida a la papelera');
    });
}

// ════════════════════════════════════════════════════════════════
// NOTIFICACIONES GLOBALES (BROADCAST)  —  localStorage
// ════════════════════════════════════════════════════════════════
const BROADCAST_KEY = 'broadcasts_admin';

function getBroadcasts() {
    try { return JSON.parse(localStorage.getItem(BROADCAST_KEY) || '[]'); }
    catch (e) { return []; }
}
function saveBroadcasts(arr) {
    localStorage.setItem(BROADCAST_KEY, JSON.stringify(arr));
}

window.publicarBroadcast = function () {
    const titulo  = (document.getElementById('broadcast-titulo')?.value || '').trim();
    const mensaje = (document.getElementById('broadcast-mensaje')?.value || '').trim();
    const tipo    = document.getElementById('broadcast-tipo')?.value || 'info';
    const expira  = document.getElementById('broadcast-expira')?.value || '';

    if (!titulo || !mensaje) {
        showToast('⚠️ Completa el título y el mensaje');
        return;
    }

    const nueva = {
        id:        'bc_' + Date.now(),
        titulo,
        mensaje,
        tipo,
        expira:    expira ? new Date(expira).toISOString() : null,
        publicado: new Date().toISOString(),
        activa:    true
    };

    const todas = getBroadcasts();
    todas.unshift(nueva);
    saveBroadcasts(todas);

    // Limpiar formulario
    document.getElementById('broadcast-titulo').value  = '';
    document.getElementById('broadcast-mensaje').value = '';
    document.getElementById('broadcast-expira').value  = '';

    showToast('📢 Notificación publicada');
    window.cargarBroadcasts();
};

window.cargarBroadcasts = function () {
    const tbody = document.getElementById('broadcast-list');
    if (!tbody) return;

    const todas = getBroadcasts();

    if (!todas.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:#94a3b8;">
            📭 No hay notificaciones publicadas.
        </td></tr>`;
        return;
    }

    tbody.innerHTML = '';
    const tipoEstilo = {
        info:   { bg: '#eff6ff', color: '#2563eb', label: 'ℹ️ Info' },
        alerta: { bg: '#fef3c7', color: '#b45309', label: '⚠️ Alerta' },
        exito:  { bg: '#f0fdf4', color: '#16a34a', label: '🎉 Celebración' }
    };

    todas.forEach(bc => {
        const estilo    = tipoEstilo[bc.tipo] || tipoEstilo.info;
        const publicado = new Date(bc.publicado).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
        const expiraStr = bc.expira
            ? new Date(bc.expira).toLocaleDateString('es-MX', { day:'2-digit', month:'short', year:'numeric' })
            : '<span style="color:#94a3b8;">Sin límite</span>';

        const expirada = bc.expira && new Date(bc.expira) < new Date();

        const tr = document.createElement('tr');
        tr.style.opacity = expirada ? '0.5' : '1';
        tr.innerHTML = `
            <td><strong>${bc.titulo}</strong>${expirada ? ' <span style="font-size:11px;color:#ef4444;">(expirada)</span>' : ''}</td>
            <td style="font-size:13px;color:#475569;max-width:220px;">${bc.mensaje}</td>
            <td><span class="badge" style="background:${estilo.bg};color:${estilo.color};">${estilo.label}</span></td>
            <td style="font-size:12px;color:#64748b;">${publicado}</td>
            <td style="font-size:12px;color:#64748b;">${expiraStr}</td>
            <td>
                <button class="btn btn-danger" onclick="eliminarBroadcast('${bc.id}')">🗑️ Eliminar</button>
            </td>`;
        tbody.appendChild(tr);
    });
};

window.eliminarBroadcast = function (id) {
    const todas    = getBroadcasts();
    const filtradas = todas.filter(b => b.id !== id);
    saveBroadcasts(filtradas);
    showToast('🗑️ Notificación eliminada');
    window.cargarBroadcasts();
};

// ════════════════════════════════════════════════════════════════
// LOGS DE INICIO DE SESIÓN  —  localStorage
// Registra cada inicio de sesión con usuario, rol, fecha y agente.
// ════════════════════════════════════════════════════════════════
const LOGS_KEY = 'logs_sesion';

function getLogs() {
    try { return JSON.parse(localStorage.getItem(LOGS_KEY) || '[]'); }
    catch (e) { return []; }
}
function saveLogs(arr) {
    localStorage.setItem(LOGS_KEY, JSON.stringify(arr));
}

/** Llamar desde cualquier página al detectar inicio de sesión exitoso */
window.registrarLoginLog = function (userData) {
    // userData: { uid, username, email, rol }
    const logs = getLogs();
    logs.unshift({
        id:        'log_' + Date.now(),
        uid:       userData.uid        || '',
        username:  userData.username   || userData.email || 'Desconocido',
        email:     userData.email      || '',
        rol:       userData.rol        || 'usuario',
        fecha:     new Date().toISOString(),
        agente:    navigator.userAgent.substring(0, 120)
    });
    // Guardar máximo 500 registros para no saturar localStorage
    if (logs.length > 500) logs.splice(500);
    saveLogs(logs);
};

/**
 * INTEGRACIÓN EN OTRAS PÁGINAS (usuarios y creadores):
 * En el onAuthStateChanged de cada página, tras confirmar el rol, llama:
 *
 *   const pendingLog = { uid, username, email, rol, fecha: new Date().toISOString(),
 *                        agente: navigator.userAgent.substring(0,120) };
 *   const logs = JSON.parse(localStorage.getItem('logs_sesion') || '[]');
 *   logs.unshift({ id: 'log_' + Date.now(), ...pendingLog });
 *   if (logs.length > 500) logs.splice(500);
 *   localStorage.setItem('logs_sesion', JSON.stringify(logs));
 */

window.cargarLogs = function () {
    const tbody    = document.getElementById('logs-list');
    const countEl  = document.getElementById('logs-count');
    const filtroRol = (document.getElementById('logs-filter-rol')?.value || '').trim();
    if (!tbody) return;

    let logs = getLogs();

    // Aplicar filtro de rol si se seleccionó uno
    if (filtroRol) {
        logs = logs.filter(l => l.rol === filtroRol);
    }

    if (countEl) countEl.textContent = logs.length + ' registros';

    if (!logs.length) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:30px;color:#94a3b8;">
            📭 No hay registros de sesión aún.
        </td></tr>`;
        return;
    }

    const rolEstilo = {
        admin:   { bg: '#fdf4ff', color: '#7c3aed', label: '🛡️ Admin' },
        creador: { bg: '#f0fdf4', color: '#16a34a', label: '🎨 Creador' },
        usuario: { bg: '#eff6ff', color: '#2563eb', label: '👤 Usuario' }
    };

    tbody.innerHTML = '';
    logs.forEach((log, idx) => {
        const estilo   = rolEstilo[log.rol] || rolEstilo.usuario;
        const fechaStr = new Date(log.fecha).toLocaleDateString('es-MX', {
            day:'2-digit', month:'short', year:'numeric',
            hour:'2-digit', minute:'2-digit', second:'2-digit'
        });
        // Detectar tipo de dispositivo desde el agente
        let dispositivo = '💻 Escritorio';
        if (/Android/i.test(log.agente))       dispositivo = '📱 Android';
        else if (/iPhone|iPad/i.test(log.agente)) dispositivo = '📱 iOS';
        else if (/Mobile/i.test(log.agente))   dispositivo = '📱 Móvil';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="font-size:12px;color:#94a3b8;font-weight:600;">${idx + 1}</td>
            <td><strong>${log.username}</strong></td>
            <td style="font-size:13px;color:#64748b;">${log.email}</td>
            <td><span class="badge" style="background:${estilo.bg};color:${estilo.color};">${estilo.label}</span></td>
            <td style="font-size:13px;color:#475569;">${fechaStr}</td>
            <td style="font-size:12px;color:#94a3b8;">${dispositivo}</td>`;
        tbody.appendChild(tr);
    });
};

// Filtrado en tiempo real por rol
document.addEventListener('DOMContentLoaded', () => {
    const filtroEl = document.getElementById('logs-filter-rol');
    if (filtroEl) filtroEl.addEventListener('change', () => {
        if (typeof window.cargarLogs === 'function') window.cargarLogs();
    });
});

window.limpiarLogs = function () {
    if (!confirm('⚠️ ¿Eliminar todos los registros de sesión? Esta acción no se puede deshacer.')) return;
    saveLogs([]);
    showToast('🗑️ Logs de sesión eliminados');
    window.cargarLogs();
};

// ── Logout ────────────────────────────────────────────────────────
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.onclick = async () => {
        if (confirm('¿Cerrar sesión?')) {
            await signOut(auth);
            window.location.href = 'index.html';
        }
    };
}