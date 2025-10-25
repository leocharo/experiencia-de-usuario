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
    collection, // Importar collection para consultas
    query, // Importar query para consultas
    where, // Importar where para consultas
    getDocs // Importar getDocs para obtener resultados de la consulta
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";


// 🚨 2. TUS CREDENCIALES DE FIREBASE (¡MANTENER ESTAS CONSTANTES!) 🚨
// DANI ESTAS SON LAS CREDENCIALES QUE HACEN QUE SE CONECTEN A LA BASE DE DATOS NO LAS CAMBIES PARA NADA 
const firebaseConfig = {
    apiKey: "AIzaSyC7zx9CreT58V1AWTq7pMoS_ps65mXf-9Y",
    authDomain: "mis-manos-hablaran-44e17.firebaseapp.com",
    projectId: "mis-manos-hablaran-44e17",
    storageBucket: "mis-manos-hablaran-44e17.firebasestorage.app",
    messagingSenderId: "637462888639",
    appId: "1:637462888639:web:c4070137237c211dbd460a",
    measurementId: "G-5E2QC1Z09F"
};

// 3. INICIALIZACIÓN DE FIREBASE
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
        // Limpia el mensaje de error si existe
        document.getElementById('login-message').textContent = '';
    });
}

if (showLoginLink && loginView && registerView) {
    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerView.classList.add('hidden');
        loginView.classList.remove('hidden');
        // Limpia el mensaje de error si existe
        document.getElementById('register-message').textContent = '';
    });
}

// -----------------------------------------------------------------
// === 4. FUNCIONES DE FIREBASE PARA REGISTRO Y LOGIN ===
// -----------------------------------------------------------------

/**
 * Función de utilidad para obtener el email a partir del username.
 * Si el input es un email válido, lo devuelve. Si es un username, busca el email en Firestore.
 * @param {string} input - Email o Username.
 * @returns {Promise<string|null>} Email encontrado o null.
 */
async function resolveInputToEmail(input) {
    // 1. Verificar si el input ya es un correo electrónico (contiene '@')
    if (input.includes('@')) {
        return input; // Es un email, se usa directamente
    }

    // 2. Si es un username, buscar el email en la colección 'perfiles' de Firestore
    try {
        const perfilesRef = collection(db, "perfiles");
        // Crear consulta: buscar documento donde 'username' sea igual al input
        const q = query(perfilesRef, where("username", "==", input));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Debería haber un solo resultado (porque el username es único)
            const userData = querySnapshot.docs[0].data();
            return userData.email; // Retorna el email asociado al username
        } else {
            return null; // Username no encontrado
        }
    } catch (error) {
        console.error("Error resolviendo username:", error);
        return null;
    }
}


/**
 * Función para manejar el registro de un nuevo usuario con Firebase.
 */
async function handleSignUp(email, password, username) {
    try {
        // ... (El código de Registro se mantiene igual) ...
        // 1. REGISTRO EN FIREBASE AUTHENTICATION
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. GUARDAR PERFIL Y PROGRESO INICIAL EN FIRESTORE
        // Usamos el user.uid como ID del documento en la colección 'perfiles'
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


/**
 * Función para manejar el inicio de sesión de un usuario existente.
 * Ahora acepta tanto email como username en el campo principal.
 */
async function handleSignIn(input, password) {
    // 1. Resolver el input (email o username) al email real
    const email = await resolveInputToEmail(input);

    if (!email) {
        // Si no se encuentra el email (ni por @, ni por username)
        return { success: false, message: 'Usuario no encontrado o inválido.' };
    }

    try {
        // 2. Intentar el inicio de sesión con el email y la contraseña
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log('Inicio de sesión exitoso. UID:', user.uid);

        // 3. Redirección
        // Línea 167 en app.js (en tu imagen, alrededor de esa línea)
        window.location.href = 'pagina_inicio.html';

        return { success: true, message: '¡Bienvenido! Redirigiendo...' };

    } catch (error) {
        let message = 'Ocurrió un error desconocido.';

        // 4. Manejo de errores de credenciales (Username o Contraseña inválida)
        if (error.code === 'auth/invalid-credential' ||
            error.code === 'auth/user-not-found' ||
            error.code === 'auth/wrong-password') {
            message = 'Credenciales inválidas. Usuario o Contraseña incorrectos.';
        }

        console.error('Error al iniciar sesión:', error.code, error.message);
        return { success: false, message: message };
    }
}

// -----------------------------------------------------------------
// === MANEJO DE EVENTOS DE FORMULARIOS ===
// -----------------------------------------------------------------

// Manejo del Formulario de Registro (Se mantiene igual)
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


// Manejo del Formulario de Login (Actualizado)
document.getElementById('login-form').addEventListener('submit', async(e) => {
    e.preventDefault();
    // Obtener el valor del campo de login (puede ser email o username)
    const input = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const messageEl = document.getElementById('login-message');

    if (!messageEl) return;

    messageEl.textContent = 'Iniciando sesión...';
    messageEl.style.color = '#3b5998';

    // Llama a la función que resuelve el input y luego inicia sesión
    const result = await handleSignIn(input, password);

    // Muestra el mensaje de éxito o error
    messageEl.textContent = result.message;
    messageEl.style.color = result.success ? 'green' : 'red';
});