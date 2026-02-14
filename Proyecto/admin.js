import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

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

let currentUserIdToDelete = null;
let cachedUsers = {};

function calcularNivelReal(user) {
    if (user.nivel4_completado) return 4;
    if (user.nivel3_completado) return 3;
    if (user.nivel2_completado) return 2;
    if (user.nivel1_completado) return 1;
    return 1;
}

async function loadAdminData() {
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) refreshBtn.textContent = "⌛ Cargando...";

    try {
        const querySnapshot = await getDocs(collection(db, "perfiles"));
        const listBody = document.getElementById('users-list');
        listBody.innerHTML = '';
        cachedUsers = {};

        let stats = { total: 0, levelsSum: 0, finished: 0 };

        querySnapshot.forEach((docSnap) => {
            const user = docSnap.data();
            const id = docSnap.id;

            if (user.rol === 'admin') return;

            cachedUsers[id] = user;
            const nivelReal = calcularNivelReal(user);

            stats.total++;
            stats.levelsSum += nivelReal;
            if (user.nivel4_completado) stats.finished++;

            const row = document.createElement('tr');
            row.id = `row-${id}`;
            row.innerHTML = `
                <td><strong>${user.username || 'Estudiante'}</strong></td>
                <td>${user.email || 'Sin correo'}</td>
                <td><span class="badge badge-level-${nivelReal}">Nivel ${nivelReal}</span></td>
                <td>
                    <button class="btn btn-view" onclick="verDetalles('${id}')">Vista</button>
                    <button class="btn btn-danger" onclick="confirmarEliminar('${id}')">Eliminar</button>
                </td>`;
            listBody.appendChild(row);
        });

        document.getElementById('stat-total-users').textContent = stats.total;
        document.getElementById('stat-avg-level').textContent = stats.total > 0 ? (stats.levelsSum / stats.total).toFixed(1) : "0";
        document.getElementById('stat-completed').textContent = stats.finished;

    } catch (e) {
        console.error("Error al cargar datos:", e);
    }

    if (refreshBtn) refreshBtn.innerHTML = "<span>🔄</span> Actualizar";
}

// SOLUCIÓN AL ERROR: Se cambió el operador ?. por una validación estándar if
const refreshBtnElement = document.getElementById('refresh-btn');
if (refreshBtnElement) {
    refreshBtnElement.addEventListener('click', loadAdminData);
}

window.verDetalles = (userId) => {
    const user = cachedUsers[userId];
    if (!user) return;

    const container = document.getElementById('levels-details-container');
    document.getElementById('modal-user-name').textContent = user.username || "Detalles Alumno";

    const niveles = [
        { n: 1, label: "Abecedario", comp: user.nivel1_completado },
        { n: 2, label: "Palabras", comp: user.nivel2_completado },
        { n: 3, label: "Calendario", comp: user.nivel3_completado },
        { n: 4, label: "Meses", comp: user.nivel4_completado }
    ];

    container.innerHTML = niveles.map(niv => `
        <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;">
            <span>Nivel ${niv.n}: ${niv.label}</span>
            <span style="color: ${niv.comp ? '#16a34a' : '#94a3b8'}; font-weight: bold;">
                ${niv.comp ? '✅ Completado' : '⏳ Pendiente'}
            </span>
        </div>`).join('');

    document.getElementById('view-modal').classList.add('active');
};

window.confirmarEliminar = (id) => {
    currentUserIdToDelete = id;
    document.getElementById('delete-modal').classList.add('active');
};

window.closeModals = () => {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
};

document.getElementById('confirm-delete-btn').addEventListener('click', async() => {
    if (currentUserIdToDelete) {
        try {
            await deleteDoc(doc(db, "perfiles", currentUserIdToDelete));
            closeModals();
            alert("Usuario eliminado con éxito.");
            loadAdminData();
        } catch (error) {
            alert("Error al eliminar: " + error.message);
        }
    }
});

loadAdminData();