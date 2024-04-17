document.addEventListener("DOMContentLoaded", () => {
    const etiquetaImagen = document.getElementById('imagen');

    let indexImagen = 0;

    const listaImagenes = [
        './imagenes/1.PNG',
        './imagenes/2.PNG',
        './imagenes/3.PNG',
        './imagenes/4.PNG',
        './imagenes/5.PNG',
        './imagenes/6.PNG'
    ];

    function mostrarImagen() {
        let imagenActual = listaImagenes[indexImagen];
        etiquetaImagen.src = imagenActual;
    }

    function mostrarSiguiente() {
        indexImagen = (indexImagen + 1) % listaImagenes.length;
        mostrarImagen();
    }

    function avanzarAutomatico() {
        setInterval(() => {
            mostrarSiguiente();
        }, 4000); // Cambiar cada 4 segundos (4000 milisegundos)
    }

    // Iniciar el avance automático al cargar el DOM
    // mostrar siguiente para no esperar 4 segundos para ver el carrousel
    mostrarSiguiente();
    avanzarAutomatico();
});
