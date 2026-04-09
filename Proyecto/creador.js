import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  where,
  query,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// opcional
const firebaseConfig = {
  apiKey: "AIzaSyC7zx9CreT58V1AWTq7pMoS_ps65mXf-9Y",
  authDomain: "mis-manos-hablaran-44e17.firebaseapp.com",
  projectId: "mis-manos-hablaran-44e17",
  storageBucket: "mis-manos-hablaran-44e17.appspot.com",
  messagingSenderId: "637462888639",
  appId: "1:637462888639:web:c4070137237c211dbd460a",
  measurementId: "G-5E2QC1Z09F"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const AUTH = getAuth();
const analytics = getAnalytics(app);
// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
        // ══════════════════════════════════════════════
        // DATOS MOCK  (reemplaza con Firebase en prod)
        // ══════════════════════════════════════════════
        let reportsSent = [];
        let corrections = [];
        let pendingToSend = [];
        let videos = [];
        let selectedFile = null;
        let currentUser = null;
        let previewURL = null;
        let unsubscribeVideos = null;
        let isLoaded = false;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUser = {
      uid: user.uid,
      name: user.displayName || "creador contenido",
      email: user.email,
      initials: (user.displayName || "U")[0]
    };
    loadVideos(); // ✅ aquí sí
  } else {
    window.location.href = 'introduccion_usuario.html';
  }
});

function getFolderByEstado(estado) {
  const map = {
    borrador: 'videos_borrador',
    revision: 'videos_revision',
    aprobado: 'videos_aprobados'
  };
  return map[estado] || 'videos_borrador';
}

async function moveVideo(url, nuevoEstado) {
  const res = await fetch("http://localhost:3000/move", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      url,
      nuevoEstado
    })
  });
  const data = await res.json();
  return data.newUrl;
  }
        // ══════════════════════════════════════════════
        // INIT
        // ══════════════════════════════════════════════
        document.addEventListener('DOMContentLoaded', async () => { 
            await loadCorrections();
            await loadReports();
            updateStats();
            renderEditList();
            renderStatusList();
            renderSendList();
            renderReport();
            renderAchievements();
            renderReportsSent();
            populateSoporteSelect();
        });

        // ══════════════════════════════════════════════
        // NAV
        // ══════════════════════════════════════════════
        const sectionMeta = {
            grabar: ['🎬 Grabar Video', 'Graba una nueva señal en Lengua de Señas Mexicana'],
            subir: ['⬆️ Subir Video', 'Selecciona y sube un archivo de video desde tu dispositivo (3.1–3.3)'],
            editar: ['✏️ Editar Contenido', 'Modifica título y descripción de tus videos (4.1–4.3)'],
            enviar: ['📤 Enviar a Revisión', 'Envía tus videos al administrador para revisión (5.1–5.3)'],
            estado: ['🔍 Estado de Videos', 'Consulta si tus videos están pendientes, en proceso o aprobados (7.1–7.2)'],
            soporte: ['🛠️ Soporte Técnico', 'Edita o reemplaza videos incorrectos (6.1–6.2)'],
            reporte: ['📊 Mi Progreso', 'Genera y envía reportes de tu actividad mensual (8.1–8.3)'],
        };

async function loadVideos() {
  if (unsubscribeVideos){
    unsubscribeVideos();
  }
  const q = query(
    collection(db, "videos"),
    where("uid", "==", currentUser.uid)
  );

  unsubscribeVideos = onSnapshot(q, (snapshot) => {
    videos = [];

    snapshot.forEach(doc => {
      videos.push({ id: doc.id, ...doc.data() });
    });

    updateStats();
    renderEditList();
    renderStatusList();
    populateSoporteSelect();
  },
  (error) => {
    console.error("Error en onSnapshot:", error)
  }
);
}
        function goTo(name, el) {
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            const sec = document.getElementById('sec-' + name);
            if (sec) sec.classList.add('active');
            if (el) el.classList.add('active');
            else {
                const allNav = document.querySelectorAll('.nav-item');
                allNav.forEach(n => {
                    const oc = n.getAttribute('onclick');
                    if (oc && oc.includes(name)) n.classList.add('active');
                });
            }
            if (sectionMeta[name]) {
                document.getElementById('page-title').textContent = sectionMeta[name][0];
                document.getElementById('page-sub').textContent = sectionMeta[name][1];
            }
            if (name === 'enviar') renderSendList();
            if (name === 'estado') renderStatusList();
        }

        function goToSend() {
            const nav = document.querySelector('.nav-item:nth-child(5)');
            goTo('enviar', nav);
        }

        // ══════════════════════════════════════════════
        // STATS
        // ══════════════════════════════════════════════
        function updateStats() {
            document.getElementById('stat-total').textContent = videos.length;
            document.getElementById('stat-pend').textContent = videos.filter(v => v.estado === 'revision').length;
            document.getElementById('stat-aprov').textContent = videos.filter(v => v.estado === 'aprobado').length;
            document.getElementById('stat-rech').textContent = videos.filter(v => v.estado === 'rechazado').length;
            document.getElementById('badge-pending').textContent = videos.filter(v => v.estado === 'revision').length;
        }

        // ══════════════════════════════════════════════
        // CÁMARA (2.1 / 2.2)
        // ══════════════════════════════════════════════
        let mediaRecorder, recordedChunks = [],
            stream, recInterval, recSeconds = 0;

        async function startCamera() {
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                const preview = document.getElementById('camera-preview');
                preview.srcObject = stream;
                preview.style.display = 'block';
                document.getElementById('cam-placeholder').style.display = 'none';
                document.getElementById('btn-rec').disabled = false;
                document.getElementById('btn-cam').textContent = '📷 Cámara activa';
                showToast('Cámara activada ✅', 'success');
            } catch (err) {
                showToast('No se pudo acceder a la cámara. Revisa permisos.', 'error');
            }
        }

        function toggleRecord() {
            if (!mediaRecorder || mediaRecorder.state === 'inactive') startRecord();
            else stopRecord();
        }

        function startRecord() {
            if (!stream) {
                showToast('Activa la cámara primero.', 'error');
                return;
            }
            const tema = document.getElementById('rec-tema').value;
            const palabra = document.getElementById('rec-palabra').value.trim();
            if (!tema || !palabra) {
                showToast('Selecciona un tema y escribe la señal primero.', 'error');
                return;
            }

            recordedChunks = [];
            mediaRecorder = new MediaRecorder(stream, {
              mimeType: 'video/webm; codecs=vp9'
            });
            mediaRecorder.ondataavailable = e => {
                if (e.data.size > 0) recordedChunks.push(e.data);
            };
            mediaRecorder.start();

            document.getElementById('btn-rec').style.display = 'none';
            document.getElementById('btn-stop').style.display = 'inline-flex';
            document.getElementById('rec-indicator').style.display = 'block';
            document.getElementById('rec-timer').style.display = 'block';

            recSeconds = 0;
            recInterval = setInterval(() => {
                recSeconds++;
                const m = String(Math.floor(recSeconds / 60)).padStart(2, '0');
                const s = String(recSeconds % 60).padStart(2, '0');
                document.getElementById('rec-timer').textContent = `${m}:${s}`;
            }, 1000);
        }

        function stopRecord() {
            if (!mediaRecorder) return;
            mediaRecorder.stop();
            clearInterval(recInterval);
            document.getElementById('btn-stop').style.display = 'none';
            document.getElementById('rec-indicator').style.display = 'none';
            document.getElementById('rec-timer').style.display = 'none';
            document.getElementById('btn-preview-rec').style.display = 'inline-flex';
            document.getElementById('btn-save-rec').style.display = 'inline-flex';
            document.getElementById('btn-rec').style.display = 'inline-flex';
            showToast('¡Grabación terminada! Puedes previsualizar o guardar.', 'success');
        }

function previewRecording() {
    if (!recordedChunks || recordedChunks.length === 0) {
        showToast('No hay ninguna grabación para mostrar.', 'error');
        return;
    }

    // 1. Crear el Blob con el tipo de video correcto
    const blob = new Blob(recordedChunks, { type: 'video/webm' });

    // 2. Generar una URL temporal para este video
    if (previewURL) URL.revokeObjectURL(previewURL); // Limpiar la memoria anterior
    previewURL = URL.createObjectURL(blob);

    // 3. Referenciar el elemento video del HTML
    const videoPreview = document.getElementById('saved-video');
    const container = document.getElementById('saved-recording');

    // 4. Asignar la fuente y mostrar el contenedor
    videoPreview.src = previewURL;
    container.style.display = 'block'; // Asegúrate de que el card sea visible
    
    videoPreview.load(); // Forzar la carga del nuevo video
    videoPreview.play().catch(e => console.log("Reproducción automática bloqueada"));
    
    showToast('Generando vista previa... 🎥', 'info');
}

async function saveRecording() {
    if (!recordedChunks.length) return;

    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const palabra = document.getElementById('rec-palabra').value.trim();
    const tema = document.getElementById('rec-tema').value;

    // Validación básica antes de enviar
    if (!tema || !palabra) {
        showToast('Falta tema o palabra para guardar el archivo correctamente', 'error');
        return;
    }

    const formData = new FormData();
    // IMPORTANTE: Los datos (tema, palabra) deben ir ANTES que el archivo en algunos servidores
    formData.append("tema", tema); 
    formData.append("palabra", palabra);
    formData.append("estado", "borrador");
    formData.append("video", blob, "grabacion.webm"); // El nombre aquí no importa, el server lo cambiará

    try {
        const res = await fetch("http://localhost:3000/upload", {
            method: "POST",
            body: formData
        });

        const data = await res.json();

        // Guardar en Firebase con la URL real que devolvió el servidor
        await addDoc(collection(db, "videos"), {
            titulo: `Señal — ${palabra}`,
            tema,
            palabra,
            desc: "Grabado en la plataforma",
            estado: "borrador",
            url: data.url, 
            fecha: new Date().toLocaleDateString('es-MX'),
            uid: currentUser.uid,
            email: currentUser.email
        });

        showToast('Grabación guardada correctamente ✅', 'success');
    } catch (error) {
        console.error(error);
        showToast('Error al conectar con el servidor local', 'error');
    }
}

        function updateThemeTag() {
            const val = document.getElementById('rec-tema').value;
            const wrap = document.getElementById('theme-tag-wrap');
            if (val) {
                wrap.style.display = 'block';
                document.getElementById('theme-tag').textContent = '🏷️ ' + val;
            } else {
                wrap.style.display = 'none';
            }
        }

        // ══════════════════════════════════════════════
        // SUBIR VIDEO (3.1 – 3.3)
        // ══════════════════════════════════════════════
        const ALLOWED = ['video/mp4', 'video/webm', 'video/quicktime', 'video/avi'];
        const MAX_MB = 500;

        function handleFileSelect(input) {
            if (input.files.length) handleFile(input.files[0]);
        }

        function handleDrop(e) {
            e.preventDefault();
            document.getElementById('drop-zone').classList.remove('drag-over');
            if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
        }

        function handleFile(file) {
            selectedFile = file;
            const preview = document.getElementById('file-preview');
            preview.classList.add('show');
            document.getElementById('file-name').textContent = file.name;
            document.getElementById('file-size').textContent = (file.size / 1024 / 1024).toFixed(2) + ' MB';

            // 3.2 Validación de formato
            const valid = document.getElementById('file-valid');
            if (!ALLOWED.includes(file.type)) {
                valid.innerHTML = '<span style="color:var(--red);font-size:12px;font-weight:600;">❌ Formato no permitido. Usa MP4, WEBM, MOV o AVI.</span>';
                document.getElementById('upload-form-card').style.display = 'none';
                setStep(2, false);
                return;
            }
            if (file.size > MAX_MB * 1024 * 1024) {
                valid.innerHTML = '<span style="color:var(--red);font-size:12px;font-weight:600;">❌ El archivo supera los 500 MB.</span>';
                document.getElementById('upload-form-card').style.display = 'none';
                setStep(2, false);
                return;
            }
            valid.innerHTML = '<span style="color:var(--green);font-size:12px;font-weight:600;">✅ Formato válido — listo para subir</span>';
            document.getElementById('upload-form-card').style.display = 'block';
            setStep(2, true);
            setStep(3, true);
            showToast('Archivo validado correctamente ✅', 'success');
        }

        function removeFile() {
            document.getElementById('file-preview').classList.remove('show');
            document.getElementById('file-input').value = '';
            document.getElementById('upload-form-card').style.display = 'none';
            setStep(2, false);
            setStep(3, false);
            setStep(4, false);
        }

        function setStep(n, done) {
            const el = document.getElementById('step' + n);
            if (!el) return;
            el.classList.toggle('done', done);
            el.classList.toggle('active', !done);
        }

async function uploadVideo() {
    try {
        const titulo = document.getElementById('vid-titulo').value;
        const tema = document.getElementById('vid-tema').value;
        const palabra = document.getElementById('vid-palabra').value;
        const nivel = document.getElementById('vid-nivel').value;
        const descripcion = document.getElementById('vid-desc').value;

        if (!tema || !palabra) {
            showToast("Debes seleccionar un tema y escribir una palabra ❌", "error");
            return;
        }
        if (!selectedFile) {
            showToast("Selecciona un archivo primero ❌", "error");
            return;
        }

        const formData = new FormData();
        formData.append("tema", tema);
        formData.append("palabra", palabra);
        formData.append("estado", "borrador");
        formData.append("nivel", nivel);
        formData.append("descripcion", descripcion);
        formData.append("video", selectedFile);

        console.log("Enviando al servidor...");

        const res = await fetch("http://localhost:3000/upload", {
            method: "POST",
            body: formData
        });

        // 🔥 Validar respuesta del servidor
        if (!res.ok) {
            throw new Error("Error en el servidor");
        }

        const data = await res.json();

        console.log("Respuesta del server:", data);

        // 🔥 Guardar en Firebase
        await addDoc(collection(db, "videos"), {
            titulo,
            tema,
            palabra,
            nivel,
            descripcion,
            estado: 'borrador',
            url: data.url,
            uid: currentUser.uid
        });

        showToast("Video guardado en local + Firebase ✅", "success");

    } catch (error) {
        console.error("ERROR:", error);
        showToast("Error al subir video ❌", "error");
    }
}

        // function saveDraft() {
        //     showToast('Borrador guardado.', 'info');
        // }

        function clearUploadForm() {
            ['vid-titulo', 'vid-palabra', 'vid-desc'].forEach(id => document.getElementById(id).value = '');
            ['vid-tema', 'vid-nivel'].forEach(id => document.getElementById(id).selectedIndex = 0);
        }

        // ══════════════════════════════════════════════
        // EDITAR (4.1 – 4.3)
        // ══════════════════════════════════════════════
        function renderEditList() {
            const tb = document.getElementById('edit-list');
            tb.innerHTML = '';
            videos.forEach(v => {
                        const canEdit = ['borrador', 'rechazado'].includes(v.estado);
                        tb.innerHTML += `
    <tr>
      <td>
        <div class="vid-cell">
          <div class="vid-thumb">🎥</div>
          <div>
            <div class="vid-title">${v.titulo}</div>
            <div class="vid-meta">${v.fecha}</div>
          </div>
        </div>
      </td>
      <td><span class="theme-tag" style="font-size:11px;">${v.tema}</span></td>
      <td style="font-size:12px;color:var(--slate);">Nivel ${v.nivel}</td>
      <td>${statusBadge(v.estado)}</td>
      <td>
        <div style="display:flex;gap:6px;">
          ${canEdit ? `<button class="btn btn-edit" onclick="openEditModal('${v.id}')">✏️ Editar</button>` : '<span style="font-size:12px;color:var(--slate);">Solo lectura</span>'}
          ${canEdit ? `<button class="btn btn-danger" onclick="deleteVideo('${v.id}')">🗑️</button>` : ''}
        </div>
      </td>
    </tr>`;
  });
  if (!videos.length) tb.innerHTML = `<tr><td colspan="5"><div class="empty"><div class="empty-icon">🎥</div><div class="empty-title">Aún no tienes videos</div></div></td></tr>`;
}

function openEditModal(id) {
  const v = videos.find(v => v.id === id);
  if (!v) return;
  document.getElementById('edit-vid-id').value = id;
  document.getElementById('edit-titulo').value = v.titulo;
  document.getElementById('edit-desc').value   = v.descripcion || "";
  document.getElementById('edit-tema').value   = v.tema;
  document.getElementById('edit-modal').classList.add('active');
}

async function saveEdit() {
  const id = document.getElementById('edit-vid-id').value;
  const titulo = document.getElementById('edit-titulo').value;
  const descripcion   = document.getElementById('edit-desc').value;
  const tema   = document.getElementById('edit-tema').value;

  if (!id) return;

  try {
    await updateDoc(doc(db, "videos", id), {
      titulo : titulo,
      descripcion : descripcion,
      tema : tema
    });

    closeModal('edit-modal');
    showToast('Cambios guardados en Firebase ✅', 'success');

  } catch (error) {
    console.error(error);
    showToast('Error al guardar cambios ❌', 'error');
  }
}

async function deleteVideo(id) {
    try {
        const v = videos.find(v => v.id === id);

        // 🔥 borrar archivo local
        if (v?.url) {
            await fetch(`http://localhost:3000/delete?url=${v.url}`, {
                method: "DELETE"
            });
        }

        // 🔥 borrar de Firebase
        await deleteDoc(doc(db, "videos", id));

        showToast('Video eliminado completamente 🗑️', 'success');

    } catch (error) {
        console.error(error);
        showToast(error.message, 'error');
    }
}

// ══════════════════════════════════════════════
// ENVIAR A REVISIÓN (5.1 – 5.3)
// ══════════════════════════════════════════════
function renderSendList() {
  const wrap  = document.getElementById('send-list-wrap');
  const ready = videos.filter(v => ['borrador','rechazado'].includes(v.estado));
  if (!ready.length) {
    wrap.innerHTML = `<div class="empty"><div class="empty-icon">✅</div><div class="empty-title">¡Todo al día!</div><div class="empty-sub">No tienes videos pendientes de enviar</div></div>`;
    return;
  }
  wrap.innerHTML = ready.map(v => `
    <div style="display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid var(--border);">
      <input type="checkbox" class="send-check" value="${v.id}" checked style="width:17px;height:17px;accent-color:var(--teal);cursor:pointer;">
      <div class="vid-thumb">🎥</div>
      <div style="flex:1;">
        <div style="font-weight:600;font-size:14px;">${v.titulo}</div>
        <div style="font-size:12px;color:var(--slate);">${v.tema} · Nivel ${v.nivel}</div>
      </div>
      ${statusBadge(v.estado)}
    </div>`).join('');
}

function sendAllToReview() {
  const checked = [...document.querySelectorAll('.send-check:checked')].map(c => c.value);
  if (!checked.length) { showToast('Selecciona al menos un video.', 'error'); return; }

  const vids = checked.map(id => videos.find(v => v.id === id)).filter(Boolean);
  document.getElementById('confirm-send-list').innerHTML =
    vids.map(v => `<div style="padding:4px 0;">📹 ${v.titulo}</div>`).join('');
  pendingToSend = checked;
  document.getElementById('confirm-send-modal').classList.add('active');
}

async function confirmSend() {
  try {
    for (const id of pendingToSend) {
const v = videos.find(v => v.id === id);

const newUrl = await moveVideo(v.url, "revision");

await updateDoc(doc(db, "videos", id), {
  estado: 'revision',
  url: newUrl
});
    }

    pendingToSend = [];
    closeModal('confirm-send-modal');
    showToast('Videos enviados a revisión ✅', 'success');

  } catch (error) {
    console.error(error);
    showToast('Error al enviar ❌', 'error');
  }
}

// ══════════════════════════════════════════════
// ESTADO (7.1 – 7.2)
// ══════════════════════════════════════════════
let activeFilter = 'all';

function renderStatusList(filter) {
  if (filter) activeFilter = filter;
  const tb   = document.getElementById('status-list');
  const list = activeFilter === 'all' ? videos : videos.filter(v => v.estado === activeFilter);
  tb.innerHTML = '';
  list.forEach(v => {
    tb.innerHTML += `
    <tr>
      <td>
        <div class="vid-cell">
          <div class="vid-thumb">🎥</div>
          <div>
            <div class="vid-title">${v.titulo}</div>
            <div class="vid-meta">${v.palabra}</div>
          </div>
        </div>
      </td>
      <td style="font-size:12px;">${v.tema}</td>
      <td style="font-size:12px;color:var(--slate);">${v.fecha}</td>
      <td>${statusBadge(v.estado)}</td>
      <td style="font-size:12px;color:var(--slate);max-width:180px;">
        ${v.comentario || '<span style="color:var(--slate-l);">Sin comentario</span>'}
      </td>
      <td>
        ${v.estado === 'rechazado' ?
          `<button class="btn btn-edit" onclick="openEditModal('${v.id}')">🔄 Corregir</button>` :
          v.estado === 'borrador' ?
          `<button class="btn btn-outline" onclick="quickSend('${v.id}')">📤 Enviar</button>` :
          `<span style="font-size:12px;color:var(--slate-l);">—</span>`
        }
      </td>
    </tr>`;
  });
  if (!list.length) tb.innerHTML = `<tr><td colspan="6"><div class="empty"><div class="empty-icon">🔍</div><div class="empty-title">Sin resultados</div></div></td></tr>`;
}

function filterByStatus(f) {
  activeFilter = f;
  renderStatusList(f);
  document.querySelectorAll('[id^="flt-"]').forEach(b => b.classList.remove('btn-primary'));
  const btn = document.getElementById('flt-' + f);
  if (btn) btn.classList.add('btn-primary');
}

async function quickSend(id) {
  try {
    await updateDoc(doc(db, "videos", id), {
      estado: 'revision'
    });

    showToast('Video enviado a revisión ✅', 'success');

  } catch (error) {
    console.error(error);
    showToast('Error al enviar ❌', 'error');
  }
}

// ══════════════════════════════════════════════
// SOPORTE (6.1 – 6.2)
// ══════════════════════════════════════════════
function populateSoporteSelect() {
  const sel  = document.getElementById('soporte-video-sel');
  if (!sel) return;
  sel.innerHTML = '<option value="">— Elige un video —</option>';
  videos.filter(v => ['rechazado','borrador'].includes(v.estado)).forEach(v => {
    sel.innerHTML += `<option value="${v.id}">${v.titulo}</option>`;
  });
}

async function submitCorrection() {
  const id   = document.getElementById('soporte-video-sel').value;
  const nota = document.getElementById('soporte-nota').value.trim();
  const file = document.getElementById('soporte-file').files[0];

  if (!id)   { showToast('Selecciona un video.', 'error'); return; }
  if (!nota) { showToast('Escribe una nota de corrección.', 'error'); return; }

  try {
    const v = videos.find(v => v.id === id);

    if (!v?.url) {
      showToast('El video no tiene URL ❌', 'error');
      return;
    }

    // 🔥 1️⃣ MOVER ARCHIVO A BORRADOR
    const res = await fetch("http://localhost:3000/move", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: v.url,
        nuevoEstado: "borrador"
      })
    });

    const data = await res.json();

    // 🔥 2️⃣ ACTUALIZAR FIREBASE (estado + nueva URL)
    await updateDoc(doc(db, "videos", id), {
      estado: 'borrador',
      url: data.newUrl
    });

    // 🔥 3️⃣ SUBIR ARCHIVO DE CORRECCIÓN (opcional)
    let fileURL = '—';

    if (file) {
      const storageRef = ref(storage, 'correcciones/' + Date.now() + '_' + file.name);
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new  Promise((resolve,reject) =>{
        uploadTask.on(
          "state_changed",
          null,
          reject,
          async () => {
            fileURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve();
          }
        );
      });
    }

    // 🔥 4️⃣ GUARDAR EN FIRESTORE
    await addDoc(collection(db, "correcciones"), { 
      videoId: id,
      titulo: v?.titulo || '',
      nota,
      fecha: new Date().toLocaleDateString('es-MX'),
      file: fileURL,
      user: currentUser.name,
      uid: currentUser.uid,
      email: currentUser.email
    });

    // 🔥 5️⃣ LIMPIAR UI
    document.getElementById('soporte-nota').value = '';
    document.getElementById('soporte-file').value = '';
    document.getElementById('soporte-video-sel').value = '';

    showToast('Video corregido y movido a borrador ✅', 'success');

  } catch (error) {
    console.error(error);
    showToast('Error al guardar corrección ❌', 'error');
  }
}
async function loadCorrections() {
  const snapshot = await getDocs(collection(db, "correcciones"));
  corrections = [];

  snapshot.forEach(doc => {
    corrections.push({ id: doc.id, ...doc.data() });
  });

  renderCorrections();
}

function renderCorrections() {
  const c = document.getElementById('corrections-list');
  if (!corrections.length) return;
  c.innerHTML = corrections.map(co => `
    <div style="padding:10px 0;border-bottom:1px solid var(--border);">
      <div style="font-weight:600;font-size:13px;">🔄 ${co.titulo}</div>
      <div style="font-size:12px;color:var(--slate);margin-top:2px;">${co.nota}</div>
      <div style="font-size:11px;color:var(--slate-l);margin-top:3px;">${co.fecha} · ${co.file}</div>
    </div>`).join('');
}

// ══════════════════════════════════════════════
// REPORTES (8.1 – 8.3)
// ══════════════════════════════════════════════
function renderReport() {
  const body = document.getElementById('report-body');
  const aprov = videos.filter(v=>v.estado==='aprobado').length;
  const rev   = videos.filter(v=>v.estado==='revision').length;
  const rech  = videos.filter(v=>v.estado==='rechazado').length;
  const bord  = videos.filter(v=>v.estado==='borrador').length;
  const total = videos.length;

  body.innerHTML = `
    <div style="margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:6px;">
        <span>Videos aprobados</span><span style="color:var(--green);">${aprov} / ${total}</span>
      </div>
      <div class="ring-track"><div class="ring-fill" style="width:${total?aprov/total*100:0}%;background:linear-gradient(90deg,#22c55e,#4ade80);"></div></div>
    </div>
    <div style="margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:6px;">
        <span>En revisión</span><span style="color:#0369a1;">${rev} / ${total}</span>
      </div>
      <div class="ring-track"><div class="ring-fill" style="width:${total?rev/total*100:0}%;background:linear-gradient(90deg,#0ea5e9,#38bdf8);"></div></div>
    </div>
    <div style="margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:6px;">
        <span>Rechazados</span><span style="color:var(--red);">${rech} / ${total}</span>
      </div>
      <div class="ring-track"><div class="ring-fill" style="width:${total?rech/total*100:0}%;background:linear-gradient(90deg,#ef4444,#f87171);"></div></div>
    </div>
    <div>
      <div style="display:flex;justify-content:space-between;font-size:13px;font-weight:600;margin-bottom:6px;">
        <span>Borradores</span><span style="color:var(--slate);">${bord} / ${total}</span>
      </div>
      <div class="ring-track"><div class="ring-fill" style="width:${total?bord/total*100:0}%;background:linear-gradient(90deg,#94a3b8,#cbd5e1);"></div></div>
    </div>
    <div style="margin-top:22px;padding:14px 16px;background:var(--teal-bg);border-radius:10px;border:1px solid var(--teal-mid);">
      <div style="font-size:13px;font-weight:700;color:var(--teal);">📈 Tasa de aprobación</div>
      <div style="font-family:'Syne',sans-serif;font-size:32px;font-weight:800;color:var(--navy);margin-top:4px;">
        ${total ? Math.round(aprov/total*100) : 0}<span style="font-size:16px;">%</span>
      </div>
    </div>`;
}

function renderAchievements() {
  const aprov = videos.filter(v=>v.estado==='aprobado').length;
  const body  = document.getElementById('achievements-body');
  const badges = [
    { label:'Primer video',   icon:'🎬', done: videos.length >= 1 },
    { label:'5 aprobados',    icon:'⭐', done: aprov >= 5 },
    { label:'10 videos total',icon:'🏆', done: videos.length >= 10 },
    { label:'Temas completos',icon:'📚', done: aprov >= 8 },
  ];
  body.innerHTML = badges.map(b => `
    <div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border);opacity:${b.done?1:.35};">
      <span style="font-size:22px;">${b.icon}</span>
      <span style="font-size:13px;font-weight:${b.done?700:500};">${b.label}</span>
      ${b.done ? '<span style="margin-left:auto;font-size:11px;color:var(--green);font-weight:700;">✅ Logrado</span>' : ''}
    </div>`).join('');
}

function renderReportsSent() {
  const c = document.getElementById('reports-sent-list');
  if (!reportsSent.length) {
    c.innerHTML = `<div style="text-align:center;padding:20px;color:var(--slate);font-size:13px;">Sin reportes enviados aún</div>`;
    return;
  }
  c.innerHTML = reportsSent.map(r => `
    <div style="padding:9px 0;border-bottom:1px solid var(--border);font-size:12px;">
      <div style="font-weight:600;">📄 ${r.titulo}</div>
      <div style="color:var(--slate);margin-top:2px;">${r.fecha}</div>
    </div>`).join('');
}

function generateReport() {
  const aprov = videos.filter(v=>v.estado==='aprobado').length;
  const rev   = videos.filter(v=>v.estado==='revision').length;
  const rech  = videos.filter(v=>v.estado==='rechazado').length;
  const fecha = new Date().toLocaleDateString('es-MX', { month:'long', year:'numeric' });

  document.getElementById('report-content').innerHTML = `
    <strong>📊 Reporte mensual — ${fecha}</strong><br><br>
    👤 Creador: ${currentUser.name}<br>
    📧 Correo: ${currentUser.email}<br><br>
    🎥 Total de videos: <strong>${videos.length}</strong><br>
    ✅ Aprobados: <strong>${aprov}</strong><br>
    ⏳ En revisión: <strong>${rev}</strong><br>
    ❌ Rechazados: <strong>${rech}</strong><br>
    📁 Borradores: <strong>${videos.filter(v=>v.estado==='borrador').length}</strong><br><br>
    📈 Tasa de aprobación: <strong>${videos.length ? Math.round(aprov/videos.length*100) : 0}%</strong><br><br>
    <em>Generado el ${new Date().toLocaleString('es-MX')}</em>`;
  document.getElementById('report-modal').classList.add('active');
}

async function loadReports() {
  const snapshot = await getDocs(collection(db, "reportes"));
  reportsSent = [];

  snapshot.forEach(doc => {
    reportsSent.push({ id: doc.id, ...doc.data() });
  });

  renderReportsSent();
}
function sendReport() { generateReport(); }

async function confirmSendReport() {
  const fecha = new Date().toLocaleDateString('es-MX', { 
    month:'long', 
    year:'numeric' 
  });

  const contenido = document.getElementById('report-content').innerHTML;

  const correoDestino = document.getElementById('correo-destino').value;

    const res = await fetch("http://localhost:3000/enviar-reporte",{
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        correoDestino,
        contenido
      })
    });

    if(!res.ok){
      throw new Error("error en el servidor");
    }
    const Data = await res.json();
    console.log(Data);
    renderReportsSent();
    closeModal('report-modal');

    showToast('Reporte enviado al correo del Administrador ✅ (8.2 / 8.3)', 'success');
      try {
    await addDoc(collection(db, "reportes"), {
      titulo: `Reporte ${fecha}`,
      fecha: new Date().toLocaleDateString('es-MX'),
      user: currentUser.name,
      uid: currentUser.uid,
      email: currentUser.email
    });
  } catch (error) {
    console.error(error);
    showToast('Error al enviar reporte ❌', 'error');
  }
}
// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════
function statusBadge(estado) {
  const map = {
    borrador:  ['badge-draft',    '📁 Borrador'],
    revision:  ['badge-review',   '⏳ En revisión'],
    aprobado:  ['badge-approved', '✅ Aprobado'],
    rechazado: ['badge-rejected', '❌ Rechazado'],
  };
  const [cls, txt] = map[estado] || ['badge-draft','—'];
  return `<span class="badge ${cls}">${txt}</span>`;
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

function showToast(msg, type = 'info') {
  const wrap = document.getElementById('toast-wrap');
  const t    = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = (type==='success'?'✅':type==='error'?'❌':'ℹ️') + ' ' + msg;
  wrap.appendChild(t);
  setTimeout(() => t.remove(), 3800);
}

async function handleLogout() {
  try {
    await signOut(auth);
    window.location.href = "login.html";
  } catch (error) {
    console.error(error);
    showToast('Error al cerrar sesión ❌', 'error');
  }
}

// Cerrar modales al hacer clic fuera
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('active'); });
});

window.toggleRecord = toggleRecord;
window.previewRecording = previewRecording;
window.saveRecording = saveRecording;
window.uploadVideo = uploadVideo;
window.openEditModal = openEditModal;
window.deleteVideo = deleteVideo;
window.sendAllToReview = sendAllToReview;
window.confirmSend = confirmSend;
window.quickSend = quickSend;
window.submitCorrection = submitCorrection;
window.generateReport = generateReport;
window.confirmSendReport = confirmSendReport;
window.handleLogout = handleLogout;
window.startCamera = startCamera;
window.updateThemeTag = updateThemeTag;
window.getFolderByEstado = getFolderByEstado;
window.goToSend = goToSend;
window.handleDrop = handleDrop;
window.removeFile = removeFile;
// window.saveDraft = saveDraft;
window.clearUploadForm = clearUploadForm;
window.saveEdit = saveEdit;
window.filterByStatus = filterByStatus;
window.sendReport = sendReport;
window.stopRecord = stopRecord;
window.goTo = goTo;
window.handleFileSelect = handleFileSelect;