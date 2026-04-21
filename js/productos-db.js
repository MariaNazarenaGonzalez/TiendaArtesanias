(function () {
    const WHATSAPP_CONFIG = {
        // Completá con tus datos de Meta/WhatsApp Cloud API
        // Ejemplo: '123456789012345'
        catalogId: '',
        // Token permanente/sistema con permisos sobre el catálogo
        accessToken: '',
        // Opcional: usado para link directo a compra por WhatsApp
        phoneNumber: '5491100000000'
    };


    const PRODUCTOS_POR_DEFECTO = [
        {
            id: 1,
            nombre: 'Poncho Pampa Tradicional',
            precio: '$85.000',
            descripcion: 'Lana de oveja hilada a mano. Diseño clásico con guarda pampa en tonos rojizos. Pesado y muy abrigado.',
            imagen: 'Imagenes/Captura1.png',
            linkCatalogo: ''
        },
        {
            id: 2,
            nombre: 'Ruana Norteña Tierra',
            precio: '$62.000',
            descripcion: 'Mezcla de lana de llama y oveja. Colores naturales sin teñir (crudo y marrón). Caída liviana y suave.',
            imagen: 'Imagenes/Captura2.png',
            linkCatalogo: ''
        },
        {
            id: 3,
            nombre: 'Poncho Corto Gris Perla',
            precio: '$70.000',
            descripcion: '100% lana merino fina. Ideal para media estación, súper suave al tacto y elegante.',
            imagen: 'Imagenes/Captura3.png',
            linkCatalogo: ''
        }
    ];


    function formatearPrecio(precio, moneda) {
        const valor = Number(precio || 0);
        if (!Number.isFinite(valor) || valor <= 0) {
            return 'Consultar precio';
        }

        const normalizado = valor >= 1000 ? valor / 100 : valor;
        try {
            return new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: moneda || 'ARS',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(normalizado);
        } catch {
            return `$${normalizado}`;
        }
    }

    function mapearProductoWhatsApp(producto) {
        return {
            id: producto.id,
            nombre: producto.name || 'Producto sin nombre',
            precio: formatearPrecio(producto.price, producto.currency),
            descripcion: producto.description || 'Sin descripción disponible.',
            imagen: producto.image_url || 'Imagenes/Captura1.png',
            linkCatalogo: producto.url || ''
        };
    }

    async function listarProductosDesdeWhatsApp() {
        if (!WHATSAPP_CONFIG.catalogId || !WHATSAPP_CONFIG.accessToken) {
            throw new Error('Falta configurar catalogId/accessToken de WhatsApp.');
        }

        const endpoint = `https://graph.facebook.com/v23.0/${WHATSAPP_CONFIG.catalogId}/products?fields=id,name,description,price,currency,image_url,url`;

        const respuesta = await fetch(endpoint, {
            headers: {
                Authorization: `Bearer ${WHATSAPP_CONFIG.accessToken}`
            }
        });

        const payload = await respuesta.json().catch(() => ({}));
        if (!respuesta.ok) {
            const detalle = payload?.error?.message || 'No se pudo consultar el catálogo de WhatsApp.';
            throw new Error(detalle);
        }

        const productos = Array.isArray(payload?.data) ? payload.data : [];
        return productos.map(mapearProductoWhatsApp);
    }

    async function listarProductos() {
        try {
            const productos = await listarProductosDesdeWhatsApp();
            if (productos.length > 0) {
                return productos;
            }
        } catch (error) {
            console.warn('No se pudo leer catálogo de WhatsApp, se usa catálogo local de respaldo.', error.message);
        }

        return PRODUCTOS_POR_DEFECTO;
    }

    async function agregarProducto() {
        throw new Error('Alta deshabilitada: los productos se gestionan desde el catálogo de WhatsApp.');
    }

    async function eliminarProducto() {
        throw new Error('Baja deshabilitada: los productos se gestionan desde el catálogo de WhatsApp.');
    }

    window.ProductosDB = {
        listarProductos,
        agregarProducto,
        eliminarProducto
    };
})();

