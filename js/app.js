import {
    agregarProducto,
    actualizarCantidad,
    calcularCantidad,
    calcularTotal,
    eliminarProducto,
    obtenerProductos as obtenerItemsCarrito,
    vaciarCarrito
} from "./carrito.js";
import {
    cargarProductos,
    consultarCatalogo,
    obtenerCategoriasCatalogo,
    obtenerProductoPorId
} from "./catalogo.js";
import { obtenerPaginaActual } from "./router.js";
import { debounce, obtenerParametrosURL } from "./utilidades.js";
import {
    actualizarContadorCarrito,
    mostrarNotificacion,
    renderCarrito,
    renderCategorias,
    renderDestacados,
    renderDetalleProducto,
    renderEmpty,
    renderError,
    renderLoader,
    renderPaginacion,
    renderProductos
} from "./ui.js";
import {
    abrirWhatsApp,
    crearMensajeConsulta,
    crearMensajePedido,
    crearMensajeProducto
} from "./whatsapp.js";

const estadoCatalogo = {
    busqueda: "",
    categoria: "",
    orden: "nombre",
    pagina: 1,
    porPagina: 9
};

function actualizarCarritoHeader() {
    actualizarContadorCarrito(calcularCantidad());
}

function obtenerProductoDesdeEvento(event) {
    const button = event.target.closest("[data-add-to-cart], [data-product-inquiry]");
    const id = button?.dataset.addToCart || button?.dataset.productInquiry;
    return id ? obtenerProductoPorId(id) : null;
}

function vincularAccionesCatalogo(root = document) {
    root.addEventListener("click", (event) => {
        const producto = obtenerProductoDesdeEvento(event);

        if (!producto) {
            return;
        }

        if (event.target.closest("[data-product-inquiry]")) {
            abrirWhatsApp(crearMensajeProducto(producto));
            return;
        }

        const cantidadInput = document.querySelector("[data-detail-quantity]");
        const cantidad = cantidadInput ? Number(cantidadInput.value) : 1;
        agregarProducto(producto, cantidad);
        actualizarCarritoHeader();
        mostrarNotificacion("Producto agregado al carrito.");
    });
}

function renderizarConsultaCatalogo() {
    const grid = document.querySelector("[data-products-grid]");
    const paginacion = document.querySelector("[data-pagination]");
    const resultado = consultarCatalogo(estadoCatalogo);

    renderProductos(grid, resultado.items);
    renderPaginacion(paginacion, resultado.paginaActual, resultado.totalPaginas);
}

function inicializarFiltros() {
    const search = document.querySelector("[data-search]");
    const category = document.querySelector("[data-category]");
    const sort = document.querySelector("[data-sort]");
    const pagination = document.querySelector("[data-pagination]");

    renderCategorias(category, obtenerCategoriasCatalogo());

    search?.addEventListener("input", debounce((event) => {
        estadoCatalogo.busqueda = event.target.value;
        estadoCatalogo.pagina = 1;
        renderizarConsultaCatalogo();
    }, 250));

    category?.addEventListener("change", (event) => {
        estadoCatalogo.categoria = event.target.value;
        estadoCatalogo.pagina = 1;
        renderizarConsultaCatalogo();
    });

    sort?.addEventListener("change", (event) => {
        estadoCatalogo.orden = event.target.value;
        estadoCatalogo.pagina = 1;
        renderizarConsultaCatalogo();
    });

    pagination?.addEventListener("click", (event) => {
        const button = event.target.closest("[data-page-number]");

        if (!button) {
            return;
        }

        estadoCatalogo.pagina = Number(button.dataset.pageNumber);
        renderizarConsultaCatalogo();
    });
}

async function inicializarInicio() {
    const container = document.querySelector("[data-featured-products]");
    renderLoader(container, "Cargando piezas destacadas...");

    try {
        const productos = await cargarProductos();
        renderDestacados(container, productos);
    } catch (error) {
        renderError(container, error.message);
    }
}

async function inicializarCatalogo() {
    const grid = document.querySelector("[data-products-grid]");
    renderLoader(grid, "Cargando catalogo...");

    try {
        await cargarProductos();
        inicializarFiltros();
        renderizarConsultaCatalogo();
    } catch (error) {
        renderError(grid, error.message);
    }
}

async function inicializarProducto() {
    const container = document.querySelector("[data-product-detail]");
    const id = obtenerParametrosURL().get("id");
    renderLoader(container, "Cargando producto...");

    try {
        await cargarProductos();
        const producto = obtenerProductoPorId(id);

        if (!producto) {
            renderEmpty(container, "No encontramos el producto solicitado.");
            return;
        }

        renderDetalleProducto(container, producto);
    } catch (error) {
        renderError(container, error.message);
    }
}

function renderizarCarrito() {
    renderCarrito(
        document.querySelector("[data-cart-container]"),
        obtenerItemsCarrito(),
        calcularTotal()
    );
    actualizarCarritoHeader();
}

function inicializarCarrito() {
    const container = document.querySelector("[data-cart-container]");
    const checkout = document.querySelector("[data-checkout]");
    const clear = document.querySelector("[data-clear-cart]");

    renderizarCarrito();

    container?.addEventListener("input", (event) => {
        const input = event.target.closest("[data-cart-quantity]");

        if (!input) {
            return;
        }

        actualizarCantidad(input.dataset.cartQuantity, Number(input.value));
        renderizarCarrito();
    });

    container?.addEventListener("click", (event) => {
        const button = event.target.closest("[data-remove-from-cart]");

        if (!button) {
            return;
        }

        eliminarProducto(button.dataset.removeFromCart);
        renderizarCarrito();
    });

    clear?.addEventListener("click", () => {
        vaciarCarrito();
        renderizarCarrito();
    });

    checkout?.addEventListener("click", () => {
        const items = obtenerItemsCarrito();

        if (!items.length) {
            mostrarNotificacion("Agrega productos antes de finalizar.");
            return;
        }

        abrirWhatsApp(crearMensajePedido(items, calcularTotal()));
    });
}

function inicializarContacto() {
    const form = document.querySelector("[data-contact-form]");

    form?.addEventListener("submit", (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const nombre = data.get("nombre")?.toString().trim();
        const mensaje = data.get("mensaje")?.toString().trim();
        const asunto = nombre ? `Soy ${nombre}. ${mensaje}` : mensaje;

        abrirWhatsApp(crearMensajeConsulta(asunto));
    });
}

/**
 * Initializes the store according to the current page.
 * @returns {Promise<void>}
 */
export async function inicializarTienda() {
    actualizarCarritoHeader();
    vincularAccionesCatalogo();

    const pagina = obtenerPaginaActual();
    const inicializadores = {
        inicio: inicializarInicio,
        catalogo: inicializarCatalogo,
        producto: inicializarProducto,
        carrito: inicializarCarrito,
        contacto: inicializarContacto
    };

    await inicializadores[pagina]?.();
}

document.addEventListener("DOMContentLoaded", () => {
    inicializarTienda().catch((error) => {
        console.error(error);
        mostrarNotificacion("Ocurrio un error al iniciar la tienda.");
    });
});
