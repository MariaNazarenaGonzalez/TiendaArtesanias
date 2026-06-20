import { cargarCatalogo } from "./api.js";
import {
    buscarProductos,
    filtrarPorCategoria,
    obtenerCategorias,
    ordenarProductos,
    paginarProductos
} from "./filtros.js";

let productos = [];

/**
 * Loads and stores the current catalog.
 * @returns {Promise<object[]>}
 */
export async function cargarProductos() {
    productos = await cargarCatalogo();
    return obtenerProductos();
}

/**
 * Returns the in-memory product list.
 * @returns {object[]}
 */
export function obtenerProductos() {
    return [...productos];
}

/**
 * Returns one product by ID.
 * @param {string} id
 * @returns {object|undefined}
 */
export function obtenerProductoPorId(id) {
    return productos.find((producto) => String(producto.id) === String(id));
}

/**
 * Returns available product categories.
 * @returns {string[]}
 */
export function obtenerCategoriasCatalogo() {
    return obtenerCategorias(productos);
}

/**
 * Applies search, category, sort and pagination criteria.
 * @param {{busqueda?: string, categoria?: string, orden?: string, pagina?: number, porPagina?: number}} filtros
 * @returns {{items: object[], total: number, totalPaginas: number, paginaActual: number}}
 */
export function consultarCatalogo(filtros = {}) {
    const buscados = buscarProductos(productos, filtros.busqueda);
    const filtrados = filtrarPorCategoria(buscados, filtros.categoria);
    const ordenados = ordenarProductos(filtrados, filtros.orden);
    const pagina = paginarProductos(ordenados, filtros.pagina, filtros.porPagina);

    return {
        ...pagina,
        total: ordenados.length
    };
}
