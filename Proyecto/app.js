// --- 1. IMPORTACIÓN DE LIBRERÍAS DE FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";


// 🚨 2. TUS CREDENCIALES REALES 🚨
const firebaseConfig = {
    apiKey: "AIzaSyC7zx9CreT58V1AWTq7pMoS_ps65mXf-9Y",
    authDomain: "mis-manos-hablaran-44e17.firebaseapp.com",
    projectId: "mis-manos-hablaran-44e17",
    storageBucket: "mis-manos-hablaran-44e17.firebasestorage.app",
    messagingSenderId: "637462888639",
    appId: "1:637462888639:web:c4070137237c211dbd460a",
    measurementId: "G-5E2QC1Z09F"
};

// 3. INICIALIZACIÓN
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// --- LÓGICA DE VISTAS (LOGIN / REGISTRO) ---
const loginView = document.getElementById('login-view');
const registerView = document.getElementById('register-view');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');

if (showRegisterLink) {
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginView.classList.add('hidden');
        registerView.classList.remove('hidden');
    });
}

if (showLoginLink) {
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerView.classList.add('hidden');
        loginView.classList.remove('hidden');
    });
}

// --- FUNCIONES DE AUTENTICACIÓN ---

async function resolveInputToEmail(input) {
    if (input.includes('@')) return input;
    try {
        const q = query(collection(db, "perfiles"), where("username", "==", input));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty ? querySnapshot.docs[0].data().email : null;
    } catch (error) {
        return null;
    }
}

async function handleSignIn(input, password) {
    const email = await resolveInputToEmail(input);
    if (!email) return { success: false, message: 'Usuario no encontrado.' };

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // BUSCAR ROL EN FIRESTORE
        const userDoc = await getDoc(doc(db, "perfiles", user.uid));

        if (userDoc.exists()) {
            const userData = userDoc.data();

            if (userData.rol === "admin") {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'pagina_inicio.html';
            }
            return { success: true, message: 'Redirigiendo...' };
        } else {
            window.location.href = 'pagina_inicio.html';
            return { success: true, message: 'Sesión iniciada.' };
        }
    } catch (error) {
        return { success: false, message: 'Credenciales incorrectas.' };
    }
}

async function handleSignUp(email, password, username) {
    try {
        // 1. Crear el usuario en Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Guardar datos adicionales en Firestore
        // Asegúrate de que la colección se llame "perfiles" como en tu login
        await setDoc(doc(db, "perfiles", user.uid), {
            username: username,
            email: email, // Usamos el email del input
            rol: "usuario",
            nivel_actual: 1,
            created_at: new Date()
        });

        return { success: true, message: '¡Registro exitoso! Ya puedes iniciar sesión.' };

    } catch (error) {
        console.error("Error detallado:", error.code, error.message);

        // Si el usuario se creó en Auth pero falló Firestore, el usuario ya existe
        if (error.code === 'auth/email-already-in-use') {
            return { success: false, message: 'Este correo ya está registrado.' };
        }

        if (error.code === 'auth/weak-password') {
            return { success: false, message: 'La contraseña debe tener al menos 6 caracteres.' };
        }

        return { success: false, message: 'Error interno: ' + error.code };
    }
}

// --- FUNCIÓN: OLVIDÉ MI CONTRASEÑA ---

async function handlePasswordReset(email) {
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true, message: '✅ Correo enviado. Revisa tu bandeja de entrada, si no encuentras el correo, revisa tu correo de SPAM' };
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            return { success: false, message: 'No existe una cuenta con ese correo.' };
        }
        if (error.code === 'auth/invalid-email') {
            return { success: false, message: 'El correo ingresado no es válido.' };
        }
        return { success: false, message: 'Error al enviar el correo. Intenta de nuevo.' };
    }
}

// --- EVENTOS DE FORMULARIO ---

document.getElementById('login-form').addEventListener('submit', async(e) => {
    e.preventDefault();
    const input = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const messageEl = document.getElementById('login-message');

    messageEl.textContent = 'Verificando credenciales...';
    const result = await handleSignIn(input, password);
    if (!result.success) {
        messageEl.textContent = result.message;
        messageEl.style.color = 'red';
    }
});

document.getElementById('register-form').addEventListener('submit', async(e) => {
    e.preventDefault();
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const username = document.getElementById('register-username').value;
    const messageEl = document.getElementById('register-message');

    const result = await handleSignUp(email, password, username);
    messageEl.textContent = result.message;
    messageEl.style.color = result.success ? 'green' : 'red';
});

// --- EVENTO: ENVIAR CORREO DE RECUPERACIÓN ---

document.getElementById('send-reset-btn').addEventListener('click', async() => {
    const email = document.getElementById('forgot-email').value.trim();
    const messageEl = document.getElementById('forgot-message');

    if (!email) {
        messageEl.textContent = 'Por favor ingresa tu correo.';
        messageEl.style.color = 'red';
        return;
    }

    messageEl.textContent = 'Enviando...';
    messageEl.style.color = '#4b5563';

    const result = await handlePasswordReset(email);
    messageEl.textContent = result.message;
    messageEl.style.color = result.success ? 'green' : 'red';
});