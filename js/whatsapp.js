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
 * Creates a WhatsApp message for a custom order (encargo), with every
 * detail the artisan needs already resolved to speed up the reply.
 * @param {{nombre?: string, prenda?: string, ancho?: string|number, largo?: string|number, lana?: string, telar?: string, colores?: string, detalles?: string, descripcion?: string}} datos
 * @returns {string}
 */
export function crearMensajeEncargo(datos) {
    const nombre = normalizarTexto(datos.nombre);
    const prenda = normalizarTexto(datos.prenda);
    const ancho = normalizarTexto(datos.ancho);
    const largo = normalizarTexto(datos.largo);
    const lana = normalizarTexto(datos.lana);
    const telar = normalizarTexto(datos.telar);
    const colores = normalizarTexto(datos.colores);
    const detalles = normalizarTexto(datos.detalles);
    const descripcion = normalizarTexto(datos.descripcion);

    const lineas = [
        "Hola. Quiero hacer un encargo a medida.",
        "",
        `Tipo de prenda: ${prenda}`,
        `Medidas: ${ancho} cm de ancho x ${largo} cm de largo`,
        `Tipo de lana: ${lana}`,
        `Tipo de telar: ${telar}`,
        `Colores: ${colores}`,
        `Detalles: ${detalles}`
    ];

    if (descripcion) {
        lineas.push(`Descripcion: ${descripcion}`);
    }

    lineas.push("", `Nombre: ${nombre}`);

    return lineas.join("\n");
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
