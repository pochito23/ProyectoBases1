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


# AUTENTICACIÓN
@csrf_exempt
def login_administrador(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    try:
        data = json.loads(request.body)
        usuario = data.get('usuario')
        password = data.get('password')

        query = """
                SELECT idAdministrador, Usuario, Nombre, Email
                FROM Administradores
                WHERE Usuario = %s \
                  AND Password = %s \
                """
        resultado = ejecutar_query(query, [usuario, password])

        if resultado:
            return JsonResponse({
                'success': True,
                'administrador': resultado[0]
            })
        else:
            return JsonResponse({'success': False, 'error': 'Credenciales incorrectas'}, status=401)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def registrar_administrador(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    try:
        data = json.loads(request.body)

        query = """
                INSERT INTO Administradores (Usuario, Password, Nombre, Email)
                VALUES (%s, %s, %s, %s) \
                """
        params = [
            data.get('usuario'),
            data.get('password'),
            data.get('nombre'),
            data.get('email')
        ]

        admin_id = ejecutar_insert(query, params)

        return JsonResponse({
            'success': True,
            'mensaje': 'Administrador registrado exitosamente',
            'id': admin_id
        }, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


# PRODUCTOS
def listar_productos(request):
    id_admin = request.GET.get('idAdministrador')
    if not id_admin:
        return JsonResponse({'error': 'ID de administrador requerido'}, status=400)

    query = """
            SELECT p.idProducto, \
                   p.Nombre, \
                   p.Disponibles, \
                   p.Precio, \
                   p.Descripcion,
                   p.TipoProducto, \
                   e.Nombre as EstacionVenta
            FROM Productos p
                     LEFT JOIN estaciones e ON p.idEstacionVenta = e.idEstacion
            WHERE p.idAdministrador = %s
            ORDER BY p.Nombre \
            """
    productos = ejecutar_query(query, [id_admin])
    return JsonResponse({'productos': productos}, safe=False)


@csrf_exempt
def crear_producto(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    try:
        data = json.loads(request.body)

        query = """
                INSERT INTO Productos
                (Nombre, Disponibles, Precio, Descripcion, TipoProducto, idEstacionVenta, idAdministrador)
                VALUES (%s, %s, %s, %s, %s, %s, %s) \
                """

        params = [
            data.get('nombre'),
            data.get('disponibles', 0),
            data.get('precio'),
            data.get('descripcion', ''),
            data.get('tipoProducto', 'Venta'),
            data.get('idEstacion', None),
            data.get('idAdministrador')
        ]

        producto_id = ejecutar_insert(query, params)

        return JsonResponse({
            'mensaje': 'Producto creado exitosamente',
            'id': producto_id
        }, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def editar_producto(request, producto_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    try:
        data = json.loads(request.body)

        query = """
                UPDATE Productos
                SET Nombre       = %s, \
                    Disponibles  = %s, \
                    Precio       = %s,
                    Descripcion  = %s, \
                    TipoProducto = %s
                WHERE idProducto = %s \
                  AND idAdministrador = %s \
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
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    id_admin = request.GET.get('idAdministrador')
    query = "DELETE FROM Productos WHERE idProducto = %s AND idAdministrador = %s"

    try:
        ejecutar_insert(query, [producto_id, id_admin])
        return JsonResponse({'mensaje': 'Producto eliminado'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# CLIENTES
def listar_clientes(request):
    id_admin = request.GET.get('idAdministrador')
    if not id_admin:
        return JsonResponse({'error': 'ID de administrador requerido'}, status=400)

    query = """
            SELECT c.idCliente, \
                   p.DNI, \
                   CONCAT(p.Nombre, ' ', p.Apellido) as NombreCompleto,
                   p.Telefono, \
                   p.Email, \
                   p.Direccion, \
                   c.Tipo, \
                   c.EstadoPago, \
                   p.FechaIngreso
            FROM Clientes c
                     INNER JOIN Personas p ON c.idPersona = p.idPersona
            WHERE c.idAdministrador = %s
            ORDER BY p.FechaIngreso DESC \
            """
    clientes = ejecutar_query(query, [id_admin])
    return JsonResponse({'clientes': clientes}, safe=False)


@csrf_exempt
def crear_cliente(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    try:
        data = json.loads(request.body)

        query_persona = """
                        INSERT INTO Personas
                            (DNI, Nombre, Apellido, Telefono, Email, Direccion, NotasAdicionales)
                        VALUES (%s, %s, %s, %s, %s, %s, %s) \
                        """

        params_persona = [
            data.get('dni'),
            data.get('nombre'),
            data.get('apellido'),
            data.get('telefono'),
            data.get('email'),
            data.get('direccion', ''),
            data.get('notas', '')
        ]

        persona_id = ejecutar_insert(query_persona, params_persona)

        query_cliente = """
                        INSERT INTO Clientes (idCliente, idPersona, Tipo, EstadoPago, idAdministrador)
                        VALUES (%s, %s, %s, %s, %s) \
                        """

        params_cliente = [
            persona_id,
            persona_id,
            data.get('tipo', 'Regular'),
            data.get('estadoPago', 'Al día'),
            data.get('idAdministrador')
        ]

        ejecutar_insert(query_cliente, params_cliente)

        return JsonResponse({
            'mensaje': 'Cliente creado exitosamente',
            'id': persona_id
        }, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def editar_cliente(request, cliente_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    try:
        data = json.loads(request.body)

        query = """
                UPDATE Personas p
                    INNER JOIN Clientes c \
                ON p.idPersona = c.idPersona
                    SET p.DNI = %s, p.Nombre = %s, p.Apellido = %s, p.Telefono = %s, p.Email = %s, p.Direccion = %s
                WHERE c.idCliente = %s \
                  AND c.idAdministrador = %s \
                """

        params = [
            data.get('dni'),
            data.get('nombre'),
            data.get('apellido'),
            data.get('telefono'),
            data.get('email'),
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
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    try:
        id_admin = request.GET.get('idAdministrador')

        query_persona = """
                        SELECT idPersona \
                        FROM Clientes
                        WHERE idCliente = %s \
                          AND idAdministrador = %s \
                        """
        resultado = ejecutar_query(query_persona, [cliente_id, id_admin])

        if resultado:
            id_persona = resultado[0]['idPersona']

            query_cliente = "DELETE FROM Clientes WHERE idCliente = %s"
            ejecutar_insert(query_cliente, [cliente_id])

            query_persona_delete = "DELETE FROM Personas WHERE idPersona = %s"
            ejecutar_insert(query_persona_delete, [id_persona])

            return JsonResponse({'mensaje': 'Cliente eliminado'}, status=200)
        else:
            return JsonResponse({'error': 'Cliente no encontrado'}, status=404)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ALQUILERES
def listar_alquileres(request):
    id_admin = request.GET.get('idAdministrador')
    if not id_admin:
        return JsonResponse({'error': 'ID de administrador requerido'}, status=400)

    query = """
            SELECT pa.idAlquiler, \
                   pa.FechaInicio, \
                   pa.FechaCorte, \
                   pa.Estado,
                   pa.CantidadAlquilada, \
                   pa.PagoInicial, \
                   pa.PagoDeposito,
                   pa.MontoAlquiler,
                   p.Nombre                              as ProductoNombre,
                   CONCAT(per.Nombre, ' ', per.Apellido) as ClienteNombre,
                   p.Precio,
                   (pa.CantidadAlquilada * p.Precio)     as TotalPagar
            FROM ProductosArrendamiento_Clientes pa
                     INNER JOIN ProductosArrendamiento pra ON pa.idProductoArrendamiento = pra.idProductoArrendamiento
                     INNER JOIN Productos p ON pra.idProducto = p.idProducto
                     INNER JOIN Clientes c ON pa.idCliente = c.idCliente
                     INNER JOIN Personas per ON c.idPersona = per.idPersona
            WHERE pa.idAdministrador = %s
            ORDER BY pa.FechaInicio DESC \
            """
    alquileres = ejecutar_query(query, [id_admin])
    return JsonResponse({'alquileres': alquileres}, safe=False)


@csrf_exempt
def crear_alquiler(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    try:
        data = json.loads(request.body)

        # Calcular días y monto
        fecha_inicio = datetime.strptime(data.get('fechaInicio'), '%Y-%m-%d')
        fecha_corte = datetime.strptime(data.get('fechaCorte'), '%Y-%m-%d')
        dias = (fecha_corte - fecha_inicio).days

        # Obtener precio del producto
        query_precio = "SELECT Precio FROM Productos WHERE idProducto = %s"
        resultado = ejecutar_query(query_precio, [data.get('idProducto')])
        precio = float(resultado[0]['Precio']) if resultado else 0

        monto_total = dias * precio * float(data.get('cantidad', 1))

        query = """
                INSERT INTO ProductosArrendamiento_Clientes
                (idCliente, idProductoArrendamiento, FechaInicio, FechaCorte,
                 CantidadAlquilada, PagoInicial, PagoDeposito, MontoAlquiler,
                 Estado, idAdministrador)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, 'Activo', %s) \
                """

        params = [
            data.get('idCliente'),
            data.get('idProducto'),
            data.get('fechaInicio'),
            data.get('fechaCorte'),
            data.get('cantidad', 1),
            data.get('pagoInicial', 0),
            data.get('pagoDeposito', 0),
            monto_total,
            data.get('idAdministrador')
        ]

        alquiler_id = ejecutar_insert(query, params)

        return JsonResponse({
            'mensaje': 'Alquiler creado exitosamente',
            'id': alquiler_id
        }, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def eliminar_alquiler(request, alquiler_id):
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    id_admin = request.GET.get('idAdministrador')
    query = """
            DELETE \
            FROM ProductosArrendamiento_Clientes
            WHERE idAlquiler = %s \
              AND idAdministrador = %s \
            """

    try:
        ejecutar_insert(query, [alquiler_id, id_admin])
        return JsonResponse({'mensaje': 'Alquiler eliminado'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# PAGOS
def listar_pagos(request):
    id_admin = request.GET.get('idAdministrador')
    if not id_admin:
        return JsonResponse({'error': 'ID de administrador requerido'}, status=400)

    query = """
            SELECT t.idTransaccion, \
                   t.MontoTotal                      as Monto, \
                   t.FechaTransaccion                as FechaPago,
                   t.MetodoPago, \
                   CONCAT(p.Nombre, ' ', p.Apellido) as Cliente
            FROM Transacciones t
                     LEFT JOIN Clientes c ON t.idCliente = c.idCliente
                     LEFT JOIN Personas p ON c.idPersona = p.idPersona
            WHERE t.idAdministrador = %s
            ORDER BY t.FechaTransaccion DESC \
            """
    pagos = ejecutar_query(query, [id_admin])
    return JsonResponse({'pagos': pagos}, safe=False)


@csrf_exempt
def registrar_pago(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    try:
        data = json.loads(request.body)

        query = """
                INSERT INTO Transacciones
                    (idCliente, idAdministrador, idAlquiler, MontoTotal, MetodoPago)
                VALUES (%s, %s, %s, %s, %s) \
                """

        params = [
            data.get('idCliente'),
            data.get('idAdministrador'),
            data.get('idAlquiler'),
            data.get('monto'),
            data.get('metodoPago', 'Efectivo')
        ]

        transaccion_id = ejecutar_insert(query, params)

        return JsonResponse({
            'mensaje': 'Pago registrado exitosamente',
            'id': transaccion_id
        }, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ESTACIONES
def listar_estaciones(request):
    id_admin = request.GET.get('idAdministrador')
    if not id_admin:
        return JsonResponse({'error': 'ID de administrador requerido'}, status=400)

    query = """
            SELECT idEstacion, Nombre, DescripcionEstacion
            FROM estaciones
            WHERE idAdministrador = %s
            ORDER BY Nombre \
            """
    estaciones = ejecutar_query(query, [id_admin])
    return JsonResponse({'estaciones': estaciones}, safe=False)


@csrf_exempt
def crear_estacion(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    try:
        data = json.loads(request.body)

        query = """
                INSERT INTO estaciones
                    (Nombre, DescripcionEstacion, idAdministrador)
                VALUES (%s, %s, %s) \
                """

        params = [
            data.get('nombre'),
            data.get('descripcion', ''),
            data.get('idAdministrador')
        ]

        estacion_id = ejecutar_insert(query, params)

        return JsonResponse({
            'mensaje': 'Estación creada exitosamente',
            'id': estacion_id
        }, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ESTADÍSTICAS
def estadisticas_dashboard(request):
    id_admin = request.GET.get('idAdministrador')
    if not id_admin:
        return JsonResponse({'error': 'ID de administrador requerido'}, status=400)

    query_productos = """
                      SELECT COUNT(*) as total \
                      FROM Productos \
                      WHERE idAdministrador = %s \
                      """
    total_productos = ejecutar_query(query_productos, [id_admin])[0]['total']

    query_clientes = """
                     SELECT COUNT(*) as total \
                     FROM Clientes \
                     WHERE idAdministrador = %s \
                     """
    total_clientes = ejecutar_query(query_clientes, [id_admin])[0]['total']

    query_estados = """
                    SELECT SUM(CASE WHEN Estado = 'Activo' THEN 1 ELSE 0 END)    as activos, \
                           SUM(CASE WHEN Estado = 'Pendiente' THEN 1 ELSE 0 END) as pendientes, \
                           SUM(CASE WHEN Estado = 'Realizado' THEN 1 ELSE 0 END) as realizados
                    FROM ProductosArrendamiento_Clientes
                    WHERE idAdministrador = %s \
                    """
    estados = ejecutar_query(query_estados, [id_admin])[0]

    query_ingresos = """
                     SELECT SUM(MontoTotal) as total
                     FROM Transacciones
                     WHERE MONTH (FechaTransaccion) = MONTH (CURRENT_DATE ())
                       AND idAdministrador = %s \
                     """
    ingresos = ejecutar_query(query_ingresos, [id_admin])[0]['total'] or 0

    query_populares = """
                      SELECT p.idProducto, \
                             p.Nombre, \
                             p.Precio,
                             COUNT(pa.idAlquiler) as total_alquileres
                      FROM Productos p
                               LEFT JOIN ProductosArrendamiento pra ON p.idProducto = pra.idProducto
                               LEFT JOIN ProductosArrendamiento_Clientes pa \
                                         ON pra.idProductoArrendamiento = pa.idProductoArrendamiento
                      WHERE p.idAdministrador = %s
                      GROUP BY p.idProducto
                      ORDER BY total_alquileres DESC LIMIT 5 \
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


# PÁGINAS HTML
def pagina_login(request):
    from django.shortcuts import render
    return render(request, 'login.html')


def pagina_dashboard(request):
    from django.shortcuts import render
    return render(request, 'dashboard.html')