import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { diccionarioData } from './glosario-data.js';
const firebaseConfig = {
    apiKey: "AIzaSyC7zx9CreT58V1AWTq7pMoS_ps65mXf-9Y",
    authDomain: "mis-manos-hablaran-44e17.firebaseapp.com",
    projectId: "mis-manos-hablaran-44e17",
    storageBucket: "mis-manos-hablaran-44e17.firebasestorage.app",
    messagingSenderId: "637462888639",
    appId: "1:637462888639:web:c4070137237c211dbd460a"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
if (window.emailjs) window.emailjs.init("Au9kUY26dgMboudTk");

const $ = id => document.getElementById(id);
const DAY = 864e5;
const INACTIVITY_LIMIT = 900000, WARNING_SECONDS = 60;
const EMAIL_SERVICE = 'service_khetf14';
const TEMPLATES = { inactividad: "template_69ol06r", progreso: "template_bvfb1je" };

let users = [], myUid = null, selectedId = null, deleteId = null;
let inactivityTimer, countdownInterval, warningVisible = false;

// ───────── Utilidades ─────────
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const toDate = v => !v ? null : (v.toDate ? v.toDate() : new Date(v));
const fmt = d => d ? d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const ago = d => { if (!d) return 'Sin registro'; const n = Math.floor((Date.now() - d) / DAY); return n <= 0 ? 'Hoy' : n === 1 ? 'Ayer' : 'hace ' + n + ' días'; };
const find = id => users.find(u => u.id === id);
const students = () => users.filter(u => u.rol !== 'admin');

function toast(t) {
    const d = document.createElement('div');
    d.className = 'toast'; d.textContent = t;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 2800);
}

// Normaliza un perfil. Nivel = nivel en el que está trabajando (completados + 1, máx. 4).
function norm(id, u) {
    const done = [1, 2, 3, 4].filter(n => u['nivel' + n + '_completado']).length;
    return {
        id, ...u, rol: u.rol || 'usuario', activo: u.activo !== false,
        done, level: Math.min(done + 1, 4), grad: !!u.nivel4_completado,
        created: toDate(u.created_at), last: toDate(u.ultimo_acceso)
    };
}

// ───────── Autenticación (solo admins activos) ─────────
onAuthStateChanged(auth, async user => {
    if (!user) { location.href = "index.html"; return; }
    try {
        const snap = await getDoc(doc(db, "perfiles", user.uid));
        if (snap.exists() && snap.data().rol === "admin" && snap.data().activo !== false) {
            myUid = user.uid;
            document.body.style.visibility = 'visible';
            startTimer();
            loadData();
        } else location.href = "index.html";
    } catch (e) { location.href = "index.html"; }
});

async function loadData() {
    try {
        const snap = await getDocs(collection(db, "perfiles"));
        users = snap.docs.map(d => norm(d.id, d.data()));
        renderAll();
    } catch (e) { console.error(e); toast('Error al cargar usuarios'); }
}
const renderAll = () => { renderUsers(); renderStats(); renderInactive(); renderRanking(); };

// ───────── Usuarios: filtros, tabla, exportación ─────────
function filtered() {
    const t = $('admin-search').value.toLowerCase(), lv = $('f-level').value, rl = $('f-role').value;
    const st = $('f-status').value, from = $('f-from').value, to = $('f-to').value;
    return users.filter(u => {
        if (t && !((u.username || '') + ' ' + (u.email || '')).toLowerCase().includes(t)) return false;
        if (lv && (u.grad ? 'g' : String(u.level)) !== lv) return false;
        if (rl && u.rol !== rl) return false;
        if (st && (u.activo ? 'on' : 'off') !== st) return false;
        if (from && (!u.created || u.created < new Date(from + 'T00:00:00'))) return false;
        if (to && (!u.created || u.created > new Date(to + 'T23:59:59'))) return false;
        return true;
    });
}

function renderUsers() {
    const list = filtered();
    $('users-list').innerHTML = list.map(u => `<tr>
        <td><strong>${esc(u.username || 'Estudiante')}</strong>${u.rol !== 'usuario' ? ` <span class="pill pill-role">${esc(u.rol)}</span>` : ''}</td>
        <td>${esc(u.email || 'Sin correo')}</td>
        <td><span class="badge badge-level-${u.level}">${u.grad ? '🎓 ' : ''}Nivel ${u.level}</span></td>
        <td>${fmt(u.created)}</td><td>${ago(u.last)}</td>
        <td><span class="pill ${u.activo ? 'pill-on' : 'pill-off'}">${u.activo ? 'Activo' : 'Suspendido'}</span></td>
        <td class="acts">
            <button class="btn btn-view" data-act="view" data-id="${u.id}">Vista</button>
            <button class="btn btn-view" data-act="mail" data-id="${u.id}">Aviso</button>
            <button class="btn btn-refresh" data-act="manage" data-id="${u.id}">Gestionar</button>
        </td></tr>`).join('') || '<tr><td colspan="7" class="muted" style="text-align:center;padding:30px">Sin resultados</td></tr>';
    const s = students();
    $('stat-total-users').textContent = s.length;
    $('stat-avg-level').textContent = s.length ? (s.reduce((a, u) => a + u.level, 0) / s.length).toFixed(1) : '0';
    $('stat-completed').textContent = s.filter(u => u.grad).length;
}

function exportCSV() {
    const q = v => { let s = String(v ?? ''); if (/^[=+\-@]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
    const rows = filtered().map(u => [u.username, u.email, u.rol, u.grad ? 'Graduado' : 'Nivel ' + u.level,
        u.done, u.activo ? 'Activo' : 'Suspendido', fmt(u.created), fmt(u.last)]);
    const head = ['Usuario', 'Correo', 'Rol', 'Nivel', 'Niveles completados', 'Estado', 'Registro', 'Último acceso'];
    const csv = [head, ...rows].map(r => r.map(q).join(',')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'usuarios_' + new Date().toISOString().slice(0, 10) + '.csv';
    a.click(); URL.revokeObjectURL(a.href);
}

// ───────── Estadísticas y gráficas ─────────
function bars(id, items, max) {
    max = max || Math.max(1, ...items.map(i => i.v));
    $(id).innerHTML = items.map(i => `<div class="bar-row"><span class="bar-l">${esc(i.l)}</span>
        <div class="bar-t"><div class="bar-f" style="width:${Math.min(100, i.v / max * 100)}%"></div></div>
        <span class="bar-v">${i.v}${i.s || ''}</span></div>`).join('');
}

function renderStats() {
    const s = students(), n = s.length, now = Date.now();
    $('st-total').textContent = n;
    $('st-grad').textContent = s.filter(u => u.grad).length;
    $('st-a7').textContent = s.filter(u => u.last && now - u.last < 7 * DAY).length;
    $('st-a30').textContent = s.filter(u => u.last && now - u.last < 30 * DAY).length;

    const dist = [1, 2, 3, 4].map(l => ({ l: 'Trabajando en Nivel ' + l, v: s.filter(u => !u.grad && u.level === l).length }));
    dist.push({ l: '🎓 Graduados', v: s.filter(u => u.grad).length });
    bars('chart-dist', dist);
    const top = dist.slice(0, 4).reduce((a, b) => b.v > a.v ? b : a);
    $('stuck-note').textContent = top.v ? `Mayor concentración: ${top.l.replace('Trabajando en ', '')} (${top.v} alumno${top.v > 1 ? 's' : ''}, ${Math.round(top.v / n * 100)}%). Si es alto, ese nivel puede ser difícil o estar abandonándose.` : 'Aún no hay datos.';

    const pct = k => n ? Math.round(s.filter(u => u['nivel' + k + '_completado']).length / n * 100) : 0;
    bars('chart-funnel', [1, 2, 3, 4].map(k => ({ l: 'Completaron Nivel ' + k, v: pct(k), s: '%' })), 100);

    const byMonth = $('chart-range').value === 'mes';
    const items = [];
    for (let i = byMonth ? 5 : 7; i >= 0; i--) {
        if (byMonth) {
            const d = new Date(new Date().getFullYear(), new Date().getMonth() - i, 1);
            items.push({ l: d.toLocaleDateString('es-MX', { month: 'short', year: '2-digit' }),
                v: s.filter(u => u.created && u.created.getFullYear() === d.getFullYear() && u.created.getMonth() === d.getMonth()).length });
        } else {
            items.push({ l: i === 0 ? 'Esta semana' : 'Hace ' + i + ' sem', v: s.filter(u => u.created && now - u.created >= i * 7 * DAY && now - u.created < (i + 1) * 7 * DAY).length });
        }
    }
    bars('chart-reg', items);
    bars('chart-act', Array.from({ length: 8 }, (_, k) => 7 - k).map(i => ({
        l: i === 0 ? 'Esta semana' : 'Hace ' + i + ' sem',
        v: s.filter(u => u.last && now - u.last >= i * 7 * DAY && now - u.last < (i + 1) * 7 * DAY).length })));
}

// ───────── Inactivos y avisos por correo ─────────
function inactiveList() {
    const days = Math.max(1, parseInt($('inactive-days').value) || 14), now = Date.now();
    return students().filter(u => u.activo && !u.grad && u.email && (!(u.last || u.created) || now - (u.last || u.created) > days * DAY))
        .sort((a, b) => (a.last || a.created || 0) - (b.last || b.created || 0));
}

function renderInactive() {
    const l = inactiveList();
    $('inactive-count').textContent = l.length;
    $('inactive-list').innerHTML = l.map(u => `<tr>
        <td><strong>${esc(u.username || 'Estudiante')}</strong></td><td>${esc(u.email)}</td>
        <td>${u.last ? ago(u.last) : 'Sin registro (se registró ' + ago(u.created) + ')'}</td>
        <td><span class="badge badge-level-${u.level}">Nivel ${u.level}</span></td>
        <td><button class="btn btn-view" data-act="mailInact" data-id="${u.id}">Avisar</button></td></tr>`).join('')
        || '<tr><td colspan="5" class="muted" style="text-align:center;padding:30px">🎉 Nadie está inactivo con este criterio</td></tr>';
}

const sendMail = (u, tipo) => window.emailjs.send(EMAIL_SERVICE, TEMPLATES[tipo], {
    to_name: u.username || 'Estudiante', to_email: u.email,
    message: tipo === 'inactividad' ? 'Te extrañamos en el curso. ¡Vuelve y continúa aprendiendo!' : '¡Sigue así, ya casi terminas!'
});

async function mailAllInactive() {
    const l = inactiveList();
    if (!l.length) return toast('No hay alumnos inactivos');
    if (!window.emailjs) return toast('EmailJS no está cargado');
    if (!confirm(`¿Enviar aviso de inactividad a ${l.length} alumno(s)?`)) return;
    let ok = 0;
    for (const u of l) {
        try { await sendMail(u, 'inactividad'); ok++; } catch (e) { console.error(e); }
        await new Promise(r => setTimeout(r, 500));
    }
    toast(`✉️ ${ok} de ${l.length} correos enviados`);
}

window.enviarAvisoPorTipo = async tipo => {
    const u = find(selectedId);
    if (!u || !window.emailjs) return toast('No se pudo enviar el correo');
    try { await sendMail(u, tipo); toast('✉️ Correo enviado'); window.closeModals(); }
    catch (e) { console.error(e); toast('Error al enviar el correo'); }
};

// ───────── Ranking y certificados ─────────
function renderRanking() {
    const s = students().filter(u => u.activo)
        .sort((a, b) => b.done - a.done || (b.progreso_dias_completados || 0) + (b.progreso_meses_completados || 0) - (a.progreso_dias_completados || 0) - (a.progreso_meses_completados || 0) || (a.created || 0) - (b.created || 0));
    $('rank-grad').textContent = s.filter(u => u.grad).length;
    const medal = i => ['🥇', '🥈', '🥉'][i] || (i + 1);
    $('ranking-list').innerHTML = s.slice(0, 15).map((u, i) => `<tr>
        <td style="font-size:18px">${medal(i)}</td><td><strong>${esc(u.username || 'Estudiante')}</strong></td>
        <td>${u.done}/4 niveles</td><td>${u.grad ? '🎓 Graduado' : 'Nivel ' + u.level}</td>
        <td>${u.grad ? `<button class="btn btn-view" data-act="cert" data-id="${u.id}">Certificado</button>` : ''}</td></tr>`).join('')
        || '<tr><td colspan="5" class="muted" style="text-align:center;padding:30px">Sin alumnos</td></tr>';
}

function certificate(id) {
    const u = find(id); if (!u) return;
    const w = window.open('', '_blank');
    if (!w) return toast('Permite las ventanas emergentes para ver el certificado');
    const f = new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
    w.document.write(`<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Certificado - ${esc(u.username)}</title><style>
        @page{size:landscape;margin:0}body{margin:0;font-family:Georgia,serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f1f5f9}
        .c{width:960px;height:640px;box-sizing:border-box;padding:56px;background:#fff;border:14px double #1e3a8a;text-align:center;display:flex;flex-direction:column;justify-content:center;gap:14px}
        h1{font-size:44px;color:#1e3a8a;margin:0}h2{font-size:40px;margin:8px 0;border-bottom:2px solid #1e3a8a;align-self:center;padding:0 30px 6px}
        p{font-size:20px;color:#334155;margin:0}@media print{body{background:#fff}}</style></head><body><div class="c">
        <p>Mis Manos Hablarán</p><h1>Certificado de Finalización</h1><p>Se otorga a</p><h2>${esc(u.username)}</h2>
        <p>por completar los 4 niveles del curso de Lengua de Señas Mexicana:<br>Abecedario, Palabras, Calendario y Meses.</p>
        <p style="margin-top:24px">${f}</p></div><script>onload=()=>setTimeout(()=>print(),400)<\/script></body></html>`);
    w.document.close();
}

// ───────── Gestionar usuario (rol, suspensión, progreso) ─────────
async function patch(id, data, msg) {
    try {
        await updateDoc(doc(db, "perfiles", id), data);
        toast('✅ ' + msg);
        await loadData();
        if (find(id) && $('manage-modal').classList.contains('active')) openManage(id);
    } catch (e) { console.error(e); toast('❌ Error: ' + (e.code || e.message)); }
}

function openManage(id) {
    const u = find(id); if (!u) return;
    selectedId = id;
    const me = id === myUid;
    $('manage-title').textContent = u.username || 'Usuario';
    $('manage-sub').textContent = u.email || '';
    $('m-role').value = u.rol;
    $('m-level').value = String(u.done);
    $('m-status').innerHTML = `<span class="pill ${u.activo ? 'pill-on' : 'pill-off'}">${u.activo ? 'Activo' : 'Suspendido'}</span>`;
    $('m-toggle').textContent = u.activo ? 'Suspender' : 'Reactivar';
    ['m-role', 'm-level', 'm-save-role', 'm-save-level', 'm-toggle', 'm-delete'].forEach(k => $(k).disabled = me);
    $('m-note').textContent = me ? 'Esta es tu propia cuenta: no puedes modificarla desde aquí.' : '';
    $('manage-modal').classList.add('active');
}

$('m-save-role').onclick = () => {
    const u = find(selectedId), r = $('m-role').value;
    if (!u || r === u.rol) return;
    if (r === 'admin' && !confirm('Este usuario tendrá acceso total al panel de administración. ¿Continuar?')) return;
    patch(u.id, { rol: r }, 'Rol actualizado a ' + r);
};
$('m-save-level').onclick = () => {
    const u = find(selectedId), n = +$('m-level').value;
    if (!u) return;
    if (!confirm(n === 0 ? '¿Reiniciar TODO el progreso de este alumno?' : `¿Marcar al alumno como completado hasta el Nivel ${n}? (los niveles posteriores se reinician)`)) return;
    const d = { nivel_actual: Math.min(n + 1, 4), progreso_dias_completados: n >= 3 ? 10 : 0, progreso_meses_completados: n >= 4 ? 16 : 0 };
    [1, 2, 3, 4].forEach(k => d['nivel' + k + '_completado'] = k <= n);
    patch(u.id, d, 'Progreso actualizado');
};
$('m-toggle').onclick = () => {
    const u = find(selectedId); if (!u) return;
    if (u.activo && !confirm('El usuario no podrá iniciar sesión mientras esté suspendido. ¿Continuar?')) return;
    patch(u.id, u.activo ? { activo: false, suspendido_en: new Date() } : { activo: true }, u.activo ? 'Cuenta suspendida' : 'Cuenta reactivada');
};
$('m-delete').onclick = () => { window.closeModals(); deleteId = selectedId; $('delete-modal').classList.add('active'); };

$('confirm-delete-btn').onclick = async () => {
    if (!deleteId || deleteId === myUid) return;
    try { await deleteDoc(doc(db, "perfiles", deleteId)); toast('Perfil eliminado'); }
    catch (e) { console.error(e); toast('❌ No se pudo eliminar'); }
    deleteId = null; window.closeModals(); loadData();
};

// ───────── Acciones de la tabla (delegación de eventos) ─────────
const acts = {
    view(id) {
        const u = find(id); if (!u) return;
        $('modal-user-name').textContent = 'Progreso de ' + (u.username || 'Estudiante');
        const L = [['Abecedario', 1], ['Palabras', 2], ['Calendario', 3], ['Meses', 4]];
        $('levels-details-container').innerHTML = L.map(([name, n]) =>
            `<div style="display:flex;justify-content:space-between;padding:10px;border-bottom:1px solid #eee"><span>Nivel ${n}: ${name}</span><span>${u['nivel' + n + '_completado'] ? '✅' : '⏳'}</span></div>`).join('');
        $('view-modal').classList.add('active');
    },
    mail(id) {
        const u = find(id); if (!u) return;
        selectedId = id;
        $('email-target-user').textContent = 'Enviar aviso a: ' + (u.username || u.email);
        $('email-modal').classList.add('active');
    },
    async mailInact(id) {
        acts.mail(id);   // abre el mismo modal flotante de la tabla de Usuarios
    },
    manage: openManage,
    cert: certificate
};
document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (b && acts[b.dataset.act]) acts[b.dataset.act](b.dataset.id);
});

window.closeModals = () => {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
};

// ───────── Controles de la interfaz ─────────
['admin-search', 'f-level', 'f-role', 'f-status', 'f-from', 'f-to'].forEach(k => $(k).addEventListener('input', renderUsers));
$('inactive-days').addEventListener('input', renderInactive);
$('chart-range').addEventListener('change', renderStats);
$('refresh-btn').addEventListener('click', loadData);
$('export-btn').addEventListener('click', exportCSV);
$('mail-all-btn').addEventListener('click', mailAllInactive);

// ───────── Cierre de sesión por inactividad del admin ─────────
async function ejecutarLogout() { await signOut(auth); location.href = "index.html"; }

function mostrarAviso() {
    warningVisible = true;
    let s = WARNING_SECONDS;
    $('inactivity-countdown').textContent = s;
    $('inactivity-modal').classList.add('active');
    countdownInterval = setInterval(() => {
        $('inactivity-countdown').textContent = --s;
        if (s <= 0) { clearInterval(countdownInterval); ejecutarLogout(); }
    }, 1000);
}
function resetTimer() {
    if (warningVisible) return;
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(mostrarAviso, INACTIVITY_LIMIT);
}
function startTimer() {
    ['mousemove', 'mousedown', 'keydown', 'scroll', 'click'].forEach(ev => document.addEventListener(ev, resetTimer, { passive: true }));
    resetTimer();
}
$('inactivity-stay-btn').addEventListener('click', () => {
    warningVisible = false; clearInterval(countdownInterval);
    $('inactivity-modal').classList.remove('active'); resetTimer();
});
$('logout-btn').addEventListener('click', () => { if (confirm("¿Cerrar sesión?")) ejecutarLogout(); });
// ===== GLOSARIO LSM =====
function renderGlosario() {
    const root = document.getElementById('glossary-root');
    if (!root) return;

    const niveles = Object.entries(diccionarioData);
    root.innerHTML = `
        <div class="gl-toolbar">
            <div class="gl-tabs">
                <button class="gl-tab active" data-nivel="all">Todos</button>
                ${niveles.map(([n, d]) =>
                    `<button class="gl-tab" data-nivel="${n}">Nivel ${n} <small>(${d.items.length})</small></button>`
                ).join('')}
            </div>
            <input type="text" id="gl-search" placeholder="Buscar seña...">
        </div>
        <div id="gl-grid" class="gl-grid"></div>
    `;

    let nivelActual = 'all';
    const grid = document.getElementById('gl-grid');

    function pintar() {
        const q = document.getElementById('gl-search').value.trim().toLowerCase();
        const html = niveles
            .filter(([n]) => nivelActual === 'all' || n === nivelActual)
            .flatMap(([n, d]) => d.items.map(it => ({ ...it, nivel: n })))
            .filter(it => it.nombre.toLowerCase().includes(q))
            .map(it => {
                const src = it.imagen || it.video;
                if (!src) return '';
                const esVideo = src.toLowerCase().endsWith('.mp4');
                const media = esVideo
                    ? `<video src="${src}" muted loop playsinline preload="metadata"
                         onmouseenter="this.play()" onmouseleave="this.pause()"></video>`
                    : `<img src="${src}" alt="${it.nombre}" loading="lazy">`;
                return `
                    <article class="gl-card" data-src="${src}" data-video="${esVideo}" data-title="${it.nombre}">
                        <div class="gl-media">${media}</div>
                        <div class="gl-info">
                            <span class="gl-badge">Nivel ${it.nivel}</span>
                            <h4>${it.nombre}</h4>
                            <p>${it.descripcion}</p>
                        </div>
                    </article>`;
            }).join('');
        grid.innerHTML = html || '<p class="muted">No se encontraron señas.</p>';
    }

    root.querySelectorAll('.gl-tab').forEach(btn => btn.addEventListener('click', () => {
        root.querySelectorAll('.gl-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        nivelActual = btn.dataset.nivel;
        pintar();
    }));
    document.getElementById('gl-search').addEventListener('input', pintar);

    // Ampliar al hacer clic
    grid.addEventListener('click', e => {
        const card = e.target.closest('.gl-card');
        if (!card) return;
        const ov = document.createElement('div');
        ov.className = 'gl-overlay';
        ov.innerHTML = card.dataset.video === 'true'
            ? `<video src="${card.dataset.src}" controls autoplay loop></video>`
            : `<img src="${card.dataset.src}" alt="${card.dataset.title}">`;
        ov.addEventListener('click', () => ov.remove());
        document.body.appendChild(ov);
    });

    pintar();
}
console.log(diccionarioData);
renderGlosario();