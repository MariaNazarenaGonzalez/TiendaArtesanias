/**
 * Converts any value into a trimmed string.
 * @param {unknown} value
 * @returns {string}
 */
export function normalizarTexto(value) {
    return String(value ?? "").trim();
}

/**
 * Escapes text before injecting it into HTML.
 * @param {unknown} value
 * @returns {string}
 */
export function escaparHTML(value) {
    return normalizarTexto(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

/**
 * Parses common spreadsheet price formats into a number.
 * @param {unknown} value
 * @returns {number}
 */
export function normalizarPrecio(value) {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
    }

    const texto = normalizarTexto(value)
        .replace(/[^\d,.-]/g, "")
        .replace(/\.(?=\d{3}(\D|$))/g, "")
        .replace(",", ".");

    const precio = Number.parseFloat(texto);
    return Number.isFinite(precio) && precio >= 0 ? precio : 0;
}

/**
 * Parses stock values from a spreadsheet cell.
 * @param {unknown} value
 * @returns {number}
 */
export function normalizarStock(value) {
    const stock = Number.parseInt(normalizarTexto(value), 10);
    return Number.isFinite(stock) && stock > 0 ? stock : 0;
}

/**
 * Converts a Google Drive "share" link (drive.google.com/open?id=... or
 * .../file/d/ID/view) into a direct-image URL that works inside an
 * <img> tag. Any other URL is returned unchanged.
 * @param {unknown} value
 * @returns {string}
 */
export function normalizarImagen(value) {
    const texto = normalizarTexto(value);

    if (!texto || !texto.includes("drive.google.com")) {
        return texto;
    }

    const coincidencia = texto.match(/(?:[?&]id=|\/d\/)([a-zA-Z0-9_-]{10,})/);
    return coincidencia ? `https://drive.google.com/thumbnail?id=${coincidencia[1]}&sz=w1000` : texto;
}

/**
 * Parses visibility values from a spreadsheet cell.
 * @param {unknown} value
 * @returns {boolean}
 */
export function normalizarVisible(value) {
    const texto = normalizarTexto(value).toLowerCase();

    if (!texto) {
        return true;
    }

    return ["si", "sí", "true", "1", "visible", "activo", "activa"].includes(texto);
}

/**
 * Formats a number as store currency.
 * @param {number} value
 * @param {string} currency
 * @returns {string}
 */
export function formatearMoneda(value, currency) {
    const monto = Number(value);

    if (!Number.isFinite(monto) || monto <= 0) {
        return "Consultar";
    }

    return `${currency}${new Intl.NumberFormat("es-AR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(monto)}`;
}

/**
 * Builds a debounced function.
 * @param {Function} callback
 * @param {number} delay
 * @returns {Function}
 */
export function debounce(callback, delay = 250) {
    let timeoutId;

    return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => callback(...args), delay);
    };
}

/**
 * Builds a throttled function.
 * @param {Function} callback
 * @param {number} delay
 * @returns {Function}
 */
export function throttle(callback, delay = 250) {
    let activo = false;

    return (...args) => {
        if (activo) {
            return;
        }

        activo = true;
        callback(...args);
        window.setTimeout(() => {
            activo = false;
        }, delay);
    };
}

/**
 * Checks if a product has the required shape.
 * @param {object} producto
 * @returns {boolean}
 */
export function esProductoValido(producto) {
    return Boolean(
        producto &&
        producto.id &&
        producto.nombre &&
        producto.categoria &&
        producto.precio >= 0 &&
        producto.imagen &&
        producto.stock >= 0
    );
}

function tokenizarClave(value) {
    return normalizarTexto(value)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // quita tildes: "categoría" -> "categoria"
        .split(/[^a-z0-9]+/)
        .filter(Boolean);
}

/**
 * Reads one of several possible spreadsheet column names.
 * Matches the full header first (e.g. "precio"), and falls back to
 * matching a whole word inside a longer header (e.g. a Google Form
 * question like "Precio (solo numeros)" still resolves to "precio").
 * @param {object} row
 * @param {string[]} keys
 * @returns {unknown}
 */
export function leerCampo(row, keys) {
    const columnas = Object.keys(row).map((key) => ({
        original: key,
        tokens: tokenizarClave(key)
    }));

    const candidatos = keys.map((key) => tokenizarClave(key).join(""));

    const porTextoCompleto = candidatos
        .map((candidato) => columnas.find((columna) => columna.tokens.join("") === candidato))
        .find(Boolean);

    if (porTextoCompleto) {
        return row[porTextoCompleto.original];
    }

    const porPalabra = candidatos
        .map((candidato) => columnas.find((columna) => columna.tokens.includes(candidato)))
        .find(Boolean);

    return porPalabra ? row[porPalabra.original] : "";
}

/**
 * Creates a URLSearchParams instance from the current page.
 * @returns {URLSearchParams}
 */
export function obtenerParametrosURL() {
    return new URLSearchParams(window.location.search);
}
