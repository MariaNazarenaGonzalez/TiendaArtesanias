# NGENECHEN - Tienda estatica

Tienda online sin backend para vender artesanias desde GitHub Pages. El catalogo se lee desde Google Sheets mediante OpenSheet, el carrito se guarda en `localStorage` y los pedidos se envian por enlaces de WhatsApp Business.

## Instalacion

No requiere instalacion ni compilacion.

1. Clonar o descargar el repositorio.
2. Configurar `js/config.js`.
3. Publicar el repositorio en GitHub Pages.

Para probar localmente se puede usar cualquier servidor estatico:

```bash
python3 -m http.server 8000
```

Luego abrir `http://localhost:8000`.

## Estructura

```text
/
├── index.html
├── catalogo.html
├── producto.html
├── carrito.html
├── contacto.html
├── css/
│   ├── style.css
│   ├── cards.css
│   ├── carrito.css
│   └── responsive.css
├── js/
│   ├── config.js
│   ├── api.js
│   ├── app.js
│   ├── catalogo.js
│   ├── carrito.js
│   ├── whatsapp.js
│   ├── filtros.js
│   ├── ui.js
│   ├── utilidades.js
│   └── router.js
├── assets/
└── .github/
```

## Configuracion

Editar `js/config.js`:

```javascript
export const CONFIG = {
    SHEET_ID: "",
    SHEET_NAME: "",
    WHATSAPP_NUMBER: "",
    CURRENCY: "$"
};
```

- `SHEET_ID`: ID de la hoja de calculo de Google.
- `SHEET_NAME`: nombre exacto de la pestana publicada.
- `WHATSAPP_NUMBER`: numero internacional sin `+`, espacios ni guiones.
- `CURRENCY`: simbolo que se muestra en precios y totales.

## Google Sheets

La hoja debe ser publica y tener una fila de encabezados. Columnas recomendadas:

```text
id | nombre | descripcion | categoria | precio | imagen | stock | visible
```

Reglas:

- `id`, `nombre`, `categoria`, `precio`, `imagen` y `stock` son obligatorios.
- `descripcion` puede quedar vacia.
- `visible` acepta valores como `si`, `sí`, `true`, `1`, `visible` o `activo`.
- `precio` puede incluir simbolos o separadores; la tienda lo normaliza a numero.
- `imagen` debe ser una URL publica accesible por el navegador.

## Publicar la hoja

1. Abrir Google Sheets.
2. Ir a `Archivo > Compartir > Publicar en la web`.
3. Publicar la pestana del catalogo.
4. Copiar el ID del documento desde la URL.
5. Completar `SHEET_ID` y `SHEET_NAME` en `js/config.js`.

La tienda consume el catalogo con OpenSheet:

```text
https://opensheet.elk.sh/{SHEET_ID}/{SHEET_NAME}
```

Solo `js/api.js` realiza esta peticion.

## GitHub Pages

El repositorio incluye `.github/workflows/pages.yml` para desplegar automaticamente el sitio estatico.

1. Subir los archivos al repositorio.
2. En GitHub, entrar a `Settings > Pages`.
3. En `Build and deployment`, elegir `GitHub Actions`.
4. Hacer push a `main` o `master`.
5. Esperar la publicacion del workflow `Deploy static site to GitHub Pages`.

Tambien se puede usar `Deploy from a branch` seleccionando la rama principal y la carpeta `/root`.

Como el proyecto usa ES Modules, debe servirse por HTTP. GitHub Pages lo hace automaticamente.

## Funcionamiento

Flujo de datos:

```text
Google Sheets -> OpenSheet -> api.js -> catalogo.js -> ui.js -> usuario
usuario -> carrito.js -> whatsapp.js -> WhatsApp Business
```

Funcionalidades incluidas:

- Catalogo desde Google Sheets.
- Busqueda por nombre, descripcion o categoria.
- Filtro por categoria.
- Orden por nombre, menor precio, mayor precio o stock.
- Paginacion.
- Detalle de producto.
- Carrito persistente con `localStorage`.
- Cantidades, subtotales y total.
- Finalizacion de compra por `https://wa.me/`.
- Consultas por producto y formulario de contacto.

## Personalizacion

- Textos y estructura de paginas: archivos `.html`.
- Estilos generales: `css/style.css`.
- Tarjetas y detalle: `css/cards.css`.
- Carrito: `css/carrito.css`.
- Ajustes mobile: `css/responsive.css`.
- Configuracion de tienda: `js/config.js`.

## Resolucion de problemas

Si no carga el catalogo:

- Verificar que `SHEET_ID` y `SHEET_NAME` esten completos.
- Confirmar que la hoja este publicada en la web.
- Revisar que el nombre de la pestana coincida exactamente.
- Validar que las columnas obligatorias tengan datos.

Si no abre WhatsApp:

- Revisar `WHATSAPP_NUMBER`.
- Usar formato internacional sin simbolos, por ejemplo `5491123456789`.
- Confirmar que el navegador no bloquee ventanas emergentes.

Si el carrito no persiste:

- Probar con la pagina servida por HTTP.
- Revisar que el navegador permita `localStorage`.
- Evitar modo incognito si borra datos al cerrar.

## Ampliaciones futuras

La arquitectura separa datos, negocio, presentacion y comunicacion externa. Esto permite sumar autenticacion, pagos o backend reemplazando modulos concretos sin reescribir la interfaz completa.
