let usuarioActual = null;
let seccionActual = 'dashboard';

let contadorProductoId = 4;
let contadorReservaId = 4;
let contadorClienteId = 3;

let listaProductos = [
    { id: 1, nombre: 'PlayStation 5', icon: 'fas fa-gamepad', reservas: 85, categoria: 'Electrónica', precio: 15, descripcion: 'Consola de última generación' },
    { id: 2, nombre: 'Cancha Volleyball', icon: 'fas fa-volleyball-ball', reservas: 72, categoria: 'Deportes', precio: 20, descripcion: 'Cancha profesional' },
    { id: 3, nombre: 'Cámara Canon EOS', icon: 'fas fa-camera', reservas: 48, categoria: 'Fotografía', precio: 25, descripcion: 'Cámara profesional DSLR' },
    { id: 4, nombre: 'Laptop Dell XPS', icon: 'fas fa-laptop', reservas: 60, categoria: 'Electrónica', precio: 18, descripcion: 'Laptop de alto rendimiento' },
];

let listaReservas = [
    { id: 1, hora: '09:00-11:00', producto: 'Cancha Volleyball', cliente: 'Juan Pérez', estado: 'confirmada', fecha: '2025-11-06' },
    { id: 2, hora: '11:00-13:00', producto: 'PlayStation 5', cliente: 'María González', estado: 'confirmada', fecha: '2025-11-06' },
    { id: 3, hora: '14:00-16:00', producto: 'Cámara Canon EOS', cliente: 'Pedro López', estado: 'pendiente', fecha: '2025-11-06' },
    { id: 4, hora: '16:00-18:00', producto: 'Laptop Dell XPS', cliente: 'Ana Martínez', estado: 'cancelada', fecha: '2025-11-06' },
];

let listaClientes = [
    { id: 1, nombre: 'Juan Pérez', email: 'juan@email.com', telefono: '555-0101', reservasTotal: 15 },
    { id: 2, nombre: 'María González', email: 'maria@email.com', telefono: '555-0102', reservasTotal: 23 },
    { id: 3, nombre: 'Pedro López', email: 'pedro@email.com', telefono: '555-0103', reservasTotal: 8 },
];

const datosGrafico = {
    '7': [45, 70, 55, 85, 90, 65, 40],
    '30': [60, 75, 65, 80, 70, 85, 75],
    '90': [50, 65, 60, 70, 75, 80, 70],
};

function handleCredentialResponse(response) {
    const token = response.credential;
    const payload = JSON.parse(atob(token.split('.')[1]));
    
    usuarioActual = {
        nombre: payload.name,
        email: payload.email,
        foto: payload.picture
    };
    
    window.location.href = 'dashboard.html';
}

function iniciarConGoogle() {
    google.accounts.id.initialize({
        client_id: "596489853911-hc94h3mbv268mh7js20uf4hdcll3uqs4.apps.googleusercontent.com",
        callback: handleCredentialResponse
    });
    
    google.accounts.id.prompt();
}

function iniciarSesion(evento) {
    evento.preventDefault();
    const email = document.getElementById('emailInput').value;
    const password = document.getElementById('passwordInput').value;

    if (email && password) {
        usuarioActual = {
            nombre: email.split('@')[0],
            email: email,
            foto: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23ec4899"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="white" font-size="40" font-family="Arial">' + email.charAt(0).toUpperCase() + '</text></svg>'
        };
        window.location.href = 'dashboard.html';
    }
}

function cerrarSesion() {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
        window.location.href = 'login.html';
    }
}

function verificarSesion() {
    if (window.location.pathname.includes('dashboard.html')) {
        usuarioActual = { nombre: 'Usuario', email: 'usuario@email.com', foto: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="%23ec4899"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="white" font-size="40" font-family="Arial">U</text></svg>' };
        inicializarDashboard();
    }
}

function inicializarDashboard() {
    document.getElementById('nombreUsuario').textContent = usuarioActual.nombre;
    document.getElementById('emailUsuario').textContent = usuarioActual.email;
    document.getElementById('fotoUsuario').src = usuarioActual.foto;
    mostrarSeccion('dashboard');
}

function mostrarFechaActual() {
    const opciones = { day: 'numeric', month: 'short', year: 'numeric' };
    const fecha = new Date().toLocaleDateString('es-ES', opciones);
    document.getElementById('fechaActual').textContent = fecha;
}

function mostrarProductosPopulares() {
    const contenedor = document.getElementById('productosPopulares');
    const coloresFondo = ['from-pink-50 to-purple-50', 'from-blue-50 to-green-50', 'from-purple-50 to-pink-50'];
    const coloresEmoji = ['from-pink-300 to-pink-400', 'from-blue-300 to-blue-400', 'from-purple-300 to-purple-400'];

    contenedor.innerHTML = listaProductos.slice(0, 3).map((producto, indice) => `
        <div class="flex items-center justify-between p-3 md:p-4 bg-gradient-to-r ${coloresFondo[indice % 3]} rounded-xl hover:scale-105 hover:shadow-lg transition-all">
            <div class="flex items-center space-x-3 md:space-x-4">
                <div class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br ${coloresEmoji[indice % 3]} rounded-lg flex items-center justify-center text-xl md:text-2xl text-white">
                    <i class="${producto.icon}"></i>
                </div>
                <div>
                    <p class="font-semibold text-gray-800 text-sm md:text-base">${producto.nombre}</p>
                    <p class="text-xs md:text-sm text-gray-500">${producto.reservas} reservas</p>
                </div>
            </div>
            <button class="px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-white font-medium text-xs md:text-sm" style="background: linear-gradient(135deg, #FFB5E8 0%, #DCD6F7 100%);">
                Ver
            </button>
        </div>
    `).join('');
}

function mostrarReservasHoy() {
    const contenedor = document.getElementById('reservasHoy');
    const hoy = new Date().toISOString().split('T')[0];
    const reservasHoy = listaReservas.filter(r => r.fecha === hoy);

    contenedor.innerHTML = reservasHoy.map(reserva => {
        const estiloEstado = reserva.estado === 'confirmada' 
            ? 'background: linear-gradient(135deg, #B5EAD7 0%, #C7FFDB 100%); color: #15803d;'
            : reserva.estado === 'pendiente' 
            ? 'background: #fef3c7; color: #92400e;' 
            : 'background: #fee2e2; color: #991b1b;';
        const [inicio, fin] = reserva.hora.split('-');

        return `
            <div class="flex items-start space-x-3 md:space-x-4 p-3 md:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                <div class="w-12 md:w-16 text-center flex-shrink-0">
                    <p class="text-xs text-gray-500 font-medium">${inicio}</p>
                    <p class="text-xs text-gray-400"><i class="fas fa-arrow-down"></i></p>
                    <p class="text-xs text-gray-500 font-medium">${fin}</p>
                </div>
                <div class="flex-1 min-w-0">
                    <p class="font-semibold text-gray-800 text-sm md:text-base truncate">${reserva.producto}</p>
                    <p class="text-xs md:text-sm text-gray-500 truncate">Cliente: ${reserva.cliente}</p>
                    <span class="inline-block mt-1 px-2 py-1 rounded text-xs capitalize" style="${estiloEstado}">
                        ${reserva.estado}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

function mostrarGrafico(periodo) {
    const contenedor = document.getElementById('contenedorGrafico');
    const datos = datosGrafico[periodo];
    const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    const colores = ['from-pink-300 to-pink-200', 'from-purple-300 to-purple-200', 'from-blue-300 to-blue-200', 'from-pink-300 to-pink-200', 'from-purple-300 to-purple-200', 'from-blue-300 to-blue-200', 'from-pink-300 to-pink-200'];

    contenedor.innerHTML = datos.map((valor, indice) => `
        <div class="flex flex-col items-center space-y-2 flex-1">
            <div class="barra-grafico w-full bg-gradient-to-t ${colores[indice]} rounded-t-lg" style="height: ${valor}%"></div>
            <span class="text-xs md:text-sm text-gray-600 font-medium">${dias[indice]}</span>
        </div>
    `).join('');
}

function actualizarGrafico() {
    const periodo = document.getElementById('periodoGrafico').value;
    mostrarGrafico(periodo);
}

function mostrarSeccion(seccion) {
    seccionActual = seccion;
    const contenedor = document.getElementById('contenidoPrincipal');
    
    document.querySelectorAll('.enlace-nav').forEach(enlace => {
        enlace.classList.remove('bg-white', 'shadow-sm');
        enlace.classList.add('hover:bg-white', 'hover:shadow-md');
    });
    
    const enlaceActivo = document.querySelector(`[data-seccion="${seccion}"]`);
    if (enlaceActivo) {
        enlaceActivo.classList.add('bg-white', 'shadow-sm');
        enlaceActivo.classList.remove('hover:bg-white', 'hover:shadow-md');
    }

    switch(seccion) {
        case 'dashboard':
            contenedor.innerHTML = obtenerHTMLDashboard();
            mostrarFechaActual();
            mostrarProductosPopulares();
            mostrarReservasHoy();
            mostrarGrafico('30');
            break;
        case 'productos':
            contenedor.innerHTML = obtenerHTMLProductos();
            renderizarProductos();
            break;
        case 'reservas':
            contenedor.innerHTML = obtenerHTMLReservas();
            renderizarReservas();
            break;
        case 'calendario':
            contenedor.innerHTML = obtenerHTMLCalendario();
            renderizarCalendario();
            break;
        case 'clientes':
            contenedor.innerHTML = obtenerHTMLClientes();
            renderizarClientes();
            break;
        case 'reportes':
            contenedor.innerHTML = obtenerHTMLReportes();
            break;
    }
    
    if (window.innerWidth < 768) {
        alternarMenu();
    }
}

function obtenerHTMLDashboard() {
    return `
        <div class="flex justify-between items-center mb-6 md:mb-8">
            <div class="flex items-center gap-3">
                <button onclick="alternarMenu()" class="md:hidden p-2 bg-white rounded-lg shadow">
                    <i class="fas fa-bars text-2xl"></i>
                </button>
                <div>
                    <h2 class="text-2xl md:text-3xl font-bold text-gray-800">Panel Principal</h2>
                    <p class="text-gray-500 mt-1 text-sm md:text-base">Bienvenido de vuelta</p>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div class="bg-white rounded-2xl p-4 md:p-6 shadow-lg border-t-4 border-pink-300 hover:-translate-y-1 transition-all">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-gray-500 text-xs md:text-sm font-medium mb-1">Total Productos</p>
                        <h3 id="contadorProductos" class="text-3xl md:text-4xl font-bold text-gray-800">${listaProductos.length}</h3>
                        <p class="text-green-500 text-xs md:text-sm mt-2 flex items-center">
                            <i class="fas fa-arrow-up mr-1"></i> +12% vs mes anterior
                        </p>
                    </div>
                    <div class="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-xl md:text-2xl" style="background: linear-gradient(135deg, #fecdd3, #fbcfe8);">
                        <i class="fas fa-box"></i>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-2xl p-4 md:p-6 shadow-lg border-t-4 border-blue-300 hover:transform hover:-translate-y-1 transition-all">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-gray-500 text-xs md:text-sm font-medium mb-1">Reservas Activas</p>
                        <h3 id="contadorReservas" class="text-3xl md:text-4xl font-bold text-gray-800">${listaReservas.filter(r => r.estado !== 'cancelada').length}</h3>
                        <p class="text-green-500 text-xs md:text-sm mt-2 flex items-center">
                            <i class="fas fa-arrow-up mr-1"></i> +8% vs mes anterior
                        </p>
                    </div>
                    <div class="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-xl md:text-2xl" style="background: linear-gradient(135deg, #bfdbfe, #ddd6fe);">
                        <i class="fa-solid fa-calendar-days"></i>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-2xl p-4 md:p-6 shadow-lg border-t-4 border-green-300 sm:col-span-2 lg:col-span-1 hover:transform hover:-translate-y-1 transition-all">
                <div class="flex justify-between items-start">
                    <div>
                        <p class="text-gray-500 text-xs md:text-sm font-medium mb-1">Ingresos Totales</p>
                        <h3 id="contadorIngresos" class="text-3xl md:text-4xl font-bold text-gray-800">$12,450</h3>
                        <p class="text-green-500 text-xs md:text-sm mt-2 flex items-center">
                            <i class="fas fa-arrow-up mr-1"></i> +15% vs mes anterior
                        </p>
                    </div>
                    <div class="w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center text-xl md:text-2xl" style="background: linear-gradient(135deg, #bbf7d0, #d9f99d);">
                        <i class="fa-solid fa-sack-dollar"></i>
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-2xl p-4 md:p-6 shadow-lg mb-6 md:mb-8">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
                <h3 class="text-lg md:text-xl font-bold text-gray-800">
                    <i class="fas fa-chart-bar mr-2"></i> Reservas - Últimos 7 días
                </h3>
                <select id="periodoGrafico" onchange="actualizarGrafico()" class="px-3 md:px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-300 text-sm">
                    <option value="7">Últimos 7 días</option>
                    <option value="30" selected>Últimos 30 días</option>
                    <option value="90">Últimos 3 meses</option>
                </select>
            </div>
            <div id="contenedorGrafico" class="flex items-end justify-around h-48 md:h-64 space-x-2 md:space-x-4"></div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
            <div class="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
                <div class="flex justify-between items-center mb-4 md:mb-6">
                    <h3 class="text-lg md:text-xl font-bold text-gray-800">
                        <i class="fas fa-fire mr-2"></i> Productos Más Rentados
                    </h3>
                    <a href="#" onclick="mostrarSeccion('productos'); return false;" class="text-pink-400 hover:text-pink-500 text-xs md:text-sm font-medium">
                        Ver todos <i class="fas fa-arrow-right ml-1"></i>
                    </a>
                </div>
                <div id="productosPopulares" class="space-y-3 md:space-y-4"></div>
            </div>

            <div class="bg-white rounded-2xl p-4 md:p-6 shadow-lg">
                <div class="flex justify-between items-center mb-4 md:mb-6">
                    <h3 class="text-lg md:text-xl font-bold text-gray-800">
                        <i class="fas fa-clock mr-2"></i> Reservas de Hoy
                    </h3>
                    <span id="fechaActual" class="px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium text-green-700" style="background: linear-gradient(135deg, #B5EAD7 0%, #C7FFDB 100%);"></span>
                </div>
                <div id="reservasHoy" class="space-y-3 md:space-y-4"></div>
            </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            <button onclick="abrirModal('modalProducto')" class="py-3 md:py-4 rounded-xl text-white font-semibold text-sm md:text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2" style="background: linear-gradient(135deg, #FFB5E8 0%, #DCD6F7 100%);">
                <i class="fas fa-plus"></i>
                <span>Agregar Producto</span>
            </button>
            <button onclick="abrirModal('modalReserva')" class="py-3 md:py-4 rounded-xl text-white font-semibold text-sm md:text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2" style="background: linear-gradient(135deg, #AEC6FF 0%, #B5EAD7 100%);">
                <i class="fas fa-calendar-plus"></i>
                <span>Nueva Reserva</span>
            </button>
            <button onclick="mostrarSeccion('reportes')" class="py-3 md:py-4 rounded-xl text-white font-semibold text-sm md:text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2" style="background: linear-gradient(to right, #c084fc, #f9a8d4);">
                <i class="fas fa-chart-pie"></i>
                <span>Ver Reportes</span>
            </button>
        </div>
    `;
}

function obtenerHTMLProductos() {
    return `
        <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 class="text-2xl md:text-3xl font-bold text-gray-800">
                    <i class="fas fa-box mr-2"></i> Gestión de Productos
                </h2>
                <p class="text-gray-500 mt-1">Administra tu catálogo de productos</p>
            </div>
            <button onclick="abrirModal('modalProducto')" class="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all" style="background: linear-gradient(135deg, #FFB5E8 0%, #DCD6F7 100%);">
                <i class="fas fa-plus mr-2"></i> Nuevo Producto
            </button>
        </div>
        <div id="listaProductos" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
    `;
}

function obtenerHTMLReservas() {
    return `
        <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 class="text-2xl md:text-3xl font-bold text-gray-800">
                    <i class="fa-solid fa-calendar-days text-pink-300 mr-2"></i> Gestión de Reservas
                </h2>
                <p class="text-gray-500 mt-1">Administra todas las reservas</p>
            </div>
            <button onclick="abrirModal('modalReserva')" class="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all" style="background: linear-gradient(135deg, #AEC6FF 0%, #B5EAD7 100%);">
                <i class="fas fa-plus mr-2"></i> Nueva Reserva
            </button>
        </div>
        <div class="bg-white rounded-2xl p-6 shadow-lg">
            <div id="listaReservas" class="space-y-4"></div>
        </div>
    `;
}

function obtenerHTMLCalendario() {
    return `
        <div class="mb-6">
            <h2 class="text-2xl md:text-3xl font-bold text-gray-800">
                <i class="fa-solid fa-calendar-days text-purple-300 mr-2"></i> Calendario de Reservas
            </h2>
            <p class="text-gray-500 mt-1">Vista mensual de todas las reservas</p>
        </div>
        <div class="bg-white rounded-2xl p-6 shadow-lg">
            <div id="calendarioMensual"></div>
        </div>
    `;
}

function obtenerHTMLClientes() {
    return `
        <div class="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 class="text-2xl md:text-3xl font-bold text-gray-800">
                    <i class="fas fa-users mr-2"></i> Gestión de Clientes
                </h2>
                <p class="text-gray-500 mt-1">Administra tu base de clientes</p>
            </div>
            <button onclick="abrirModal('modalCliente')" class="px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all" style="background: linear-gradient(135deg, #c084fc, #f9a8d4);">
                <i class="fas fa-plus mr-2"></i> Nuevo Cliente
            </button>
        </div>
        <div id="listaClientes" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"></div>
    `;
}

function obtenerHTMLReportes() {
    const totalIngresos = listaReservas.filter(r => r.estado === 'confirmada').length * 50;
    const tasaCancelacion = ((listaReservas.filter(r => r.estado === 'cancelada').length / listaReservas.length) * 100).toFixed(1);
    
    return `
        <div class="mb-6">
            <h2 class="text-2xl md:text-3xl font-bold text-gray-800">
                <i class="fas fa-chart-bar mr-2"></i> Reportes y Estadísticas
            </h2>
            <p class="text-gray-500 mt-1">Análisis detallado del negocio</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div class="bg-white rounded-xl p-6 shadow-lg">
                <div class="text-3xl mb-2"><i class="fa-solid fa-sack-dollar text-yellow-400"></i></div>
                <p class="text-gray-500 text-sm">Ingresos Totales</p>
                <p class="text-2xl font-bold text-gray-800">$${totalIngresos.toLocaleString()}</p>
            </div>
            <div class="bg-white rounded-xl p-6 shadow-lg">
                <div class="text-3xl mb-2"><i class="fa-solid fa-calendar-days text-pink-300"></i></div>
                <p class="text-gray-500 text-sm">Total Reservas</p>
                <p class="text-2xl font-bold text-gray-800">${listaReservas.length}</p>
            </div>
            <div class="bg-white rounded-xl p-6 shadow-lg">
                <div class="text-3xl mb-2"><i class="fas fa-check-circle text-green-500"></i></div>
                <p class="text-gray-500 text-sm">Confirmadas</p>
                <p class="text-2xl font-bold text-green-600">${listaReservas.filter(r => r.estado === 'confirmada').length}</p>
            </div>
            <div class="bg-white rounded-xl p-6 shadow-lg">
                <div class="text-3xl mb-2"><i class="fas fa-times-circle text-red-500"></i></div>
                <p class="text-gray-500 text-sm">Tasa Cancelación</p>
                <p class="text-2xl font-bold text-red-600">${tasaCancelacion}%</p>
            </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <h3 class="text-xl font-bold text-gray-800 mb-4">
                <i class="fas fa-fire mr-2"></i> Top 5 Productos Más Rentados
            </h3>
            <div class="space-y-3">
                ${listaProductos.sort((a, b) => b.reservas - a.reservas).slice(0, 5).map((p, i) => `
                    <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div class="flex items-center space-x-4">
                            <span class="text-2xl font-bold text-gray-400">#${i + 1}</span>
                            <i class="${p.icon} text-2xl text-pink-400"></i>
                            <div>
                                <p class="font-semibold text-gray-800">${p.nombre}</p>
                                <p class="text-sm text-gray-500">${p.categoria}</p>
                            </div>
                        </div>
                        <div class="text-right">
                            <p class="text-2xl font-bold text-pink-500">${p.reservas}</p>
                            <p class="text-xs text-gray-500">reservas</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-lg">
            <h3 class="text-xl font-bold text-gray-800 mb-4">
                <i class="fas fa-chart-pie mr-2"></i> Distribución por Estado
            </h3>
            <div class="grid grid-cols-3 gap-4">
                <div class="text-center p-4 bg-green-50 rounded-lg">
                    <p class="text-4xl font-bold text-green-600">${listaReservas.filter(r => r.estado === 'confirmada').length}</p>
                    <p class="text-sm text-gray-600 mt-1">Confirmadas</p>
                </div>
                <div class="text-center p-4 bg-yellow-50 rounded-lg">
                    <p class="text-4xl font-bold text-yellow-600">${listaReservas.filter(r => r.estado === 'pendiente').length}</p>
                    <p class="text-sm text-gray-600 mt-1">Pendientes</p>
                </div>
                <div class="text-center p-4 bg-red-50 rounded-lg">
                    <p class="text-4xl font-bold text-red-600">${listaReservas.filter(r => r.estado === 'cancelada').length}</p>
                    <p class="text-sm text-gray-600 mt-1">Canceladas</p>
                </div>
            </div>
        </div>
    `;
}

function renderizarProductos() {
    const contenedor = document.getElementById('listaProductos');
    contenedor.innerHTML = listaProductos.map(producto => `
        <div class="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div class="flex justify-between items-start mb-4">
                <div class="w-16 h-16 bg-gradient-to-br from-pink-300 to-purple-300 rounded-xl flex items-center justify-center text-3xl text-white">
                    <i class="${producto.icon}"></i>
                </div>
                <div class="flex space-x-2">
                    <button onclick="editarProducto(${producto.id})" class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="eliminarProducto(${producto.id})" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <h4 class="font-bold text-lg text-gray-800 mb-1">${producto.nombre}</h4>
            <p class="text-sm text-gray-500 mb-3">${producto.categoria}</p>
            <p class="text-xs text-gray-600 mb-4">${producto.descripcion}</p>
            <div class="flex justify-between items-center pt-4 border-t border-gray-100">
                <div>
                    <p class="text-xs text-gray-500">Precio/hora</p>
                    <p class="text-xl font-bold text-pink-500">${producto.precio}</p>
                </div>
                <div class="text-right">
                    <p class="text-xs text-gray-500">Reservas</p>
                    <p class="text-xl font-bold text-purple-500">${producto.reservas}</p>
                </div>
            </div>
        </div>
    `).join('');
}

function renderizarReservas() {
    const contenedor = document.getElementById('listaReservas');
    contenedor.innerHTML = listaReservas.map(reserva => {
        const estiloEstado = {
            'confirmada': 'bg-green-100 text-green-700',
            'pendiente': 'bg-yellow-100 text-yellow-700',
            'cancelada': 'bg-red-100 text-red-700'
        }[reserva.estado];

        return `
            <div class="flex flex-col md:flex-row md:items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                <div class="flex items-center space-x-4 mb-3 md:mb-0">
                    <div class="w-12 h-12 bg-gradient-to-br from-blue-300 to-purple-300 rounded-lg flex items-center justify-center text-xl text-white">
                        <i class="fas fa-calendar-check"></i>
                    </div>
                    <div>
                        <p class="font-semibold text-gray-800">${reserva.producto}</p>
                        <p class="text-sm text-gray-500">Cliente: ${reserva.cliente}</p>
                        <p class="text-xs text-gray-400">${reserva.fecha} <i class="fas fa-circle text-gray-300" style="font-size: 4px;"></i> ${reserva.hora}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-3">
                    <span class="px-3 py-1 rounded-full text-xs font-medium ${estiloEstado} capitalize">
                        ${reserva.estado}
                    </span>
                    <button onclick="editarReserva(${reserva.id})" class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="eliminarReserva(${reserva.id})" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function renderizarCalendario() {
    const contenedor = document.getElementById('calendarioMensual');
    const fecha = new Date();
    const mes = fecha.getMonth();
    const año = fecha.getFullYear();
    
    const primerDia = new Date(año, mes, 1).getDay();
    const diasEnMes = new Date(año, mes + 1, 0).getDate();
    
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    
    let html = `
        <div class="mb-6">
            <h3 class="text-2xl font-bold text-gray-800">${meses[mes]} ${año}</h3>
        </div>
        <div class="grid grid-cols-7 gap-2 mb-2">
            ${dias.map(dia => `<div class="text-center font-semibold text-gray-600 py-2">${dia}</div>`).join('')}
        </div>
        <div class="grid grid-cols-7 gap-2">
    `;
    
    for (let i = 0; i < primerDia; i++) {
        html += `<div class="aspect-square"></div>`;
    }
    
    for (let dia = 1; dia <= diasEnMes; dia++) {
        const fechaDia = `${año}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const reservasDelDia = listaReservas.filter(r => r.fecha === fechaDia);
        const esHoy = dia === fecha.getDate();
        
        html += `
            <div class="aspect-square border ${esHoy ? 'border-pink-400 bg-pink-50' : 'border-gray-200'} rounded-lg p-2 hover:bg-gray-50 transition-all">
                <div class="text-sm font-semibold ${esHoy ? 'text-pink-600' : 'text-gray-700'} mb-1">${dia}</div>
                ${reservasDelDia.length > 0 ? `
                    <div class="text-xs">
                        ${reservasDelDia.slice(0, 2).map(r => `
                            <div class="bg-blue-100 text-blue-700 px-1 rounded mb-1 truncate">${r.hora.split('-')[0]}</div>
                        `).join('')}
                        ${reservasDelDia.length > 2 ? `<div class="text-gray-500">+${reservasDelDia.length - 2}</div>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    html += `</div>`;
    contenedor.innerHTML = html;
}

function renderizarClientes() {
    const contenedor = document.getElementById('listaClientes');
    contenedor.innerHTML = listaClientes.map(cliente => `
        <div class="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all">
            <div class="flex justify-between items-start mb-4">
                <div class="w-16 h-16 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full flex items-center justify-center text-2xl font-bold text-white">
                    <i class="fas fa-user"></i>
                </div>
                <div class="flex space-x-2">
                    <button onclick="editarCliente(${cliente.id})" class="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="eliminarCliente(${cliente.id})" class="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <h4 class="font-bold text-lg text-gray-800 mb-1">${cliente.nombre}</h4>
            <p class="text-sm text-gray-500 mb-1"><i class="fas fa-envelope mr-2"></i>${cliente.email}</p>
            <p class="text-sm text-gray-500 mb-4"><i class="fas fa-phone mr-2"></i>${cliente.telefono}</p>
            <div class="pt-4 border-t border-gray-100">
                <p class="text-xs text-gray-500">Reservas totales</p>
                <p class="text-2xl font-bold text-purple-500">${cliente.reservasTotal}</p>
            </div>
        </div>
    `).join('');
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

function abrirModal(idModal) {
    const modal = document.getElementById(idModal);
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
    
    if (idModal === 'modalReserva') {
        cargarProductosEnSelect();
        cargarClientesEnSelect();
    }
    
}

function cerrarModal(idModal) {
    const modal = document.getElementById(idModal);
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = 'auto';

    const formularios = {
        'modalProducto': 'formularioProducto',
        'modalReserva': 'formularioReserva',
        'modalCliente': 'formularioCliente'
    };
    
    const formulario = document.getElementById(formularios[idModal]);
    if (formulario) formulario.reset();
}

function guardarProducto(evento) {
    evento.preventDefault();

    const nombre = document.getElementById('nombreProducto').value;
    const categoria = document.getElementById('categoriaProducto').value;
    const descripcion = document.getElementById('descripcionProducto').value;
    const precio = parseFloat(document.getElementById('precioProducto').value);

    const iconosPorCategoria = {
        'Electrónica': 'fas fa-laptop',
        'Deportes': 'fas fa-futbol',
        'Fotografía': 'fas fa-camera',
        'Entretenimiento': 'fas fa-gamepad'
    };

    const nuevoProducto = {
        id: ++contadorProductoId,
        nombre: nombre,
        icon: iconosPorCategoria[categoria] || 'fas fa-box',
        reservas: 0,
        categoria: categoria,
        precio: precio,
        descripcion: descripcion || 'Sin descripción'
    };

    listaProductos.push(nuevoProducto);

    if (seccionActual === 'productos') {
        renderizarProductos();
    }

    mostrarNotificacion(`Producto "${nombre}" agregado exitosamente - Categoría: ${categoria} - Precio: ${precio}/hora`, 'success');
    cerrarModal('modalProducto');
}

function cargarProductosEnSelect() {
    const select = document.getElementById('productoReserva');
    if (!select) return;

    select.innerHTML = '<option value="">Seleccionar producto</option>' +
        listaProductos.map(producto =>
            `<option value="${producto.nombre}">${producto.nombre}</option>`
        ).join('');
}
function cargarClientesEnSelect() {
    const select = document.getElementById('clienteReserva');
    if (!select) return;

    select.innerHTML = '<option value="">Seleccionar cliente</option>' +
        listaClientes.map(cliente =>
            `<option value="${cliente.nombre}">${cliente.nombre}</option>`
        ).join('');
}

function guardarReserva(evento) {
    evento.preventDefault();

    const producto = document.getElementById('productoReserva').value;
    const cliente = document.getElementById('clienteReserva').value;
    const fecha = document.getElementById('fechaReserva').value;
    const horaInicio = document.getElementById('horaInicioReserva').value;
    const horaFin = document.getElementById('horaFinReserva').value;
    const estado = document.getElementById('estadoReserva').value;

    const nuevaReserva = {
        id: ++contadorReservaId,
        hora: `${horaInicio}-${horaFin}`,
        producto: producto,
        cliente: cliente,
        estado: estado,
        fecha: fecha
    };

    listaReservas.push(nuevaReserva);

    const productoEncontrado = listaProductos.find(p => p.nombre === producto);
    if (productoEncontrado) {
        productoEncontrado.reservas++;
    }

    if (seccionActual === 'reservas') {
        renderizarReservas();
    } else if (seccionActual === 'calendario') {
        renderizarCalendario();
    }

    mostrarNotificacion(`Reserva para "${producto}" creada exitosamente`, 'success');
    cerrarModal('modalReserva');
}

function guardarCliente(evento) {
    evento.preventDefault();

    const nombre = document.getElementById('nombreCliente').value;
    const email = document.getElementById('emailCliente').value;
    const telefono = document.getElementById('telefonoCliente').value;

    const nuevoCliente = {
        id: ++contadorClienteId,
        nombre: nombre,
        email: email,
        telefono: telefono,
        reservasTotal: 0
    };

    listaClientes.push(nuevoCliente);

    if (seccionActual === 'clientes') {
        renderizarClientes();
    }

    mostrarNotificacion(`Cliente "${nombre}" agregado exitosamente`, 'success');
    cerrarModal('modalCliente');
}

function eliminarProducto(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        listaProductos = listaProductos.filter(p => p.id !== id);
        renderizarProductos();
        mostrarNotificacion('Producto eliminado correctamente', 'success');
    }
}

function eliminarReserva(id) {
    if (confirm('¿Estás seguro de eliminar esta reserva?')) {
        listaReservas = listaReservas.filter(r => r.id !== id);
        if (seccionActual === 'reservas') {
            renderizarReservas();
        } else if (seccionActual === 'calendario') {
            renderizarCalendario();
        }
        mostrarNotificacion('Reserva eliminada correctamente', 'success');
    }
}

function eliminarCliente(id) {
    if (confirm('¿Estás seguro de eliminar este cliente?')) {
        listaClientes = listaClientes.filter(c => c.id !== id);
        renderizarClientes();
        mostrarNotificacion('Cliente eliminado correctamente', 'success');
    }
}



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

document.addEventListener('click', function (evento) {
    const modales = ['modalProducto', 'modalReserva', 'modalCliente'];
    modales.forEach(idModal => {
        const modal = document.getElementById(idModal);
        if (modal && evento.target === modal) {
            cerrarModal(idModal);
        }
    });
});

window.addEventListener('resize', function () {
    if (window.innerWidth >= 768) {
        const menu = document.getElementById('menuLateral');
        const overlay = document.getElementById('overlay');
        if (menu) menu.classList.remove('activo');
        if (overlay) overlay.classList.add('hidden');
    }
});

document.addEventListener('DOMContentLoaded', verificarSesion);