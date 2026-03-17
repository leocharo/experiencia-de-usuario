        // ══════════════════════════════════════════════
        // DATOS MOCK  (reemplaza con Firebase en prod)
        // ══════════════════════════════════════════════
        let reportsSent = [];
        let corrections = [];
        let pendingToSend = [];
        let videos = [];
        let currentUser = {
            name: 'Creador de Contenido',
            email: 'creador@mmh.mx',
            initials: 'CC'
        };

        // ══════════════════════════════════════════════
        // INIT
        // ══════════════════════════════════════════════
        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('user-display-name').textContent = currentUser.name;
            document.getElementById('user-display-email').textContent = currentUser.email;
            document.getElementById('user-initials').textContent = currentUser.initials;
            // updateStats();
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
        // function updateStats() {
        //     document.getElementById('stat-total').textContent = videos.length;
        //     document.getElementById('stat-pend').textContent = videos.filter(v => v.estado === 'revision').length;
        //     document.getElementById('stat-aprov').textContent = videos.filter(v => v.estado === 'aprobado').length;
        //     document.getElementById('stat-rech').textContent = videos.filter(v => v.estado === 'rechazado').length;
        //     document.getElementById('badge-pending').textContent = videos.filter(v => v.estado === 'revision').length;
        // }

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

        async function subirvideoarchivo(){
          const formData = new FormData();
          const blob = new Blob(recordedChunks, { type: "video/webm" });
          const tema = document.getElementById("rec-tema").value;
          // 'video' coincide con $_FILES["video"] y 'tema' con $_POST["tema"] en tu PHP
          formData.append("video", blob, "video.webm");
          formData.append('tema', tema);
    
          showToast('Subiendo video a la carpeta...', 'info');
          try {
            const response = await fetch('videos_grabados.php', {
              method: 'POST',
              body: formData
            });

          const data = await response.text();
          console.log(data);

          showToast('Video guardado correctamente ✅', 'success');
        } catch (error) {
          console.error("Error:", error);
          showToast('No se pudo conectar con el servidor ❌', 'error');
        }
        }
function stopCamera() {
    // 1. Verificamos si existe un stream activo
    if (stream) {
        // 2. Detenemos todas las pistas (video y audio)
        stream.getTracks().forEach(track => track.stop());
        
        // 3. Limpiamos el elemento video
        const videoPreview = document.getElementById('camera-preview');
        videoPreview.srcObject = null;
        videoPreview.style.display = 'none';
        
        // 4. Actualizamos la interfaz
        document.getElementById('cam-placeholder').style.display = 'block';
        document.getElementById('btn-rec').disabled = true;

        showToast('Cámara desactivada ❌', 'info');
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
            mediaRecorder = new MediaRecorder(stream);
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
            const blob = new Blob(recordedChunks, {
                type: 'video/webm'
            });
            const url = URL.createObjectURL(blob);
            const sv = document.getElementById('saved-video');
            sv.src = url;
            document.getElementById('saved-recording').style.display = 'block';
        }

async function saveRecording() {
    if (!recordedChunks.length) {
        showToast('No hay grabación para guardar.', 'error');
        return;
    }

    const blob = new Blob(recordedChunks, {type: 'video/webm'});
    const url = URL.createObjectURL(blob);
    const palabra = document.getElementById('rec-palabra').value.trim();
    const tema = document.getElementById('rec-tema').value;

        if (response.ok) {
            const newVid = {
                id: 'v' + Date.now(),
                titulo: `Señal — ${palabra}`,
                tema,
                nivel: 1,
                palabra,
                desc: `Grabado en la plataforma.`,
                estado: 'borrador',
                fecha: new Date().toLocaleDateString('es-MX'),
                comentario: ''
            };

            videos.push(newVid);
            updateStats();
            renderEditList();
            populateSoporteSelect();

            document.getElementById('saved-video').src = url;
            document.getElementById('saved-recording').style.display = 'block';
            showToast(`Video "${newVid.titulo}" guardado correctamente ✅`, 'success');

            // Detener stream de cámara
            if (stream) stream.getTracks().forEach(t => t.stop());
        } else {
            showToast('Error en el servidor al subir video', 'error');
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

        function uploadVideo() {
            // Crear un objeto FormData para enviar datos al servidor (PHP)
            let formData = new FormData();
            //se obtienen los datos ingresados por el usuario en el html
            formData.append("titulo", document.getElementById("vid-titulo").value);
            formData.append("tema", document.getElementById("vid-tema").value);
            formData.append("nivel", document.getElementById("vid-nivel").value);
            formData.append("palabra", document.getElementById("vid-palabra").value);
            formData.append("video", document.getElementById("file-input").files[0]);

            // Enviar los datos al archivo PHP usando fetch (petición POST)
            fetch("video_revision.php", {
              method: "POST",
              body: formData //se envia todo el contenido del FormData
            })
            // Convierte la respuesta del servidor en texto
            .then(res => res.text())
            .then(data => {
              console.log(data);
            });
            const titulo = document.getElementById('vid-titulo').value.trim();
            const tema = document.getElementById('vid-tema').value;
            if (!titulo || !tema) {
                showToast('Completa título y tema.', 'error');
                return;
            }

            // Simular carga con progress
            const prog = document.getElementById('upload-progress');
            const fill = document.getElementById('progress-fill');
            const pct = document.getElementById('progress-pct');
            const lbl = document.getElementById('progress-label-text');
            prog.classList.add('show');
            document.getElementById('btn-upload').disabled = true;

            let p = 0;
            const iv = setInterval(() => {
                p += Math.random() * 18 + 4;
                if (p >= 100) {
                    p = 100;
                    clearInterval(iv);
                    lbl.textContent = '¡Video cargado correctamente! (3.3)';
                    setStep(4, true);

                    const newVid = {
                        id: 'v' + Date.now(),
                        titulo,
                        tema,
                        nivel: +document.getElementById('vid-nivel').value,
                        palabra: document.getElementById('vid-palabra').value,
                        desc: document.getElementById('vid-desc').value,
                        estado: 'borrador',
                        fecha: new Date().toLocaleDateString('es-MX'),
                        comentario: ''
                    };
                    videos.push(newVid);
                    updateStats();
                    renderEditList();
                    populateSoporteSelect();
                    showToast(`Video "${titulo}" subido y guardado como borrador ✅`, 'success');
                    document.getElementById('btn-upload').disabled = false;
                }
                fill.style.width = p + '%';
                pct.textContent = Math.floor(p) + '%';
            }, 180);
        }

        function saveDraft() {
            showToast('Borrador guardado.', 'info');
        }

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
  document.getElementById('edit-desc').value   = v.desc;
  document.getElementById('edit-tema').value   = v.tema;
  document.getElementById('edit-modal').classList.add('active');
}

function saveEdit() {
  const id     = document.getElementById('edit-vid-id').value;
  const v      = videos.find(v => v.id === id);
  if (!v) return;
  v.titulo = document.getElementById('edit-titulo').value;
  v.desc   = document.getElementById('edit-desc').value;
  v.tema   = document.getElementById('edit-tema').value;
  renderEditList();
  renderStatusList();
  closeModal('edit-modal');
  showToast('Cambios guardados ✅ (4.3)', 'success');
}

function deleteVideo(id) {
  videos = videos.filter(v => v.id !== id);
  updateStats();
  renderEditList();
  renderStatusList();
  renderSendList();
  populateSoporteSelect();
  showToast('Video eliminado.', 'error');
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

function confirmSend() {
  pendingToSend.forEach(id => {
    const v = videos.find(v => v.id === id);
    if (v) v.estado = 'revision';
  });
  pendingToSend = [];
  updateStats();
  renderEditList();
  renderStatusList();
  renderSendList();
  closeModal('confirm-send-modal');
  showToast('Videos enviados a revisión del administrador ✅ (5.2 / 5.3)', 'success');
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

function quickSend(id) {
  const v = videos.find(v => v.id === id);
  if (!v) return;
  v.estado = 'revision';
  updateStats();
  renderStatusList();
  renderSendList();
  showToast(`"${v.titulo}" enviado a revisión ✅`, 'success');
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

function submitCorrection() {
  const id   = document.getElementById('soporte-video-sel').value;
  const nota = document.getElementById('soporte-nota').value.trim();
  const file = document.getElementById('soporte-file').files[0];

  if (!id)   { showToast('Selecciona un video.', 'error'); return; }
  if (!nota) { showToast('Escribe una nota de corrección.', 'error'); return; }

  const v = videos.find(v => v.id === id);
  if (v) v.estado = 'borrador';

  const entry = { id: 'c' + Date.now(), titulo: v?.titulo, nota, fecha: new Date().toLocaleDateString('es-MX'), file: file?.name || '—' };
  corrections.push(entry);

  renderCorrections();
  updateStats();
  renderStatusList();
  populateSoporteSelect();

  document.getElementById('soporte-nota').value = '';
  document.getElementById('soporte-file').value = '';
  document.getElementById('soporte-video-sel').value = '';
  showToast('Video corregido y listo para re-enviar (6.2) ✅', 'success');
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

function sendReport() { generateReport(); }

function confirmSendReport() {
  const fecha = new Date().toLocaleDateString('es-MX', { month:'long', year:'numeric' });
  reportsSent.push({ titulo: `Reporte ${fecha}`, fecha: new Date().toLocaleDateString('es-MX') });
  renderReportsSent();
  closeModal('report-modal');
  showToast('Reporte enviado al administrador ✅ (8.2 / 8.3)', 'success');
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

function openEditModal(id) {
  const v = videos.find(v => v.id === id);
  if (!v) return;
  document.getElementById('edit-vid-id').value = id;
  document.getElementById('edit-titulo').value = v.titulo;
  document.getElementById('edit-desc').value   = v.desc;
  // set select
  const sel = document.getElementById('edit-tema');
  for (let i = 0; i < sel.options.length; i++) {
    if (sel.options[i].text === v.tema) { sel.selectedIndex = i; break; }
  }
  document.getElementById('edit-modal').classList.add('active');
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

function handleLogout() {
  showToast('Cerrando sesión... (9.3 — acceso registrado)', 'info');
  // firebase.auth().signOut().then(() => window.location.href = 'index.html');
}

// Cerrar modales al hacer clic fuera
document.querySelectorAll('.modal-overlay').forEach(o => {
  o.addEventListener('click', e => { if (e.target === o) o.classList.remove('active'); });
});