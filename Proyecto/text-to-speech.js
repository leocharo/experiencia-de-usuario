// --- TEXT-TO-SPEECH (Web Speech API) ---
// API nativa del navegador (W3C Web Speech API), sin costo, sin backend,
// sin API key. Se usa para leer en voz alta las instrucciones de examen,
// mejorando la accesibilidad de la plataforma "Mis Manos Hablarán".

let vozActual = null; // referencia a la voz en español que encontremos

// Busca y guarda una voz en español apenas el navegador las tenga listas.
// (Las voces cargan de forma asíncrona en algunos navegadores, por eso
// escuchamos el evento 'voiceschanged').
function cargarVozEspanol() {
    const voces = speechSynthesis.getVoices();
    vozActual =
        voces.find(v => v.lang === 'es-MX') ||
        voces.find(v => v.lang.startsWith('es')) ||
        null;
}

if ('speechSynthesis' in window) {
    cargarVozEspanol();
    speechSynthesis.onvoiceschanged = cargarVozEspanol;
}

/**
 * Lee en voz alta el texto recibido.
 * @param {string} texto - El texto a leer (ej. instrucciones del examen).
 */
function leerTexto(texto) {
    if (!('speechSynthesis' in window)) {
        alert('Tu navegador no soporta lectura de voz. Prueba con Chrome o Edge.');
        return;
    }

    // Si ya está leyendo algo, lo detenemos antes de iniciar una lectura nueva
    // (evita que se encimen dos audios si el usuario da clic varias veces).
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(texto);
    utterance.lang = 'es-MX';
    if (vozActual) utterance.voice = vozActual;
    utterance.rate = 0.95;   // velocidad (1 = normal)
    utterance.pitch = 1;     // tono de voz

    speechSynthesis.speak(utterance);
}

/**
 * Detiene cualquier lectura en curso.
 */
function detenerLectura() {
    speechSynthesis.cancel();
}

// Se exponen globalmente para poder llamarlas desde el HTML con onclick="leerTexto(...)"
window.leerTexto = leerTexto;
window.detenerLectura = detenerLectura;