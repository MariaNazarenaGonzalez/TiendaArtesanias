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

/**
 * Reads one of several possible spreadsheet column names.
 * @param {object} row
 * @param {string[]} keys
 * @returns {unknown}
 */
export function leerCampo(row, keys) {
    const normalizados = Object.entries(row).reduce((acc, [key, value]) => {
        acc[normalizarTexto(key).toLowerCase()] = value;
        return acc;
    }, {});

    const encontrado = keys.find((key) => key.toLowerCase() in normalizados);
    return encontrado ? normalizados[encontrado.toLowerCase()] : "";
}

/**
 * Creates a URLSearchParams instance from the current page.
 * @returns {URLSearchParams}
 */
export function obtenerParametrosURL() {
    return new URLSearchParams(window.location.search);
}
