// nivel1.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// Configuración Firebase
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
    else window.location.href = "index.html";
});

// Lista de letras
const letras = [
    { letra: "A", descripcion: "Cierra el puño dejando el pulgar a un lado." },
    { letra: "B", descripcion: "Extiende los dedos juntos, pulgar cruzado sobre la palma." },
    { letra: "C", descripcion: "Forma una 'C' con la mano." },
    { letra: "D", descripcion: "Levanta el índice y toca con la punta del pulgar, otros dedos cerrados." },
    { letra: "E", descripcion: "Cierra la mano con los dedos tocando la base del pulgar." },
    { letra: "F", descripcion: "Une la punta del pulgar con el índice formando un círculo, otros dedos extendidos." },
    { letra: "G", descripcion: "Extiende el índice paralelo al pulgar, otros dedos cerrados." },
    { letra: "H", descripcion: "Extiende índice y medio juntos, otros dedos cerrados." },
    { letra: "I", descripcion: "Levanta el meñique, otros dedos cerrados." },
    { letra: "J", descripcion: "Traza una 'J' en el aire con el meñique, otros dedos cerrados." },
    { letra: "K", descripcion: "Extiende índice y medio en 'V', pulgar entre medio y base del índice." },
    { letra: "L", descripcion: "Forma una 'L' con índice y pulgar." },
    { letra: "M", descripcion: "Coloca el pulgar debajo de tres dedos, meñique arriba." },
    { letra: "N", descripcion: "Coloca el pulgar debajo de dos dedos, otros dos arriba." },
    { letra: "O", descripcion: "Forma un círculo con todos los dedos tocándose." },
    { letra: "P", descripcion: "Como la 'K', pero la mano apuntando hacia abajo." },
    { letra: "Q", descripcion: "Extiende el pulgar e índice hacia abajo, otros dedos cerrados." },
    { letra: "R", descripcion: "Cruza índice sobre medio, otros dedos cerrados." },
    { letra: "S", descripcion: "Cierra la mano con pulgar delante de los dedos." },
    { letra: "T", descripcion: "Coloca el pulgar entre índice y medio, otros dedos cerrados." },
    { letra: "U", descripcion: "Extiende índice y medio juntos, otros dedos cerrados." },
    { letra: "V", descripcion: "Extiende índice y medio formando 'V'." },
    { letra: "W", descripcion: "Extiende índice, medio y anular formando 'W'." },
    { letra: "X", descripcion: "Dobla el índice en gancho, otros dedos cerrados." },
    { letra: "Y", descripcion: "Extiende pulgar y meñique, otros dedos cerrados." },
    { letra: "Z", descripcion: "Dibuja una 'Z' en el aire con el índice, otros dedos cerrados." }
];

let index = 0;

const leccionDiv = document.getElementById("leccion");
const btnSiguiente = document.getElementById("btnSiguiente");
const quizDiv = document.getElementById("quiz");
const quizImg = document.getElementById("quiz-img");
const quizOpciones = document.getElementById("quiz-opciones");
const resultadoDiv = document.getElementById("resultado");
const btnContinuar = document.getElementById("btnContinuar");

function mostrarLetra() {
    const letraObj = letras[index];
    leccionDiv.querySelector("h2").textContent = `Letra ${letraObj.letra}`;
    leccionDiv.querySelector("img").src = `Letras/Letra ${letraObj.letra}.png`;
    leccionDiv.querySelector("p").textContent = letraObj.descripcion;
}

// Inicia mini quiz
function iniciarQuiz() {
    const letraCorrecta = letras[Math.floor(Math.random() * letras.length)];
    quizImg.src = `Letras/Letra ${letraCorrecta.letra}.png`;
    quizOpciones.innerHTML = "";

    const opciones = [letraCorrecta.letra];
    while (opciones.length < 4) {
        const letraRandom = letras[Math.floor(Math.random() * letras.length)].letra;
        if (!opciones.includes(letraRandom)) opciones.push(letraRandom);
    }

    opciones.sort(() => 0.5 - Math.random());

    opciones.forEach(op => {
        const btn = document.createElement("button");
        btn.textContent = op;
        btn.className = "bg-blue-500 text-white rounded-xl px-4 py-2 hover:bg-blue-600 transition duration-200";
        btn.onclick = () => verificarRespuesta(op === letraCorrecta.letra);
        quizOpciones.appendChild(btn);
    });
}

// Verifica respuesta del quiz
async function verificarRespuesta(correcto) {
    if (correcto) {
        // Mostrar mensaje de nivel completado
        const mensaje = document.createElement("div");
        mensaje.textContent = "🎉 Nivel 1 completado ✅";
        Object.assign(mensaje.style, {
            position: "fixed",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#22c55e",
            color: "#fff",
            fontSize: "2rem",
            padding: "1.5rem 2rem",
            borderRadius: "1rem",
            boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
            zIndex: "9999",
            textAlign: "center"
        });
        document.body.appendChild(mensaje);

        // Guardar progreso en Firestore (opcional)
        if (userId) {
            try {
                const docRef = doc(db, "perfiles", userId);
                await updateDoc(docRef, { nivel1_completado: true });
            } catch (error) {
                console.error("Error guardando progreso:", error);
            }
        }

        // Redirigir después de 2 segundos
        setTimeout(() => window.location.href = "pagina_inicio.html", 2000);
    } else {
        resultadoDiv.textContent = "Intenta de nuevo ❌";
        resultadoDiv.style.color = "red";
    }
}

btnSiguiente.addEventListener("click", () => {
    if (index < letras.length - 1) {
        index++;
        mostrarLetra();
    } else {
        // Terminar lecciones y mostrar quiz
        leccionDiv.style.display = "none";
        quizDiv.style.display = "block";
        iniciarQuiz();
    }
});

// Mostrar la primera letra al cargar
mostrarLetra();
