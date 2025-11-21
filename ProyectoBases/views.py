from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json
from datetime import datetime


def ejecutar_query(query, params=None):
    with connection.cursor() as cursor:
        cursor.execute(query, params or [])
        columns = [col[0] for col in cursor.description] if cursor.description else []
        return [dict(zip(columns, row)) for row in cursor.fetchall()]


def ejecutar_insert(query, params):
    with connection.cursor() as cursor:
        cursor.execute(query, params)
        return cursor.lastrowid


@csrf_exempt
def login_administrador(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Metodo no permitido'}, status=405)

    try:
        data = json.loads(request.body)
        usuario = data.get('usuario')
        password = data.get('password')

        query = """
            SELECT idAdministrador, Usuario, Nombre, Email
            FROM administradores
            WHERE Usuario = %s AND Password = %s
        """
        resultado = ejecutar_query(query, [usuario, password])

        if resultado:
            return JsonResponse({'success': True, 'administrador': resultado[0]})
        else:
            return JsonResponse({'success': False, 'error': 'Credenciales incorrectas'}, status=401)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def registrar_administrador(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Metodo no permitido'}, status=405)

    try:
        data = json.loads(request.body)
        query = """
            INSERT INTO administradores (Usuario, Password, Nombre, Email)
            VALUES (%s, %s, %s, %s)
        """
        params = [data.get('usuario'), data.get('password'), data.get('nombre'), data.get('email')]
        admin_id = ejecutar_insert(query, params)

        return JsonResponse({
            'success': True,
            'mensaje': 'Administrador registrado exitosamente',
            'id': admin_id
        }, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


def listar_productos(request, idAdministrador=None):
    if not idAdministrador:
        idAdministrador = request.GET.get('idAdministrador')

    if not idAdministrador:
        return JsonResponse({'error': 'ID de administrador requerido'}, status=400)

    query = """
        SELECT p.idProducto, p.nombre, p.Precio, p.Descripcion, p.TipoProducto, p.Disponibles
        FROM productos p
        WHERE p.idAdministrador = %s
        ORDER BY p.nombre
    """
    productos = ejecutar_query(query, [idAdministrador])
    return JsonResponse({'productos': productos}, safe=False)


@csrf_exempt
def crear_producto(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Metodo no permitido'}, status=405)

    try:
        data = json.loads(request.body)
        query_producto = """
            INSERT INTO productos (nombre, Precio, Descripcion, TipoProducto, idAdministrador, Disponibles)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        params = [
            data.get('nombre'),
            data.get('precio'),
            data.get('descripcion', ''),
            data.get('tipoProducto', 'Venta'),
            data.get('idAdministrador'),
            data.get('disponibles', 0)
        ]
        producto_id = ejecutar_insert(query_producto, params)

        if data.get('tipoProducto') == 'Arrendamiento':
            query_arrendamiento = """
                INSERT INTO productosarrendamiento (idProducto, UnidadTiempo, Estado, HorarioDisponibilidad)
                VALUES (%s, %s, %s, %s)
            """
            ejecutar_insert(query_arrendamiento, [producto_id, 'Dia', 'Disponible', '24/7'])

        return JsonResponse({'mensaje': 'Producto creado exitosamente', 'id': producto_id}, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def editar_producto(request, producto_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Metodo no permitido'}, status=405)

    try:
        data = json.loads(request.body)
        query = """
            UPDATE productos
            SET nombre = %s, Disponibles = %s, Precio = %s, Descripcion = %s, TipoProducto = %s
            WHERE idProducto = %s AND idAdministrador = %s
        """
        params = [
            data.get('nombre'),
            data.get('disponibles', 0),
            data.get('precio'),
            data.get('descripcion', ''),
            data.get('tipoProducto', 'Venta'),
            producto_id,
            data.get('idAdministrador')
        ]
        ejecutar_insert(query, params)
        return JsonResponse({'mensaje': 'Producto actualizado exitosamente'}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def eliminar_producto(request, producto_id):
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Metodo no permitido'}, status=405)

    id_admin = request.GET.get('idAdministrador')
    query = "DELETE FROM productos WHERE idProducto = %s AND idAdministrador = %s"

    try:
        ejecutar_insert(query, [producto_id, id_admin])
        return JsonResponse({'mensaje': 'Producto eliminado'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def listar_clientes(request):
    id_admin = request.GET.get('idAdministrador')
    if not id_admin:
        return JsonResponse({'error': 'ID de administrador requerido'}, status=400)

    query = """
        SELECT c.idCliente, p.DNI, CONCAT(p.Nombre, ' ', p.Apellido) as NombreCompleto,
               p.Telefono, p.Email, p.Direccion, c.Tipo, c.EstadoPago, p.FechaIngreso
        FROM clientes c
        INNER JOIN personas p ON c.idPersona = p.idPersona
        WHERE c.idAdministrador = %s
        ORDER BY p.FechaIngreso DESC
    """
    clientes = ejecutar_query(query, [id_admin])
    return JsonResponse({'clientes': clientes}, safe=False)


@csrf_exempt
def crear_cliente(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Metodo no permitido'}, status=405)

    try:
        data = json.loads(request.body)
        query_persona = """
            INSERT INTO personas (DNI, Nombre, Apellido, Telefono, Email, Direccion, NotasAdicionales)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        params_persona = [
            data.get('dni'),
            data.get('nombre'),
            data.get('apellido'),
            data.get('telefono'),
            data.get('email', ''),
            data.get('direccion', ''),
            data.get('notas', '')
        ]
        persona_id = ejecutar_insert(query_persona, params_persona)

        query_cliente = """
            INSERT INTO clientes (idPersona, Tipo, EstadoPago, idAdministrador)
            VALUES (%s, %s, %s, %s)
        """
        params_cliente = [
            persona_id,
            data.get('tipo', 'Regular'),
            data.get('estadoPago', 'Al dia'),
            data.get('idAdministrador')
        ]
        cliente_id = ejecutar_insert(query_cliente, params_cliente)

        return JsonResponse({'mensaje': 'Cliente creado exitosamente', 'id': cliente_id}, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def editar_cliente(request, cliente_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Metodo no permitido'}, status=405)

    try:
        data = json.loads(request.body)
        query = """
            UPDATE personas p
            INNER JOIN clientes c ON p.idPersona = c.idPersona
            SET p.DNI = %s, p.Nombre = %s, p.Apellido = %s, p.Telefono = %s, p.Email = %s, p.Direccion = %s
            WHERE c.idCliente = %s AND c.idAdministrador = %s
        """
        params = [
            data.get('dni'),
            data.get('nombre'),
            data.get('apellido'),
            data.get('telefono'),
            data.get('email', ''),
            data.get('direccion', ''),
            cliente_id,
            data.get('idAdministrador')
        ]
        ejecutar_insert(query, params)
        return JsonResponse({'mensaje': 'Cliente actualizado exitosamente'}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def eliminar_cliente(request, cliente_id):
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Metodo no permitido'}, status=405)

    try:
        id_admin = request.GET.get('idAdministrador')
        query_persona = "SELECT idPersona FROM clientes WHERE idCliente = %s AND idAdministrador = %s"
        resultado = ejecutar_query(query_persona, [cliente_id, id_admin])

        if resultado:
            id_persona = resultado[0]['idPersona']
            query_cliente = "DELETE FROM clientes WHERE idCliente = %s"
            ejecutar_insert(query_cliente, [cliente_id])
            query_persona_delete = "DELETE FROM personas WHERE idPersona = %s"
            ejecutar_insert(query_persona_delete, [id_persona])
            return JsonResponse({'mensaje': 'Cliente eliminado'}, status=200)
        else:
            return JsonResponse({'error': 'Cliente no encontrado'}, status=404)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def listar_alquileres(request):
    id_admin = request.GET.get('idAdministrador')
    if not id_admin:
        return JsonResponse({'error': 'ID de administrador requerido'}, status=400)

    query = """
        SELECT pa.idAlquiler, pa.FechaInicio, pa.FechaCorte, pa.Estado, pa.CantidadAlquilada,
               pa.PagoInicial, pa.PagoDeposito, pa.MontoAlquiler, p.nombre as ProductoNombre,
               CONCAT(per.Nombre, ' ', per.Apellido) as ClienteNombre, p.Precio,
               (pa.CantidadAlquilada * p.Precio) as TotalPagar
        FROM productosarrendamiento_clientes pa
        INNER JOIN productosarrendamiento pra ON pa.idProductoArrendamiento = pra.idProductoArrendamiento
        INNER JOIN productos p ON pra.idProducto = p.idProducto
        INNER JOIN clientes c ON pa.idCliente = c.idCliente
        INNER JOIN personas per ON c.idPersona = per.idPersona
        WHERE pa.idAdministrador = %s
        ORDER BY pa.FechaInicio DESC
    """
    alquileres = ejecutar_query(query, [id_admin])
    return JsonResponse({'alquileres': alquileres}, safe=False)


@csrf_exempt
def crear_alquiler(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Metodo no permitido'}, status=405)

    try:
        data = json.loads(request.body)
        query_prod_arr = "SELECT idProductoArrendamiento FROM productosarrendamiento WHERE idProducto = %s"
        resultado = ejecutar_query(query_prod_arr, [data.get('idProducto')])

        if not resultado:
            return JsonResponse({'error': 'Producto de arrendamiento no encontrado'}, status=404)

        id_prod_arrendamiento = resultado[0]['idProductoArrendamiento']
        fecha_inicio = datetime.strptime(data.get('fechaInicio'), '%Y-%m-%d')
        fecha_corte = datetime.strptime(data.get('fechaCorte'), '%Y-%m-%d')
        dias = (fecha_corte - fecha_inicio).days

        query_precio = "SELECT Precio FROM productos WHERE idProducto = %s"
        resultado = ejecutar_query(query_precio, [data.get('idProducto')])
        precio = float(resultado[0]['Precio']) if resultado else 0
        monto_total = dias * precio * float(data.get('cantidad', 1))

        query = """
            INSERT INTO productosarrendamiento_clientes
            (idCliente, idProductoArrendamiento, FechaInicio, FechaCorte, CantidadAlquilada,
             PagoInicial, PagoDeposito, MontoAlquiler, Estado, idAdministrador)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'Activo', %s)
        """
        params = [
            data.get('idCliente'),
            id_prod_arrendamiento,
            data.get('fechaInicio'),
            data.get('fechaCorte'),
            data.get('cantidad', 1),
            data.get('pagoInicial', 0),
            data.get('pagoDeposito', 0),
            monto_total,
            data.get('idAdministrador')
        ]
        alquiler_id = ejecutar_insert(query, params)

        return JsonResponse({'mensaje': 'Alquiler creado exitosamente', 'id': alquiler_id}, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def editar_alquiler(request, alquiler_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Metodo no permitido'}, status=405)

    try:
        data = json.loads(request.body)
        query = """
            UPDATE productosarrendamiento_clientes
            SET FechaInicio = %s, FechaCorte = %s, Estado = %s, CantidadAlquilada = %s,
                PagoInicial = %s, PagoDeposito = %s
            WHERE idAlquiler = %s AND idAdministrador = %s
        """
        params = [
            data.get('fechaInicio'),
            data.get('fechaCorte'),
            data.get('estado'),
            data.get('cantidad'),
            data.get('pagoInicial'),
            data.get('pagoDeposito'),
            alquiler_id,
            data.get('idAdministrador')
        ]
        ejecutar_insert(query, params)
        return JsonResponse({'mensaje': 'Alquiler actualizado exitosamente'}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def eliminar_alquiler(request, alquiler_id):
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Metodo no permitido'}, status=405)

    id_admin = request.GET.get('idAdministrador')
    query = "DELETE FROM productosarrendamiento_clientes WHERE idAlquiler = %s AND idAdministrador = %s"

    try:
        ejecutar_insert(query, [alquiler_id, id_admin])
        return JsonResponse({'mensaje': 'Alquiler eliminado'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def listar_pagos(request):
        id_admin = request.GET.get('idAdministrador')
        if not id_admin:
            return JsonResponse({'error': 'ID de administrador requerido'}, status=400)

        query = """
                SELECT pt.idTransaccion, \
                       pt.MontoTransaccion as Monto, \
                       t.FechaTransaccion as FechaPago,
                       pt.MetodoPago, \
                       CONCAT(p.Nombre, ' ', p.Apellido) as Cliente
                FROM pagostransacciones pt
                         INNER JOIN transacciones t ON pt.idTransaccion = t.idTransaccion
                         LEFT JOIN clientes c ON t.idCliente = c.idCliente
                         LEFT JOIN personas p ON c.idPersona = p.idPersona
                WHERE t.idCliente IN (SELECT idCliente FROM clientes WHERE idAdministrador = %s)
                ORDER BY t.FechaTransaccion DESC
    """
        pagos = ejecutar_query(query, [id_admin])
        return JsonResponse({'pagos': pagos}, safe=False)


@csrf_exempt
@csrf_exempt
def registrar_pago(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    try:
        data = json.loads(request.body)

        # Validar campos requeridos
        if not data.get('idCliente'):
            return JsonResponse({'error': 'Cliente es requerido'}, status=400)

        query_transaccion = "INSERT INTO transacciones (idCliente, FechaTransaccion) VALUES (%s, NOW())"
        transaccion_id = ejecutar_insert(query_transaccion, [data.get('idCliente')])

        query_pago = """
                     INSERT INTO pagostransacciones
                         (idTransaccion, idAlquiler, idCompra, MontoManual, MetodoPago)
                     VALUES (%s, %s, %s, %s, %s) 
                     """

        id_alquiler = data.get('idAlquiler')
        id_compra = data.get('idCompra')
        monto_manual = data.get('monto')

        params = [
            transaccion_id,
            id_alquiler if id_alquiler else None,
            id_compra if id_compra else None,
            float(monto_manual) if monto_manual else None,  # Convertir a float si existe
            data.get('metodoPago', 'Efectivo')
        ]

        pago_id = ejecutar_insert(query_pago, params)

        return JsonResponse({
            'mensaje': 'Pago registrado exitosamente',
            'id': transaccion_id
        }, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
@csrf_exempt
def editar_pago(request, pago_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Metodo no permitido'}, status=405)

    try:
        data = json.loads(request.body)
        query = """
            UPDATE pagostransacciones
            SET MontoTransaccion = %s, MetodoPago = %s
            WHERE idTransaccion = %s
        """
        params = [data.get('montoTransaccion'), data.get('metodoPago'), pago_id]
        ejecutar_insert(query, params)
        return JsonResponse({'mensaje': 'Pago actualizado exitosamente'}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def eliminar_pago(request, pago_id):
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Metodo no permitido'}, status=405)

    try:
        query_pago = "DELETE FROM pagostransacciones WHERE idTransaccion = %s"
        ejecutar_insert(query_pago, [pago_id])
        query_transaccion = "DELETE FROM transacciones WHERE idTransaccion = %s"
        ejecutar_insert(query_transaccion, [pago_id])
        return JsonResponse({'mensaje': 'Pago eliminado'}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def listar_estaciones(request):
    id_admin = request.GET.get('idAdministrador')
    if not id_admin:
        return JsonResponse({'error': 'ID de administrador requerido'}, status=400)

    query = "SELECT idEstacion, Nombre, DescripcionEstacion FROM estaciones WHERE idAdministrador = %s ORDER BY Nombre"
    estaciones = ejecutar_query(query, [id_admin])
    return JsonResponse({'estaciones': estaciones}, safe=False)


@csrf_exempt
def crear_estacion(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Metodo no permitido'}, status=405)

    try:
        data = json.loads(request.body)
        query = "INSERT INTO estaciones (Nombre, DescripcionEstacion, idAdministrador) VALUES (%s, %s, %s)"
        params = [data.get('nombre'), data.get('descripcion', ''), data.get('idAdministrador')]
        estacion_id = ejecutar_insert(query, params)

        return JsonResponse({'mensaje': 'Estacion creada exitosamente', 'id': estacion_id}, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def editar_estacion(request, estacion_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Metodo no permitido'}, status=405)

    try:
        data = json.loads(request.body)
        query = """
            UPDATE estaciones
            SET Nombre = %s, DescripcionEstacion = %s
            WHERE idEstacion = %s AND idAdministrador = %s
        """
        params = [data.get('nombre'), data.get('descripcion'), estacion_id, data.get('idAdministrador')]
        ejecutar_insert(query, params)
        return JsonResponse({'mensaje': 'Estacion actualizada exitosamente'}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def eliminar_estacion(request, estacion_id):
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Metodo no permitido'}, status=405)

    id_admin = request.GET.get('idAdministrador')
    query = "DELETE FROM estaciones WHERE idEstacion = %s AND idAdministrador = %s"

    try:
        ejecutar_insert(query, [estacion_id, id_admin])
        return JsonResponse({'mensaje': 'Estacion eliminada'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def estadisticas_dashboard(request):
    id_admin = request.GET.get('idAdministrador')
    if not id_admin:
        return JsonResponse({'error': 'ID de administrador requerido'}, status=400)

    query_productos = "SELECT COUNT(*) as total FROM productos WHERE idAdministrador = %s"
    total_productos = ejecutar_query(query_productos, [id_admin])[0]['total']

    query_clientes = "SELECT COUNT(*) as total FROM clientes WHERE idAdministrador = %s"
    total_clientes = ejecutar_query(query_clientes, [id_admin])[0]['total']

    query_estados = """
        SELECT 
            SUM(CASE WHEN Estado = 'Activo' THEN 1 ELSE 0 END) as activos,
            SUM(CASE WHEN Estado = 'Pendiente' THEN 1 ELSE 0 END) as pendientes,
            SUM(CASE WHEN Estado = 'Realizado' THEN 1 ELSE 0 END) as realizados
        FROM productosarrendamiento_clientes
        WHERE idAdministrador = %s
    """
    estados = ejecutar_query(query_estados, [id_admin])[0]

    query_ingresos = """
        SELECT COALESCE(SUM(pt.MontoTransaccion), 0) as total
        FROM pagostransacciones pt
        INNER JOIN transacciones t ON pt.idTransaccion = t.idTransaccion
        WHERE MONTH(t.FechaTransaccion) = MONTH(CURRENT_DATE())
    """
    ingresos = ejecutar_query(query_ingresos, [])[0]['total'] or 0

    query_populares = """
        SELECT p.idProducto, p.nombre, p.Precio, COUNT(pa.idAlquiler) as total_alquileres
        FROM productos p
        LEFT JOIN productosarrendamiento pra ON p.idProducto = pra.idProducto
        LEFT JOIN productosarrendamiento_clientes pa ON pra.idProductoArrendamiento = pa.idProductoArrendamiento
        WHERE p.idAdministrador = %s
        GROUP BY p.idProducto
        ORDER BY total_alquileres DESC LIMIT 5
    """
    productos_populares = ejecutar_query(query_populares, [id_admin])

    return JsonResponse({
        'total_productos': total_productos,
        'total_clientes': total_clientes,
        'alquileres_activos': estados['activos'] or 0,
        'alquileres_pendientes': estados['pendientes'] or 0,
        'alquileres_realizados': estados['realizados'] or 0,
        'ingresos_mes': float(ingresos),
        'productos_populares': productos_populares
    })


def pagina_login(request):
    from django.shortcuts import render
    return render(request, 'login.html')


def pagina_dashboard(request):
    from django.shortcuts import render
    return render(request, 'dashboard.html')