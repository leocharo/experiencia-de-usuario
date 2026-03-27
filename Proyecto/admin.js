import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, deleteDoc, addDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// CAMBIO AQUÍ: Usamos el objeto global de la ventana en lugar de import
var emailjs = window.emailjs;

var firebaseConfig = {
    apiKey: "AIzaSyC7zx9CreT58V1AWTq7pMoS_ps65mXf-9Y",
    authDomain: "mis-manos-hablaran-44e17.firebaseapp.com",
    projectId: "mis-manos-hablaran-44e17",
    storageBucket: "mis-manos-hablaran-44e17.firebasestorage.app",
    messagingSenderId: "637462888639",
    appId: "1:637462888639:web:c4070137237c211dbd460a"
};

var app = initializeApp(firebaseConfig);
var db = getFirestore(app);
var auth = getAuth(app);

// Inicializar EmailJS
if (emailjs) {
    emailjs.init("Au9kUY26dgMboudTk");
}

var currentUserIdToDelete = null;
var cachedUsers = {};
var selectedUserEmail = "";
var selectedUserName = "";

var INACTIVITY_LIMIT = 900000;
var WARNING_SECONDS = 60;
var inactivityTimer = null;
var countdownInterval = null;
var warningVisible = false;

onAuthStateChanged(auth, async function(user) {
    var loadingEl = document.getElementById('auth-loading');
    var contentEl = document.getElementById('dashboard-content');
    if (!user) {
        window.location.href = "index.html";
        return;
    }
    try {
        var userDoc = await getDoc(doc(db, "perfiles", user.uid));
        if (userDoc.exists() && userDoc.data().rol === "admin") {
            if (loadingEl) loadingEl.style.display = 'none';
            if (contentEl) contentEl.style.display = 'flex';
            iniciarTemporizador();
            loadAdminData();
        } else {
            window.location.href = "index.html";
        }
    } catch (error) {
        window.location.href = "index.html";
    }
});

function calcularNivelReal(user) {
    if (user.nivel4_completado) return 4;
    if (user.nivel3_completado) return 3;
    if (user.nivel2_completado) return 2;
    if (user.nivel1_completado) return 1;
    return 1;
}

async function loadAdminData() {
    var listBody = document.getElementById('users-list');
    if (!listBody) return;
    try {
        var querySnapshot = await getDocs(collection(db, "perfiles"));
        listBody.innerHTML = '';
        var stats = { total: 0, levelsSum: 0, finished: 0 };
        querySnapshot.forEach(function(docSnap) {
            var user = docSnap.data();
            var id = docSnap.id;
            if (user.rol === 'admin') return;
            cachedUsers[id] = user;
            var nivel = calcularNivelReal(user);
            stats.total++;
            stats.levelsSum += nivel;
            if (user.nivel4_completado) stats.finished++;
            var row = document.createElement('tr');
            row.innerHTML = '<td><strong>' + (user.username || "Estudiante") + '</strong></td>' +
                '<td>' + (user.email || "Sin correo") + '</td>' +
                '<td><span class="badge badge-level-' + nivel + '">Nivel ' + nivel + '</span></td>' +
                '<td>' +
                '<button class="btn btn-view" onclick="verDetalles(\'' + id + '\')">Vista</button> ' +
                '<button class="btn btn-refresh" style="background:#f0fdf4; color:#16a34a; border:none;" onclick="abrirAviso(\'' + id + '\')">Aviso</button> ' +
                '<button class="btn btn-danger" onclick="confirmarEliminar(\'' + id + '\')">Eliminar</button>' +
                '</td>';
            listBody.appendChild(row);
        });
        document.getElementById('stat-total-users').textContent = stats.total;
        document.getElementById('stat-avg-level').textContent = stats.total > 0 ? (stats.levelsSum / stats.total).toFixed(1) : "0";
        document.getElementById('stat-completed').textContent = stats.finished;
    } catch (e) { console.error(e); }
}

function mostrarAviso() {
    warningVisible = true;
    var segundos = WARNING_SECONDS;
    var modal = document.getElementById('inactivity-modal');
    var countdownEl = document.getElementById('inactivity-countdown');
    if (countdownEl) countdownEl.textContent = segundos;
    if (modal) modal.classList.add('show');
    countdownInterval = setInterval(async function() {
        segundos--;
        if (countdownEl) countdownEl.textContent = segundos;
        if (segundos <= 0) {
            clearInterval(countdownInterval);
            await ejecutarLogout();
        }
    }, 1000);
}

function resetTimer() {
    if (warningVisible) return;
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(mostrarAviso, INACTIVITY_LIMIT);
}

function iniciarTemporizador() {
    var evts = ['mousemove', 'mousedown', 'keydown', 'scroll', 'click'];
    for (var i = 0; i < evts.length; i++) {
        document.addEventListener(evts[i], resetTimer, { passive: true });
    }
    resetTimer();
}

async function ejecutarLogout() {
    await signOut(auth);
    window.location.href = "index.html";
}

window.abrirAviso = function(userId) {
    var user = cachedUsers[userId];
    if (user) {
        selectedUserEmail = user.email;
        selectedUserName = user.username;
        var targetText = document.getElementById('email-target-user');
        var emailModal = document.getElementById('email-modal');
        if (targetText) { targetText.textContent = "Enviar aviso a: " + selectedUserName; }
        if (emailModal) { emailModal.classList.add('active'); }
    }
};

window.enviarAvisoPorTipo = async function(tipo) {
    var templateIDs = { inactividad: "template_69ol06r", progreso: "template_bvfb1je" };
    try {
        await emailjs.send('service_khetf14', templateIDs[tipo], {
            to_name: selectedUserName,
            to_email: selectedUserEmail,
            message: tipo === 'inactividad' ? "Te extrañamos en el curso." : "¡Sigue así, ya casi terminas!"
        });
        alert("✉️ Correo enviado con éxito.");
        window.closeModals();
    } catch (error) {
        alert("Error al enviar el correo.");
    }
};

window.closeModals = function() {
    var modals = document.querySelectorAll('.modal-overlay');
    for (var i = 0; i < modals.length; i++) { modals[i].classList.remove('active'); }
    var inact = document.getElementById('inactivity-modal');
    if (inact) inact.classList.remove('show');
};

window.verDetalles = function(id) {
    var user = cachedUsers[id];
    if (!user) return;
    var container = document.getElementById('levels-details-container');
    document.getElementById('modal-user-name').textContent = "Progreso de " + user.username;
    var niveles = [
        { n: 1, l: "Abecedario", c: user.nivel1_completado },
        { n: 2, l: "Palabras", c: user.nivel2_completado },
        { n: 3, l: "Calendario", c: user.nivel3_completado },
        { n: 4, l: "Meses", c: user.nivel4_completado }
    ];
    container.innerHTML = niveles.map(function(niv) {
        return '<div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;">' +
            '<span>Nivel ' + niv.n + ': ' + niv.l + '</span>' +
            '<span>' + (niv.c ? '✅' : '⏳') + '</span></div>';
    }).join('');
    document.getElementById('view-modal').classList.add('active');
};

window.confirmarEliminar = function(id) {
    currentUserIdToDelete = id;
    document.getElementById('delete-modal').classList.add('active');
};

var btnDelete = document.getElementById('confirm-delete-btn');
if (btnDelete) {
    btnDelete.addEventListener('click', async function() {
        if (currentUserIdToDelete) {
            await deleteDoc(doc(db, "perfiles", currentUserIdToDelete));
            window.closeModals();
            loadAdminData();
        }
    });
}

var btnStay = document.getElementById('inactivity-stay-btn');
if (btnStay) {
    btnStay.addEventListener('click', function() {
        warningVisible = false;
        document.getElementById('inactivity-modal').classList.remove('show');
        clearInterval(countdownInterval);
        resetTimer();
    });
}

var btnLogout = document.getElementById('logout-btn');
if (btnLogout) {
    btnLogout.addEventListener('click', function() {
        if (confirm("¿Cerrar sesión?")) ejecutarLogout();
    });
}

var searchInput = document.getElementById('admin-search');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        var term = e.target.value.toLowerCase();
        var rows = document.querySelectorAll('#users-list tr');
        for (var i = 0; i < rows.length; i++) {
            var txt = rows[i].innerText.toLowerCase();
            rows[i].style.display = txt.indexOf(term) > -1 ? "" : "none";
        }
    });
}

const btnRegistrar = document.getElementById('btn-registrar-local');
if (btnRegistrar) {
    btnRegistrar.addEventListener('click', async() => {
        const profesor = document.getElementById('local-profesor-nombre').value;
        const archivo = document.getElementById('local-archivo-nombre').value;

        if (!profesor || !archivo) {
            return alert("Por favor llena ambos campos.");
        }

        try {
            await addDoc(collection(db, "solicitudes_multimedia"), {
                profesorNombre: profesor,
                nombreArchivo: archivo,
                estado: "aceptado", // Se registra como aceptado de una vez
                fecha: new Date(),
                tipo: archivo.endsWith('.mp4') ? 'video/mp4' : 'image/png' // Detección simple
            });

            alert("✅ ¡Registrado! Asegúrate de que '" + archivo + "' esté dentro de la carpeta video_grabados.");

            // Limpiar campos
            document.getElementById('local-profesor-nombre').value = '';
            document.getElementById('local-archivo-nombre').value = '';
        } catch (e) {
            console.error("Error al registrar:", e);
        }
    });
}