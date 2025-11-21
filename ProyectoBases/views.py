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


# PRODUCTOS
def listar_productos(request):
    query = """
            SELECT p.idProducto, \
                   p.Nombre, \
                   p.Disponibles, \
                   p.Precio, \
                   p.Descripcion, \
                   p.TipoProducto, \
                   e.Nombre as EstacionVenta
            FROM Productos p
                     LEFT JOIN estaciones e ON p.idEstacionVenta = e.idEstacion
            ORDER BY p.Nombre \
            """
    productos = ejecutar_query(query)
    return JsonResponse({'productos': productos}, safe=False)


@csrf_exempt
def crear_producto(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    try:
        data = json.loads(request.body)

        if not data.get('nombre') or not data.get('precio'):
            return JsonResponse({'error': 'Faltan datos requeridos'}, status=400)

        query = """
                INSERT INTO Productos
                (Nombre, Disponibles, Precio, Descripcion, TipoProducto, idEstacionVenta)
                VALUES (%s, %s, %s, %s, %s, %s) \
                """

        params = [
            data.get('nombre'),
            data.get('disponibles', 0),
            data.get('precio'),
            data.get('descripcion', ''),
            data.get('tipoProducto', 'Venta'),
            data.get('idEstacion', None)
        ]

        producto_id = ejecutar_insert(query, params)

        return JsonResponse({
            'mensaje': 'Producto creado exitosamente',
            'id': producto_id
        }, status=201)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
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
                """

        params = [
            data.get('nombre'),
            data.get('disponibles', 0),
            data.get('precio'),
            data.get('descripcion', ''),
            data.get('tipoProducto', 'Venta'),
            producto_id
        ]

        ejecutar_insert(query, params)

        return JsonResponse({'mensaje': 'Producto actualizado exitosamente'}, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def eliminar_producto(request, producto_id):
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    query = "DELETE FROM Productos WHERE idProducto = %s"

    try:
        ejecutar_insert(query, [producto_id])
        return JsonResponse({'mensaje': 'Producto eliminado'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# CLIENTES
def listar_clientes(request):
    query = """
            SELECT c.idCliente, \
                   p.DNI, \
                   CONCAT(p.Nombre, ' ', p.Apellido) as NombreCompleto, \
                   p.Telefono, \
                   p.Email, \
                   p.Direccion, \
                   c.Tipo, \
                   c.EstadoPago, \
                   p.FechaIngreso
            FROM Clientes c
                     INNER JOIN Personas p ON c.idPersona = p.idPersona
            ORDER BY p.FechaIngreso DESC \
            """
    clientes = ejecutar_query(query)
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
                        INSERT INTO Clientes (idCliente, idPersona, Tipo, EstadoPago)
                        VALUES (%s, %s, %s, %s) \
                        """

        params_cliente = [
            persona_id,
            persona_id,
            data.get('tipo', 'Regular'),
            data.get('estadoPago', 'Al día')
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
                """

        params = [
            data.get('dni'),
            data.get('nombre'),
            data.get('apellido'),
            data.get('telefono'),
            data.get('email'),
            data.get('direccion', ''),
            cliente_id
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
        # Primero obtener el idPersona
        query_persona = "SELECT idPersona FROM Clientes WHERE idCliente = %s"
        resultado = ejecutar_query(query_persona, [cliente_id])

        if resultado:
            id_persona = resultado[0]['idPersona']

            # Eliminar cliente
            query_cliente = "DELETE FROM Clientes WHERE idCliente = %s"
            ejecutar_insert(query_cliente, [cliente_id])

            # Eliminar persona
            query_persona_delete = "DELETE FROM Personas WHERE idPersona = %s"
            ejecutar_insert(query_persona_delete, [id_persona])

            return JsonResponse({'mensaje': 'Cliente eliminado'}, status=200)
        else:
            return JsonResponse({'error': 'Cliente no encontrado'}, status=404)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ALQUILERES
def listar_alquileres(request):
    query = """
            SELECT pa.idAlquiler, \
                   pa.FechaInicio, \
                   pa.FechaCorte, \
                   pa.Estado, \
                   pa.CantidadAlquilada, \
                   pa.PagoInicial, \
                   pa.PagoDeposito, \
                   p.Nombre                              as ProductoNombre, \
                   CONCAT(per.Nombre, ' ', per.Apellido) as ClienteNombre, \
                   p.Precio, \
                   (pa.CantidadAlquilada * p.Precio)     as TotalPagar
            FROM ProductosArrendamiento_Clientes pa
                     INNER JOIN Productos p ON pa.idProductoArrendado = p.idProducto
                     INNER JOIN Clientes c ON pa.idCliente = c.idCliente
                     INNER JOIN Personas per ON c.idPersona = per.idPersona
            ORDER BY pa.FechaInicio DESC \
            """
    alquileres = ejecutar_query(query)
    return JsonResponse({'alquileres': alquileres}, safe=False)


@csrf_exempt
def crear_alquiler(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    try:
        data = json.loads(request.body)

        query = """
                INSERT INTO ProductosArrendamiento_Clientes
                (idCliente, idProductoArrendado, FechaInicio, FechaCorte,
                 CantidadAlquilada, PagoInicial, PagoDeposito)
                VALUES (%s, %s, %s, %s, %s, %s, %s) \
                """

        params = [
            data.get('idCliente'),
            data.get('idProducto'),
            data.get('fechaInicio'),
            data.get('fechaCorte'),
            data.get('cantidad', 1),
            data.get('pagoInicial', 0),
            data.get('pagoDeposito', 0)
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

    query = "DELETE FROM ProductosArrendamiento_Clientes WHERE idAlquiler = %s"

    try:
        ejecutar_insert(query, [alquiler_id])
        return JsonResponse({'mensaje': 'Alquiler eliminado'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ESTADÍSTICAS
def estadisticas_dashboard(request):
    query_productos = "SELECT COUNT(*) as total FROM Productos"
    total_productos = ejecutar_query(query_productos)[0]['total']

    query_clientes = "SELECT COUNT(*) as total FROM Clientes"
    total_clientes = ejecutar_query(query_clientes)[0]['total']

    query_estados = """
                    SELECT SUM(CASE WHEN Estado = 'Activo' THEN 1 ELSE 0 END)    as activos, \
                           SUM(CASE WHEN Estado = 'Pendiente' THEN 1 ELSE 0 END) as pendientes, \
                           SUM(CASE WHEN Estado = 'Realizado' THEN 1 ELSE 0 END) as realizados
                    FROM ProductosArrendamiento_Clientes \
                    """
    estados = ejecutar_query(query_estados)[0]

    query_ingresos = """
                     SELECT SUM(Monto) as total
                     FROM Pagos
                     WHERE MONTH (FechaPago) = MONTH (CURRENT_DATE ()) \
                     """
    ingresos = ejecutar_query(query_ingresos)[0]['total'] or 0

    query_populares = """
                      SELECT p.idProducto, \
                             p.Nombre, \
                             p.Precio, \
                             COUNT(pa.idAlquiler) as total_alquileres
                      FROM Productos p
                               LEFT JOIN ProductosArrendamiento_Clientes pa
                                         ON p.idProducto = pa.idProductoArrendado
                      GROUP BY p.idProducto
                      ORDER BY total_alquileres DESC LIMIT 5 \
                      """
    productos_populares = ejecutar_query(query_populares)

    return JsonResponse({
        'total_productos': total_productos,
        'total_clientes': total_clientes,
        'alquileres_activos': estados['activos'] or 0,
        'alquileres_pendientes': estados['pendientes'] or 0,
        'alquileres_realizados': estados['realizados'] or 0,
        'ingresos_mes': float(ingresos),
        'productos_populares': productos_populares
    })


# ESTACIONES
def listar_estaciones(request):
    query = """
            SELECT idEstacion, \
                   Nombre, \
                   DescripcionEstacion
            FROM estaciones
            ORDER BY Nombre \
            """
    estaciones = ejecutar_query(query)
    return JsonResponse({'estaciones': estaciones}, safe=False)


@csrf_exempt
def crear_estacion(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    try:
        data = json.loads(request.body)

        if not data.get('nombre'):
            return JsonResponse({'error': 'El nombre es requerido'}, status=400)

        query = """
                INSERT INTO estaciones
                    (Nombre, DescripcionEstacion)
                VALUES (%s, %s) \
                """

        params = [
            data.get('nombre'),
            data.get('descripcion', '')
        ]

        estacion_id = ejecutar_insert(query, params)

        return JsonResponse({
            'mensaje': 'Estación creada exitosamente',
            'id': estacion_id
        }, status=201)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON inválido'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# PAGOS
def listar_pagos(request):
    query = """
            SELECT p.idPago, \
                   p.Monto, \
                   p.FechaPago, \
                   p.MetodoPago, \
                   CONCAT(per.Nombre, ' ', per.Apellido) as Cliente
            FROM Pagos p
                     LEFT JOIN Clientes c ON p.idCliente = c.idCliente
                     LEFT JOIN Personas per ON c.idPersona = per.idPersona
            ORDER BY p.FechaPago DESC \
            """
    pagos = ejecutar_query(query)
    return JsonResponse({'pagos': pagos}, safe=False)


@csrf_exempt
def registrar_pago(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    try:
        data = json.loads(request.body)

        query = """
                INSERT INTO Pagos
                    (idPago, idCliente, idAlquiler, Monto, MetodoPago)
                VALUES (%s, %s, %s, %s, %s) \
                """

        query_max_id = "SELECT IFNULL(MAX(idPago), 0) + 1 as nuevo_id FROM Pagos"
        nuevo_id = ejecutar_query(query_max_id)[0]['nuevo_id']

        params = [
            nuevo_id,
            data.get('idCliente'),
            data.get('idAlquiler'),
            data.get('monto'),
            data.get('metodoPago', 'Efectivo')
        ]

        ejecutar_insert(query, params)

        return JsonResponse({
            'mensaje': 'Pago registrado exitosamente',
            'id': nuevo_id
        }, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# PÁGINAS HTML
def pagina_login(request):
    from django.shortcuts import render
    return render(request, 'login.html')


def pagina_dashboard(request):
    from django.shortcuts import render
    return render(request, 'dashboard.html')