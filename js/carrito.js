const STORAGE_KEY = "tiendita.carrito";

let carrito = cargarCarrito();

function normalizarItem(producto, cantidad) {
    return {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagen,
        stock: producto.stock,
        cantidad: Math.min(Math.max(Number(cantidad) || 1, 1), producto.stock)
    };
}

/**
 * Adds a product to the cart.
 * @param {object} producto
 * @param {number} cantidad
 * @returns {object[]}
 */
export function agregarProducto(producto, cantidad = 1) {
    if (!producto || producto.stock <= 0) {
        return obtenerProductos();
    }

    const existente = carrito.find((item) => item.id === producto.id);

    if (existente) {
        existente.cantidad = Math.min(existente.cantidad + cantidad, producto.stock);
    } else {
        carrito.push(normalizarItem(producto, cantidad));
    }

    return guardarCarrito();
}

/**
 * Removes a product from the cart.
 * @param {string} id
 * @returns {object[]}
 */
export function eliminarProducto(id) {
    carrito = carrito.filter((item) => String(item.id) !== String(id));
    return guardarCarrito();
}

/**
 * Updates a cart item quantity.
 * @param {string} id
 * @param {number} cantidad
 * @returns {object[]}
 */
export function actualizarCantidad(id, cantidad) {
    carrito = carrito
        .map((item) => {
            if (String(item.id) !== String(id)) {
                return item;
            }

            return {
                ...item,
                cantidad: Math.min(Math.max(Number(cantidad) || 1, 1), item.stock)
            };
        })
        .filter((item) => item.cantidad > 0);

    return guardarCarrito();
}

/**
 * Empties the cart.
 * @returns {object[]}
 */
export function vaciarCarrito() {
    carrito = [];
    return guardarCarrito();
}

/**
 * Persists the cart in localStorage.
 * @returns {object[]}
 */
export function guardarCarrito() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito));
    return obtenerProductos();
}

/**
 * Loads the cart from localStorage.
 * @returns {object[]}
 */
export function cargarCarrito() {
    try {
        const guardado = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(guardado) ? guardado : [];
    } catch {
        return [];
    }
}

/**
 * Calculates the current cart total.
 * @returns {number}
 */
export function calcularTotal() {
    return carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
}

/**
 * Calculates the total amount of units in the cart.
 * @returns {number}
 */
export function calcularCantidad() {
    return carrito.reduce((total, item) => total + item.cantidad, 0);
}

/**
 * Returns cart products.
 * @returns {object[]}
 */
export function obtenerProductos() {
    return [...carrito];
}
