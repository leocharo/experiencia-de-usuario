// nivel2.js
import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";

// Config de Firebase (usa la tuya si es distinta)
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

// Lista completa de lecciones
const lecciones = [
    // Saludos
    { palabra: "Hola", descripcion: "Levanta la mano abierta a la altura de tu frente.", video: "videos/Hola.mp4" },
    { palabra: "Adiós", descripcion: "Mano abierta desde el frente hacia afuera, como despedida.", video: "videos/Adios.mp4" },
    { palabra: "Buenos días", descripcion: "Mano desde el mentón hacia adelante y luego gesto de sol saliendo.", video: "videos/BuenosDias.mp4" },
    { palabra: "Buenas tardes", descripcion: "Mano desde el mentón hacia adelante y luego gesto del sol bajando.", video: "videos/BuenasTardes.mp4" },
    { palabra: "Buenas noches", descripcion: "Haz 'buenas' y luego gesto de noche: una mano horizonte y otra curva sobre ella.", video: "videos/BuenasNoches.mp4" },
    { palabra: "¿Cómo estás?", descripcion: "Ambas manos con dedos curvados hacia abajo y girarlas frente al pecho.", video: "videos/ComoEstas.mp4" },
    { palabra: "Gracias", descripcion: "Toca los labios y aleja la mano hacia adelante.", video: "videos/Gracias.mp4" },

    // Familia
    { palabra: "Familia", descripcion: "Forma F con una mano y pasa el otro brazo recto de arriba hacia abajo.", video: "videos/Familia.mp4" },
    { palabra: "Madre", descripcion: "Mano abierta sobre la barbilla, toca ligeramente una o dos veces.", video: "videos/Madre.mp4" },
    { palabra: "Padre", descripcion: "Forma P y toca la barbilla con pequeños toques.", video: "videos/Padre.mp4" },
    { palabra: "Hermano", descripcion: "Frota los dedos índice entre sí.", video: "videos/Hermano.mp4" },
    { palabra: "Hermana", descripcion: "Frota los dedos índice horizontalmente y toca la mejilla.", video: "videos/Hermana.mp4" },
    { palabra: "Abuelo", descripcion: "Forma A, coloca cerca de la frente y mueve ligeramente hacia adelante o arriba.", video: "videos/Abuelo.mp4" },
    { palabra: "Abuela", descripcion: "Forma A, coloca cerca de la mejilla y mueve ligeramente hacia adelante o arriba.", video: "videos/Abuela.mp4" },
    { palabra: "Tío", descripcion: "Mano en T chocando entre sí.", video: "videos/Tio.mp4" },

    // Comida
    { palabra: "Agua", descripcion: "Extiende el índice y haz un movimiento vertical de arriba a abajo.", video: "videos/Agua.mp4" },
    { palabra: "Tortilla", descripcion: "Extiende ambas manos abiertas frente al cuerpo, palmas hacia abajo.", video: "videos/Tortilla.mp4" },
    { palabra: "Leche", descripcion: "Gesto de ordeñar con ambas manos.", video: "videos/Leche.mp4" },
    { palabra: "Cereal", descripcion: "Extiende la mano dominante en forma de C.", video: "videos/Cerial.mp4" },
    { palabra: "Manzana", descripcion: "Extiende la mano abierta sobre la mejilla y frota ligeramente.", video: "videos/Manzana.mp4" },
    { palabra: "Plátano", descripcion: "Simula pelar un plátano con la mano dominante.", video: "videos/Platano.mp4" },
    { palabra: "Jugo de Naranja", descripcion: "Simula beber con una mano y frota la otra sobre la mejilla.", video: "videos/JugoNaranja.mp4" },
];

let index = 0;
const leccionDiv = document.getElementById("leccion");
const btnSiguiente = document.getElementById("btnSiguiente");
const quizDiv = document.getElementById("quiz");
const resultadoDiv = document.getElementById("resultado");
const btnContinuar = document.getElementById("btnContinuar");

function mostrarLeccion(i) {
    const leccion = lecciones[i];
    leccionDiv.querySelector("h2").textContent = `Aprende la palabra: "${leccion.palabra}"`;
    
    const video = leccionDiv.querySelector("#videoLeccion");
    video.src = leccion.video;
    video.load();

    leccionDiv.querySelector("p").textContent = leccion.descripcion;
}

// Avanzar lecciones
btnSiguiente.addEventListener("click", async () => {
    // Guardar progreso de la lección actual
    if (userId) {
        const docRef = doc(db, "perfiles", userId);
        await updateDoc(docRef, { [`progreso_palabras.${lecciones[index].palabra}`]: true });
    }

    index++;
    if (index < lecciones.length) {
        mostrarLeccion(index);
    } else {
        leccionDiv.style.display = "none";
        mostrarQuiz();
    }
});

// Mostrar quiz al final
function mostrarQuiz() {
    quizDiv.style.display = "block";
    quizDiv.innerHTML = `<h2 class="text-2xl font-semibold text-yellow-700 mb-4">Quiz Rápido</h2>
        <p class="text-gray-700 mb-4">Selecciona la seña correcta:</p>
        <div class="grid grid-cols-2 gap-4" id="quiz-opciones"></div>
    `;

    const opcionesDiv = document.getElementById("quiz-opciones");
    const opciones = lecciones.sort(() => 0.5 - Math.random()).slice(0, 4);
    const correcta = opciones[0]; // primera es correcta

    opciones.forEach(op => {
        const video = document.createElement("video");
        video.src = op.video;
        video.width = 150;
        video.height = 150;
        video.controls = true;
        video.className = "cursor-pointer border-2 rounded-lg";
        video.onclick = async () => {
            if (op === correcta) {
                resultadoDiv.textContent = "¡Correcto! 🎉 Nivel completado ✅";
                resultadoDiv.style.color = "green";
                btnContinuar.style.display = "block";

                // Guardar que nivel completado
                if (userId) {
                    const docRef = doc(db, "perfiles", userId);
                    await updateDoc(docRef, { nivel2_completado: true });
                }
            } else {
                resultadoDiv.textContent = "Intenta de nuevo ❌";
                resultadoDiv.style.color = "red";
            }
        };
        opcionesDiv.appendChild(video);
    });
}

// Continuar a la página principal
btnContinuar.addEventListener("click", () => {
    window.location.href = "pagina_inicio.html";
});

// Inicializa primera lección
mostrarLeccion(index);
