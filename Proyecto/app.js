// --- 1. IMPORTACIÓN DE LIBRERÍAS DE FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
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

async function ensureInternalUser(userUid) {
    if (!userUid) return null;
    const profileRef = doc(db, "perfiles", userUid);
    try {
        const payload = {
            username: 'JesusRUTP',
            email: 'jjrockg@hotmail.com',
            rol: 'empleado',
            nivel_actual: 4,
            nivel1_completado: true,
            nivel2_completado: true,
            nivel3_completado: true,
            nivel4_completado: true,
            progreso_dias_completados: 10,
            progreso_meses_completados: 12,
            photoURL: 'https://placehold.co/120x120/d1d5db/4b5563?text=👤',
            hasSeenWelcomeModal: true,
            created_at: new Date()
        };
        await setDoc(profileRef, payload, { merge: true });
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
            return profileSnap;
        }
        return null;
    } catch (err) {
        console.error('Error garantizando usuario interno en Firestore', err);
        return null;
    }
}

async function handleSignIn(input, password) {
    const normal = input.trim().toLowerCase();
    const isInternal = (normal === 'jesusempleado' && password === '12345678') || (normal === 'jesusrutp' && password === 'jesusutp') || (normal === 'jjrockg@hotmail.com' && password === 'jesusutp');
    // Soporte especial para usuarios internos de prueba
    if (isInternal) {
        try {
            console.log('[DEBUG] Iniciando login especial interno', input);
            // Asegurar usuario en Firestore con ID fijo JesusRUTP
            const userId = 'JesusRUTP';
            const profileRef = doc(db, 'perfiles', userId);
            await setDoc(profileRef, {
                username: 'JesusRUTP',
                email: 'jjrockg@hotmail.com',
                rol: 'empleado',
                nivel_actual: 4,
                nivel1_completado: true,
                nivel2_completado: true,
                nivel3_completado: true,
                nivel4_completado: true,
                progreso_dias_completados: 10,
                progreso_meses_completados: 12,
                photoURL: 'https://placehold.co/120x120/d1d5db/4b5563?text=👤',
                hasSeenWelcomeModal: true,
                created_at: new Date()
            }, { merge: true });
            localStorage.setItem('MMH_role', 'empleado');
            localStorage.setItem('MMH_uid', userId);
            window.location.href = 'pagina_inicio.html';
            return { success: true, message: 'Redirigiendo al menú principal (usuario interno especial).' };
        } catch (err) {
            console.error('Error acceso interno fijo', err);
            return { success: false, message: 'No se pudo iniciar sesión interna.' };
        }
    }

    const email = await resolveInputToEmail(input);
    if (!email) {
        console.warn('[DEBUG] resolveInputToEmail no encontró usuario:', input);
        if (isInternal) {
            // ya manejado antes, pero si llega aquí, volvemos a intentar con correo especial
            return { success: false, message: 'Usuario interno no encontrado tras creación. Reintenta.' };
        }
        return { success: false, message: 'Usuario no encontrado.' };
    }

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // BUSCAR ROL EN FIRESTORE
        const userDoc = await getDoc(doc(db, "perfiles", user.uid));

        if (userDoc.exists()) {
            const userData = userDoc.data();

            // Redirección especial para el usuario JesusEmpleado
            if (userData.username === 'JesusEmpleado' || input === 'JesusEmpleado') {
                localStorage.setItem('MMH_role', userData.rol || 'empleado');
                localStorage.setItem('MMH_uid', user.uid);
                window.location.href = 'pagina_inicio.html';
                return { success: true, message: 'Redirigiendo al menú principal.' };
            }

            if (userData.rol === "admin") {
                localStorage.setItem('MMH_role', userData.rol || 'admin');
                localStorage.setItem('MMH_uid', user.uid);
                window.location.href = 'admin-dashboard.html';
            } else {
                localStorage.setItem('MMH_role', userData.rol || 'usuario');
                localStorage.setItem('MMH_uid', user.uid);
                window.location.href = 'pagina_inicio.html';
            }
            return { success: true, message: 'Redirigiendo...' };
        } else {
                localStorage.setItem('MMH_role', 'usuario');
                localStorage.setItem('MMH_uid', user.uid);
                window.location.href = 'pagina_inicio.html';
                return { success: true, message: 'Sesión iniciada.' };
        }
    } catch (error) {
        console.error('Error login regular:', error);
        return { success: false, message: 'Credenciales incorrectas.' };
    }
}

async function handleSignUp(email, password, username) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "perfiles", user.uid), {
            username: username,
            email: user.email,
            rol: "usuario",
            nivel_actual: 1,
            created_at: new Date()
        });
        return { success: true, message: 'Registro exitoso.' };
    } catch (error) {
        return { success: false, message: 'Error en el registro.' };
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