// diccionario.js

// 1. ESTRUCTURA DE DATOS COMBINADA DE TODOS LOS NIVELES
const diccionarioData = {
    // 🛑 Nivel 1: Abecedario (usando la estructura de tu nivel1.js)
    1: {
        title: "Nivel 1: El Abecedario 🧠",
        color: "text-blue-700",
        items: [
            { nombre: "A", descripcion: "Con la mano cerrada, se muestran las uñas y se estira el dedo pulgar hacia un lado. La palma mira al frente.", imagen: "Letras/Letra A.png" },
            { nombre: "B", descripcion: "Los dedos índice, medio, anular y meñique se estiran bien unidos y el pulgar se dobla hacia la palma, la cual mira al frente.", imagen: "Letras/Letra B.png" },
            { nombre: "C", descripcion: "Los dedos índice, medio, anular y meñique se mantienen bien unidos y en posición cóncava; el pulgar también se pone en esa posición. La palma mira a un lado.", imagen: "Letras/Letra C.png" },
            { nombre: "D", descripcion: "Los dedos medio, anular, meñique y pulgar se unen por las puntas y el dedo índice se estira. La palma mira al frente.", imagen: "Letras/Letra D.png" },
            { nombre: "E", descripcion: "Se doblan los dedos completamente, y se muestran las uñas. La palma mira al frente.", imagen: "Letras/Letra E.png" },
            { nombre: "F", descripcion: "Con la mano abierta y los dedos bien unidos, se dobla el índice hasta que su parte lateral toque la yema del pulgar. La palma mira a un lado.", imagen: "Letras/Letra F.png" },
            { nombre: "G", descripcion: "Se cierra la mano y los dedos índice y pulgar se estiran. La palma mira hacia usted.", imagen: "Letras/Letra G.png" },
            { nombre: "H", descripcion: "Con la mano cerrada y los dedos índice y medio bien estirados y unidos, se extiende el dedo pulgar señalando hacia arriba. La palma mira hacia usted.", imagen: "Letras/Letra H.png" },
            { nombre: "I", descripcion: "Con la mano cerrada, el dedo meñique se estira señalando hacia arriba. La palma se pone de lado.", imagen: "Letras/Letra I.png" },
            { nombre: "J", descripcion: "Con la mano cerrada, el dedo meñique bien estirado señalando hacia arriba y la palma a un lado dibuja una j en el aire.", imagen: "Letras/Letra J.png" },
            { nombre: "K", descripcion: "Se cierra la mano con los dedos índice, medio y pulgar estirados. La yema del pulgar se pone entre el índice y el medio. Se mueve la muñeca hacia arriba.", imagen: "Letras/Letra K.png" },
            { nombre: "L", descripcion: "Con la mano cerrada y los dedos índice y pulgar estirados, se forma una l. La palma mira al frente.", imagen: "Letras/Letra L.png" },
            { nombre: "M", descripcion: "Con la mano cerrada, se ponen los dedos índice, medio y anular sobre el pulgar", imagen: "Letras/Letra M.png" },
            { nombre: "N", descripcion: "Con la mano cerrada, se ponen los dedos índice y medio sobre el pulgar.", imagen: "Letras/Letra N.png" },
            { nombre: "Ñ", descripcion: "Con la mano cerrada, se ponen los dedos índice y medio sobre el pulgar. Se mueve la muñeca a los lados.", imagen: "Letras/Letra Ñ.png" },
            { nombre: "O", descripcion: "Con la mano se forma una letra o. Todos los dedos se tocan por las puntas.", imagen: "Letras/Letra O.png" },
            { nombre: "P", descripcion: "Con la mano cerrada y los dedos índice, medio y pulgar estirados, se pone la yema del pulgar entre el índice y el medio.", imagen: "Letras/Letra P.png" },
            { nombre: "Q", descripcion: "Con la mano cerrada, se ponen los dedos índice y pulgar en posición de garra. La palma mira hacia abajo, y se mueve la muñeca hacia los lados.", imagen: "Letras/Letra Q.png" },
            { nombre: "R", descripcion: "Con la mano cerrada, se estiran y entrelazan los dedos índice y medio. La palma mira al frente.", imagen: "Letras/Letra R.png" },
            { nombre: "S", descripcion: "Con la mano cerrada, se pone el pulgar sobre los otros dedos. La palma mira al frente.", imagen: "Letras/Letra S.png" },
            { nombre: "T", descripcion: "Con la mano cerrada, el pulgar se pone entre el índice y el medio. La palma mira al frente", imagen: "Letras/Letra T.png" },
            { nombre: "U", descripcion: "Con la mano cerrada, se estiran los dedos índice y medio unidos. La palma mira al frente.", imagen: "Letras/Letra U.png" },
            { nombre: "V", descripcion: "Con la mano cerrada, se estiran los dedos índice y medio separados. La palma mira al frente.", imagen: "Letras/Letra V.png" },
            { nombre: "W", descripcion: "Con la mano cerrada, se estiran los dedos índice, medio y anular separados. La palma mira al frente.", imagen: "Letras/Letra W.png" },
            { nombre: "X", descripcion: "Con la mano cerrada, el índice y el pulgar en posición de garra y la palma dirigida a un lado, se realiza un movimiento al frente y de regreso.", imagen: "Letras/Letra X.png" },
            { nombre: "Y", descripcion: "Con la mano cerrada, se estira el meñique y el pulgar. La palma mira hacia usted.", imagen: "Letras/Letra Y.png" },
            { nombre: "Z", descripcion: "Con la mano cerrada, el dedo índice estirado y la palma al frente, se dibuja una letra z en el aire.", imagen: "Letras/Letra Z.png" }
        ]
    },

    // 🛑 Nivel 2: Primeras Palabras (usando la estructura de tu nivel2.js)
    2: {
        title: "Nivel 2: Primeras Palabras 💬",
        color: "text-yellow-700",
        items: [
            { nombre: "Hola", descripcion: "Levanta la mano abierta a la altura de tu frente.", video: "videos/Hola.mp4" },
            { nombre: "Gracias", descripcion: "La punta de los dedos toca la barbilla y se mueve al frente.", video: "videos/Gracias.mp4" },
            // ... [AGREGA AQUÍ TODAS LAS PALABRAS DEL NIVEL 2] ...
        ]
    },
    // 🛑 Nivel 3: Días y Tiempos
    3: {
        title: "Nivel 3: Calendario y Tiempos 📅",
        color: "text-purple-700",
        items: [
            { nombre: "Hoy", descripcion: "Señala hacia abajo con ambas manos abiertas y planas.", imagen: "Tiempos/Hoy.png" },
            { nombre: "Lunes", descripcion: "Forma la letra 'L' y gira la mano en círculo.", imagen: "Tiempos/Lunes.png" },
            // ... [AGREGA AQUÍ TODAS LAS SEÑAS DEL NIVEL 3] ...
        ]
    },
    // 🛑 Nivel 4: Meses y Estaciones
    4: {
        title: "Nivel 4: Meses y Estaciones 🗓️",
        color: "text-indigo-700",
        items: [
            { nombre: "Enero", descripcion: "Letra 'E' seguida de la letra 'R' con un movimiento circular.", imagen: "Meses/Enero.png" },
            { nombre: "Verano", descripcion: "Se desliza el dedo índice desde la frente hasta la barbilla.", imagen: "Estaciones/Verano.png" },
            // ... [AGREGA AQUÍ TODAS LAS SEÑAS DEL NIVEL 4] ...
        ]
    }
    // ... Puedes añadir Nivel 5 aquí ...
};

// 2. REFERENCIAS DEL DOM
const dictionaryModal = document.getElementById('dictionary-modal');
const closeModalButton = document.getElementById('close-dictionary-modal');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');
const levelCards = document.querySelectorAll('.level-card');

// 3. MANEJO DEL MODAL
function closeModal() {
    dictionaryModal.classList.add('hidden');
    modalContent.innerHTML = '';
}

closeModalButton.addEventListener('click', closeModal);

// Cerrar modal al hacer clic fuera
dictionaryModal.addEventListener('click', (e) => {
    if (e.target.id === 'dictionary-modal') {
        closeModal();
    }
});


// 4. FUNCIÓN PRINCIPAL PARA MOSTRAR EL CONTENIDO
function showLevelContent(levelNumber) {
    const levelData = diccionarioData[levelNumber];

    if (!levelData) {
        // ... (Manejo de error) ...
        return;
    }

    modalTitle.textContent = levelData.title;
    modalTitle.className = `text-3xl font-bold mb-6 border-b pb-2 ${levelData.color}`;

    let contentHTML = '';

    levelData.items.forEach(item => {
        // 🛑 CORRECCIÓN: Definimos itemTitle para la consistencia (aunque 'nombre' es consistente)
        const itemTitle = item.nombre;
        const imageSource = item.imagen || item.video; // Obtener la ruta del recurso

        contentHTML += `
            <div class="flex items-start p-4 bg-gray-50 rounded-lg shadow-sm">
                <div class="mr-4 flex-shrink-0">
                    <img src="${imageSource}" 
                         alt="${itemTitle}" 
                         data-img-src="${imageSource}"
                         data-img-title="${itemTitle}"
                         class="w-16 h-16 object-cover rounded-md border border-gray-200 cursor-pointer image-clickable">
                </div>
                <div>
                    <h5 class="text-xl font-semibold text-gray-900">${itemTitle}</h5>
                    <p class="text-gray-600 text-sm">${item.descripcion}</p>
                </div>
            </div>
        `;
    });

    // 🛑 CORRECCIÓN: Inyectar el HTML generado por el bucle
    modalContent.innerHTML = contentHTML;
    dictionaryModal.classList.remove('hidden');

    // 🛑 Código extra movido: Asegurar que el Título Desconocido no rompa la imagen grande
    if (levelNumber === 1) {
        // Si es el nivel 1, la imagen será la fuente de la letra
        modalContent.querySelectorAll('.image-clickable').forEach(img => {
            img.setAttribute('data-img-title', img.alt);
        });
    }
}

// 5. FUNCIÓN PARA MOSTRAR IMAGEN GRANDE (Modal de Ampliación)
function showImageModal(imageUrl, itemTitle) {
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100]';

    const largeImage = document.createElement('img');
    largeImage.src = imageUrl;
    largeImage.alt = itemTitle;
    largeImage.className = 'max-w-[90%] max-h-[90%] rounded-lg shadow-2xl cursor-pointer';

    overlay.appendChild(largeImage);

    overlay.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

    document.body.appendChild(overlay);
}

// 6. ESCUCHAR CLICS GLOBALES

// Escuchar clics en las tarjetas del índice (para abrir el modal)
levelCards.forEach(card => {
    card.addEventListener('click', (e) => {
        const level = e.currentTarget.getAttribute('data-level');
        showLevelContent(parseInt(level));
    });
});

// 🛑 CORRECCIÓN: Escuchar clics en las imágenes (Para la ampliación)
document.addEventListener('click', (e) => {
    // Verifica si el elemento clicado tiene la clase 'image-clickable'
    if (e.target.classList.contains('image-clickable')) {
        const imgSrc = e.target.getAttribute('data-img-src');
        const imgTitle = e.target.getAttribute('data-img-title');

        // Llamar a la función para mostrar la imagen grande
        showImageModal(imgSrc, imgTitle);
    }
});