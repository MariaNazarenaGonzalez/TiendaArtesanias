/**
 * Returns the page name declared in the document body.
 * @returns {string}
 */
export function obtenerPaginaActual() {
    return document.body.dataset.page || "inicio";
}

/**
 * Navigates to a product detail page.
 * @param {string} id
 * @returns {void}
 */
export function irAProducto(id) {
    window.location.href = `producto.html?id=${encodeURIComponent(id)}`;
}

/**
 * Navigates to the cart page.
 * @returns {void}
 */
export function irACarrito() {
    window.location.href = "carrito.html";
}
