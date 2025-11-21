// VARIABLES GLOBALES
let usuarioActual = null;
let seccionActual = 'dashboard';

let productos = [];
let clientes = [];
let alquileres = [];
let pagos = [];
let estaciones = [];

// INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('dashboard')) {
        verificarSesion();
    } else if (window.location.pathname.includes('login') || window.location.pathname === '/') {
        configurarLogin();
    }
});

// AUTENTICACIÓN
function configurarLogin() {
    const formulario = document.getElementById('formularioLogin');
    if (formulario) {
        formulario.addEventListener('submit', iniciarSesion);
    }

    const formularioRegistro = document.getElementById('formularioRegistro');
    if (formularioRegistro) {
        formularioRegistro.addEventListener('submit', registrarAdministrador);
    }
}

async function iniciarSesion(evento) {
    evento.preventDefault();

    const usuario = document.getElementById('usuarioInput').value;
    const password = document.getElementById('passwordInput').value;

    try {
        const respuesta = await fetch('/api/login/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password })
        });

        const datos = await respuesta.json();

        if (datos.success) {
            usuarioActual = datos.administrador;
            localStorage.setItem('usuarioActual', JSON.stringify(datos.administrador));
            window.location.href = '/dashboard/';
        } else {
            mostrarError('Usuario o contraseña incorrectos');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarError('Error de conexión');
    }
}

async function registrarAdministrador(evento) {
    evento.preventDefault();

    const nombre = document.getElementById('nombreRegistro').value;
    const usuario = document.getElementById('usuarioRegistro').value;
    const email = document.getElementById('emailRegistro').value;
    const password = document.getElementById('passwordRegistro').value;
    const confirmarPassword = document.getElementById('confirmarPasswordRegistro').value;

    if (password !== confirmarPassword) {
        alert('Las contraseñas no coinciden');
        return;
    }

    try {
        const respuesta = await fetch('api/registrar/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ usuario, password, nombre, email })
        });

        if (respuesta.ok) {
            alert('Administrador registrado exitosamente. Ya puedes iniciar sesión.');
            cerrarModalRegistro();
        } else {
            const error = await respuesta.json();
            alert('Error: ' + error.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error de conexión');
    }
}

function abrirModalRegistro() {
    const modal = document.getElementById('modalRegistro');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
}

function cerrarModalRegistro() {
    const modal = document.getElementById('modalRegistro');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.getElementById('formularioRegistro').reset();
}

function mostrarError(mensaje) {
    const mensajeError = document.getElementById('mensajeError');
    const textoError = document.getElementById('textoError');

    textoError.textContent = mensaje;
    mensajeError.classList.remove('hidden');

    setTimeout(() => {
        mensajeError.classList.add('hidden');
    }, 3000);
}

function verificarSesion() {
    const sesionGuardada = localStorage.getItem('usuarioActual');

    if (sesionGuardada) {
        usuarioActual = JSON.parse(sesionGuardada);
        inicializarDashboard();
    } else {
        window.location.href = '/login/';
    }
}

function cerrarSesion() {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        localStorage.removeItem('usuarioActual');
        window.location.href = '/login/';
    }
}

// INICIALIZACIÓN DEL DASHBOARD
function inicializarDashboard() {
    document.getElementById('nombreUsuario').textContent = usuarioActual.Usuario;
    document.getElementById('emailUsuario').textContent = usuarioActual.Email;
    document.getElementById('inicialUsuario').textContent = usuarioActual.Nombre.charAt(0).toUpperCase();

    cargarDatosIniciales();
    mostrarSeccion('dashboard');
}

// CARGA DE DATOS
async function cargarDatosIniciales() {
    await Promise.all([
        cargarProductos(),
        cargarClientes(),
        cargarAlquileres(),
        cargarEstaciones()
    ]);
}

async function cargarProductos() {
    try {
        const respuesta = await fetch(`/productos/?idAdministrador=${usuarioActual.idAdministrador}`);
        const datos = await respuesta.json();
        productos = datos.productos || [];
    } catch (error) {
        console.error('Error al cargar productos:', error);
        productos = [];
    }
}

async function cargarClientes() {
    try {
        const respuesta = await fetch(`/clientes/?idAdministrador=${usuarioActual.idAdministrador}`);
        const datos = await respuesta.json();
        clientes = datos.clientes || [];
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        clientes = [];
    }
}

async function cargarAlquileres() {
    try {
        const respuesta = await fetch(`/alquileres/?idAdministrador=${usuarioActual.idAdministrador}`);
        const datos = await respuesta.json();
        alquileres = datos.alquileres || [];
    } catch (error) {
        console.error('Error al cargar alquileres:', error);
        alquileres = [];
    }
}

async function cargarEstaciones() {
    try {
        const respuesta = await fetch(`/estaciones/?idAdministrador=${usuarioActual.idAdministrador}`);
        const datos = await respuesta.json();
        estaciones = datos.estaciones || [];
    } catch (error) {
        console.error('Error al cargar estaciones:', error);
        estaciones = [];
    }
}

async function cargarPagos() {
    try {
        const respuesta = await fetch(`/pagos/?idAdministrador=${usuarioActual.idAdministrador}`);
        const datos = await respuesta.json();
        pagos = datos.pagos || [];
    } catch (error) {
        console.error('Error al cargar pagos:', error);
        pagos = [];
    }
}

// NAVEGACIÓN
function mostrarSeccion(seccion) {
    seccionActual = seccion;
    const contenedor = document.getElementById('contenidoPrincipal');

    document.querySelectorAll('.enlace-nav').forEach(enlace => {
        enlace.classList.remove('bg-gradient-to-r', 'from-pink-200', 'to-purple-200', 'shadow-sm');
    });

    const enlaceActivo = document.querySelector(`[data-seccion="${seccion}"]`);
    if (enlaceActivo) {
        enlaceActivo.classList.add('bg-gradient-to-r', 'from-pink-200', 'to-purple-200', 'shadow-sm');
    }

    switch(seccion) {
        case 'dashboard':
            contenedor.innerHTML = obtenerHTMLDashboard();
            cargarEstadisticas();
            cargarAlquileresHoy();
            break;
        case 'productos':
            contenedor.innerHTML = obtenerHTMLProductos();
            renderizarProductos();
            break;
        case 'alquileres':
            contenedor.innerHTML = obtenerHTMLAlquileres();
            renderizarAlquileres();
            break;
        case 'clientes':
            contenedor.innerHTML = obtenerHTMLClientes();
            renderizarClientes();
            break;
        case 'pagos':
            contenedor.innerHTML = obtenerHTMLPagos();
            cargarPagos().then(renderizarPagos);
            break;
        case 'estaciones':
            contenedor.innerHTML = obtenerHTMLEstaciones();
            renderizarEstaciones();
            break;
        case 'reportes':
            contenedor.innerHTML = obtenerHTMLReportes();
            cargarReportes();
            break;
    }

    if (window.innerWidth < 768) {
        alternarMenu();
    }
}

function alternarMenu() {
    const menu = document.getElementById('menuLateral');
    const overlay = document.getElementById('overlay');

    if (menu.classList.contains('activo')) {
        menu.classList.remove('activo');
        overlay.classList.add('hidden');
    } else {
        menu.classList.add('activo');
        overlay.classList.remove('hidden');
    }
}

// DASHBOARD
function obtenerHTMLDashboard() {
    return `
        <div class="flex justify-between items-center mb-8">
            <div class="flex items-center gap-3">
                <button onclick="alternarMenu()" class="md:hidden p-2 bg-white rounded-lg shadow">
                    <i class="fas fa-bars text-2xl"></i>
                </button>
                <div>
                    <h2 class="text-3xl font-bold text-gray-800">Panel Principal</h2>
                    <p class="text-gray-500 mt-1">Bienvenido, ${usuarioActual.Nombre}</p>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-pink-300 hover:-translate-y-3 hover:shadow-2xl transition-all">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-gray-500 text-sm font-medium mb-1">Total Productos</p>
                        <h3 id="totalProductos" class="text-4xl font-bold text-gray-800">0</h3>
                    </div>
                    <div class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style="background: linear-gradient(135deg, #fecdd3, #fbcfe8);">
                        <i class="fas fa-box"></i>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-blue-300 hover:-translate-y-3 hover:shadow-2xl transition-all">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-gray-500 text-sm font-medium mb-1">Total Clientes</p>
                        <h3 id="totalClientes" class="text-4xl font-bold text-gray-800">0</h3>
                    </div>
                    <div class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style="background: linear-gradient(135deg, #bfdbfe, #ddd6fe);">
                        <i class="fas fa-users"></i>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-green-300 hover:-translate-y-3 hover:shadow-2xl transition-all">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-gray-500 text-sm font-medium mb-1">Alquileres Activos</p>
                        <h3 id="alquileresActivos" class="text-4xl font-bold text-gray-800">0</h3>
                    </div>
                    <div class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style="background: linear-gradient(135deg, #bbf7d0, #d9f99d);">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-yellow-300 hover:-translate-y-3 hover:shadow-2xl transition-all">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-gray-500 text-sm font-medium mb-1">Ingresos del Mes</p>
                        <h3 id="ingresosMes" class="text-4xl font-bold text-gray-800">L. 0</h3>
                    </div>
                    <div class="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style="background: linear-gradient(135deg, #fef08a, #fde047);">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <button onclick="abrirModal('modalProducto')" class="py-4 rounded-xl text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all" style="background: linear-gradient(135deg, #FFB5E8 0%, #DCD6F7 100%);">
                <i class="fas fa-plus mr-2"></i>Agregar Producto
            </button>
            <button onclick="abrirModal('modalCliente')" class="py-4 rounded-xl text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all" style="background: linear-gradient(135deg, #c084fc, #f9a8d4);">
                <i class="fas fa-user-plus mr-2"></i>Nuevo Cliente
            </button>
            <button onclick="abrirModal('modalAlquiler')" class="py-4 rounded-xl text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all" style="background: linear-gradient(135deg, #AEC6FF 0%, #B5EAD7 100%);">
                <i class="fas fa-calendar-plus mr-2"></i>Nuevo Alquiler
            </button>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div class="bg-white rounded-2xl p-6 shadow-lg">
                <h3 class="text-xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-calendar-day text-blue-500 mr-2"></i>Alquileres de Hoy
                </h3>
                <div id="alquileresHoy" class="space-y-3"></div>
            </div>

            <div class="bg-white rounded-2xl p-6 shadow-lg">
                <h3 class="text-xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-calendar-alt text-purple-500 mr-2"></i>Calendario
                </h3>
                <div id="calendarioMensual"></div>
            </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-lg">
            <h3 class="text-xl font-bold text-gray-800 mb-4">
                <i class="fas fa-fire text-orange-500 mr-2"></i>Productos Más Alquilados
            </h3>
            <div id="productosPopulares" class="space-y-3"></div>
        </div>
    `;
}

async function cargarEstadisticas() {
    try {
        const respuesta = await fetch(`/estadisticas/?idAdministrador=${usuarioActual.idAdministrador}`);
        const datos = await respuesta.json();

        document.getElementById('totalProductos').textContent = datos.total_productos || 0;
        document.getElementById('totalClientes').textContent = datos.total_clientes || 0;
        document.getElementById('alquileresActivos').textContent = datos.alquileres_activos || 0;
        document.getElementById('ingresosMes').textContent = `L. ${(datos.ingresos_mes || 0).toFixed(2)}`;

        const contenedor = document.getElementById('productosPopulares');
        if (datos.productos_populares && datos.productos_populares.length > 0) {
            contenedor.innerHTML = datos.productos_populares.map(p => `
                <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                    <div class="flex items-center space-x-3">
                        <i class="fas fa-box text-2xl text-pink-400"></i>
                        <div>
                            <p class="font-semibold text-gray-800">${p.Nombre}</p>
                            <p class="text-sm text-gray-500">L. ${p.Precio}/día</p>
                        </div>
                    </div>
                    <span class="text-2xl font-bold text-purple-500">${p.total_alquileres || 0}</span>
                </div>
            `).join('');
        } else {
            contenedor.innerHTML = '<p class="text-gray-500 text-center">No hay datos disponibles</p>';
        }

        generarCalendario();
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}

async function cargarAlquileresHoy() {
    const hoy = new Date().toISOString().split('T')[0];
    const alquileresHoy = alquileres.filter(a => a.FechaInicio === hoy || (a.FechaInicio <= hoy && a.FechaCorte >= hoy));

    const contenedor = document.getElementById('alquileresHoy');
    if (alquileresHoy.length === 0) {
        contenedor.innerHTML = '<p class="text-gray-500 text-center py-4">No hay alquileres para hoy</p>';
        return;
    }

    contenedor.innerHTML = alquileresHoy.map(a => `
        <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div class="flex items-center space-x-3">
                <i class="fas fa-calendar-check text-lg text-blue-500"></i>
                <div>
                    <p class="font-semibold text-gray-800 text-sm">${a.ProductoNombre}</p>
                    <p class="text-xs text-gray-500">${a.ClienteNombre}</p>
                </div>
            </div>
            <span class="px-2 py-1 rounded-full text-xs font-medium ${a.Estado === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}">${a.Estado}</span>
        </div>
    `).join('');
}

function generarCalendario() {
    const fecha = new Date();
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();

    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasMes = ultimoDia.getDate();
    const diaSemanaInicio = primerDia.getDay();

    const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const nombresDias = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

    let html = `
        <div class="mb-4">
            <h4 class="text-center font-bold text-lg text-gray-800">${nombresMeses[mes]} ${año}</h4>
        </div>
        <div class="grid grid-cols-7 gap-2 mb-2">
            ${nombresDias.map(d => `<div class="text-center font-semibold text-gray-600 text-sm">${d}</div>`).join('')}
        </div>
        <div class="grid grid-cols-7 gap-2">
    `;

    for (let i = 0; i < diaSemanaInicio; i++) {
        html += '<div></div>';
    }

    const hoy = fecha.getDate();
    for (let dia = 1; dia <= diasMes; dia++) {
        const esHoy = dia === hoy;
        html += `
            <div class="aspect-square flex items-center justify-center rounded-lg text-sm ${esHoy ? 'bg-gradient-to-br from-pink-400 to-purple-400 text-white font-bold' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'}">
                ${dia}
            </div>
        `;
    }

    html += '</div>';
    document.getElementById('calendarioMensual').innerHTML = html;
}

// PRODUCTOS
function obtenerHTMLProductos() {
    return `
        <div class="mb-6 flex justify-between items-center">
            <div>
                <h2 class="text-3xl font-bold text-gray-800">
                    <i class="fas fa-box mr-2"></i>Productos
                </h2>
                <p class="text-gray-500 mt-1">Administra tu inventario</p>
            </div>
            <button onclick="abrirModal('modalProducto')" class="px-6 py-3 rounded-xl text-white font-semibold shadow-lg" style="background: linear-gradient(135deg, #FFB5E8 0%, #DCD6F7 100%);">
                <i class="fas fa-plus mr-2"></i>Nuevo Producto
            </button>
        </div>
        <div id="listaProductos" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
    `;
}

function renderizarProductos() {
    const contenedor = document.getElementById('listaProductos');

    if (productos.length === 0) {
        contenedor.innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">No hay productos registrados</p>';
        return;
    }

    contenedor.innerHTML = productos.map(p => `
        <div class="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div class="flex justify-between items-start mb-4">
                <div class="w-16 h-16 bg-gradient-to-br from-pink-300 to-purple-300 rounded-xl flex items-center justify-center text-3xl text-white">
                    <i class="fas fa-box"></i>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-medium ${p.TipoProducto === 'Arrendamiento' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}">
                    ${p.TipoProducto}
                </span>
            </div>
            <h4 class="font-bold text-lg text-gray-800 mb-1">${p.nombre}</h4>
            <p class="text-sm text-gray-600 mb-4">${p.Descripcion || 'Sin descripción'}</p>
            <div class="flex justify-between items-center pt-4 border-t border-gray-100 mb-4">
                <div>
                    <p class="text-xs text-gray-500">Precio</p>
                    <p class="text-xl font-bold text-pink-500">L. ${p.Precio}</p>
                </div>
                <div class="text-right">
                    <p class="text-xs text-gray-500">Disponibles</p>
                    <p class="text-xl font-bold text-purple-500">${p.Disponibles}</p>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="editarProducto(${p.idProducto})" class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm">
                    <i class="fas fa-edit mr-1"></i>Editar
                </button>
                <button onclick="eliminarProducto(${p.idProducto})" class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm">
                    <i class="fas fa-trash mr-1"></i>Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

async function guardarProducto(evento) {
    evento.preventDefault();

    const datos = {
        nombre: document.getElementById('nombreProducto').value,
        disponibles: parseInt(document.getElementById('disponiblesProducto').value),
        precio: parseFloat(document.getElementById('precioProducto').value),
        tipoProducto: document.getElementById('tipoProducto').value,
        descripcion: document.getElementById('descripcionProducto').value,
        idAdministrador: usuarioActual.idAdministrador
    };

    const idProducto = document.getElementById('idProductoEditar')?.value;
    const url = idProducto ? `/productos/editar/${idProducto}/` : '/productos/crear/';

    try {
        const respuesta = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (respuesta.ok) {
            mostrarNotificacion(idProducto ? 'Producto actualizado exitosamente' : 'Producto agregado exitosamente', 'success');
            cerrarModal('modalProducto');
            await cargarProductos();
            if (seccionActual === 'productos') renderizarProductos();
            if (seccionActual === 'dashboard') cargarEstadisticas();
        } else {
            mostrarNotificacion('Error al guardar producto', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error de conexión', 'error');
    }
}

function editarProducto(id) {
    const producto = productos.find(p => p.idProducto === id);
    if (!producto) return;

    document.getElementById('nombreProducto').value = producto.Nombre;
    document.getElementById('disponiblesProducto').value = producto.Disponibles;
    document.getElementById('precioProducto').value = producto.Precio;
    document.getElementById('tipoProducto').value = producto.TipoProducto;
    document.getElementById('descripcionProducto').value = producto.Descripcion || '';

    let inputId = document.getElementById('idProductoEditar');
    if (!inputId) {
        inputId = document.createElement('input');
        inputId.type = 'hidden';
        inputId.id = 'idProductoEditar';
        document.getElementById('formularioProducto').appendChild(inputId);
    }
    inputId.value = id;

    document.querySelector('#modalProducto h3').textContent = 'Editar Producto';
    abrirModal('modalProducto');
}

async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
        const respuesta = await fetch(`/productos/eliminar/${id}/?idAdministrador=${usuarioActual.idAdministrador}`, {
            method: 'DELETE'
        });

        if (respuesta.ok) {
            mostrarNotificacion('Producto eliminado exitosamente', 'success');
            await cargarProductos();
            if (seccionActual === 'productos') renderizarProductos();
            if (seccionActual === 'dashboard') cargarEstadisticas();
        } else {
            mostrarNotificacion('Error al eliminar producto', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error de conexión', 'error');
    }
}

// CLIENTES
function obtenerHTMLClientes() {
    return `
        <div class="mb-6 flex justify-between items-center">
            <div>
                <h2 class="text-3xl font-bold text-gray-800">
                    <i class="fas fa-users mr-2"></i>Clientes
                </h2>
                <p class="text-gray-500 mt-1">Administra tu base de clientes</p>
            </div>
            <button onclick="abrirModal('modalCliente')" class="px-6 py-3 rounded-xl text-white font-semibold shadow-lg" style="background: linear-gradient(135deg, #c084fc, #f9a8d4);">
                <i class="fas fa-plus mr-2"></i>Nuevo Cliente
            </button>
        </div>
        <div id="listaClientes" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
    `;
}

function renderizarClientes() {
    const contenedor = document.getElementById('listaClientes');

    if (clientes.length === 0) {
        contenedor.innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">No hay clientes registrados</p>';
        return;
    }

    contenedor.innerHTML = clientes.map(c => `
        <div class="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div class="flex items-center space-x-4 mb-4">
                <div class="w-16 h-16 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full flex items-center justify-center text-2xl text-white font-bold">
                    ${c.NombreCompleto.charAt(0)}
                </div>
                <div>
                    <h4 class="font-bold text-lg text-gray-800">${c.NombreCompleto}</h4>
                    <p class="text-sm text-gray-500">${c.Tipo || 'Regular'}</p>
                </div>
            </div>
            <div class="space-y-2 text-sm mb-4">
                <p class="text-gray-600"><i class="fas fa-id-card mr-2"></i>${c.DNI}</p>
                <p class="text-gray-600"><i class="fas fa-phone mr-2"></i>${c.Telefono}</p>
                <p class="text-gray-600"><i class="fas fa-envelope mr-2"></i>${c.Email || 'Sin email'}</p>
            </div>
            <div class="flex gap-2">
                <button onclick="editarCliente(${c.idCliente})" class="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm">
                    <i class="fas fa-edit mr-1"></i>Editar
                </button>
                <button onclick="eliminarCliente(${c.idCliente})" class="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm">
                    <i class="fas fa-trash mr-1"></i>Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

async function guardarCliente(evento) {
    evento.preventDefault();

    const datos = {
        dni: document.getElementById('dniCliente').value,
        nombre: document.getElementById('nombreCliente').value,
        apellido: document.getElementById('apellidoCliente').value,
        telefono: document.getElementById('telefonoCliente').value,
        email: document.getElementById('emailCliente').value,
        direccion: document.getElementById('direccionCliente').value,
        idAdministrador: usuarioActual.idAdministrador
    };

    const idCliente = document.getElementById('idClienteEditar')?.value;
    const url = idCliente ? `/clientes/editar/${idCliente}/` : '/clientes/crear/';

    try {
        const respuesta = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (respuesta.ok) {
            mostrarNotificacion(idCliente ? 'Cliente actualizado exitosamente' : 'Cliente agregado exitosamente', 'success');
            cerrarModal('modalCliente');
            await cargarClientes();
            if (seccionActual === 'clientes') renderizarClientes();
            if (seccionActual === 'dashboard') cargarEstadisticas();
        } else {
            mostrarNotificacion('Error al guardar cliente', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error de conexión', 'error');
    }
}

function editarCliente(id) {
    const cliente = clientes.find(c => c.idCliente === id);
    if (!cliente) return;

    const nombres = cliente.NombreCompleto.split(' ');
    document.getElementById('nombreCliente').value = nombres[0] || '';
    document.getElementById('apellidoCliente').value = nombres.slice(1).join(' ') || '';
    document.getElementById('dniCliente').value = cliente.DNI;
    document.getElementById('telefonoCliente').value = cliente.Telefono;
    document.getElementById('emailCliente').value = cliente.Email || '';
    document.getElementById('direccionCliente').value = cliente.Direccion || '';

    let inputId = document.getElementById('idClienteEditar');
    if (!inputId) {
        inputId = document.createElement('input');
        inputId.type = 'hidden';
        inputId.id = 'idClienteEditar';
        document.getElementById('formularioCliente').appendChild(inputId);
    }
    inputId.value = id;

    document.querySelector('#modalCliente h3').textContent = 'Editar Cliente';
    abrirModal('modalCliente');
}

async function eliminarCliente(id) {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;

    try {
        const respuesta = await fetch(`/clientes/eliminar/${id}/?idAdministrador=${usuarioActual.idAdministrador}`, {
            method: 'DELETE'
        });

        if (respuesta.ok) {
            mostrarNotificacion('Cliente eliminado exitosamente', 'success');
            await cargarClientes();
            if (seccionActual === 'clientes') renderizarClientes();
            if (seccionActual === 'dashboard') cargarEstadisticas();
        } else {
            mostrarNotificacion('Error al eliminar cliente', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error de conexión', 'error');
    }
}

// ALQUILERES
function obtenerHTMLAlquileres() {
    return `
        <div class="mb-6 flex justify-between items-center">
            <div>
                <h2 class="text-3xl font-bold text-gray-800">
                    <i class="fas fa-calendar-check mr-2"></i>Alquileres
                </h2>
                <p class="text-gray-500 mt-1">Administra todos los alquileres</p>
            </div>
            <button onclick="abrirModal('modalAlquiler')" class="px-6 py-3 rounded-xl text-white font-semibold shadow-lg" style="background: linear-gradient(135deg, #AEC6FF 0%, #B5EAD7 100%);">
                <i class="fas fa-plus mr-2"></i>Nuevo Alquiler
            </button>
        </div>
        <div class="bg-white rounded-2xl p-6 shadow-lg">
            <div id="listaAlquileres" class="space-y-4"></div>
        </div>
    `;
}

function renderizarAlquileres() {
    const contenedor = document.getElementById('listaAlquileres');

    if (alquileres.length === 0) {
        contenedor.innerHTML = '<p class="text-gray-500 text-center py-8">No hay alquileres registrados</p>';
        return;
    }

    contenedor.innerHTML = alquileres.map(a => {
        const colorEstado = {
            'Activo': 'bg-green-100 text-green-700',
            'Pendiente': 'bg-yellow-100 text-yellow-700',
            'Realizado': 'bg-gray-100 text-gray-700'
        }[a.Estado] || 'bg-gray-100 text-gray-700';

        return `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                <div class="flex items-center space-x-4 flex-1">
                    <div class="w-12 h-12 bg-gradient-to-br from-blue-300 to-purple-300 rounded-lg flex items-center justify-center text-xl text-white">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-800">${a.ProductoNombre}</p>
                        <p class="text-sm text-gray-500">Cliente: ${a.ClienteNombre}</p>
                        <p class="text-xs text-gray-400">${a.FechaInicio} - ${a.FechaCorte}</p>
                    </div>
                </div>
                <div class="text-right mr-4">
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${colorEstado}">${a.Estado}</span>
                    <p class="text-sm text-gray-600 mt-2">Total: <strong>L. ${parseFloat(a.TotalPagar || 0).toFixed(2)}</strong></p>
                </div>
                <div class="flex gap-2">
                    <button onclick="eliminarAlquiler(${a.idAlquiler})" class="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

async function guardarAlquiler(evento) {
    evento.preventDefault();

    const datos = {
        idCliente: parseInt(document.getElementById('clienteAlquiler').value),
        idProducto: parseInt(document.getElementById('productoAlquiler').value),
        fechaInicio: document.getElementById('fechaInicioAlquiler').value,
        fechaCorte: document.getElementById('fechaFinAlquiler').value,
        cantidad: parseInt(document.getElementById('cantidadAlquiler').value),
        pagoInicial: parseFloat(document.getElementById('pagoInicialAlquiler').value),
        pagoDeposito: parseFloat(document.getElementById('depositoAlquiler').value),
        idAdministrador: usuarioActual.idAdministrador
    };

    try {
        const respuesta = await fetch('/alquileres/crear/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (respuesta.ok) {
            mostrarNotificacion('Alquiler registrado exitosamente', 'success');
            cerrarModal('modalAlquiler');
            await cargarAlquileres();
            if (seccionActual === 'alquileres') renderizarAlquileres();
            if (seccionActual === 'dashboard') {
                cargarEstadisticas();
                cargarAlquileresHoy();
            }
        } else {
            mostrarNotificacion('Error al registrar alquiler', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error de conexión', 'error');
    }
}

async function eliminarAlquiler(id) {
    if (!confirm('¿Estás seguro de eliminar este alquiler?')) return;

    try {
        const respuesta = await fetch(`/alquileres/eliminar/${id}/?idAdministrador=${usuarioActual.idAdministrador}`, {
            method: 'DELETE'
        });

        if (respuesta.ok) {
            mostrarNotificacion('Alquiler eliminado exitosamente', 'success');
            await cargarAlquileres();
            if (seccionActual === 'alquileres') renderizarAlquileres();
            if (seccionActual === 'dashboard') {
                cargarEstadisticas();
                cargarAlquileresHoy();
            }
        } else {
            mostrarNotificacion('Error al eliminar alquiler', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error de conexión', 'error');
    }
}

// PAGOS
function obtenerHTMLPagos() {
    return `
        <div class="mb-6 flex justify-between items-center">
            <div>
                <h2 class="text-3xl font-bold text-gray-800">
                    <i class="fas fa-dollar-sign mr-2"></i>Pagos
                </h2>
                <p class="text-gray-500 mt-1">Historial de transacciones</p>
            </div>
            <button onclick="abrirModal('modalPago')" class="px-6 py-3 rounded-xl text-white font-semibold shadow-lg" style="background: linear-gradient(135deg, #34d399, #10b981);">
                <i class="fas fa-plus mr-2"></i>Registrar Pago
            </button>
        </div>
        <div class="bg-white rounded-2xl p-6 shadow-lg">
            <div id="listaPagos" class="space-y-4"></div>
        </div>
    `;
}

function renderizarPagos() {
    const contenedor = document.getElementById('listaPagos');

    if (pagos.length === 0) {
        contenedor.innerHTML = '<p class="text-gray-500 text-center py-8">No hay pagos registrados</p>';
        return;
    }

    contenedor.innerHTML = pagos.map(p => `
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
            <div class="flex items-center space-x-4">
                <div class="w-12 h-12 bg-gradient-to-br from-green-300 to-blue-300 rounded-lg flex items-center justify-center text-xl text-white">
                    <i class="fas fa-dollar-sign"></i>
                </div>
                <div>
                    <p class="font-semibold text-gray-800">${p.Cliente || 'Cliente no especificado'}</p>
                    <p class="text-sm text-gray-500">Método: ${p.MetodoPago}</p>
                    <p class="text-xs text-gray-400">${new Date(p.FechaPago).toLocaleDateString('es-HN')}</p>
                </div>
            </div>
            <div class="text-right">
                <p class="text-2xl font-bold text-green-600">L. ${parseFloat(p.Monto).toFixed(2)}</p>
            </div>
        </div>
    `).join('');
}

async function guardarPago(evento) {
    evento.preventDefault();

    const datos = {
        idCliente: parseInt(document.getElementById('clientePago').value),
        idAlquiler: parseInt(document.getElementById('alquilerPago').value) || null,
        monto: parseFloat(document.getElementById('montoPago').value),
        metodoPago: document.getElementById('metodoPago').value,
        idAdministrador: usuarioActual.idAdministrador
    };

    try {
        const respuesta = await fetch('/pagos/registrar/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (respuesta.ok) {
            mostrarNotificacion('Pago registrado exitosamente', 'success');
            cerrarModal('modalPago');
            await cargarPagos();
            if (seccionActual === 'pagos') renderizarPagos();
            if (seccionActual === 'dashboard') cargarEstadisticas();
        } else {
            mostrarNotificacion('Error al registrar pago', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error de conexión', 'error');
    }
}

// ESTACIONES
function obtenerHTMLEstaciones() {
    return `
        <div class="mb-6 flex justify-between items-center">
            <div>
                <h2 class="text-3xl font-bold text-gray-800">
                    <i class="fas fa-map-marker-alt mr-2"></i>Estaciones
                </h2>
                <p class="text-gray-500 mt-1">Ubicaciones del negocio</p>
            </div>
            <button onclick="abrirModal('modalEstacion')" class="px-6 py-3 rounded-xl text-white font-semibold shadow-lg" style="background: linear-gradient(135deg, #c084fc, #f9a8d4);">
                <i class="fas fa-plus mr-2"></i>Nueva Estación
            </button>
        </div>
        <div id="listaEstaciones" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
    `;
}

function renderizarEstaciones() {
    const contenedor = document.getElementById('listaEstaciones');

    if (estaciones.length === 0) {
        contenedor.innerHTML = '<p class="text-gray-500 col-span-full text-center py-8">No hay estaciones registradas</p>';
        return;
    }

    contenedor.innerHTML = estaciones.map(e => `
        <div class="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div class="flex items-center space-x-4 mb-4">
                <div class="w-16 h-16 bg-gradient-to-br from-blue-300 to-green-300 rounded-xl flex items-center justify-center text-2xl text-white">
                    <i class="fas fa-store"></i>
                </div>
                <div>
                    <h4 class="font-bold text-lg text-gray-800">${e.Nombre}</h4>
                </div>
            </div>
            <p class="text-sm text-gray-600">${e.DescripcionEstacion || 'Sin descripción'}</p>
        </div>
    `).join('');
}

async function guardarEstacion(evento) {
    evento.preventDefault();

    const datos = {
        nombre: document.getElementById('nombreEstacion').value,
        descripcion: document.getElementById('descripcionEstacion').value,
        idAdministrador: usuarioActual.idAdministrador
    };

    try {
        const respuesta = await fetch('/estaciones/crear/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (respuesta.ok) {
            mostrarNotificacion('Estación agregada exitosamente', 'success');
            cerrarModal('modalEstacion');
            await cargarEstaciones();
            if (seccionActual === 'estaciones') renderizarEstaciones();
        } else {
            mostrarNotificacion('Error al agregar estación', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error de conexión', 'error');
    }
}

// REPORTES
function obtenerHTMLReportes() {
    return `
        <div class="mb-6">
            <h2 class="text-3xl font-bold text-gray-800">
                <i class="fas fa-chart-bar mr-2"></i>Reportes
            </h2>
            <p class="text-gray-500 mt-1">Análisis detallado del negocio</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div class="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                <div class="flex items-center justify-between mb-4">
                    <i class="fas fa-dollar-sign text-4xl opacity-80"></i>
                    <span class="text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full">Total</span>
                </div>
                <h3 class="text-3xl font-bold mb-1" id="reporteIngresoTotal">L. 0</h3>
                <p class="text-sm opacity-80">Ingresos Totales</p>
            </div>

            <div class="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                <div class="flex items-center justify-between mb-4">
                    <i class="fas fa-calendar-check text-4xl opacity-80"></i>
                    <span class="text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full">Activos</span>
                </div>
                <h3 class="text-3xl font-bold mb-1" id="reporteAlquileresTotal">0</h3>
                <p class="text-sm opacity-80">Total Alquileres</p>
            </div>

            <div class="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                <div class="flex items-center justify-between mb-4">
                    <i class="fas fa-chart-line text-4xl opacity-80"></i>
                    <span class="text-xs bg-white bg-opacity-20 px-3 py-1 rounded-full">Promedio</span>
                </div>
                <h3 class="text-3xl font-bold mb-1" id="reportePromedioAlquiler">L. 0</h3>
                <p class="text-sm opacity-80">Ingreso por Alquiler</p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div class="bg-white rounded-2xl p-6 shadow-lg">
                <h3 class="text-xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-trophy text-yellow-500 mr-2"></i>Top 5 Clientes
                </h3>
                <div id="reporteTopClientes" class="space-y-3"></div>
            </div>

            <div class="bg-white rounded-2xl p-6 shadow-lg">
                <h3 class="text-xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-box-open text-blue-500 mr-2"></i>Productos Más Rentables
                </h3>
                <div id="reporteProductosRentables" class="space-y-3"></div>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div class="bg-white rounded-2xl p-6 shadow-lg">
                <h3 class="text-xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-chart-pie text-purple-500 mr-2"></i>Estado de Alquileres
                </h3>
                <div id="reporteEstadoAlquileres"></div>
            </div>

            <div class="bg-white rounded-2xl p-6 shadow-lg">
                <h3 class="text-xl font-bold text-gray-800 mb-4">
                    <i class="fas fa-chart-bar text-green-500 mr-2"></i>Ingresos por Mes
                </h3>
                <div id="reporteIngresosMes"></div>
            </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-lg">
            <h3 class="text-xl font-bold text-gray-800 mb-4">
                <i class="fas fa-table text-indigo-500 mr-2"></i>Historial de Pagos Recientes
            </h3>
            <div id="reportePagosRecientes" class="overflow-x-auto"></div>
        </div>
    `;
}

async function cargarReportes() {
    try {
        await cargarPagos();

        const ingresoTotal = pagos.reduce((sum, p) => sum + parseFloat(p.Monto || 0), 0);
        const totalAlquileres = alquileres.length;
        const promedioAlquiler = totalAlquileres > 0 ? ingresoTotal / totalAlquileres : 0;

        document.getElementById('reporteIngresoTotal').textContent = `L. ${ingresoTotal.toFixed(2)}`;
        document.getElementById('reporteAlquileresTotal').textContent = totalAlquileres;
        document.getElementById('reportePromedioAlquiler').textContent = `L. ${promedioAlquiler.toFixed(2)}`;

        const clientesConAlquileres = clientes.map(c => ({
            ...c,
            totalAlquileres: alquileres.filter(a => a.ClienteNombre === c.NombreCompleto).length
        })).sort((a, b) => b.totalAlquileres - a.totalAlquileres).slice(0, 5);

        document.getElementById('reporteTopClientes').innerHTML = clientesConAlquileres.map((c, i) => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white font-bold text-sm">
                        ${i + 1}
                    </div>
                    <div>
                        <p class="font-semibold text-gray-800">${c.NombreCompleto}</p>
                        <p class="text-xs text-gray-500">${c.Email || 'Sin email'}</p>
                    </div>
                </div>
                <span class="text-lg font-bold text-purple-600">${c.totalAlquileres}</span>
            </div>
        `).join('') || '<p class="text-gray-500 text-center">No hay datos</p>';

        const productosConIngresos = productos.map(p => {
            const ingresosProducto = alquileres
                .filter(a => a.ProductoNombre === p.Nombre)
                .reduce((sum, a) => sum + parseFloat(a.TotalPagar || 0), 0);
            return { ...p, ingresos: ingresosProducto };
        }).sort((a, b) => b.ingresos - a.ingresos).slice(0, 5);

        document.getElementById('reporteProductosRentables').innerHTML = productosConIngresos.map(p => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-box text-2xl text-blue-400"></i>
                    <div>
                        <p class="font-semibold text-gray-800">${p.nombre}</p>
                        <p class="text-xs text-gray-500">${p.TipoProducto}</p>
                    </div>
                </div>
                <span class="text-lg font-bold text-green-600">L. ${p.ingresos.toFixed(2)}</span>
            </div>
        `).join('') || '<p class="text-gray-500 text-center">No hay datos</p>';

        const estados = {
            'Activo': alquileres.filter(a => a.Estado === 'Activo').length,
            'Pendiente': alquileres.filter(a => a.Estado === 'Pendiente').length,
            'Realizado': alquileres.filter(a => a.Estado === 'Realizado').length
        };

        const maxEstado = Math.max(...Object.values(estados), 1);
        document.getElementById('reporteEstadoAlquileres').innerHTML = `
            <div class="space-y-4">
                ${Object.entries(estados).map(([estado, cantidad]) => `
                    <div>
                        <div class="flex justify-between mb-1">
                            <span class="text-sm font-medium text-gray-700">${estado}</span>
                            <span class="text-sm font-bold text-gray-800">${cantidad}</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-3">
                            <div class="h-3 rounded-full ${estado === 'Activo' ? 'bg-green-500' : estado === 'Pendiente' ? 'bg-yellow-500' : 'bg-gray-500'}" style="width: ${(cantidad / maxEstado) * 100}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        const mesesIngresos = calcularIngresosMensuales();
        const maxIngreso = Math.max(...mesesIngresos.map(m => m.ingreso), 1);

        document.getElementById('reporteIngresosMes').innerHTML = `
            <div class="flex items-end justify-between h-48 space-x-2">
                ${mesesIngresos.map(m => `
                    <div class="flex-1 flex flex-col items-center">
                        <div class="w-full bg-gradient-to-t from-green-400 to-green-600 rounded-t-lg transition-all hover:opacity-80" 
                             style="height: ${(m.ingreso / maxIngreso) * 100}%"
                             title="L. ${m.ingreso.toFixed(2)}">
                        </div>
                        <p class="text-xs text-gray-600 mt-2">${m.mes}</p>
                    </div>
                `).join('')}
            </div>
        `;

        const pagosRecientes = pagos.slice(0, 10);
        document.getElementById('reportePagosRecientes').innerHTML = pagosRecientes.length > 0 ? `
            <table class="w-full">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    ${pagosRecientes.map(p => `
                        <tr class="hover:bg-gray-50">
                            <td class="px-4 py-3 text-sm text-gray-800">${p.Cliente || 'N/A'}</td>
                            <td class="px-4 py-3 text-sm text-gray-600">${p.MetodoPago}</td>
                            <td class="px-4 py-3 text-sm text-gray-600">${new Date(p.FechaPago).toLocaleDateString('es-HN')}</td>
                            <td class="px-4 py-3 text-sm text-right font-bold text-green-600">L. ${parseFloat(p.Monto).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : '<p class="text-gray-500 text-center py-8">No hay pagos registrados</p>';

    } catch (error) {
        console.error('Error al cargar reportes:', error);
    }
}

function calcularIngresosMensuales() {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const hoy = new Date();
    const resultado = [];

    for (let i = 5; i >= 0; i--) {
        const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
        const mes = fecha.getMonth();
        const año = fecha.getFullYear();

        const ingresosMes = pagos.filter(p => {
            const fechaPago = new Date(p.FechaPago);
            return fechaPago.getMonth() === mes && fechaPago.getFullYear() === año;
        }).reduce((sum, p) => sum + parseFloat(p.Monto || 0), 0);

        resultado.push({
            mes: meses[mes],
            ingreso: ingresosMes
        });
    }

    return resultado;
}

// MODALES
function abrirModal(idModal) {
    const modal = document.getElementById(idModal);
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';

    if (idModal === 'modalAlquiler') {
        cargarClientesEnSelect();
        cargarProductosEnSelect();
    }

    if (idModal === 'modalPago') {
        cargarClientesEnSelectPago();
        cargarAlquileresEnSelect();
    }
}

function cerrarModal(idModal) {
    const modal = document.getElementById(idModal);
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';

    const formularios = {
        'modalProducto': 'formularioProducto',
        'modalCliente': 'formularioCliente',
        'modalAlquiler': 'formularioAlquiler',
        'modalEstacion': 'formularioEstacion',
        'modalPago': 'formularioPago'
    };

    const formulario = document.getElementById(formularios[idModal]);
    if (formulario) formulario.reset();

    const inputIdProducto = document.getElementById('idProductoEditar');
    if (inputIdProducto) inputIdProducto.remove();

    const inputIdCliente = document.getElementById('idClienteEditar');
    if (inputIdCliente) inputIdCliente.remove();

    if (idModal === 'modalProducto') {
        document.querySelector('#modalProducto h3').textContent = 'Agregar Nuevo Producto';
    } else if (idModal === 'modalCliente') {
        document.querySelector('#modalCliente h3').textContent = 'Agregar Nuevo Cliente';
    }
}

function cargarClientesEnSelect() {
    const select = document.getElementById('clienteAlquiler');
    if (!select) return;

    select.innerHTML = '<option value="">Seleccionar cliente</option>' +
        clientes.map(c => `<option value="${c.idCliente}">${c.NombreCompleto}</option>`).join('');
}

function cargarProductosEnSelect() {
    const select = document.getElementById('productoAlquiler');
    if (!select) return;

    const productosArrendamiento = productos.filter(p => p.TipoProducto === 'Arrendamiento' && p.Disponibles > 0);

    select.innerHTML = '<option value="">Seleccionar producto</option>' +
        productosArrendamiento.map(p => `<option value="${p.idProducto}">${p.Nombre} - L. ${p.Precio}/día (${p.Disponibles} disponibles)</option>`).join('');
}

function cargarClientesEnSelectPago() {
    const select = document.getElementById('clientePago');
    if (!select) return;

    select.innerHTML = '<option value="">Seleccionar cliente</option>' +
        clientes.map(c => `<option value="${c.idCliente}">${c.NombreCompleto}</option>`).join('');
}

function cargarAlquileresEnSelect() {
    const select = document.getElementById('alquilerPago');
    if (!select) return;

    const alquileresActivos = alquileres.filter(a => a.Estado === 'Activo');

    select.innerHTML = '<option value="">Seleccionar alquiler (opcional)</option>' +
        alquileresActivos.map(a => `<option value="${a.idAlquiler}">${a.ProductoNombre} - ${a.ClienteNombre}</option>`).join('');
}

document.addEventListener('click', function(evento) {
    const modales = ['modalProducto', 'modalCliente', 'modalAlquiler', 'modalEstacion', 'modalPago'];
    modales.forEach(idModal => {
        const modal = document.getElementById(idModal);
        if (modal && evento.target === modal) {
            cerrarModal(idModal);
        }
    });
});

// NOTIFICACIONES
function mostrarNotificacion(mensaje, tipo = 'info') {
    const colores = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };

    const iconos = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    const notificacion = document.createElement('div');
    notificacion.className = `fixed top-4 right-4 ${colores[tipo]} text-white px-6 py-4 rounded-lg shadow-lg z-50 flex items-center space-x-3 animate-slide-in`;
    notificacion.innerHTML = `
        <i class="fas ${iconos[tipo]}"></i>
        <span>${mensaje}</span>
    `;

    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.style.animation = 'slide-out 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notificacion);
        }, 300);
    }, 3000);
}

// EVENTOS GLOBALES
window.addEventListener('resize', function() {
    if (window.innerWidth >= 768) {
        const menu = document.getElementById('menuLateral');
        const overlay = document.getElementById('overlay');
        if (menu) menu.classList.remove('activo');
        if (overlay) overlay.classList.add('hidden');
    }
});