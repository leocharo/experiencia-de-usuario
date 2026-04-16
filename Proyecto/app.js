// --- 1. IMPORTACIÓN DE LIBRERÍAS DE FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification,
    signOut
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


// 2. CREDENCIALES DE FIREBASE
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

// Acepta correo o nombre de usuario y devuelve el email
async function resolveInputToEmail(input) {
    if (input.includes('@')) return input;
    try {
        const q = query(collection(db, "perfiles"), where("username", "==", input));
        const querySnapshot = await getDocs(q);
        return !querySnapshot.empty ? querySnapshot.docs[0].data().email : null;
    } catch (error) {
        console.error("resolveInputToEmail:", error);
        return null;
    }
}

// Mensajes de error de Firebase en español
function traducirErrorFirebase(code) {
    const errores = {
        'auth/user-not-found':         'No existe una cuenta con ese correo o usuario.',
        'auth/wrong-password':         'Contraseña incorrecta.',
        'auth/invalid-credential':     'Correo o contraseña incorrectos.',
        'auth/invalid-email':          'El correo no tiene un formato válido.',
        'auth/user-disabled':          'Esta cuenta ha sido deshabilitada.',
        'auth/too-many-requests':      'Demasiados intentos. Espera un momento e intenta de nuevo.',
        'auth/email-already-in-use':   'Este correo ya está registrado. Intenta iniciar sesión.',
        'auth/weak-password':          'La contraseña es muy débil. Usa al menos 6 caracteres.',
        'auth/network-request-failed': 'Error de red. Revisa tu conexión a internet.',
        'auth/operation-not-allowed':  'Este método de registro no está habilitado.',
    };
    return errores[code] || 'Ocurrió un error inesperado. Intenta de nuevo.';
}

async function handleSignIn(input, password) {
    const email = await resolveInputToEmail(input.trim());
    if (!email) {
        return { success: false, message: 'No se encontró una cuenta con ese usuario o correo.' };
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const userDoc = await getDoc(doc(db, "perfiles", user.uid));

        if (!userDoc.exists()) {
            window.location.href = 'pagina_inicio.html';
            return { success: true };
        }

        const userData = userDoc.data();

        // Verificar correo solo para rol "usuario"
        if (userData.rol === "usuario" && !user.emailVerified) {
            await sendEmailVerification(user);
            await signOut(auth);
            return {
                success: false,
                message: "Debes verificar tu correo antes de iniciar sesión. Te reenviamos el correo de verificación 📩"
            };
        }

        // Redirección según rol
        if (userData.rol === "admin") {
            window.location.href = 'admin-dashboard.html';
        } else if (userData.rol === 'creador') {
            window.location.href = 'Dashboard_Creador.html';
        } else {
            window.location.href = 'pagina_inicio.html';
        }

        return { success: true };

    } catch (error) {
        console.error("handleSignIn:", error.code, error.message);
        return { success: false, message: traducirErrorFirebase(error.code) };
    }
}

async function handleSignUp(email, password, username) {
    if (!username || username.trim().length < 3) {
        return { success: false, message: 'El nombre de usuario debe tener al menos 3 caracteres.' };
    }

    // Verificar si el username ya existe
    try {
        const q = query(collection(db, "perfiles"), where("username", "==", username.trim()));
        const snap = await getDocs(q);
        if (!snap.empty) {
            return { success: false, message: 'Ese nombre de usuario ya está en uso. Elige otro.' };
        }
    } catch (e) {
        console.error("Verificación username:", e);
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await sendEmailVerification(user);

        await setDoc(doc(db, "perfiles", user.uid), {
            username: username.trim(),
            email: user.email,
            rol: "usuario",
            nivel_actual: 1,
            created_at: new Date()
        });

        await signOut(auth);

        return {
            success: true,
            message: '✅ Registro exitoso. Revisa tu correo para verificar tu cuenta antes de iniciar sesión.'
        };
    } catch (error) {
        console.error("handleSignUp:", error.code, error.message);
        return { success: false, message: traducirErrorFirebase(error.code) };
    }
}

// --- EVENTOS DE FORMULARIO ---

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input     = document.getElementById('login-email').value.trim();
    const password  = document.getElementById('login-password').value;
    const messageEl = document.getElementById('login-message');

    messageEl.textContent = 'Verificando credenciales...';
    messageEl.style.color = '#6b7280';

    const result = await handleSignIn(input, password);
    if (!result.success) {
        messageEl.textContent = result.message;
        messageEl.style.color = 'red';
    }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email     = document.getElementById('register-email').value.trim();
    const password  = document.getElementById('register-password').value;
    const username  = document.getElementById('register-username').value.trim();
    const messageEl = document.getElementById('register-message');

    messageEl.textContent = 'Creando cuenta...';
    messageEl.style.color = '#6b7280';

    const result = await handleSignUp(email, password, username);
    messageEl.textContent = result.message;
    messageEl.style.color = result.success ? 'green' : 'red';
});

// --- RECUPERAR CONTRASEÑA (acepta correo o nombre de usuario) ---
const sendResetBtn = document.getElementById('send-reset-btn');
if (sendResetBtn) {
    sendResetBtn.addEventListener('click', async () => {
        const input  = document.getElementById('forgot-email').value.trim();
        const msgEl  = document.getElementById('forgot-message');

        if (!input) {
            msgEl.textContent = 'Ingresa tu correo o nombre de usuario.';
            msgEl.style.color = 'red';
            return;
        }

        msgEl.textContent = 'Buscando cuenta...';
        msgEl.style.color = '#6b7280';

        const email = await resolveInputToEmail(input);

        if (!email) {
            msgEl.textContent = 'No se encontró una cuenta con ese usuario o correo.';
            msgEl.style.color = 'red';
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            msgEl.textContent = '✅ Correo de recuperación enviado. Revisa tu bandeja (y spam).';
            msgEl.style.color = 'green';
        } catch (error) {
            console.error('sendPasswordResetEmail:', error.code, error.message);
            msgEl.textContent = traducirErrorFirebase(error.code);
            msgEl.style.color = 'red';
        }
    });
}