// --- 1. IMPORTACIÓN Y CONFIGURACIÓN DE FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js";

// --- 2. CREDENCIALES DE FIREBASE ---
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

// --- VARIABLES GLOBALES Y CONSTANTES ---

// ✅ Lista de rutas de imágenes de perfil disponibles (Ajustar según tu proyecto)
const AVAILABLE_PROFILE_IMAGES = [
    'usuarios/usuario_1.png',
    'usuarios/usuario_2.png',
    'usuarios/usuario_3.png',
    'usuarios/usuario_4.png',
    'usuarios/usuario_5.png',
    'usuarios/usuario_6.png',
    'usuarios/usuario_7.png',
    'usuarios/usuario_8.png',
    'usuarios/usuario_9.png',
    'usuarios/usuario_10.jpg',
    'usuarios/usuario_11.jpg',
    'usuarios/usuario_12.jpg',
    'usuarios/usuario_13.jpg',
];

let areAllLevelsComplete = false;
let currentUserId = null;
const TOTAL_LETTERS = 26;
const TOTAL_WORDS_LEVEL_2 = 22;
const TOTAL_DAYS = 10;
const TOTAL_MONTHS = 16;

// --- 3. ELEMENTOS DEL DOM ---
const userIdDisplay = document.getElementById('profile-username');
const profileImage = document.getElementById('profile-picture');
const loadingMessage = document.getElementById('loading-message');
const photoStatus = document.getElementById('photo-status');

const profileModal = document.getElementById('profile-modal');
const showProfileButton = document.getElementById('show-profile-button');
const closeProfileModal = document.getElementById('close-profile-modal');
const logoutButtonSidebar = document.getElementById('logout-button-sidebar');

// ✅ Elementos para la selección de perfil
const changeProfilePictureButton = document.getElementById('change-profile-picture-button');
const selectProfileImageModal = document.getElementById('select-profile-image-modal');
const closeSelectImageModalButton = document.getElementById('close-select-image-modal');
const profileImageOptions = document.getElementById('profile-image-options');


// Elementos progreso niveles (Barras)
const progressLettersBar = document.getElementById('progress-letters-bar');
const progressLettersPercentage = document.getElementById('progress-letters-percentage');
const progressLettersCount = document.getElementById('progress-letters-count');
const progressWordsBar = document.getElementById('progress-words-bar');
const progressWordsPercentage = document.getElementById('progress-words-percentage');
const progressWordsCount = document.getElementById('progress-words-count');

// progreso dias y semana (Nivel 3)
const progressDaysBar = document.getElementById('progress-days-bar');
const progressDaysPercentageText = document.getElementById('progress-days-percentage-text');
const progressDaysCount = document.getElementById('progress-days-count');

// progreso meses y estaciones (Nivel 4)
const progressMonthsBar = document.getElementById('progress-months-bar');
const progressMonthsPercentageText = document.getElementById('progress-months-percentage-text');
const progressMonthsCount = document.getElementById('progress-months-count');

const showDictionaryButton = document.getElementById('show-dictionary-button');

// --- 4. MANEJO DE MODALES ---

// Lógica de apertura/cierre del modal de Perfil
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
if (profileModal) {
    profileModal.addEventListener('click', (e) => {
        if (e.target.id === 'profile-modal') {
            profileModal.classList.add('hidden');
        }
    });
}

// ✅ Lógica de apertura/cierre del modal de Selección de Imagen
if (changeProfilePictureButton) {
    changeProfilePictureButton.addEventListener('click', () => {
        profileModal.classList.add('hidden');
        selectProfileImageModal.classList.remove('hidden');
        loadProfileImageOptions(); // Cargar las imágenes disponibles
    });
}

if (closeSelectImageModalButton) {
    closeSelectImageModalButton.addEventListener('click', () => {
        selectProfileImageModal.classList.add('hidden');
        profileModal.classList.remove('hidden'); // Volver al modal de perfil
    });
}

if (selectProfileImageModal) {
    selectProfileImageModal.addEventListener('click', (e) => {
        if (e.target.id === 'select-profile-image-modal') {
            closeSelectImageModalButton.click();
        }
    });
}

// --- 5. VERIFICAR AUTENTICACIÓN ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserId = user.uid;
        loadUserData(currentUserId);
    } else {
        console.log('No hay usuario autenticado. Redirigiendo.');
        // Redirigir al login si es necesario
    }
});

// --- 6. CARGAR PERFIL Y PROGRESO (CON INICIALIZACIÓN PEREZOSA Y BLOQUEO DIC.) ---
async function loadUserData(userId) {
    if (loadingMessage) {
        loadingMessage.textContent = 'Cargando tu perfil y progreso...';
    }

    try {
        const profileRef = doc(db, "perfiles", userId);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
            let data = profileSnap.data();
            let updateNeeded = false;
            let updateObject = {};

            // INICIALIZACIÓN PEREZOSA: Asegurar campos para Nivel 3 y 4
            if (data.nivel3_completado === undefined) {
                updateObject.nivel3_completado = false;
                updateObject.progreso_dias_completados = 0;
                updateNeeded = true;
            }
            if (data.nivel4_completado === undefined) {
                updateObject.nivel4_completado = false;
                updateObject.progreso_meses_completados = 0;
                updateNeeded = true;
            }

            // INICIALIZACIÓN PEREZOSA: Asegurar que photoURL no sea 'null' o undefined
            if (data.photoURL === undefined || data.photoURL === null) {
                updateObject.photoURL = "https://placehold.co/120x120/d1d5db/4b5563?text=👤";
                updateNeeded = true;
            }


            if (updateNeeded) {
                await updateDoc(profileRef, updateObject);
                data = {...data, ...updateObject };
            }

            // Mostrar datos del usuario
            if (userIdDisplay) userIdDisplay.textContent = data.username || 'Usuario';
            if (profileImage) {
                profileImage.src = data.photoURL || "https://placehold.co/120x120/d1d5db/4b5563?text=👤";
            }

            // Lectura de Progreso
            const lettersCompleted = data.nivel1_completado ? TOTAL_LETTERS : 0;
            const wordsCompleted = data.nivel2_completado ? TOTAL_WORDS_LEVEL_2 : 0;
            const nivel3_completado = data.nivel3_completado === true;
            const daysCompleted = nivel3_completado ? TOTAL_DAYS : (data.progreso_dias_completados || 0);
            const nivel4_completado = data.nivel4_completado === true;
            const monthsCompleted = nivel4_completado ? TOTAL_MONTHS : (data.progreso_meses_completados || 0);

            displayProgressLevels(lettersCompleted, wordsCompleted, daysCompleted, monthsCompleted);

            // Lógica de Desbloqueo de Niveles (Dashboard)
            if (lettersCompleted === TOTAL_LETTERS) unlockLevel(2);
            if (wordsCompleted === TOTAL_WORDS_LEVEL_2) unlockLevel(3);
            if (nivel3_completado) unlockLevel(4);

            // ✅ LÓGICA DE BLOQUEO DEL DICCIONARIO
            const isLevel1Complete = data.nivel1_completado === true;
            const isLevel2Complete = data.nivel2_completado === true;
            const isLevel3Complete = data.nivel3_completado === true;
            const isLevel4Complete = data.nivel4_completado === true;

            if (isLevel1Complete && isLevel2Complete && isLevel3Complete && isLevel4Complete) {
                areAllLevelsComplete = true;
            } else {
                areAllLevelsComplete = false;
            }


        } else {
            console.error("No se encontró el perfil del usuario en Firestore.");
        }
    } catch (error) {
        console.error("Error al cargar datos del usuario:", error);
    } finally {
        if (loadingMessage) loadingMessage.classList.add('hidden');
    }
}

// --- 7. FUNCION DISPLAY PROGRESO ---
function displayProgressLevels(lettersCompleted, wordsCompleted, daysCompleted, monthsCompleted) {
    // Letras (Nivel 1)
    const lettersPercentage = Math.round((lettersCompleted / TOTAL_LETTERS) * 100);
    if (progressLettersPercentage) progressLettersPercentage.textContent = `${lettersPercentage}%`;
    if (progressLettersBar) progressLettersBar.style.width = `${lettersPercentage}%`;
    if (progressLettersCount) progressLettersCount.textContent = `[${lettersCompleted}/${TOTAL_LETTERS} Letras completadas]`;

    // Palabras (Nivel 2)
    const wordsPercentage = Math.round((wordsCompleted / TOTAL_WORDS_LEVEL_2) * 100);
    if (progressWordsPercentage) progressWordsPercentage.textContent = `${wordsPercentage}%`;
    if (progressWordsBar) progressWordsBar.style.width = `${wordsPercentage}%`;
    if (progressWordsCount) progressWordsCount.textContent = `[${wordsCompleted}/${TOTAL_WORDS_LEVEL_2} Palabras completadas]`;

    // Dias, saludos (Nivel 3)
    const daysPercentage = Math.round((daysCompleted / TOTAL_DAYS) * 100);
    if (progressDaysPercentageText) progressDaysPercentageText.textContent = `${daysPercentage}%`;
    if (progressDaysBar) progressDaysBar.style.width = `${daysPercentage}%`;
    if (progressDaysCount) progressDaysCount.textContent = `[${daysCompleted}/${TOTAL_DAYS} Palabras completadas]`;

    // Meses y Estaciones (Nivel 4)
    const monthsPercentage = Math.round((monthsCompleted / TOTAL_MONTHS) * 100);

    if (progressMonthsPercentageText) progressMonthsPercentageText.textContent = `${monthsPercentage}%`;
    if (progressMonthsBar) progressMonthsBar.style.width = `${monthsPercentage}%`;
    if (progressMonthsCount) progressMonthsCount.textContent = `[${monthsCompleted}/${TOTAL_MONTHS} Temas completados]`;
}

// --- 8. DESBLOQUEO DE NIVELES ---
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

        button.onclick = () => {
            if (levelNumber === 2) window.location.href = 'niveles_2.html';
            else if (levelNumber === 3) window.location.href = 'niveles_3.html';
            else if (levelNumber === 4) window.location.href = 'niveles_4.html';
        }
    }
}

// --- 9. LÓGICA DE SELECCIÓN DE IMAGEN DE PERFIL ---

/**
 * Función para generar y cargar las opciones de imagen en el modal.
 */
function loadProfileImageOptions() {
    if (!profileImageOptions) return;
    profileImageOptions.innerHTML = '';
    AVAILABLE_PROFILE_IMAGES.forEach(imagePath => {
        const imgElement = document.createElement('img');
        imgElement.src = imagePath;
        imgElement.alt = `Foto de Perfil ${imagePath.split('/').pop().split('.')[0]}`;
        imgElement.className = 'w-24 h-24 object-cover rounded-full cursor-pointer border-2 border-gray-300 hover:border-blue-500 transition duration-200';

        imgElement.addEventListener('click', () => {
            selectProfileImage(imagePath);
        });
        profileImageOptions.appendChild(imgElement);
    });
}

/**
 * Función para guardar la ruta de la imagen seleccionada en Firestore.
 */
async function selectProfileImage(imagePath) {
    if (!currentUserId) {
        console.error("No hay usuario autenticado.");
        return;
    }

    try {
        const profileRef = doc(db, "perfiles", currentUserId);
        await updateDoc(profileRef, {
            photoURL: imagePath
        });

        // Actualizar la imagen mostrada en el perfil principal
        if (profileImage) profileImage.src = imagePath;

        alert('Foto de perfil actualizada con éxito!');

        // Cerrar el modal de selección y volver al de perfil
        selectProfileImageModal.classList.add('hidden');
        profileModal.classList.remove('hidden');

    } catch (error) {
        console.error("Error al guardar la foto de perfil:", error);
    }
}

// --- 10. LOGOUT ---
if (logoutButtonSidebar) {
    logoutButtonSidebar.addEventListener('click', async() => {
        try {
            await signOut(auth);
            window.location.href = 'index.html';
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            alert("Hubo un error al cerrar sesión.");
        }
    });
}

// --- 11. EVENTOS DE NIVELES ---
document.getElementById('level-1').addEventListener('click', () => {
    alert('¡Excelente! Para comenzarestamos preparando la lección numero 1...');
    window.location.href = 'niveles_1.html';
});
document.getElementById('level-2').addEventListener('click', () => {
    alert('¡Excelente! Preparando la lección numero 2...');
    window.location.href = 'niveles_1.html';
});
document.getElementById('level-3').addEventListener('click', () => {
    alert('¡Excelente! Preparando la lección numero 3...');
    window.location.href = 'niveles_3.html';
});
document.getElementById('level-4').addEventListener('click', () => {
    alert('¡Excelente! Preparando la lección numero 4...');
    window.location.href = 'niveles_4.html';
});

// --- 12. EVENTO DEL DICCIONARIO ---
if (showDictionaryButton) {
    showDictionaryButton.addEventListener('click', () => {
        if (areAllLevelsComplete) {
            window.location.href = 'diccionario.html';
        } else {
            alert('¡Acceso Bloqueado! Debes completar todos los niveles (Nivel 1 al 4) para acceder al Diccionario de Señas completo.');
        }
    });
}