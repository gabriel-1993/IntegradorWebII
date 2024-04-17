
// Función para manejar los errores de las promesas
function handleErrors(response) {
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return response.json();
}

// Función para obtener datos de una URL usando fetch
function fetchData(url) {
    return fetch(url)
        .then(handleErrors)
        .catch(error => {
            console.error(`Error fetching ${url}:`, error);
            throw error;
        });
}

// Función para renderizar un producto en la página
function renderProduct(producto, descuentosData, contenedorProductos) {
    const tieneDescuento = descuentosData.descuentos.some(descuento => descuento.id === producto.id);

    const cardProducto = document.createElement('div');
    cardProducto.classList.add('cardProducto');
    // Establecer el atributo data-id con el id del producto: 
    //para poder verificar en la traduccion y asignar el texto traducido solo si coincide
    cardProducto.setAttribute('data-id', producto.id);

    const divImgProducto = document.createElement('div');
    divImgProducto.classList.add('divImgProducto');
    divImgProducto.style.backgroundImage = `url(${producto.image})`;
    cardProducto.appendChild(divImgProducto);

    const h2Producto = document.createElement('h2');
    h2Producto.classList.add('h2Producto');
    h2Producto.textContent = producto.title ;

    const h3Producto = document.createElement('h3');
    h3Producto.classList.add('h3Producto');
    h3Producto.textContent = producto.category;


    const pDescripcionProducto = document.createElement('p');
    pDescripcionProducto.classList.add('pDescripcionProducto');



    const descripcionCorta = producto.description.substring(0, 30) + (producto.description.length > 30 ? '...' : '');
    pDescripcionProducto.textContent = descripcionCorta;

    pDescripcionProducto.addEventListener('mouseenter', () => {
        divImgProducto.style.height = "110px";
        pDescripcionProducto.textContent = producto.description;
    });

    pDescripcionProducto.addEventListener('mouseleave', () => {
        divImgProducto.style.height = "";
        pDescripcionProducto.textContent = descripcionCorta;
    });

    const pPrecioProducto = document.createElement('p');
    pPrecioProducto.classList.add('pPrecioProducto');
    pPrecioProducto.textContent = `Precio: $${producto.price}`;

    // Contenedor para el icono de agregar al carrito
    const divAgregarCarro = document.createElement('div');
    divAgregarCarro.classList.add('divAgregarCarro');
    const iconoCarrito = document.createElement('i');
    iconoCarrito.classList.add('fa-solid', 'fa-cart-plus');
    // IMPORTANTE PARA IDENTIFICAR CARD AL AGREGAR AL CARRO DE COMPRAS
    // Agregar el atributo data-id al elemento <i> con el ID del producto
    iconoCarrito.setAttribute('data-id', producto.id);
    divAgregarCarro.appendChild(iconoCarrito);

    cardProducto.appendChild(h2Producto);
    cardProducto.appendChild(h3Producto);
    cardProducto.appendChild(pDescripcionProducto);
    divAgregarCarro.appendChild(pPrecioProducto);
    cardProducto.appendChild(divAgregarCarro);




    if (tieneDescuento) {

        // Establecer el atributo data-id con el id del producto: 
        //para poder verificar en la traduccion y asignar el texto traducido solo si coincide
        cardProducto.setAttribute('data-id', producto.id);

        cardProducto.classList.add('conDescuento');
        const descuentoPorcentaje = descuentosData.descuentos.find(descuento => descuento.id === producto.id).porcentaje;
        const descuentoValor = (producto.price * descuentoPorcentaje) / 100;
        const precioConDescuento = producto.price - descuentoValor;


        cardProducto.appendChild(pPrecioProducto);

        const valorDescontado = document.createElement('p');
        valorDescontado.classList.add('valorDescontado');
        valorDescontado.textContent = `- ${descuentoValor}`;
        cardProducto.appendChild(valorDescontado);



        const pPrecioConDescuento = document.createElement('p');
        pPrecioConDescuento.classList.add('pPrecioConDescuento');
        pPrecioConDescuento.textContent = `Precio final: $${precioConDescuento.toFixed(2)}`;
        divAgregarCarro.appendChild(pPrecioConDescuento);
        divAgregarCarro.style.order = "10";




        //ETIQUETA ROJA CON EL PORCENTAJE DE DESCUENTO(ESQUINA EN CARD DESCUENTO)
        //  Crear contenedor para el icono de descuento
        const iconoDescuentoContainer = document.createElement('div');
        iconoDescuentoContainer.classList.add('iconoDescuentoContainer');

        // Crear ícono de descuento
        const iconoDescuento = document.createElement('i');
        iconoDescuento.classList.add('fa-solid', 'fa-tag');

        // Crear elemento para el porcentaje de descuento (en color blanco)
        const descuentoNum = document.createElement("span");
        descuentoNum.classList.add("spanDescuento");

        descuentoNum.textContent = `${descuentoPorcentaje}%`;

        // Agregar porcentaje dentro del ícono de descuento
        iconoDescuento.appendChild(descuentoNum);

        // Agregar ícono de descuento al contenedor
        iconoDescuentoContainer.appendChild(iconoDescuento);

        // Agregar contenedor del ícono de descuento al elemento de la imagen del producto
        cardProducto.appendChild(iconoDescuentoContainer);

        //evitar que la etiqueta descuento quede abajo de todo
        // Obtener la referencia al primer hijo de cardProducto
        var primerHijo = cardProducto.firstChild;

        // Insertar iconoDescuentoContainer antes del primer hijo
        cardProducto.insertBefore(iconoDescuentoContainer, primerHijo);

    }

    contenedorProductos.appendChild(cardProducto);
}





// Función principal para cargar productos y descuentos
function cargarProductosYDescuentos(descuentosUrl, apiUrl) {
    const contenedorProductos = document.querySelector('.contenedorProductos');

    Promise.all([fetchData(descuentosUrl), fetchData(apiUrl)])
        .then(([descuentosData, productos]) => {
            productos.forEach(producto => {
                renderProduct(producto, descuentosData, contenedorProductos);
            });

            // Después de renderizar los productos con descuentos, actualizar productos desde el servidor local
            obtenerYActualizarProductos();
        })
        .catch(error => {
            console.error('Error:', error);
        });
}


async function obtenerYActualizarProductos() {
    const url = 'http://localhost:3001/productos';

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error al obtener los productos: ${response.statusText}`);
        }

        const productosES = await response.json();

        const contenedorProductos = document.querySelector('.contenedorProductos');

        // Obtener todas las tarjetas de productos existentes
        const cardsProductosExistente = contenedorProductos.querySelectorAll('.cardProducto');

        // Iterar sobre los productos recibidos desde el servidor local
        productosES.forEach(producto => {
            // Encontrar la tarjeta de producto correspondiente en las tarjetas existentes
            const cardExistente = Array.from(cardsProductosExistente).find(card => {
                // Comparar el ID del producto con el ID almacenado en el atributo de datos (data-id) de la tarjeta existente
                return parseInt(card.dataset.id) === parseInt(producto.id)
            });

            if (cardExistente) {
                // Actualizar los elementos dentro de la tarjeta existente con las traducciones
                const h2Titulo = cardExistente.querySelector('.h2Producto');
                const h3Categoria = cardExistente.querySelector('.h3Producto');
                const pDescripcionProducto = cardExistente.querySelector('.pDescripcionProducto');
                const divImgProducto = cardExistente.querySelector('.divImgProducto');


                if (h2Titulo && h3Categoria && pDescripcionProducto) {
                    h2Titulo.textContent = producto.title_es;
                    h3Categoria.textContent = producto.category_es;

                    const descripcionCorta = producto.description_es.substring(0, 30) + (producto.description_es.length > 30 ? '...' : '');
                    pDescripcionProducto.textContent = descripcionCorta;

                    pDescripcionProducto.addEventListener('mouseenter', () => {
                        divImgProducto.style.height = "110px";
                        pDescripcionProducto.textContent = producto.description_es;
                    });

                    pDescripcionProducto.addEventListener('mouseleave', () => {
                        divImgProducto.style.height = "";
                        pDescripcionProducto.textContent = descripcionCorta;
                    });


                } else {
                    console.warn('Alguno de los elementos de la tarjeta existente no se encontró.');
                }
            } else {
                console.warn('No se encontró la tarjeta existente para el producto:', producto);
            }
        });
    } catch (error) {
        console.error('Error al obtener y renderizar productos:', error);
    }
}

// Uso de las funciones al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const descuentosUrl = 'descuentos.json';
    const apiUrl = 'https://fakestoreapi.com/products';

    cargarProductosYDescuentos(descuentosUrl, apiUrl);

});






