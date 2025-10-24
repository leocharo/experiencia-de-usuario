// --- 1. IMPORTACIÓN DE LIBRERÍAS DE FIREBASE ---
// Asegúrate de que los números de versión (12.4.0) coincidan con los que Firebase te dio.
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";

// Importaciones cruciales para la autenticación y la base de datos
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";


// 🚨 CREDENCIALES DE FIREBASE 🚨
const firebaseConfig = {
    apiKey: "AIzaSyC7zx9CreT58V1AWTq7pMoS_ps65mXf-9Y",
    authDomain: "mis-manos-hablaran-44e17.firebaseapp.com",
    projectId: "mis-manos-hablaran-44e17",
    storageBucket: "mis-manos-hablaran-44e17.firebasestorage.app",
    messagingSenderId: "637462888639",
    appId: "1:637462888639:web:c4070137237c211dbd460a",
    measurementId: "G-5E2QC1Z09F"
};


const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("Cliente Firebase conectado.");

// -----------------------------------------------------------------
// === LÓGICA DE VISTAS (Switch entre Login y Registro) ===
// -----------------------------------------------------------------

const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');

if (showRegisterLink && loginView && registerView) {
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginView.classList.add('hidden');
        registerView.classList.remove('hidden');
    });
}

if (showLoginLink && loginView && registerView) {
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerView.classList.add('hidden');
        loginView.classList.remove('hidden');
    });
}

// -----------------------------------------------------------------
// === 4. FUNCIONES DE FIREBASE PARA REGISTRO Y LOGIN ===
// -----------------------------------------------------------------


async function handleSignUp(email, password, username) {
    try {

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;


        await setDoc(doc(db, "perfiles", user.uid), {
            username: username,
            email: user.email,
            nivel_actual: 1,
            progreso_letras: {},
            created_at: new Date()
        });

        return { success: true, message: '¡Registro exitoso! Ya puedes iniciar sesión.' };

    } catch (error) {
        let message = 'Ocurrió un error desconocido.';

        if (error.code === 'auth/email-already-in-use') {
            message = 'El correo ya está registrado.';
        } else if (error.code === 'auth/weak-password') {
            message = 'La contraseña es demasiado débil (mínimo 6 caracteres).';
        } else if (error.code === 'auth/invalid-email') {
            message = 'El formato del correo electrónico es inválido.';
        } else {
            console.error('Error de Firebase:', error.code, error.message);
        }

        return { success: false, message: message };
    }
}



async function handleSignIn(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log('Inicio de sesión exitoso. UID:', user.uid);

        return { success: true, message: '¡Bienvenido! Redirigiendo...' };

    } catch (error) {
        let message = 'Ocurrió un error desconocido.';

        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            message = 'Correo o contraseña incorrectos.';
        }

        console.error('Error al iniciar sesión:', error.code, error.message);
        return { success: false, message: message };
    }
}

// -----------------------------------------------------------------
// === 5. MANEJO DE EVENTOS DE FORMULARIOS ===
// -----------------------------------------------------------------


document.getElementById('register-form').addEventListener('submit', async(e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const username = document.getElementById('register-username').value;
    const messageEl = document.getElementById('register-message');

    if (!messageEl) return;

    messageEl.textContent = 'Registrando...';
    messageEl.style.color = '#3b5998';

    const result = await handleSignUp(email, password, username);

    messageEl.textContent = result.message;
    messageEl.style.color = result.success ? 'green' : 'red';

    if (result.success) {
        document.getElementById('register-form').reset();
    }
});


// Manejo del Formulario de Login
document.getElementById('login-form').addEventListener('submit', async(e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const messageEl = document.getElementById('login-message');

    if (!messageEl) return;

    messageEl.textContent = 'Iniciando sesión...';
    messageEl.style.color = '#3b5998';

    const result = await handleSignIn(email, password);

    messageEl.textContent = result.message;
    messageEl.style.color = result.success ? 'green' : 'red';

    if (result.success) {
        // Redirigir al usuario al área principal de la aplicación.
    }
});