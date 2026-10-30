// --- 1. IMPORTACIÓN DE LIBRERÍAS DE FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification,
    updateProfile,
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



async function handleSignUp(email, password, username) {
    try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: username });
        await sendEmailVerification(cred.user);
        await signOut(auth);

        return {
            success: true,
            message: '📧 Te enviamos un correo de verificación. Confírmalo (revisa también SPAM) y después inicia sesión.'
        };
    } catch (error) {
        console.error(error.code, error.message);

        if (error.code === 'auth/email-already-in-use') {
            // Puede ser una cuenta registrada pero nunca verificada
            try {
                const cred = await signInWithEmailAndPassword(auth, email, password);
                if (!cred.user.emailVerified) {
                    await sendEmailVerification(cred.user);
                    await signOut(auth);
                    return { success: true, message: 'Ese correo ya estaba registrado sin verificar. Te reenviamos el enlace de verificación.' };
                }
                await signOut(auth);
            } catch (_) { /* contraseña distinta u otro error */ }
            return { success: false, message: 'Este correo ya está registrado.' };
        }
        if (error.code === 'auth/invalid-email') {
            return { success: false, message: 'El correo ingresado no es válido.' };
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
    const input = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const messageEl = document.getElementById('login-message');

    messageEl.textContent = 'Verificando credenciales...';
    const result = await handleSignIn(input, password);
    if (!result.success) {
        messageEl.textContent = result.message;
        messageEl.style.color = 'red';
    }
});
async function handleSignIn(input, password) {
    try {
        const email = await resolveInputToEmail(input);
        if (!email) {
            return { success: false, message: 'Usuario o correo no encontrado. Si acabas de registrarte, inicia sesión con tu correo.' };
        }

        const cred = await signInWithEmailAndPassword(auth, email, password);
        const user = cred.user;
        const ref = doc(db, "perfiles", user.uid);
        let snap = await getDoc(ref);

        // Sin perfil = cuenta nueva: exige verificación y crea el perfil
        if (!snap.exists()) {
            if (!user.emailVerified) {
                try { await sendEmailVerification(user); } catch (_) {}
                await signOut(auth);
                return {
                    success: false,
                    message: '⚠️ Tu correo aún no está verificado. Te reenviamos el enlace, revisa tu bandeja o SPAM.'
                };
            }
            await setDoc(ref, {
                username: user.displayName || email.split('@')[0],
                email: user.email,
                rol: "usuario",
                nivel_actual: 1,
                created_at: new Date()
            });
            snap = await getDoc(ref);
        }
        if (snap.data().activo === false) {
            await signOut(auth);
            localStorage.removeItem('MMH_role');
            localStorage.removeItem('MMH_uid');
            return {
                success: false,
                message: '🚫 Tu cuenta está suspendida. Contacta al administrador para más información.'
            };
        }
        const rol = snap.data().rol;
        localStorage.setItem('MMH_role', rol || 'usuario');
        localStorage.setItem('MMH_uid', user.uid);

        window.location.href = rol === 'admin'
            ? 'admin-dashboard-actualizado.html'
            : 'pagina_inicio.html';
        return { success: true };
    } catch (error) {
        console.error(error.code, error.message);
        if (['auth/invalid-credential', 'auth/wrong-password', 'auth/user-not-found'].includes(error.code)) {
            return { success: false, message: 'Correo/usuario o contraseña incorrectos.' };
        }
        if (error.code === 'auth/too-many-requests') {
            return { success: false, message: 'Demasiados intentos. Intenta más tarde.' };
        }
        return { success: false, message: 'Error al iniciar sesión: ' + error.code };
    }
}
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