/* ⬇️ PEGÁ ACÁ TU COMENTARIO DE REGISTRO DE IA (no lo tengo, así que lo dejo para vos) ⬇️ */


/* =====================================================
   Mueblería Escolar - app.js
   Paso 1: datos, localStorage e imagen de reemplazo
   ===================================================== */

/* ---------- 1. CONSTANTES ---------- */

// Clave con la que se guarda todo en localStorage
const CLAVE_ALMACENAMIENTO = "muebleria-escolar-datos";

// Productos ficticios que se cargan la primera vez (cuando no hay nada guardado)
const PRODUCTOS_DE_EJEMPLO = [
  {
    codigo: "SIL-01",
    nombre: "Silla escolar Apilable Rosa",
    categoria: "Sillas",
    material: "Estructura de metal rosa y asiento de polipropileno",
    medidas: "42 x 45 x 78 cm",
    precio: 48900,
    imagen: "imagenes/silla_escolar.jpg"
  },
  {
    codigo: "MES-01",
    nombre: "Mesa escolar Doble",
    categoria: "Mesas",
    material: "Tablero de melamina blanca y patas de metal rosa",
    medidas: "120 x 60 x 75 cm",
    precio: 75900,
    imagen: "imagenes/mesa_escolar.jpg"
  },
  {
    codigo: "PUP-01",
    nombre: "Pupitre Individual con Cajón",
    categoria: "Pupitres",
    material: "Melamina rosa y estructura de metal reforzado",
    medidas: "60 x 45 x 75 cm",
    precio: 89900,
    imagen: "imagenes/pupitre.jpg"
  },
  {
    codigo: "BIB-01",
    nombre: "Biblioteca Escolar 4 Estantes",
    categoria: "Bibliotecas",
    material: "Melamina rosa pastel con estantes regulables",
    medidas: "120 x 32 x 180 cm",
    precio: 189000,
    imagen: "imagenes/biblioteca_escolar.jpg"
  },
  {
    codigo: "ARM-01",
    nombre: "Armario Escolar 2 Puertas",
    categoria: "Almacenamiento",
    material: "Melamina rosa y tiradores metálicos",
    medidas: "100 x 45 x 190 cm",
    precio: 215000,
    // Esta imagen NO existe a propósito: sirve para probar la imagen de reemplazo (onerror)
    imagen: "imagenes/armario-escolar.jpg"
  },
  {
    codigo: "ESC-01",
    nombre: "Escritorio Docente con Cajonera",
    categoria: "Escritorios",
    material: "Melamina blanca y rosa con cajones con llave",
    medidas: "140 x 65 x 76 cm",
    precio: 142000,
    imagen: "imagenes/escritorio.jpg"
  }
];

// Imagen de reemplazo: un SVG con un emoji sobre fondo beige.
// Va "incrustado" en el código, así funciona aunque no haya archivos ni internet.
const SVG_REEMPLAZO =
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">' +
  '<rect width="400" height="300" fill="#FCE4EC"/>' +
  '<text x="200" y="175" font-size="96" text-anchor="middle">🪑</text>' +
  '</svg>';

const IMAGEN_DE_REEMPLAZO =
  "data:image/svg+xml;charset=utf-8," + encodeURIComponent(SVG_REEMPLAZO);


/* ---------- 2. DATOS EN MEMORIA ---------- */

// Lista de productos del catálogo. Cada producto tiene:
// { codigo, nombre, categoria, material, medidas, precio, imagen }
let productos = [];

// Productos que la persona puso en el carrito. Cada elemento tiene:
// { codigo, cantidad }  (el resto de los datos se busca en "productos" por el código)
let carrito = [];

// Presupuestos generados. Cada uno tiene:
// { id, fecha, cliente, descuento, validezDias, items, subtotal, total }
// y cada item de "items" es { codigo, nombre, precio, cantidad }
let presupuestos = [];


/* ---------- 3. GUARDAR Y CARGAR (localStorage) ---------- */

// Guarda los tres arrays juntos, en un solo objeto, bajo una única clave
function guardarDatos() {
  const datos = {
    productos: productos,
    carrito: carrito,
    presupuestos: presupuestos
  };

  try {
    // localStorage solo guarda texto, por eso se convierte el objeto a JSON
    localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(datos));
  } catch (error) {
    // Puede fallar si el navegador bloquea el almacenamiento o está lleno
    console.error("No se pudieron guardar los datos:", error);
  }
}

// Lee los datos guardados. Si no hay nada (o están dañados), usa los de ejemplo
function cargarDatos() {
  let datosGuardados = null;

  try {
    const texto = localStorage.getItem(CLAVE_ALMACENAMIENTO);
    if (texto) {
      datosGuardados = JSON.parse(texto); // convierte el texto otra vez en objeto
    }
  } catch (error) {
    console.error("No se pudieron leer los datos guardados:", error);
  }

  if (datosGuardados && Array.isArray(datosGuardados.productos)) {
    // Hay datos válidos: se usan tal cual
    productos = datosGuardados.productos;
    carrito = Array.isArray(datosGuardados.carrito) ? datosGuardados.carrito : [];
    presupuestos = Array.isArray(datosGuardados.presupuestos) ? datosGuardados.presupuestos : [];
  } else {
    // No hay datos: se cargan los 6 productos de ejemplo y se guardan
    // El map con { ...producto } hace una copia, para no modificar la lista original
    productos = PRODUCTOS_DE_EJEMPLO.map(function (producto) {
      return { ...producto };
    });
    carrito = [];
    presupuestos = [];
    guardarDatos();
  }
}


/* ---------- 4. IMAGEN CON REEMPLAZO (evento onerror) ---------- */

// Crea un <img> para un producto. Si la imagen no existe, se muestra la de reemplazo.
// Todavía no la usamos: la va a llamar el código que dibuje las tarjetas del catálogo.
function crearImagenProducto(producto) {
  const imagen = document.createElement("img");
  imagen.alt = producto.nombre;
  imagen.loading = "lazy";

  // onerror se ejecuta si el navegador no puede cargar la imagen.
  // Va ANTES de asignar src, para no perder el error.
  imagen.onerror = function () {
    imagen.onerror = null;           // evita un bucle infinito si el reemplazo también fallara
    imagen.src = IMAGEN_DE_REEMPLAZO;
  };

  imagen.src = producto.imagen || IMAGEN_DE_REEMPLAZO;
  return imagen;
}


/* ---------- 5. ADMINISTRACIÓN DE PRODUCTOS ---------- */

// Reglas de validación (expresiones regulares)
const REGLA_CODIGO = /^[A-Z]{3}-\d{2}$/;     // 3 letras mayúsculas, guion y 2 números (ej.: MES-01)
const REGLA_IMAGEN = /\.(jpg|png|webp)$/i;   // termina en .jpg, .png o .webp (sin importar mayúsculas)

// Elementos del HTML con los que vamos a trabajar
const formularioProducto = document.getElementById("formulario-producto");
const botonGuardarProducto = formularioProducto.querySelector('button[type="submit"]');
const contenedorListaAdmin = document.getElementById("lista-administracion");

// Un objeto con todos los campos del formulario, para poder recorrerlos
const campos = {
  codigo: document.getElementById("producto-codigo"),
  nombre: document.getElementById("producto-nombre"),
  categoria: document.getElementById("producto-categoria"),
  material: document.getElementById("producto-material"),
  medidas: document.getElementById("producto-medidas"),
  precio: document.getElementById("producto-precio"),
  imagen: document.getElementById("producto-imagen")
};

// null = estamos dando de alta un producto nuevo.
// Si tiene un código = estamos editando el producto con ese código.
let codigoEnEdicion = null;

// Convierte 98500 en "$98.500"
function formatearPrecio(precio) {
  return "$" + precio.toLocaleString("es-AR");
}


/* --- 5.1 Mostrar y borrar errores --- */

// Muestra (o borra, si el mensaje está vacío) el error de un campo
function mostrarErrorCampo(nombreCampo, mensaje) {
  const espacioError = document.getElementById("error-producto-" + nombreCampo);
  const campo = campos[nombreCampo];

  if (espacioError) {
    espacioError.textContent = mensaje;
  }

  if (mensaje) {
    campo.setAttribute("aria-invalid", "true");   // el CSS le pone borde rojo
  } else {
    campo.removeAttribute("aria-invalid");
  }
}

function limpiarErroresProducto() {
  Object.keys(campos).forEach(function (nombreCampo) {
    mostrarErrorCampo(nombreCampo, "");
  });
}

// Apenas la persona escribe en un campo, se borra su error
Object.keys(campos).forEach(function (nombreCampo) {
  campos[nombreCampo].addEventListener("input", function () {
    mostrarErrorCampo(nombreCampo, "");
  });
});


/* --- 5.2 Leer y validar el formulario --- */

// Lee los campos y limpia los espacios sobrantes
function leerFormularioProducto() {
  return {
    codigo: campos.codigo.value.trim().toUpperCase(),   // "mes-01" pasa a "MES-01"
    nombre: campos.nombre.value.trim(),
    categoria: campos.categoria.value.trim(),
    material: campos.material.value.trim(),
    medidas: campos.medidas.value.trim(),
    precioTexto: campos.precio.value.trim(),            // todavía es texto
    imagen: campos.imagen.value.trim()
  };
}

// Devuelve un objeto con un mensaje por cada campo que tenga error.
// Si el objeto queda vacío, todo está bien.
function validarProducto(datos) {
  const errores = {};

  // Código: solo se valida al dar de alta (al editar no se puede cambiar)
  if (codigoEnEdicion === null) {
    if (datos.codigo === "") {
      errores.codigo = "El código es obligatorio.";
    } else if (!REGLA_CODIGO.test(datos.codigo)) {
      errores.codigo = "Usá 3 letras, un guion y 2 números. Ejemplo: MES-01.";
    } else if (productos.some(function (producto) { return producto.codigo === datos.codigo; })) {
      errores.codigo = "Ese código ya existe. Elegí otro.";
    }
  }

  if (datos.nombre === "") {
    errores.nombre = "El nombre es obligatorio.";
  }

  if (datos.categoria === "") {
    errores.categoria = "La categoría es obligatoria.";
  }

  if (datos.medidas === "") {
    errores.medidas = "Las medidas son obligatorias.";
  }

  // Precio: obligatorio, entero y mayor que cero
  if (datos.precioTexto === "") {
    errores.precio = "El precio es obligatorio.";
  } else if (!Number.isInteger(Number(datos.precioTexto))) {
    errores.precio = "El precio tiene que ser un número entero, sin decimales.";
  } else if (Number(datos.precioTexto) <= 0) {
    errores.precio = "El precio tiene que ser mayor que cero.";
  }

  if (datos.imagen === "") {
    errores.imagen = "La ruta de la imagen es obligatoria.";
  } else if (!REGLA_IMAGEN.test(datos.imagen)) {
    errores.imagen = "La ruta tiene que terminar en .jpg, .png o .webp.";
  }

  return errores;
}


/* --- 5.3 Alta y edición (evento submit del formulario) --- */

formularioProducto.addEventListener("submit", function (evento) {
  evento.preventDefault();   // evita que el navegador recargue la página

  const datos = leerFormularioProducto();
  const errores = validarProducto(datos);

  // Se muestra el error de cada campo (o se borra si está bien)
  Object.keys(campos).forEach(function (nombreCampo) {
    mostrarErrorCampo(nombreCampo, errores[nombreCampo] || "");
  });

  // Si hay errores, se frena acá y se lleva el cursor al primer campo con error
  const primerCampoConError = Object.keys(campos).find(function (nombreCampo) {
    return errores[nombreCampo];
  });
  if (primerCampoConError) {
    campos[primerCampoConError].focus();
    return;
  }

  // Todo está bien: se arma el producto
  const producto = {
    codigo: codigoEnEdicion === null ? datos.codigo : codigoEnEdicion,
    nombre: datos.nombre,
    categoria: datos.categoria,
    material: datos.material,
    medidas: datos.medidas,
    precio: Number(datos.precioTexto),   // ahora sí, convertido a número
    imagen: datos.imagen
  };

  if (codigoEnEdicion === null) {
    productos.push(producto);            // alta: se agrega al final
  } else {
    const posicion = productos.findIndex(function (item) {
      return item.codigo === codigoEnEdicion;
    });
    productos[posicion] = producto;      // edición: se reemplaza el producto
  }

  guardarDatos();
  dibujarTablaAdministracion();
  formularioProducto.reset();            // limpia el formulario y sale del modo edición
});

// Cuando el formulario se limpia (botón "Limpiar" o después de guardar), se sale del modo edición
formularioProducto.addEventListener("reset", function () {
  codigoEnEdicion = null;
  campos.codigo.readOnly = false;
  botonGuardarProducto.textContent = "Guardar producto";
  limpiarErroresProducto();
});


/* --- 5.4 Listado (tabla con miniatura) --- */

function dibujarTablaAdministracion() {
  // Se vacía el contenedor. Si no hay productos, el CSS muestra el mensaje de "vacío".
  contenedorListaAdmin.innerHTML = "";
  if (productos.length === 0) {
    return;
  }

  const tabla = document.createElement("table");
  tabla.className = "tabla-productos";

  // Encabezado de la tabla
  const filaEncabezado = tabla.createTHead().insertRow();
  ["Imagen", "Código", "Nombre", "Categoría", "Precio", "Acciones"].forEach(function (titulo) {
    const celda = document.createElement("th");
    celda.scope = "col";
    celda.textContent = titulo;
    filaEncabezado.appendChild(celda);
  });

  // Una fila por cada producto
  const cuerpo = tabla.createTBody();
  productos.forEach(function (producto) {
    const fila = cuerpo.insertRow();

    // Miniatura (usa la función con onerror, así se ve el reemplazo si falta la imagen)
    const miniatura = crearImagenProducto(producto);
    miniatura.className = "miniatura";
    fila.insertCell().appendChild(miniatura);

    // textContent (y no innerHTML) para que el texto escrito nunca se interprete como HTML
    fila.insertCell().textContent = producto.codigo;
    fila.insertCell().textContent = producto.nombre;
    fila.insertCell().textContent = producto.categoria;
    fila.insertCell().textContent = formatearPrecio(producto.precio);

    // Botones de acciones
    const celdaAcciones = fila.insertCell();

    const botonEditar = document.createElement("button");
    botonEditar.type = "button";
    botonEditar.className = "boton-editar";
    botonEditar.textContent = "Editar";
    botonEditar.addEventListener("click", function () {
      iniciarEdicion(producto.codigo);
    });

    const botonEliminar = document.createElement("button");
    botonEliminar.type = "button";
    botonEliminar.className = "boton-eliminar";
    botonEliminar.textContent = "Eliminar";
    botonEliminar.addEventListener("click", function () {
      eliminarProducto(producto.codigo);
    });

    celdaAcciones.appendChild(botonEditar);
    celdaAcciones.appendChild(botonEliminar);
  });

  contenedorListaAdmin.appendChild(tabla);
}


/* --- 5.5 Edición --- */

// Pasa los datos del producto al formulario y activa el modo edición
function iniciarEdicion(codigo) {
  const producto = productos.find(function (item) {
    return item.codigo === codigo;
  });
  if (!producto) {
    return;
  }

  limpiarErroresProducto();
  campos.codigo.value = producto.codigo;
  campos.nombre.value = producto.nombre;
  campos.categoria.value = producto.categoria;
  campos.material.value = producto.material;
  campos.medidas.value = producto.medidas;
  campos.precio.value = producto.precio;
  campos.imagen.value = producto.imagen;

  codigoEnEdicion = codigo;
  campos.codigo.readOnly = true;         // el código no se cambia: el carrito lo usa para encontrar el producto
  botonGuardarProducto.textContent = "Guardar cambios";

  formularioProducto.scrollIntoView({ behavior: "smooth" });
  campos.nombre.focus({ preventScroll: true });
}


/* --- 5.6 Baja (con confirmación) --- */

function eliminarProducto(codigo) {
  const producto = productos.find(function (item) {
    return item.codigo === codigo;
  });
  if (!producto) {
    return;
  }

  // confirm() muestra un cuadro con Aceptar y Cancelar; devuelve true o false
  const confirmado = confirm(
    "¿Seguro que querés eliminar \"" + producto.nombre + "\" (" + producto.codigo + ")?\n" +
    "Esta acción no se puede deshacer."
  );
  if (!confirmado) {
    return;
  }

  productos = productos.filter(function (item) {
    return item.codigo !== codigo;
  });

  // Si estaba en el carrito, también se saca (los presupuestos ya guardados conservan su copia)
  carrito = carrito.filter(function (item) {
    return item.codigo !== codigo;
  });

  guardarDatos();

  // Si justo se estaba editando ese producto, se limpia el formulario
  if (codigoEnEdicion === codigo) {
    formularioProducto.reset();
  }

  dibujarTablaAdministracion();
}


/* ---------- 6. INICIO ---------- */

// Al abrir la página se cargan los datos (guardados o de ejemplo) y se dibuja la tabla
cargarDatos();
dibujarTablaAdministracion();
