// --- 1. IMPORTACIÓN Y CONFIGURACIÓN DE FIREBASE ---
// Importaciones cruciales para Auth, Firestore y Storage
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import {
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js";

// 🚨 2. TUS CREDENCIALES DE FIREBASE (¡REEMPLAZA ESTOS VALORES!) 🚨
const firebaseConfig = {
    apiKey: "AIzaSyC7zx9CreT58V1AWTq7pMoS_ps65mXf-9Y",
    authDomain: "mis-manos-hablaran-44e17.firebaseapp.com",
    projectId: "mis-manos-hablaran-44e17",
    storageBucket: "mis-manos-hablaran-44e17.firebasestorage.app",
    messagingSenderId: "637462888639",
    appId: "1:637462888639:web:c4070137237c211dbd460a",
    measurementId: "G-5E2QC1Z09F"
};

// Inicialización de Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// --- 3. ELEMENTOS DEL DOM ---
const userIdDisplay = document.getElementById('profile-username');
const profileImage = document.getElementById('profile-picture');
const photoUploadInput = document.getElementById('photo-upload');
const progressBarFill = document.getElementById('progress-bar-fill');
const progressPercentage = document.getElementById('progress-percentage');
const progressCount = document.getElementById('progress-count');
const loadingMessage = document.getElementById('loading-message');
const photoStatus = document.getElementById('photo-status');

const profileModal = document.getElementById('profile-modal');
const showProfileButton = document.getElementById('show-profile-button');
const closeProfileModal = document.getElementById('close-profile-modal');
const logoutButtonSidebar = document.getElementById('logout-button-sidebar');

let currentUserId = null;
const TOTAL_LETTERS = 26; // Total de letras para el abecedario


// --- 4. MANEJO DE VISTAS (MODAL) ---

if (showProfileButton) {
    showProfileButton.addEventListener('click', () => {
        profileModal.classList.remove('hidden');
    });
}

if (closeProfileModal) {
    closeProfileModal.addEventListener('click', () => {
        profileModal.classList.add('hidden');
    });
}

// Cerrar modal al hacer clic fuera
if (profileModal) {
    profileModal.addEventListener('click', (e) => {
        if (e.target.id === 'profile-modal') {
            profileModal.classList.add('hidden');
        }
    });
}


// --- 5. VERIFICAR AUTENTICACIÓN Y CARGAR DATOS ---

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserId = user.uid;
        loadUserData(currentUserId);
    } else {
        // Redirigir si no hay sesión activa
        console.log('No hay usuario autenticado. Redirigiendo.');
        // window.location.href = 'index.html'; 
    }
});

// --- 6. CARGAR PERFIL Y PROGRESO ---

async function loadUserData(userId) {
    if (loadingMessage) {
        loadingMessage.textContent = 'Cargando tu perfil y progreso...';
    }

    try {
        const profileRef = doc(db, "perfiles", userId);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
            const data = profileSnap.data();

            // Mostrar nombre de usuario
            if (userIdDisplay) userIdDisplay.textContent = data.username || 'Usuario';

            // Cargar foto de perfil
            if (profileImage) {
                if (data.photoURL) {
                    profileImage.src = data.photoURL;
                } else {
                    profileImage.src = "https://placehold.co/120x120/d1d5db/4b5563?text=👤"; // Imagen por defecto
                }
            }

            // Calcular y mostrar el progreso
            calculateAndDisplayProgress(data.progreso_letras || {});

            // Bloquear/Desbloquear niveles (ejemplo: Nivel 2 se desbloquea al 100%)
            if (calculateProgressCount(data.progreso_letras) === TOTAL_LETTERS) {
                unlockLevel(2);
            }

        } else {
            console.error("No se encontró el perfil del usuario en Firestore.");
        }
    } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
    } finally {
        if (loadingMessage) {
            loadingMessage.classList.add('hidden');
        }
    }
}


// --- 7. GESTIÓN Y CÁLCULO DE PROGRESO ---

function calculateProgressCount(progreso) {
    // Cuenta cuántas letras tienen valor 'true'
    return Object.values(progreso).filter(isComplete => isComplete === true).length;
}

function calculateAndDisplayProgress(progreso) {
    const completedCount = calculateProgressCount(progreso);
    const percentage = Math.round((completedCount / TOTAL_LETTERS) * 100);

    if (progressPercentage) progressPercentage.textContent = `${percentage}%`;
    if (progressBarFill) progressBarFill.style.width = `${percentage}%`;
    if (progressCount) progressCount.textContent = `[${completedCount}/${TOTAL_LETTERS} Letras completadas]`;
}

function unlockLevel(levelNumber) {
    const levelCard = document.getElementById(`level-${levelNumber}`);
    if (levelCard) {
        levelCard.classList.remove('opacity-60', 'pointer-events-none', 'border-gray-400');
        levelCard.classList.add('hover:shadow-2xl', 'cursor-pointer', 'border-green-500');
        const button = levelCard.querySelector('button');
        button.classList.remove('bg-gray-400');
        button.classList.add('bg-green-500', 'hover:bg-green-600');
        button.textContent = '¡Empezar ahora!';
        const lockIcon = levelCard.querySelector('i');
        if (lockIcon) lockIcon.classList.add('hidden');
    }
}


// --- 8. SUBIDA Y GESTIÓN DE LA FOTO DE PERFIL (Storage) ---

if (photoUploadInput) {
    photoUploadInput.addEventListener('change', async(e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!currentUserId) {
            if (photoStatus) photoStatus.textContent = 'Error: No hay usuario activo.';
            return;
        }

        if (photoStatus) {
            photoStatus.textContent = 'Subiendo foto...';
            photoStatus.style.color = '#4f46e5';
        }


        try {
            // 1. Crear referencia: user-photos/ [UID] / profile.jpg
            // Las reglas de Storage están configuradas para usar el UID como la carpeta de seguridad
            const storageRef = ref(storage, `${currentUserId}/profile.jpg`);

            // 2. Subir el archivo
            const snapshot = await uploadBytes(storageRef, file);

            // 3. Obtener la URL pública
            const downloadURL = await getDownloadURL(snapshot.ref);

            // 4. Actualizar Firestore con la URL (para persistencia)
            const profileRef = doc(db, "perfiles", currentUserId);
            await updateDoc(profileRef, {
                photoURL: downloadURL
            });

            // 5. Actualizar UI
            if (profileImage) profileImage.src = downloadURL;
            if (photoStatus) {
                photoStatus.textContent = 'Foto actualizada con éxito.';
                photoStatus.style.color = 'green';
            }

        } catch (error) {
            console.error("Error al subir o guardar la foto:", error);
            if (photoStatus) {
                photoStatus.textContent = `Error al subir: ${error.message}`;
                photoStatus.style.color = 'red';
            }
        }
    });
}


// --- 9. FUNCIÓN DE LOGOUT ---

if (logoutButtonSidebar) {
    logoutButtonSidebar.addEventListener('click', async() => {
        try {
            await signOut(auth);
            // Redirigir al login después de cerrar sesión
            window.location.href = 'index.html';
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            alert("Hubo un error al cerrar sesión.");
        }
    });
}


// --- 10. EVENTOS DE NIVELES ---

// Redirigir al hacer clic en el Nivel 1
document.getElementById('level-1').addEventListener('click', () => {
    // Aquí puedes redirigir a la lección real del abecedario
    alert('¡Excelente! Preparando la lección del Abecedario...');
    window.location.href = 'niveles_1.html';

});

// Los niveles bloqueados no necesitan eventos, ya que tienen 'pointer-events-none'