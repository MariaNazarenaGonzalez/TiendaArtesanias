import { CONFIG } from "./config.js";
import { formatearMoneda, normalizarTexto } from "./utilidades.js";

function obtenerNumero() {
    const numero = normalizarTexto(CONFIG.WHATSAPP_NUMBER).replace(/\D/g, "");

    if (!numero) {
        throw new Error("Falta configurar WHATSAPP_NUMBER en js/config.js.");
    }

    return numero;
}

/**
 * Creates a WhatsApp order message.
 * @param {object[]} items
 * @param {number} total
 * @returns {string}
 */
export function crearMensajePedido(items, total) {
    const lineas = items.flatMap((item) => [
        item.nombre,
        `Cantidad: ${item.cantidad}`,
        `Subtotal: ${formatearMoneda(item.precio * item.cantidad, CONFIG.CURRENCY)}`,
        ""
    ]);

    return [
        "Hola.",
        "",
        "Quiero realizar el siguiente pedido.",
        "",
        "--------------------------------",
        "",
        ...lineas,
        "--------------------------------",
        "",
        `TOTAL: ${formatearMoneda(total, CONFIG.CURRENCY)}`,
        "",
        "Nombre:",
        "",
        "Dirección:",
        "",
        "Forma de pago:"
    ].join("\n");
}

/**
 * Creates a generic WhatsApp inquiry message.
 * @param {string} asunto
 * @returns {string}
 */
export function crearMensajeConsulta(asunto = "Quiero hacer una consulta sobre la tienda.") {
    return `Hola. ${normalizarTexto(asunto)}`;
}

/**
 * Creates a WhatsApp product inquiry message.
 * @param {object} producto
 * @returns {string}
 */
export function crearMensajeProducto(producto) {
    return `Hola. Quiero consultar por el producto "${producto.nombre}".`;
}

/**
 * Generates a wa.me URL.
 * @param {string} mensaje
 * @returns {string}
 */
export function generarURL(mensaje) {
    return `https://wa.me/${obtenerNumero()}?text=${encodeURIComponent(mensaje)}`;
}

/**
 * Opens WhatsApp in a new tab.
 * @param {string} mensaje
 * @returns {void}
 */
export function abrirWhatsApp(mensaje) {
    window.open(generarURL(mensaje), "_blank", "noopener,noreferrer");
}
