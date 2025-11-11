/* funciones.js - Completo y funcional
   Controla: navegación, login, carrito, carruseles, visibilidad y colores dinámicos.
*/

/* ------------------ Configuración global ------------------ */
const CARRUSEL_AUTOPLAY_MS = 9000;
let carrito = [];
let usuarioActivo = false;
let slideTimers = {};
let lastAction = {};

/* ------------------ Control de visualización ------------------ */
function ocultarTodas() {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
}

function mostrar(id) {
  ocultarTodas();
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('active');
  controlarHeader(id);
}

/* ------------------ Header / Selector / Tienda ------------------ */
function controlarHeader(id) {
  const sel = document.getElementById('selector-tienda');
  if (!sel) return;

  if (
    id === 'inicio' || 
    id === 'login' || 
    id === 'registro' || 
    id === 'final' || 
    id === 'carrito'  
  ) {
    sel.style.display = 'none';
    document.body.setAttribute('data-tienda', 'inicio');
  } else {
    sel.style.display = 'inline-block';
    const sec = document.getElementById(id);
    const cat = sec?.dataset?.cat || id.split('-')[0] || id;
    document.body.setAttribute('data-tienda', cat);
    sel.value = cat;
    iniciarCarruselAuto(cat);
  }
}


/* ------------------ Navegación general ------------------ */
function mostrarInicio() {
  document.body.setAttribute('data-tienda', 'inicio');
  mostrar('inicio');
}

function abrirCategoria(tienda) {
  const sec = document.getElementById(tienda);
  if (!sec) return;
  document.body.setAttribute('data-tienda', tienda);
  mostrar(tienda);
  const sel = document.getElementById('selector-tienda');
  if (sel) { sel.value = tienda; sel.style.display = 'inline-block'; }
  iniciarCarruselAuto(tienda);
}

function cambiarTienda() {
  const sel = document.getElementById('selector-tienda');
  if (!sel) return;
  abrirCategoria(sel.value);
}

function abrirSubseccion(tienda, tipo) {
  const id = `${tienda}-${tipo}`;
  const sec = document.getElementById(id);
  if (!sec) return;
  document.body.setAttribute('data-tienda', tienda);
  mostrar(id);
}

function volverTienda(tienda) {
  abrirCategoria(tienda);
}

/* ------------------ Login y Registro ------------------ */
function iniciarSesion() {
  const user = (document.getElementById('usuario')?.value || '').trim();
  const pass = (document.getElementById('contrasena')?.value || '').trim();
  const msg = document.getElementById('mensajeLogin');

  if (user === 'alumno' && pass === '2025') {
    usuarioActivo = true;
    if (msg) { msg.textContent = 'Sesión iniciada correctamente.'; msg.style.color = 'lightgreen'; }

    const b1 = document.getElementById('btn-login');
    const b2 = document.getElementById('btn-registro');
    if (b1) b1.style.display = 'none';
    if (b2) b2.style.display = 'none';

    mostrarInicio();
  } else {
    if (msg) { msg.textContent = 'Usuario o contraseña incorrectos.'; msg.style.color = 'salmon'; }
  }
}

function registrar() {
  const nombre = (document.getElementById('reg-nombre')?.value || '').trim();
  const email = (document.getElementById('reg-email')?.value || '').trim();
  const edad = (document.getElementById('reg-edad')?.value || '').trim();
  const acepta = !!document.getElementById('reg-acepta')?.checked;

  if (!nombre || !email || !edad || !acepta) {
    alert('Completa todos los campos y acepta los términos.');
    return;
  }
  alert('Registro exitoso. Ahora puedes iniciar sesión.');
  mostrar('login');
}

/* ------------------ Carrito global ------------------ */
function agregarCarrito(nombre, precio) {
  if (!usuarioActivo) { alert('Debes iniciar sesión para agregar productos al carrito.'); return; }
  carrito.push({ nombre, precio: Number(precio) });
  actualizarContador();
}

function actualizarContador() {
  const c = document.getElementById('contador');
  if (c) c.textContent = carrito.length;
}

function mostrarCarrito() {
  if (!usuarioActivo) { alert('Inicia sesión para ver tu carrito.'); return; }
  mostrar('carrito');
  const lista = document.getElementById('listaCarrito');
  lista.innerHTML = '';
  let suma = 0;
  carrito.forEach((p, i) => {
    const li = document.createElement('li');
    li.textContent = `${p.nombre} — Q${Number(p.precio).toFixed(2)}`;
    const btnQ = document.createElement('button');
    btnQ.textContent = 'Eliminar';
    btnQ.style.marginLeft = '8px';
    btnQ.onclick = () => {
      carrito.splice(i, 1);
      actualizarContador();
      mostrarCarrito();
    };
    li.appendChild(btnQ);
    lista.appendChild(li);
    suma += Number(p.precio);
  });
  const total = document.getElementById('total');
  if (total) total.textContent = `Total: Q${suma.toFixed(2)}`;
}

function finalizarCompra() {
  if (carrito.length === 0) { alert('Tu carrito está vacío.'); return; }
  carrito = [];
  actualizarContador();
  mostrar('final');
}

/* ------------------ Carruseles ------------------ */
function inicializarTodosCarruseles() {
  document.querySelectorAll('.carrusel').forEach(c => {
    crearDotsPara(c);
    const slidesRow = c.querySelector('.slides');
    if (slidesRow) slidesRow.style.transform = 'translateX(0%)';
    if (slideTimers[c.id]) clearInterval(slideTimers[c.id]);
    lastAction[c.id] = Date.now();
  });
}

function crearDotsPara(carrusel) {
  const slides = carrusel.querySelectorAll('.slide');
  let dotsWrap = carrusel.querySelector('.dots');
  if (!dotsWrap) {
    dotsWrap = document.createElement('div');
    dotsWrap.className = 'dots';
    carrusel.appendChild(dotsWrap);
  }
  dotsWrap.innerHTML = '';
  slides.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'dot';
    if (i === 0) dot.classList.add('active');
    dot.onclick = () => {
      cambiarSlide(carrusel, i);
      reiniciarAutoplay(carrusel.id);
    };
    dotsWrap.appendChild(dot);
  });
}

function cambiarSlide(carrusel, index) {
  if (!carrusel) return;
  const slides = Array.from(carrusel.querySelectorAll('.slide'));
  const dots = Array.from(carrusel.querySelectorAll('.dot'));
  slides.forEach(s => s.classList.remove('active'));
  dots.forEach(d => d.classList.remove('active'));
  const realIndex = Math.max(0, Math.min(index, slides.length - 1));
  slides[realIndex].classList.add('active');
  if (dots[realIndex]) dots[realIndex].classList.add('active');
  const slidesRow = carrusel.querySelector('.slides');
  if (slidesRow) slidesRow.style.transform = `translateX(-${realIndex * 100}%)`;
  lastAction[carrusel.id] = Date.now();
}

function moverCarrusel(id, paso) {
  const carrusel = document.getElementById(id);
  if (!carrusel) return;
  const slides = Array.from(carrusel.querySelectorAll('.slide'));
  let activo = slides.findIndex(s => s.classList.contains('active'));
  if (activo < 0) activo = 0;
  let nuevo = (activo + paso + slides.length) % slides.length;
  cambiarSlide(carrusel, nuevo);
  reiniciarAutoplay(id);
}

function iniciarCarruselAuto(tienda) {
  const id = `carrusel-${tienda}`;
  const carrusel = document.getElementById(id);
  if (!carrusel) return;
  crearDotsPara(carrusel);
  if (slideTimers[id]) { clearInterval(slideTimers[id]); slideTimers[id] = null; }
  cambiarSlide(carrusel, 0);

  slideTimers[id] = setInterval(() => {
    const page = carrusel.closest('.page');
    if (!page || !page.classList.contains('active')) return;
    const now = Date.now();
    if (now - (lastAction[id] || 0) < CARRUSEL_AUTOPLAY_MS) return;
    moverCarrusel(id, 1);
    lastAction[id] = Date.now();
  }, 1000);
  lastAction[id] = Date.now();
}

function reiniciarAutoplay(id) {
  lastAction[id] = Date.now();
}

/* ------------------ Inicialización ------------------ */
document.addEventListener('DOMContentLoaded', () => {
  inicializarTodosCarruseles();
  mostrarInicio();

  const sel = document.getElementById('selector-tienda');
  if (sel && sel.value) {
    const current = document.body.getAttribute('data-tienda') || 'inicio';
    if (current !== 'inicio') {
      sel.value = current;
      iniciarCarruselAuto(current);
    }
  }
});

/* ------------------ Botón de regreso inteligente ------------------ */
function volverUltimaTienda() {
  // Detecta la tienda activa guardada en el atributo data-tienda
  const tiendaActual = document.body.getAttribute('data-tienda');

  // Si no hay tienda activa o está en "inicio", regresa al inicio
  if (!tiendaActual || tiendaActual === 'inicio') {
    mostrarInicio();
    return;
  }

  // Si la tienda actual es válida, abre su categoría
  abrirCategoria(tiendaActual);
}


/* ------------------ Exportar globalmente ------------------ */
window.mostrar = mostrar;
window.mostrarInicio = mostrarInicio;
window.abrirCategoria = abrirCategoria;
window.cambiarTienda = cambiarTienda;
window.abrirSubseccion = abrirSubseccion;
window.volverTienda = volverTienda;
window.iniciarSesion = iniciarSesion;
window.registrar = registrar;
window.agregarCarrito = agregarCarrito;
window.mostrarCarrito = mostrarCarrito;
window.finalizarCompra = finalizarCompra;
window.moverCarrusel = moverCarrusel;
window.iniciarCarruselAuto = iniciarCarruselAuto;
window.cambiarSlide = cambiarSlide;
window.reiniciarAutoplay = reiniciarAutoplay;
window.agregarDesdeTarjeta = agregarDesdeTarjeta;
window.volverUltimaTienda = volverUltimaTienda;


/* ------------------ Agregar desde tarjeta ------------------ */
function agregarDesdeTarjeta(boton) {
  const card = boton.closest('.card-producto');
  if (!card) return;

  // Obtener el nombre (texto del <h4>)
  const nombre = card.querySelector('h4')?.textContent.trim() || 'Producto sin nombre';

  // Obtener el precio (texto del <p>), eliminando la "Q" y espacios
  let precioTexto = card.querySelector('p')?.textContent.trim().replace('Q', '').replace(',', '') || '0';
  const precio = parseFloat(precioTexto);

  if (isNaN(precio)) {
    alert('Error al leer el precio del producto.');
    return;
  }

  agregarCarrito(nombre, precio);
}
