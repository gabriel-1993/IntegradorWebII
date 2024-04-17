



const axios = require('axios');
const express = require('express');
const cors = require('cors');
const translate = require('node-google-translate-skidz');

const app = express();
const port = 3001;

async function dynamicTranslate(textToTranslate) {
    const translation = await translate({
        text: `${textToTranslate}`,
        source: 'en',
        target: 'es'
    });
    return translation.translation;
}

// Habilitar CORS para todas las rutas
app.use(cors());

// Endpoint para obtener productos desde la API
app.get('/productos', async (req, res) => {
    const apiUrl = 'https://fakestoreapi.com/products';

    try {
        const response = await axios.get(apiUrl);

        if (response.status !== 200) {
            throw new Error('La solicitud a la API falló.');
        }

        const productos = response.data;

        // Traducir títulos y descripciones al español
        for (let producto of productos) {
            // Traduce el título
            producto.title_es = await dynamicTranslate(producto.title);

            // Traduce la categoría (si existe)
            if (producto.category) {
                producto.category_es = await dynamicTranslate(producto.category);
            }

            // Traduce la descripción (si existe)
            if (producto.description) {
                producto.description_es = await dynamicTranslate(producto.description);
            }
        }

        res.json(productos); // Devuelve los productos traducidos como respuesta JSON
    } catch (error) {
        console.error('Error al obtener los productos:', error.message);
        res.status(500).send('Error al obtener los productos desde la API.');
    }
});

// Inicia el servidor y escucha en el puerto especificado
app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
});










const fs = require('fs');
const port2 = 3002;

app.use(express.json());

// Ruta para recibir datos de compras desde el cliente y guardarlos en un archivo
app.post('/compras', (req, res) => {
    const nuevaCompra = req.body; // Obtener los datos enviados desde el cliente

    const nombreArchivo = 'comprasConfirmadas.json';

    // Cargar las compras anteriores si existen
    let comprasAnteriores = [];
    try {
        const jsonData = fs.readFileSync(nombreArchivo, 'utf8');
        if (jsonData.trim() !== '') { // Verificar si el archivo no está vacío
            comprasAnteriores = JSON.parse(jsonData);
        }
    } catch (err) {
        console.error('Error al cargar el archivo de compras:', err);
    }

    // Asignar la fecha y hora actual a la nueva compra
    nuevaCompra.date = new Date();

    // Agregar la nueva compra a las compras anteriores
    comprasAnteriores.push(nuevaCompra);

    // Guardar las compras actualizadas en el archivo JSON
    guardarDatosEnArchivo(comprasAnteriores, nombreArchivo);

    res.send('Datos de compras recibidos y guardados correctamente en el servidor.');
});

// Función para guardar datos en un archivo JSON
function guardarDatosEnArchivo(datos, nombreArchivo) {
    // Convertir datos a formato JSON
    const jsonData = JSON.stringify(datos, null, 2); // null, 2 para formatear con 2 espacios de sangría

    // Escribir en el archivo
    fs.writeFile(nombreArchivo, jsonData, 'utf8', (err) => {
        if (err) {
            console.error('Error al guardar el archivo:', err);
        } else {
            console.log('Archivo de compras guardado correctamente.');
        }
    });
}

// Iniciar el servidor
app.listen(port2, () => {
    console.log(`Servidor escuchando en http://localhost:${port2}`);
});































