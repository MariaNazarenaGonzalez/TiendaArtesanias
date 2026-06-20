import { normalizarTexto } from "./utilidades.js";

/**
 * Searches products by name, description or category.
 * @param {object[]} productos
 * @param {string} termino
 * @returns {object[]}
 */
export function buscarProductos(productos, termino) {
    const busqueda = normalizarTexto(termino).toLowerCase();

    if (!busqueda) {
        return [...productos];
    }

    return productos.filter((producto) => {
        const campos = [producto.nombre, producto.descripcion, producto.categoria].join(" ").toLowerCase();
        return campos.includes(busqueda);
    });
}

/**
 * Filters products by category.
 * @param {object[]} productos
 * @param {string} categoria
 * @returns {object[]}
 */
export function filtrarPorCategoria(productos, categoria) {
    const seleccionada = normalizarTexto(categoria);

    if (!seleccionada) {
        return [...productos];
    }

    return productos.filter((producto) => producto.categoria === seleccionada);
}

/**
 * Sorts products by a supported sort option.
 * @param {object[]} productos
 * @param {string} orden
 * @returns {object[]}
 */
export function ordenarProductos(productos, orden) {
    const ordenados = [...productos];

    const comparadores = {
        nombre: (a, b) => a.nombre.localeCompare(b.nombre, "es"),
        precioAsc: (a, b) => a.precio - b.precio,
        precioDesc: (a, b) => b.precio - a.precio,
        stock: (a, b) => b.stock - a.stock
    };

    return ordenados.sort(comparadores[orden] || comparadores.nombre);
}

/**
 * Returns unique product categories.
 * @param {object[]} productos
 * @returns {string[]}
 */
export function obtenerCategorias(productos) {
    return [...new Set(productos.map((producto) => producto.categoria))].sort((a, b) => a.localeCompare(b, "es"));
}

/**
 * Returns one page from a product list.
 * @param {object[]} productos
 * @param {number} pagina
 * @param {number} porPagina
 * @returns {{items: object[], totalPaginas: number, paginaActual: number}}
 */
export function paginarProductos(productos, pagina = 1, porPagina = 9) {
    const totalPaginas = Math.max(1, Math.ceil(productos.length / porPagina));
    const paginaActual = Math.min(Math.max(Number(pagina) || 1, 1), totalPaginas);
    const inicio = (paginaActual - 1) * porPagina;

    return {
        items: productos.slice(inicio, inicio + porPagina),
        totalPaginas,
        paginaActual
    };
}
