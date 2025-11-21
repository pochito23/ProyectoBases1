// VARIABLES GLOBALES

let usuarioActual = null;
let seccionActual = 'dashboard';

let administradores = [
    { usuario: 'admin', password: 'admin123', nombre: 'Administrador Principal', email: 'admin@sistema.com' },
    { usuario: 'kevin', password: 'kevin123', nombre: 'Kevin Sanchez', email: 'kevin@sistema.com' }
];

let productos = [];
let clientes = [];
let alquileres = [];
let pagos = [];
let estaciones = [];


// INICIALIZACIÓN

document.addEventListener('DOMContentLoaded', function() {
    cargarAdministradores();

    // Detectar si estamos en dashboard o login
    if (window.location.pathname.includes('dashboard')) {
        verificarSesion();
    } else if (window.location.pathname.includes('login') || window.location.pathname === '/') {
        configurarLogin();
    }
});


// GESTIÓN DE ADMINISTRADORES

function cargarAdministradores() {
    const adminsGuardados = localStorage.getItem('administradores');
    if (adminsGuardados) {
        administradores = JSON.parse(adminsGuardados);
    }
}

function guardarAdministradores() {
    localStorage.setItem('administradores', JSON.stringify(administradores));
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

function iniciarSesion(evento) {
    evento.preventDefault();

    const usuario = document.getElementById('usuarioInput').value;
    const password = document.getElementById('passwordInput').value;

    const admin = administradores.find(a => a.usuario === usuario && a.password === password);

    if (admin) {
        // Guardar sesión
        usuarioActual = admin;
        localStorage.setItem('usuarioActual', JSON.stringify(admin));

        // CORRECCIÓN: Redirigir a la URL correcta de Django
        window.location.href = '/dashboard/';

    } else {
        mostrarError('Usuario o contraseña incorrectos');
    }
}

function registrarAdministrador(evento) {
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

    if (administradores.some(a => a.usuario === usuario)) {
        alert('El usuario ya existe');
        return;
    }

    if (administradores.some(a => a.email === email)) {
        alert('El correo electrónico ya está registrado');
        return;
    }

    const nuevoAdmin = {
        usuario: usuario,
        password: password,
        nombre: nombre,
        email: email
    };

    administradores.push(nuevoAdmin);
    guardarAdministradores();

    alert('Administrador registrado exitosamente. Ya puedes iniciar sesión.');
    cerrarModalRegistro();
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
        // CORRECCIÓN: Redirigir a la URL correcta de Django
        window.location.href = '/login/';
    }
}

function cerrarSesion() {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        localStorage.removeItem('usuarioActual');
        // CORRECCIÓN: Redirigir a la URL correcta de Django
        window.location.href = '/login/';
    }
}


// ============================================
// INICIALIZACIÓN DEL DASHBOARD
// ============================================

function inicializarDashboard() {
    document.getElementById('nombreUsuario').textContent = usuarioActual.usuario;
    document.getElementById('emailUsuario').textContent = usuarioActual.email;
    document.getElementById('inicialUsuario').textContent = usuarioActual.nombre.charAt(0).toUpperCase();

    cargarDatosIniciales();
    mostrarSeccion('dashboard');
}


// ============================================
// CARGA DE DATOS DESDE EL BACKEND
// ============================================

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
        const respuesta = await fetch('/productos/');
        const datos = await respuesta.json();
        productos = datos.productos || [];
    } catch (error) {
        console.error('Error al cargar productos:', error);
        productos = [];
    }
}

async function cargarClientes() {
    try {
        const respuesta = await fetch('/clientes/');
        const datos = await respuesta.json();
        clientes = datos.clientes || [];
    } catch (error) {
        console.error('Error al cargar clientes:', error);
        clientes = [];
    }
}

async function cargarAlquileres() {
    try {
        const respuesta = await fetch('/alquileres/');
        const datos = await respuesta.json();
        alquileres = datos.alquileres || [];
    } catch (error) {
        console.error('Error al cargar alquileres:', error);
        alquileres = [];
    }
}

async function cargarEstaciones() {
    try {
        const respuesta = await fetch('/estaciones/');
        const datos = await respuesta.json();
        estaciones = datos.estaciones || [];
    } catch (error) {
        console.error('Error al cargar estaciones:', error);
        estaciones = [];
    }
}

async function cargarPagos() {
    try {
        const respuesta = await fetch('/pagos/');
        const datos = await respuesta.json();
        pagos = datos.pagos || [];
    } catch (error) {
        console.error('Error al cargar estaciones:', error);
        pagos = [];
    }
}


// ============================================
// NAVEGACIÓN
// ============================================

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
            cargarPagos();
            break;
        case 'estaciones':
            contenedor.innerHTML = obtenerHTMLEstaciones();
            renderizarEstaciones();
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


// ============================================
// DASHBOARD PRINCIPAL
// ============================================

function obtenerHTMLDashboard() {
    return `
        <div class="flex justify-between items-center mb-8">
            <div class="flex items-center gap-3">
                <button onclick="alternarMenu()" class="md:hidden p-2 bg-white rounded-lg shadow">
                    <i class="fas fa-bars text-2xl"></i>
                </button>
                <div>
                    <h2 class="text-3xl font-bold text-gray-800">Panel Principal</h2>
                    <p class="text-gray-500 mt-1">Bienvenido de vuelta, ${usuarioActual.nombre}</p>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-pink-300 hover:-translate-y-3 hover:shadow-2xl transition-all">
                <div class="flex justify-between items-start ">
                    <div>
                        <p class="text-gray-500 text-sm font-medium mb-1 ">Total Productos</p>
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

            <div class="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-green-300 hover:-translate-y-3 hover:shadow-2xl transition-all" >
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

            <div class="bg-white rounded-2xl p-6 shadow-lg border-t-4 border-yellow-300 hover:-translate-y-3 hover:shadow-2xl transition-all    ">
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
        const respuesta = await fetch('/estadisticas/');
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
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
    }
}


// [RESTO DEL CÓDIGO SE MANTIENE IGUAL - Solo cambié las URLs de fetch para usar rutas relativas y las redirecciones]

// Continúa con las demás funciones...
// ============================================
// PRODUCTOS
// ============================================

function obtenerHTMLProductos() {
    return `
        <div class="mb-6 flex justify-between items-center">
            <div>
                <h2 class="text-3xl font-bold text-gray-800">
                    <i class="fas fa-box mr-2"></i>Gestión de Productos
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
            <h4 class="font-bold text-lg text-gray-800 mb-1">${p.Nombre}</h4>
            <p class="text-sm text-gray-600 mb-4">${p.Descripcion || 'Sin descripción'}</p>
            <div class="flex justify-between items-center pt-4 border-t border-gray-100">
                <div>
                    <p class="text-xs text-gray-500">Precio</p>
                    <p class="text-xl font-bold text-pink-500">L. ${p.Precio}</p>
                </div>
                <div class="text-right">
                    <p class="text-xs text-gray-500">Disponibles</p>
                    <p class="text-xl font-bold text-purple-500">${p.Disponibles}</p>
                </div>
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
        descripcion: document.getElementById('descripcionProducto').value
    };
    
    try {
        const respuesta = await fetch('http://localhost:8000/productos/crear/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        
        if (respuesta.ok) {
            mostrarNotificacion('Producto agregado exitosamente', 'success');
            cerrarModal('modalProducto');
            await cargarProductos();
            if (seccionActual === 'productos') renderizarProductos();
        } else {
            mostrarNotificacion('Error al agregar producto', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error de conexión', 'error');
    }
}


// ============================================
// CLIENTES
// ============================================

function obtenerHTMLClientes() {
    return `
        <div class="mb-6 flex justify-between items-center">
            <div>
                <h2 class="text-3xl font-bold text-gray-800">
                    <i class="fas fa-users mr-2"></i>Gestión de Clientes
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
            <div class="space-y-2 text-sm">
                <p class="text-gray-600"><i class="fas fa-id-card mr-2"></i>${c.DNI}</p>
                <p class="text-gray-600"><i class="fas fa-phone mr-2"></i>${c.Telefono}</p>
                <p class="text-gray-600"><i class="fas fa-envelope mr-2"></i>${c.Email || 'Sin email'}</p>
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
        direccion: document.getElementById('direccionCliente').value
    };
    
    try {
        const respuesta = await fetch('http://localhost:8000/clientes/crear/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        
        if (respuesta.ok) {
            mostrarNotificacion('Cliente agregado exitosamente', 'success');
            cerrarModal('modalCliente');
            await cargarClientes();
            if (seccionActual === 'clientes') renderizarClientes();
        } else {
            mostrarNotificacion('Error al agregar cliente', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error de conexión', 'error');
    }
}


// ============================================
// ALQUILERES
// ============================================

function obtenerHTMLAlquileres() {
    return `
        <div class="mb-6 flex justify-between items-center">
            <div>
                <h2 class="text-3xl font-bold text-gray-800">
                    <i class="fas fa-calendar-check mr-2"></i>Gestión de Alquileres
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
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-gradient-to-br from-blue-300 to-purple-300 rounded-lg flex items-center justify-center text-xl text-white">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-800">${a.ProductoNombre}</p>
                        <p class="text-sm text-gray-500">Cliente: ${a.ClienteNombre}</p>
                        <p class="text-xs text-gray-400">${a.FechaInicio} - ${a.FechaCorte}</p>
                    </div>
                </div>
                <div class="text-right">
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${colorEstado}">${a.Estado}</span>
                    <p class="text-sm text-gray-600 mt-2">Total: <strong>L. ${a.TotalPagar}</strong></p>
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
        pagoDeposito: parseFloat(document.getElementById('depositoAlquiler').value)
    };
    
    try {
        const respuesta = await fetch('http://localhost:8000/alquileres/crear/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });

        if (respuesta.ok) {
            mostrarNotificacion('Alquiler registrado exitosamente', 'success');
            cerrarModal('modalAlquiler');
            await cargarAlquileres();
            if (seccionActual === 'alquileres') renderizarAlquileres();
        } else {
            mostrarNotificacion('Error al registrar alquiler', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('Error de conexión', 'error');
    }
}


// ============================================
// PAGOS
// ============================================

function obtenerHTMLPagos() {
    return `
        <div class="mb-6">
            <h2 class="text-3xl font-bold text-gray-800">
                <i class="fas fa-dollar-sign mr-2"></i>Gestión de Pagos
            </h2>
            <p class="text-gray-500 mt-1">Historial de transacciones</p>
        </div>
        <div class="bg-white rounded-2xl p-6 shadow-lg">
            <div id="listaPagos" class="space-y-4"></div>
        </div>
    `;
}

async function cargarPagos() {
    try {
        const respuesta = await fetch('http://localhost:8000/pagos/');
        const datos = await respuesta.json();
        pagos = datos.pagos || [];
        renderizarPagos();
    } catch (error) {
        console.error('Error al cargar pagos:', error);
        pagos = [];
        renderizarPagos();
    }
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


// ============================================
// ESTACIONES
// ============================================

function obtenerHTMLEstaciones() {
    return `
        <div class="mb-6">
            <h2 class="text-3xl font-bold text-gray-800">
                <i class="fas fa-map-marker-alt mr-2"></i>Estaciones de Venta
            </h2>
                        <button onclick="abrirModal('modalEstacion')" class="px-6 py-3 rounded-xl text-white font-semibold shadow-lg" style="background: linear-gradient(135deg, #c084fc, #f9a8d4);">
                <i class="fas fa-plus mr-2"></i>Nueva Estacion
            </button>
            <p class="text-gray-500 mt-1">Ubicaciones del negocio</p>
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
        descripcion: document.getElementById('descripcionEstacion').value
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
// ============================================
// MODALES
// ============================================

function abrirModal(idModal) {
    const modal = document.getElementById(idModal);
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';

    // Cargar datos necesarios según el modal
    if (idModal === 'modalAlquiler') {
        cargarClientesEnSelect();
        cargarProductosEnSelect();
    }
}

function cerrarModal(idModal) {
    const modal = document.getElementById(idModal);
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';

    // Limpiar formularios
    const formularios = {
        'modalProducto': 'formularioProducto',
        'modalCliente': 'formularioCliente',
        'modalAlquiler': 'formularioAlquiler',
        'modalEstacion': 'formularioEstacion'
    };

    const formulario = document.getElementById(formularios[idModal]);
    if (formulario) formulario.reset();
}

// Cargar clientes en el select del modal de alquiler
function cargarClientesEnSelect() {
    const select = document.getElementById('clienteAlquiler');
    if (!select) return;

    select.innerHTML = '<option value="">Seleccionar cliente</option>' +
        clientes.map(c => `<option value="${c.idCliente}">${c.NombreCompleto}</option>`).join('');
}

// Cargar productos en el select del modal de alquiler
function cargarProductosEnSelect() {
    const select = document.getElementById('productoAlquiler');
    if (!select) return;

    // Solo productos de tipo Arrendamiento
    const productosArrendamiento = productos.filter(p => p.TipoProducto === 'Arrendamiento' && p.Disponibles > 0);

    select.innerHTML = '<option value="">Seleccionar producto</option>' +
        productosArrendamiento.map(p => `<option value="${p.idProducto}">${p.Nombre} - L. ${p.Precio}/día (${p.Disponibles} disponibles)</option>`).join('');
}

// Cerrar modal al hacer clic fuera
document.addEventListener('click', function(evento) {
    const modales = ['modalProducto', 'modalCliente', 'modalAlquiler'];
    modales.forEach(idModal => {
        const modal = document.getElementById(idModal);
        if (modal && evento.target === modal) {
            cerrarModal(idModal);
        }
    });
});


// ============================================
// NOTIFICACIONES
// ============================================

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


// ============================================
// EVENTOS GLOBALES
// ============================================

// Ajustar menú en cambio de tamaño de ventana
window.addEventListener('resize', function() {
    if (window.innerWidth >= 768) {
        const menu = document.getElementById('menuLateral');
        const overlay = document.getElementById('overlay');
        if (menu) menu.classList.remove('activo');
        if (overlay) overlay.classList.add('hidden');
    }
});