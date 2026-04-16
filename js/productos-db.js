(function () {
    const DB_NAME = 'tiendaArtesaniasDB';
    const DB_VERSION = 1;
    const STORE_NAME = 'productos';

    const PRODUCTOS_POR_DEFECTO = [
        {
            id: 1,
            nombre: 'Poncho Pampa Tradicional',
            precio: '$85.000',
            descripcion: 'Lana de oveja hilada a mano. Diseño clásico con guarda pampa en tonos rojizos. Pesado y muy abrigado.',
            imagen: 'Imagenes/Captura1.png'
        },
        {
            id: 2,
            nombre: 'Ruana Norteña Tierra',
            precio: '$62.000',
            descripcion: 'Mezcla de lana de llama y oveja. Colores naturales sin teñir (crudo y marrón). Caída liviana y suave.',
            imagen: 'https://images.unsplash.com/photo-1605001011155-25efb0193185?auto=format&fit=crop&w=600&q=80'
        },
        {
            id: 3,
            nombre: 'Poncho Corto Gris Perla',
            precio: '$70.000',
            descripcion: '100% lana merino fina. Ideal para media estación, súper suave al tacto y elegante.',
            imagen: 'https://images.unsplash.com/photo-1520986603414-998845fc6596?auto=format&fit=crop&w=600&q=80'
        }
    ];

    function abrirDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    function ejecutarTransaccion(modo, operacion) {
        return abrirDB().then((db) => new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, modo);
            const store = tx.objectStore(STORE_NAME);
            const request = operacion(store);

            tx.oncomplete = () => resolve(request?.result);
            tx.onerror = () => reject(tx.error);
            tx.onabort = () => reject(tx.error);
        }));
    }

    function contarProductos() {
        return ejecutarTransaccion('readonly', (store) => store.count());
    }

    function agregarVarios(productos) {
        return ejecutarTransaccion('readwrite', (store) => {
            productos.forEach((producto) => store.put(producto));
            return null;
        });
    }

    function asegurarCatalogoInicial() {
        return contarProductos().then((cantidad) => {
            if (cantidad === 0) {
                return agregarVarios(PRODUCTOS_POR_DEFECTO);
            }
            return null;
        });
    }

    function listarProductos() {
        return asegurarCatalogoInicial()
            .then(() => ejecutarTransaccion('readonly', (store) => store.getAll()))
            .then((productos) => productos.sort((a, b) => b.id - a.id));
    }

    function agregarProducto(producto) {
        const productoConId = {
            ...producto,
            id: Date.now()
        };

        return ejecutarTransaccion('readwrite', (store) => store.put(productoConId))
            .then(() => productoConId);
    }

    function eliminarProducto(id) {
        return ejecutarTransaccion('readwrite', (store) => store.delete(id))
            .then(() => id);
    }

    window.ProductosDB = {
        listarProductos,
        agregarProducto,
        eliminarProducto
    };
})();
