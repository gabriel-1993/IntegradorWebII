

// FUNCION PARA MOSTRAR OCULTAR CARRITO DE COMPRAS.  EFECTO A LOS ELEMENTOS DE ATRAS
function toggleCarrito() {
    const contenedorCarrito = document.querySelector('.contenedorCarrito');
    const divEfectoDifuminado = document.querySelector('.divEfectoDifuminado');

    // Alternar la clase 'visible' en el contenedor del carrito y el fondo difuminado
    contenedorCarrito.classList.toggle('visible');
    divEfectoDifuminado.classList.toggle('visible');
}




// Cerrar carrito y ocultar fondo difuminado al hacer clic en divEfectoDifuminado (fuera del carrito)
const divEfectoDifuminado = document.querySelector('.divEfectoDifuminado');
divEfectoDifuminado.addEventListener('click', () => {
    const contenedorCarrito = document.querySelector('.contenedorCarrito');
    contenedorCarrito.classList.remove('visible');
    divEfectoDifuminado.classList.remove('visible');
});




// Cerrar carrito y fondo difuminado al hacer scroll fuera del carrito
document.addEventListener('scroll', () => {
    const contenedorCarrito = document.querySelector('.contenedorCarrito');
    const divEfectoDifuminado = document.querySelector('.divEfectoDifuminado');
    contenedorCarrito.classList.remove('visible');
    divEfectoDifuminado.classList.remove('visible');
});




// Función para mostrar una notificación al usuario(producto agregado, producto existente,etc...)
function mostrarMensaje(mensaje) {
    const divMensajes = document.querySelector(".divMensajes");

    // Limpiar el contenido anterior del contenedor de mensajes
    divMensajes.innerHTML = "";

    // Crear un elemento <p> para mostrar el mensaje
    const pMsj = document.createElement('p');
    pMsj.textContent = mensaje;

    // Agregar el elemento <p> al contenedor de mensajes
    divMensajes.appendChild(pMsj);

    // Crear el botón "Aceptar" dentro del contenedor de mensajes
    const btnMensaje = document.createElement('button');
    btnMensaje.textContent = "Aceptar";
    btnMensaje.classList.add('btnMensaje'); // Agregar la clase al botón creado dinámicamente
    divMensajes.appendChild(btnMensaje);

    // Mostrar el contenedor de mensajes (puedes agregar estilos CSS para esto)
    divMensajes.classList.add('visible');

    // Agregar evento de clic al botón "Aceptar" para ocultar el mensaje
    btnMensaje.addEventListener('click', () => {
        // Ocultar el contenedor de mensajes
        divMensajes.classList.remove('visible');
    });
}












// Evento para mostrar/ocultar carrito
// AGREGAR PRODUCTO AL CARRITO Y LOCAL STORAGE
document.addEventListener('DOMContentLoaded', async function () {


    // Agregar un evento de clic al icono de carrito para mostrar/ocultar
    const iconoCarrito = document.querySelector('.fa-cart-shopping');
    iconoCarrito.addEventListener('click', toggleCarrito);



    const contenedorProductos = document.querySelector('.contenedorProductos');
    const divCarrito = document.querySelector('.contenedorCarrito');
    const divProductosCarrito = document.querySelector('.divProductosCarrito');

    // Obtener productos del servidor
    async function obtenerProductos() {
        try {
            const response = await fetch('http://localhost:3001/productos');
            if (!response.ok) {
                throw new Error('No se pudo obtener la lista de productos');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error al obtener los productos:', error);
            return []; // Devolver un array vacío en caso de error
        }
    }



    // Función para cargar los descuentos desde el archivo JSON local
    function cargarDescuentos() {
        return fetch('descuentos.json')
            .then(response => response.json())
            .then(data => data.descuentos)
            .catch(error => {
                console.error('Error al cargar los descuentos:', error);
                return [];
            });
    }





    // Función para calcular el precio con descuento
    function calcularPrecioConDescuento(producto, descuentoPorcentaje) {
        const precio = producto.price;
        const descuento = (precio * descuentoPorcentaje) / 100;
        return precio - descuento;
    }




    // Función para agregar un producto al carrito y guardar en localStorage
    async function agregarAlCarrito(producto) {
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        const descuentos = await cargarDescuentos();

        const productoExistente = carrito.find(elemento => elemento.id === producto.id);

        if (!productoExistente) {
            // Verificar si hay un descuento para el producto
            const descuento = descuentos.find(descuento => descuento.id === producto.id);

            if (descuento) {
                const precioConDescuento = calcularPrecioConDescuento(producto, descuento.porcentaje);
                producto.price =  parseFloat(precioConDescuento.toFixed(3));
            }

            // Agregar la propiedad 'cantidad' al producto con un valor de 1
            producto.cantidad = 1;
            carrito.push(producto);
            localStorage.setItem('carrito', JSON.stringify(carrito));
            renderizarCarrito();
            let msj = "Producto agregado con éxito al carrito de compras";
            mostrarMensaje(msj);
        } else {
            let msj = "El producto ya existe en el carrito, puede modificar la cantidad en el carrito de compras.";
            mostrarMensaje(msj);
        }
    }



    try {
        let productos = await obtenerProductos(); // Esperar a que se obtengan los productos

        // Agregar un evento click al contenedor de productos
        contenedorProductos.addEventListener('click', function (event) {

            // Verificar si se hizo clic en un icono de carrito (elemento <i> con clase 'fa-cart-plus')
            if (event.target.classList.contains('fa-cart-plus')) {
                // Obtener el data-id del producto desde el icono de carrito
                const productId = event.target.getAttribute('data-id');

                if (productId) {
                    // Convertir productId a un número entero si es necesario
                    const productIdInt = parseInt(productId, 10);

                    // Buscar el producto en la lista de productos por productIdInt
                    const productoSeleccionado = productos.find(producto => producto.id === productIdInt);

                    if (productoSeleccionado) {
                        // Si se encuentra el producto, agregarlo al carrito
                        agregarAlCarrito(productoSeleccionado);
                    } else {
                        console.log('Producto no encontrado con ID:', productIdInt);
                    }
                }
            }
        });




        // Función para renderizar el contenido del carrito
        function renderizarCarrito() {
            const divBotonesCarrito = document.querySelector('.divBotonesCarrito');
            const btnConfirmarCompra = document.querySelector('.btnConfirmarCompra');
            const btnVaciarCarrito = document.querySelector('.btnVaciarCarrito');
            const divProductosCarrito = document.querySelector('.divProductosCarrito')

            divProductosCarrito.innerHTML = '';


            const carrito = JSON.parse(localStorage.getItem('carrito')) || [];

            // Si el carrito está vacío, mostrar un mensaje
            if (carrito.length === 0) {
                const pCarroVacio = document.createElement('p');
                pCarroVacio.style.color = "#1a1a46";
                pCarroVacio.style.textAlign="center";
                pCarroVacio.style.fontWeight = "600";
                pCarroVacio.style.marginTop="20px";
                pCarroVacio.innerHTML = "Carrito de compras vacío =)";
                divProductosCarrito.appendChild(pCarroVacio);
                divBotonesCarrito.classList.remove('mostrarBtnsCarrito');

                return
            } else {



                // Recorrer carrito del localStorage y agregar al carrito 
                carrito.forEach((producto, index) => {
                    const cardCarrito = document.createElement('div');
                    cardCarrito.classList.add('cardCarrito');
                    cardCarrito.innerHTML = `
                    <img src="${producto.image}" alt="Imagen del producto" class="imgCardCarrito">
                    <div class="divTextoCardCarrito"> 
                        <p class="pCarroTitulo">${producto.title_es}</p>
                        <p class="pCarroCategoria">Categoría: ${producto.category_es}</p>
                    <div>
                    <i class="fa-solid fa-trash" data-index="${index}"></i>
                    <button class="btn-menos" data-index="${index}"> - </button>
                    <span class="spanCantidad">Cantidad: ${producto.cantidad}</span>
                    <button class="btn-mas" data-index="${index}"> + </button> 
                    </div>
                    <p class="pPrecioCardCarrito">Precio: $${producto.price}</p>
                    </div>
                    `;
                    divProductosCarrito.appendChild(cardCarrito);
                });


                // Mostrar total y botones confirmar compra y vaciar carrito
                const divTotal = document.createElement('div');

                // Lógica para calcular y mostrar el total
                const totalCompra = calcularTotal(carrito);
                divTotal.innerHTML = `<p class="pTotalCarrito">Total: $${totalCompra}</p>`;
                divProductosCarrito.appendChild(divTotal);


                divBotonesCarrito.classList.add('mostrarBtnsCarrito');

            }


            // Escuchar eventos de clic en los íconos de eliminar, aumentar y disminuir cantidad
            divProductosCarrito.querySelectorAll('.fa-trash').forEach(icono => {
                icono.addEventListener('click', () => {
                    let msj = "Producto eliminado del carrito de compras";
                    mostrarMensaje(msj);
                    const index = icono.getAttribute('data-index');
                    eliminarProducto(index);
                });
            });

            divProductosCarrito.querySelectorAll('.btn-menos').forEach(btnMenos => {
                btnMenos.addEventListener('click', () => {
                    const index = btnMenos.getAttribute('data-index');
                    modificarCantidad(index, -1); // Restar 1 a la cantidad
                });
            });

            divProductosCarrito.querySelectorAll('.btn-mas').forEach(btnMas => {
                btnMas.addEventListener('click', () => {
                    const index = btnMas.getAttribute('data-index');
                    modificarCantidad(index, 1); // Sumar 1 a la cantidad
                });
            });

        }






        // Función para eliminar un producto del carrito y actualizar el localStorage
        function eliminarProducto(index) {
            let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            carrito.splice(index, 1); // Eliminar el producto del arreglo
            localStorage.setItem('carrito', JSON.stringify(carrito));
            renderizarCarrito(); // Volver a renderizar el carrito
        }



        // Función para modificar la cantidad de un producto en el carrito y actualizar el localStorage
        function modificarCantidad(index, cantidad) {
            let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
            carrito[index].cantidad += cantidad; // Modificar la cantidad del producto
            if (carrito[index].cantidad <= 0) {
                carrito.splice(index, 1); // Si la cantidad llega a 0 o menos, eliminar el producto
            }
            localStorage.setItem('carrito', JSON.stringify(carrito));
            renderizarCarrito(); // Volver a renderizar el carrito
        }

        // Función para calcular el total de la compra
        function calcularTotal(carrito) {
            let total = 0;
            carrito.forEach(producto => {
                total += producto.price * producto.cantidad;
            });
            total = parseFloat(total.toFixed(3));

            return total;
        }

        // VACIAR CARRITO Y LOCALSTORAGE 
        // Seleccionar el botón para vaciar el carrito
        const btnVaciarCarrito = document.querySelector('.btnVaciarCarrito');

        // Agregar evento de clic al botón para vaciar el carrito
        btnVaciarCarrito.addEventListener('click', function () {
            // Vaciar el contenido del localStorage eliminando el ítem 'carrito'
            localStorage.clear();
            let msj = "Su carrito de compras esta vacio";
            mostrarMensaje(msj);
            renderizarCarrito();
            const divBotonesCarrito = document.querySelector(".divBotonesCarrito");
            divBotonesCarrito.classList.remove('mostrarBtnsCarrito');

        });

        renderizarCarrito();

    } catch (error) {
        console.error('Error al cargar la página:', error);
    }
});






// GUARDAR COMPRAS

// GUARDAR COMPRAS
document.addEventListener('DOMContentLoaded', () => {
    const btnConfirmarCompra = document.querySelector('.btnConfirmarCompra');
    if (btnConfirmarCompra) {
        btnConfirmarCompra.addEventListener('click', async (event) => {
            event.preventDefault(); // Prevenir el comportamiento predeterminado del botón
            // Capturar el valor total de la compra desde el elemento HTML
            const pTotal = document.querySelector('.pTotalCarrito');
            let compraTotal = pTotal.innerText;
            // Crear un objeto de compra con la fecha y el total
            const compra = {
                date: new Date(), // Fecha y hora actual
                total: compraTotal // Total de la compra
            };
            // Obtener datos del localStorage
            const datosLocalStorage = JSON.parse(localStorage.getItem('carrito'));
            // Combinar los datos del localStorage con los datos de fecha
            Object.assign(compra, datosLocalStorage);
            // Enviar datos al servidor
            try {
                const response = await fetch('http://localhost:3002/compras', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(compra)
                });

                if (response.ok) {
                    // Vaciar localStorage y carrito de compras
                    localStorage.clear();
                    let msj = "Compra finalizada exitosamente, gracias por elegirnos ";
                    mostrarMensaje(msj);
                } else {
                    console.error('Error al enviar datos al servidor.');
                }
            } catch (error) {
                console.error('Error en la solicitud fetch:', error);
            }
        });
    } else {
        console.error('No se encontró el botón .btnConfirmarCompra en el DOM.');
    }
});












