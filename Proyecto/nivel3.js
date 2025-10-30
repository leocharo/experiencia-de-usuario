// nivel3.js

import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

// Configuración de Firebase
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
const db = getFirestore(app);
const auth = getAuth(app);

let userId = null;
onAuthStateChanged(auth, user => {
    if (user) userId = user.uid;
});

// >>> DATOS DE LECCIONES DEL NIVEL 3 (22 lecciones en total)
// NOTA: Reemplaza "ruta_a_imagen/" con tu carpeta real de imágenes.
const lecciones = [
    // Días de la Semana (7)
    { palabra: "Lunes", descripcion: "Letra 'L' de la mano dominante, moviéndola en círculo frente al cuerpo.", imagen: "ruta_a_imagen/Lunes.png", categoria: "Días" },
    { palabra: "Martes", descripcion: "Letra 'M' de la mano dominante, moviéndola en círculo.", imagen: "ruta_a_imagen/Martes.png", categoria: "Días" },
    { palabra: "Miércoles", descripcion: "Letra 'I' de la mano dominante, moviéndola en círculo.", imagen: "ruta_a_imagen/Miercoles.png", categoria: "Días" },
    { palabra: "Jueves", descripcion: "Letra 'J' con la mano dominante, haciendo la forma de la letra en el aire.", imagen: "ruta_a_imagen/Jueves.png", categoria: "Días" },
    { palabra: "Viernes", descripcion: "Letra 'V' de la mano dominante, moviéndola en círculo.", imagen: "ruta_a_imagen/Viernes.png", categoria: "Días" },
    { palabra: "Sábado", descripcion: "Letra 'S' de la mano dominante, moviéndola en círculo.", imagen: "ruta_a_imagen/Sabado.png", categoria: "Días" },
    { palabra: "Domingo", descripcion: "Ambas manos abiertas, tocando el pecho y luego abriéndose hacia adelante.", imagen: "ruta_a_imagen/Domingo.png", categoria: "Días" },

    // Tiempos (Hoy, Ayer, Mañana) (3)
    { palabra: "Hoy", descripcion: "Ambas manos en 'Y', golpeando ligeramente la barbilla.", imagen: "ruta_a_imagen/Hoy.png", categoria: "Tiempos" },
    { palabra: "Ayer", descripcion: "Letra 'A', moviéndola sobre el hombro hacia atrás.", imagen: "ruta_a_imagen/Ayer.png", categoria: "Tiempos" },
    { palabra: "Mañana", descripcion: "Mano en 'A' o 'M', moviéndola en círculo en el aire delante del cuerpo.", imagen: "ruta_a_imagen/Manana.png", categoria: "Tiempos" },

    // Meses (12)
    { palabra: "Enero", descripcion: "Letra 'E', moviéndola en círculo.", imagen: "ruta_a_imagen/Enero.png", categoria: "Meses" },
    { palabra: "Febrero", descripcion: "Letra 'F', moviéndola en círculo.", imagen: "ruta_a_imagen/Febrero.png", categoria: "Meses" },
    { palabra: "Marzo", descripcion: "Letra 'M', moviéndola de arriba a abajo.", imagen: "ruta_a_imagen/Marzo.png", categoria: "Meses" },
    { palabra: "Abril", descripcion: "Letra 'A', moviéndola de arriba a abajo.", imagen: "ruta_a_imagen/Abril.png", categoria: "Meses" },
    { palabra: "Mayo", descripcion: "Letra 'M', golpeando la frente ligeramente.", imagen: "ruta_a_imagen/Mayo.png", categoria: "Meses" },
    { palabra: "Junio", descripcion: "Letra 'J', dibujando la forma de la letra en el aire.", imagen: "ruta_a_imagen/Junio.png", categoria: "Meses" },
    { palabra: "Julio", descripcion: "Letra 'J', con un ligero movimiento hacia arriba.", imagen: "ruta_a_imagen/Julio.png", categoria: "Meses" },
    { palabra: "Agosto", descripcion: "Letra 'A', golpeando la frente ligeramente.", imagen: "ruta_a_imagen/Agosto.png", categoria: "Meses" },
    { palabra: "Septiembre", descripcion: "Letra 'S', moviéndola en círculo.", imagen: "ruta_a_imagen/Septiembre.png", categoria: "Meses" },
    { palabra: "Octubre", descripcion: "Letra 'O', moviéndola en círculo.", imagen: "ruta_a_imagen/Octubre.png", categoria: "Meses" },
    { palabra: "Noviembre", descripcion: "Letra 'N', moviéndola en círculo.", imagen: "ruta_a_imagen/Noviembre.png", categoria: "Meses" },
    { palabra: "Diciembre", descripcion: "Letra 'D', moviéndola en círculo.", imagen: "ruta_a_imagen/Diciembre.png", categoria: "Meses" },
];

let index = 0;
// Lógica de 4 Quizzes
let quizzesCompletados = 0;
const TOTAL_QUIZZES = 4;

const leccionDiv = document.getElementById("leccion");
const btnSiguiente = document.getElementById("btnSiguiente");
const btnAnterior = document.getElementById("btnAnterior");
const imagenLeccion = document.getElementById("imagenLeccion"); // NUEVA REFERENCIA IMG
const quizDiv = document.getElementById("quiz");
const resultadoDiv = document.getElementById("resultado");
const btnContinuar = document.getElementById("btnContinuar");

// Referencias para la Barra Circular de Progreso
const progressCircle = document.getElementById("progressCircle");
const progressText = document.getElementById("progressText");
const TOTAL_LECCIONES = lecciones.length; // 22 lecciones

// --- FUNCIONES DE PROGRESO Y NAVEGACIÓN ---

// nivel3.js

// ... (código anterior)

// --- FUNCIONES DE PROGRESO Y NAVEGACIÓN ---

function actualizarProgreso(esQuiz = false) {
    let porcentaje, color, texto;

    if (esQuiz) {
        porcentaje = Math.round((quizzesCompletados / TOTAL_QUIZZES) * 100);
        color = '#34d399'; // Verde claro para Quiz
        texto = `Quiz ${quizzesCompletados}/${TOTAL_QUIZZES}`;
    } else {
        porcentaje = Math.round(((index + 1) / TOTAL_LECCIONES) * 100);

        // ** SOLUCIÓN: Usamos un color único para todas las lecciones del Nivel 3 **
        color = '#a855f7'; // Púrpura (Color principal del Nivel 3)

        texto = `${index + 1}/${TOTAL_LECCIONES}`;
    }

    // Aplica los cambios al CSS
    progressCircle.style.setProperty('--progress-value', porcentaje);
    progressCircle.style.setProperty('--progress-color', color);
    progressText.textContent = texto;
}

// ... (resto del código)

function mostrarLeccion(i) {
    const leccion = lecciones[i];
    leccionDiv.querySelector("h2").textContent = `Aprende la palabra: "${leccion.palabra}"`;

    // CARGA LA IMAGEN
    imagenLeccion.src = leccion.imagen;

    leccionDiv.querySelector("p").textContent = leccion.descripcion;

    actualizarBotones();
    actualizarProgreso();
}

function actualizarBotones() {
    // Deshabilitar/Habilitar botón ANTERIOR
    if (index === 0) {
        btnAnterior.disabled = true;
        btnAnterior.classList.add("opacity-50", "cursor-not-allowed");
    } else {
        btnAnterior.disabled = false;
        btnAnterior.classList.remove("opacity-50", "cursor-not-allowed");
    }

    // Lógica para el botón Siguiente
    if (index === lecciones.length - 1) {
        btnSiguiente.textContent = "Hacer Quiz →";
    } else {
        btnSiguiente.textContent = "Siguiente →";
    }
}

// Event Listener para Anterior
btnAnterior.addEventListener("click", () => {
    if (index > 0) {
        index--;
        mostrarLeccion(index);
    }
});

// Avanzar lecciones
btnSiguiente.addEventListener("click", async() => {
    // Guardar progreso de la lección actual
    if (userId) {
        const docRef = doc(db, "perfiles", userId);
        updateDoc(docRef, {
                [`progreso_palabras_n3.${lecciones[index].palabra}`]: true
            })
            .catch(error => console.error("Error al guardar progreso N3:", error));
    }

    index++;
    if (index < lecciones.length) {
        mostrarLeccion(index);
    } else {
        leccionDiv.style.display = "none";
        iniciarQuiz();
    }
});

// --- FUNCIONES DE QUIZ (4 Rondas) ---

function iniciarQuiz() {
    quizDiv.style.display = "block";
    resultadoDiv.textContent = "";

    if (quizzesCompletados >= TOTAL_QUIZZES) return;

    actualizarProgreso(true);

    // Renderiza la estructura del quiz (cambiamos a usar img)
    quizDiv.innerHTML = `<h2 class="text-2xl font-semibold text-purple-700 mb-4">Quiz ${quizzesCompletados + 1} de ${TOTAL_QUIZZES}</h2>
        <p class="text-gray-700 mb-4">Selecciona la palabra correcta para la imagen:</p>
        <img id="quiz-img" src="" alt="Imagen de seña para adivinar" class="mb-4 rounded-xl shadow-lg w-56 h-auto mx-auto"/> 
        <div class="grid grid-cols-2 gap-4" id="quiz-opciones"></div>
    `;

    const quizImg = document.getElementById("quiz-img");
    const opcionesDiv = document.getElementById("quiz-opciones");

    // Selecciona 4 lecciones aleatorias para el quiz
    const opcionesLecciones = lecciones.sort(() => 0.5 - Math.random()).slice(0, 4);
    const palabraCorrecta = opcionesLecciones[0];

    // Muestra la imagen de la palabra correcta
    quizImg.src = palabraCorrecta.imagen;


    opcionesLecciones.sort(() => 0.5 - Math.random()).forEach(op => {
        const btn = document.createElement("button");
        btn.textContent = op.palabra; // Muestra el texto de la palabra
        btn.className = "bg-purple-500 text-white rounded-xl px-4 py-2 hover:bg-purple-600 transition duration-200";
        btn.onclick = () => verificarRespuestaQuiz(op.palabra === palabraCorrecta.palabra, opcionesDiv, btn);
        opcionesDiv.appendChild(btn);
    });
}

async function verificarRespuestaQuiz(esCorrecta, opcionesDiv, btnElemento) {
    if (esCorrecta) {
        quizzesCompletados++;
        resultadoDiv.textContent = `¡Correcto! ✅ Haz completado el Quiz ${quizzesCompletados}.`;
        resultadoDiv.style.color = "green";

        Array.from(opcionesDiv.children).forEach(child => child.onclick = null);

        actualizarProgreso(true);

        if (quizzesCompletados < TOTAL_QUIZZES) {
            setTimeout(() => iniciarQuiz(), 2000);
        } else {
            // Finalizar Nivel 3
            resultadoDiv.textContent = "🎉 ¡Nivel 3 completado! 🎉";
            resultadoDiv.style.color = "green";
            btnContinuar.style.display = "block";
            quizDiv.style.display = "none";

            // Guardar que nivel completado
            if (userId) {
                const docRef = doc(db, "perfiles", userId);
                await updateDoc(docRef, { nivel3_completado: true });
            }
        }
    } else {
        resultadoDiv.textContent = "Intenta de nuevo ❌";
        resultadoDiv.style.color = "red";
        btnElemento.classList.remove("bg-purple-500", "hover:bg-purple-600");
        btnElemento.classList.add("bg-red-500");
    }
}

// Continuar a la página principal
btnContinuar.addEventListener("click", () => {
    window.location.href = "pagina_inicio.html";
});

// Inicializa la primera lección al cargar la página
mostrarLeccion(index);