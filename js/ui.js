import { CONFIG } from "./config.js";
import { formatearMoneda, escaparHTML } from "./utilidades.js";

/**
 * Renders a loading state inside a container.
 * @param {Element} container
 * @param {string} text
 * @returns {void}
 */
export function renderLoader(container, text = "Cargando...") {
    if (!container) {
        return;
    }

    container.innerHTML = `<div class="state state-loading">${escaparHTML(text)}</div>`;
}

/**
 * Renders an empty state inside a container.
 * @param {Element} container
 * @param {string} text
 * @returns {void}
 */
export function renderEmpty(container, text) {
    if (!container) {
        return;
    }

    container.innerHTML = `<div class="state">${escaparHTML(text)}</div>`;
}

/**
 * Renders an error state inside a container.
 * @param {Element} container
 * @param {string} text
 * @returns {void}
 */
export function renderError(container, text) {
    if (!container) {
        return;
    }

    container.innerHTML = `<div class="state state-error">${escaparHTML(text)}</div>`;
}

/**
 * Shows a small notification.
 * @param {string} message
 * @returns {void}
 */
export function mostrarNotificacion(message) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);

    window.setTimeout(() => toast.classList.add("is-visible"), 10);
    window.setTimeout(() => {
        toast.classList.remove("is-visible");
        toast.addEventListener("transitionend", () => toast.remove(), { once: true });
    }, 2200);
}

/**
 * Updates cart counters in the header.
 * @param {number} cantidad
 * @returns {void}
 */
export function actualizarContadorCarrito(cantidad) {
    document.querySelectorAll("[data-cart-count]").forEach((element) => {
        element.textContent = String(cantidad);
        element.toggleAttribute("hidden", cantidad === 0);
    });
}

/**
 * Renders category select options.
 * @param {HTMLSelectElement} select
 * @param {string[]} categorias
 * @returns {void}
 */
export function renderCategorias(select, categorias) {
    if (!select) {
        return;
    }

    select.innerHTML = [
        `<option value="">Todas las categorias</option>`,
        ...categorias.map((categoria) => (
            `<option value="${escaparHTML(categoria)}">${escaparHTML(categoria)}</option>`
        ))
    ].join("");
}

/**
 * Renders product cards.
 * @param {Element} container
 * @param {object[]} productos
 * @returns {void}
 */
export function renderProductos(container, productos) {
    if (!container) {
        return;
    }

    if (!productos.length) {
        renderEmpty(container, "No encontramos productos con esos filtros.");
        return;
    }

    container.innerHTML = productos.map(renderProductoCard).join("");
}

/**
 * Renders pagination controls.
 * @param {Element} container
 * @param {number} paginaActual
 * @param {number} totalPaginas
 * @returns {void}
 */
export function renderPaginacion(container, paginaActual, totalPaginas) {
    if (!container) {
        return;
    }

    if (totalPaginas <= 1) {
        container.innerHTML = "";
        return;
    }

    const botones = Array.from({ length: totalPaginas }, (_, index) => {
        const pagina = index + 1;
        const active = pagina === paginaActual ? "is-active" : "";
        return `<button class="page-button ${active}" type="button" data-page-number="${pagina}">${pagina}</button>`;
    });

    container.innerHTML = botones.join("");
}

/**
 * Renders one product detail view.
 * @param {Element} container
 * @param {object} producto
 * @returns {void}
 */
export function renderDetalleProducto(container, producto) {
    if (!container) {
        return;
    }

    container.innerHTML = `
        <article class="product-detail">
            <img class="product-detail__image" src="${escaparHTML(producto.imagen)}" alt="${escaparHTML(producto.nombre)}">
            <div class="product-detail__content">
                <p class="eyebrow">${escaparHTML(producto.categoria)}</p>
                <h1>${escaparHTML(producto.nombre)}</h1>
                <p class="product-detail__description">${escaparHTML(producto.descripcion)}</p>
                <p class="price">${formatearMoneda(producto.precio, CONFIG.CURRENCY)}</p>
                <p class="stock">${producto.stock > 0 ? `${producto.stock} unidades disponibles` : "Sin stock"}</p>
                <div class="actions-row">
                    <label class="quantity-field">
                        Cantidad
                        <input type="number" min="1" max="${producto.stock}" value="1" data-detail-quantity ${producto.stock <= 0 ? "disabled" : ""}>
                    </label>
                    <button class="button button-primary" type="button" data-add-to-cart="${escaparHTML(producto.id)}" ${producto.stock <= 0 ? "disabled" : ""}>Agregar al carrito</button>
                    <button class="button button-secondary" type="button" data-product-inquiry="${escaparHTML(producto.id)}">Consultar</button>
                </div>
            </div>
        </article>
    `;
}

/**
 * Renders cart contents.
 * @param {Element} container
 * @param {object[]} items
 * @param {number} total
 * @returns {void}
 */
export function renderCarrito(container, items, total) {
    if (!container) {
        return;
    }

    if (!items.length) {
        renderEmpty(container, "Tu carrito esta vacio.");
        return;
    }

    container.innerHTML = `
        <div class="cart-list">
            ${items.map(renderCarritoItem).join("")}
        </div>
        <aside class="cart-summary">
            <span>Total</span>
            <strong>${formatearMoneda(total, CONFIG.CURRENCY)}</strong>
        </aside>
    `;
}

/**
 * Renders the featured products section.
 * @param {Element} container
 * @param {object[]} productos
 * @returns {void}
 */
export function renderDestacados(container, productos) {
    renderProductos(container, productos.slice(0, 3));
}

function renderProductoCard(producto) {
    return `
        <article class="product-card">
            <a class="product-card__media" href="producto.html?id=${encodeURIComponent(producto.id)}">
                <img src="${escaparHTML(producto.imagen)}" alt="${escaparHTML(producto.nombre)}">
            </a>
            <div class="product-card__body">
                <p class="product-card__category">${escaparHTML(producto.categoria)}</p>
                <h3>${escaparHTML(producto.nombre)}</h3>
                <p>${escaparHTML(producto.descripcion)}</p>
                <div class="product-card__footer">
                    <strong>${formatearMoneda(producto.precio, CONFIG.CURRENCY)}</strong>
                    <span>${producto.stock} disp.</span>
                </div>
                <div class="product-card__actions">
                    <a class="button button-secondary" href="producto.html?id=${encodeURIComponent(producto.id)}">Ver detalle</a>
                    <button class="button button-primary" type="button" data-add-to-cart="${escaparHTML(producto.id)}" ${producto.stock <= 0 ? "disabled" : ""}>${producto.stock <= 0 ? "Sin stock" : "Agregar"}</button>
                </div>
            </div>
        </article>
    `;
}

function renderCarritoItem(item) {
    return `
        <article class="cart-item">
            <img src="${escaparHTML(item.imagen)}" alt="${escaparHTML(item.nombre)}">
            <div>
                <h3>${escaparHTML(item.nombre)}</h3>
                <p>${formatearMoneda(item.precio, CONFIG.CURRENCY)}</p>
            </div>
            <label class="quantity-field">
                Cantidad
                <input type="number" min="1" max="${item.stock}" value="${item.cantidad}" data-cart-quantity="${escaparHTML(item.id)}">
            </label>
            <strong>${formatearMoneda(item.precio * item.cantidad, CONFIG.CURRENCY)}</strong>
            <button class="button button-ghost" type="button" data-remove-from-cart="${escaparHTML(item.id)}">Eliminar</button>
        </article>
    `;
}
