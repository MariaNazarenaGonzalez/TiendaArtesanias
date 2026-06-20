import { CONFIG } from "./config.js";
import {
    esProductoValido,
    leerCampo,
    normalizarPrecio,
    normalizarStock,
    normalizarTexto,
    normalizarVisible
} from "./utilidades.js";

function construirEndpoint() {
    const sheetId = normalizarTexto(CONFIG.SHEET_ID);
    const sheetName = normalizarTexto(CONFIG.SHEET_NAME);

    if (!sheetId || !sheetName) {
        throw new Error("Falta configurar SHEET_ID o SHEET_NAME en js/config.js.");
    }

    return `https://opensheet.elk.sh/${encodeURIComponent(sheetId)}/${encodeURIComponent(sheetName)}`;
}

function transformarProducto(row, index) {
    const producto = {
        id: normalizarTexto(leerCampo(row, ["id", "ID"])) || `producto-${index + 1}`,
        nombre: normalizarTexto(leerCampo(row, ["nombre", "name", "producto"])),
        descripcion: normalizarTexto(leerCampo(row, ["descripcion", "descripción", "description"])),
        categoria: normalizarTexto(leerCampo(row, ["categoria", "categoría", "category"])) || "General",
        precio: normalizarPrecio(leerCampo(row, ["precio", "price"])),
        imagen: normalizarTexto(leerCampo(row, ["imagen", "image", "foto", "image_url"])),
        stock: normalizarStock(leerCampo(row, ["stock", "cantidad", "quantity"])),
        visible: normalizarVisible(leerCampo(row, ["visible", "activo", "publicado"]))
    };

    if (!esProductoValido(producto)) {
        console.warn("Producto descartado por datos faltantes o invalidos.", producto);
        return null;
    }

    return producto;
}

async function leerRespuesta(response) {
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error("No se pudo cargar el catalogo desde Google Sheets.");
    }

    if (!Array.isArray(payload)) {
        throw new Error("La respuesta de OpenSheet no tiene el formato esperado.");
    }

    return payload;
}

/**
 * Loads products from the configured public Google Sheet through OpenSheet.
 * @returns {Promise<object[]>}
 */
export async function cargarCatalogo() {
    try {
        const response = await fetch(construirEndpoint());
        const rows = await leerRespuesta(response);

        return rows
            .map(transformarProducto)
            .filter(Boolean)
            .filter((producto) => producto.visible);
    } catch (error) {
        throw new Error(error.message || "Error inesperado al cargar el catalogo.");
    }
}
