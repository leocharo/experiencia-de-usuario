// --- 1. IMPORTACIÓN Y CONFIGURACIÓN DE FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js";
import { deleteUser } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { deleteDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

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
const showDictionaryButton = document.getElementById('show-dictionary-button');
const showInfoButton = document.getElementById('show-info-button');

// --- SELECCIÓN DE PERFIL ---
const changeProfilePictureButton = document.getElementById('change-profile-picture-button');
const selectProfileImageModal = document.getElementById('select-profile-image-modal');
const closeSelectImageModalButton = document.getElementById('close-select-image-modal');
const profileImageOptions = document.getElementById('profile-image-options');

// --- MODAL INFO ---
const infoModal = document.getElementById('info-modal');
const closeInfoModalButton = document.getElementById('close-info-modal');

// --- BARRAS ---
const progressLettersBar = document.getElementById('progress-letters-bar');
const progressLettersPercentage = document.getElementById('progress-letters-percentage');
const progressLettersCount = document.getElementById('progress-letters-count');

const progressWordsBar = document.getElementById('progress-words-bar');
const progressWordsPercentage = document.getElementById('progress-words-percentage');
const progressWordsCount = document.getElementById('progress-words-count');

const progressDaysBar = document.getElementById('progress-days-bar');
const progressDaysPercentageText = document.getElementById('progress-days-percentage-text');
const progressDaysCount = document.getElementById('progress-days-count');

const progressMonthsBar = document.getElementById('progress-months-bar');
const progressMonthsPercentageText = document.getElementById('progress-months-percentage-text');
const progressMonthsCount = document.getElementById('progress-months-count');

// --- MOBILE ---
const showProfileButtonMobile = document.getElementById('show-profile-button-mobile');
const showInfoButtonMobile = document.getElementById('show-info-button-mobile');
const showDictionaryButtonMobile = document.getElementById('show-dictionary-button-mobile');
const logoutButtonMobile = document.getElementById('logout-button-mobile');

// --- EVENTOS PERFIL ---
[showProfileButton, showProfileButtonMobile].forEach(button => {
    if (button) {
        button.addEventListener('click', () => {
            profileModal.classList.remove('hidden');
        });
    }
});

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

// --- AUTH ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUserId = user.uid;
        loadUserData(currentUserId);
    } else {
        console.log('No hay usuario autenticado.');
    }
});

// --- CARGA ---
async function loadUserData(userId) {
    if (loadingMessage) {
        loadingMessage.textContent = 'Cargando tu perfil y progreso...';
    }

    try {
        const profileRef = doc(db, "perfiles", userId);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
            let data = profileSnap.data();

            if (userIdDisplay) userIdDisplay.textContent = data.username || 'Usuario';
            if (profileImage) profileImage.src = data.photoURL;

            const lettersCompleted = data.nivel1_completado ? TOTAL_LETTERS : 0;
            const wordsCompleted = data.nivel2_completado ? TOTAL_WORDS_LEVEL_2 : 0;

            displayProgressLevels(lettersCompleted, wordsCompleted, 0, 0);

        } else {
            console.error("No se encontró el perfil");
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        if (loadingMessage) loadingMessage.classList.add('hidden');
    }
}

// --- PROGRESO ---
function displayProgressLevels(lettersCompleted, wordsCompleted, daysCompleted, monthsCompleted) {

    const lettersPercentage = Math.round((lettersCompleted / TOTAL_LETTERS) * 100);
    progressLettersPercentage.textContent = `${lettersPercentage}%`;
    progressLettersBar.style.width = `${lettersPercentage}%`;
    progressLettersCount.textContent = `[${lettersCompleted}/${TOTAL_LETTERS}]`;

    const wordsPercentage = Math.round((wordsCompleted / TOTAL_WORDS_LEVEL_2) * 100);
    progressWordsPercentage.textContent = `${wordsPercentage}%`;
    progressWordsBar.style.width = `${wordsPercentage}%`;
    progressWordsCount.textContent = `[${wordsCompleted}/${TOTAL_WORDS_LEVEL_2}]`;
}

// --- LOGOUT ---
[logoutButtonSidebar, logoutButtonMobile].forEach(button => {
    if (button) {
        button.addEventListener('click', async () => {
            await signOut(auth);
            window.location.href = 'index.html';
        });
    }
});

// --- EDITAR USUARIO ---
const editBtn = document.getElementById("edit-username-btn");
const usernameInput = document.getElementById("username-input");

if (editBtn && usernameInput && userIdDisplay) {

    editBtn.addEventListener("click", () => {
        usernameInput.classList.remove("hidden");
        usernameInput.value = userIdDisplay.textContent;
        userIdDisplay.classList.add("hidden");
    });

    const saveUsername = async () => {
        const newName = usernameInput.value.trim();

        if (newName === "") {
            alert("El nombre no puede estar vacío");
            return;
        }

        if (!currentUserId) return;

        try {
            const profileRef = doc(db, "perfiles", currentUserId);

            await updateDoc(profileRef, {
                username: newName
            });

            userIdDisplay.textContent = newName;

        } catch (error) {
            console.error("Error al actualizar nombre:", error);
        }

        usernameInput.classList.add("hidden");
        userIdDisplay.classList.remove("hidden");
    };

    usernameInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            saveUsername();
        }
    });

    usernameInput.addEventListener("blur", saveUsername);
}
