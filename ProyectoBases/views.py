"""
views.py - VERSIÓN CON CURSORES SQL PUROS
Sin ORM, sin serializers, solo SQL directo
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import json


# ============================================
# HELPER: Ejecutar consultas SQL
# ============================================

def ejecutar_query(query, params=None):
    """
    Función helper para ejecutar queries SQL
    """
    with connection.cursor() as cursor:
        cursor.execute(query, params or [])
        columns = [col[0] for col in cursor.description] if cursor.description else []
        return [dict(zip(columns, row)) for row in cursor.fetchall()]


def ejecutar_insert(query, params):
    """
    Función helper para INSERT/UPDATE/DELETE
    Retorna el ID del registro insertado
    """
    with connection.cursor() as cursor:
        cursor.execute(query, params)
        return cursor.lastrowid


# ============================================
# PRODUCTOS
# ============================================

def listar_productos(request):
    """
    GET /api/productos/
    Lista todos los productos
    """
    query = """
            SELECT id, \
                   nombre, \
                   categoria, \
                   descripcion, \
                   precio,
                   icon, \
                   reservas, \
                   disponible, \
                   fecha_creacion
            FROM productos
            WHERE disponible = 1
            ORDER BY reservas DESC \
            """

    productos = ejecutar_query(query)
    return JsonResponse({'productos': productos}, safe=False)


@csrf_exempt
def crear_producto(request):
    """
    POST /api/productos/crear/
    Crea un nuevo producto
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    try:
        data = json.loads(request.body)

        # Validación básica
        if not data.get('nombre') or not data.get('precio'):
            return JsonResponse({'error': 'Faltan datos requeridos'}, status=400)

        query = """
                INSERT INTO productos (nombre, categoria, descripcion, precio, icon, disponible)
                VALUES (%s, %s, %s, %s, %s, %s) \
                """

        # Mapeo de íconos por categoría
        iconos = {
            'Electrónica': 'fas fa-laptop',
            'Deportes': 'fas fa-futbol',
            'Fotografía': 'fas fa-camera',
            'Entretenimiento': 'fas fa-gamepad'
        }

        icon = iconos.get(data.get('categoria'), 'fas fa-box')

        params = [
            data.get('nombre'),
            data.get('categoria'),
            data.get('descripcion', ''),
            data.get('precio'),
            icon,
            1  # disponible = true
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
def eliminar_producto(request, producto_id):
    """
    DELETE /api/productos/eliminar/<id>/
    Elimina un producto
    """
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    query = "DELETE FROM productos WHERE id = %s"

    try:
        ejecutar_insert(query, [producto_id])
        return JsonResponse({'mensaje': 'Producto eliminado'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ============================================
# CLIENTES
# ============================================

def listar_clientes(request):
    """
    GET /api/clientes/
    Lista todos los clientes
    """
    query = """
            SELECT id, nombre, email, telefono, reservas_total, fecha_registro
            FROM clientes
            WHERE activo = 1
            ORDER BY fecha_registro DESC \
            """

    clientes = ejecutar_query(query)
    return JsonResponse({'clientes': clientes}, safe=False)


@csrf_exempt
def crear_cliente(request):
    """
    POST /api/clientes/crear/
    Crea un nuevo cliente
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    try:
        data = json.loads(request.body)

        query = """
                INSERT INTO clientes (nombre, email, telefono, reservas_total, activo)
                VALUES (%s, %s, %s, 0, 1) \
                """

        params = [
            data.get('nombre'),
            data.get('email'),
            data.get('telefono')
        ]

        cliente_id = ejecutar_insert(query, params)

        return JsonResponse({
            'mensaje': 'Cliente creado exitosamente',
            'id': cliente_id
        }, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ============================================
# RESERVAS
# ============================================

def listar_reservas(request):
    """
    GET /api/reservas/
    Lista todas las reservas con JOIN
    """
    query = """
            SELECT r.id, \
                   r.fecha, \
                   r.hora_inicio, \
                   r.hora_fin, \
                   r.estado, \
                   p.nombre as producto_nombre, \
                   c.nombre as cliente_nombre
            FROM reservas r
                     INNER JOIN productos p ON r.producto_id = p.id
                     INNER JOIN clientes c ON r.cliente_id = c.id
            ORDER BY r.fecha DESC, r.hora_inicio DESC \
            """

    reservas = ejecutar_query(query)
    return JsonResponse({'reservas': reservas}, safe=False)


def reservas_hoy(request):
    """
    GET /api/reservas/hoy/
    Solo las reservas de HOY
    """
    query = """
            SELECT r.id, \
                   r.fecha, \
                   r.hora_inicio, \
                   r.hora_fin, \
                   r.estado, \
                   p.nombre as producto_nombre, \
                   c.nombre as cliente_nombre
            FROM reservas r
                     INNER JOIN productos p ON r.producto_id = p.id
                     INNER JOIN clientes c ON r.cliente_id = c.id
            WHERE r.fecha = CURDATE()
            ORDER BY r.hora_inicio \
            """

    reservas = ejecutar_query(query)
    return JsonResponse({'reservas': reservas}, safe=False)


@csrf_exempt
def crear_reserva(request):
    """
    POST /api/reservas/crear/
    Crea una nueva reserva
    """
    if request.method != 'POST':
        return JsonResponse({'error': 'Método no permitido'}, status=405)

    try:
        data = json.loads(request.body)

        # 1. Buscar el ID del producto por nombre
        query_producto = "SELECT id FROM productos WHERE nombre = %s"
        productos = ejecutar_query(query_producto, [data.get('producto_nombre')])

        if not productos:
            return JsonResponse({'error': 'Producto no encontrado'}, status=404)

        producto_id = productos[0]['id']

        # 2. Buscar el ID del cliente por nombre
        query_cliente = "SELECT id FROM clientes WHERE nombre = %s"
        clientes = ejecutar_query(query_cliente, [data.get('cliente_nombre')])

        if not clientes:
            return JsonResponse({'error': 'Cliente no encontrado'}, status=404)

        cliente_id = clientes[0]['id']

        # 3. Insertar la reserva
        query_insertar = """
                         INSERT INTO reservas
                             (producto_id, cliente_id, fecha, hora_inicio, hora_fin, estado)
                         VALUES (%s, %s, %s, %s, %s, %s) \
                         """

        params = [
            producto_id,
            cliente_id,
            data.get('fecha'),
            data.get('hora_inicio'),
            data.get('hora_fin'),
            data.get('estado', 'pendiente')
        ]

        reserva_id = ejecutar_insert(query_insertar, params)

        # 4. Actualizar contador de reservas del producto
        query_update_producto = """
                                UPDATE productos
                                SET reservas = reservas + 1
                                WHERE id = %s \
                                """
        ejecutar_insert(query_update_producto, [producto_id])

        # 5. Actualizar contador del cliente
        query_update_cliente = """
                               UPDATE clientes
                               SET reservas_total = reservas_total + 1
                               WHERE id = %s \
                               """
        ejecutar_insert(query_update_cliente, [cliente_id])

        return JsonResponse({
            'mensaje': 'Reserva creada exitosamente',
            'id': reserva_id
        }, status=201)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


# ============================================
# ESTADÍSTICAS PARA EL DASHBOARD
# ============================================

def estadisticas_dashboard(request):
    """
    GET /api/estadisticas/
    Retorna todas las estadísticas para el dashboard
    """

    # Total de productos
    query_productos = "SELECT COUNT(*) as total FROM productos WHERE disponible = 1"
    total_productos = ejecutar_query(query_productos)[0]['total']

    # Total de reservas
    query_reservas = "SELECT COUNT(*) as total FROM reservas"
    total_reservas = ejecutar_query(query_reservas)[0]['total']

    # Reservas por estado
    query_estados = """
                    SELECT SUM(CASE WHEN estado = 'confirmada' THEN 1 ELSE 0 END) as confirmadas, \
                           SUM(CASE WHEN estado = 'pendiente' THEN 1 ELSE 0 END)  as pendientes, \
                           SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END)  as canceladas
                    FROM reservas \
                    """
    estados = ejecutar_query(query_estados)[0]

    # Ingresos totales (suma de precios de reservas confirmadas)
    query_ingresos = """
                     SELECT SUM(p.precio) as total
                     FROM reservas r
                              INNER JOIN productos p ON r.producto_id = p.id
                     WHERE r.estado = 'confirmada' \
                     """
    ingresos = ejecutar_query(query_ingresos)[0]['total'] or 0

    # Tasa de cancelación
    tasa_cancelacion = (estados['canceladas'] / total_reservas * 100) if total_reservas > 0 else 0

    # Productos más populares
    query_populares = """
                      SELECT id, nombre, categoria, precio, reservas, icon
                      FROM productos
                      WHERE disponible = 1
                      ORDER BY reservas DESC LIMIT 5 \
                      """
    productos_populares = ejecutar_query(query_populares)

    return JsonResponse({
        'total_productos': total_productos,
        'total_reservas': total_reservas,
        'reservas_confirmadas': estados['confirmadas'],
        'reservas_pendientes': estados['pendientes'],
        'reservas_canceladas': estados['canceladas'],
        'ingresos_totales': float(ingresos),
        'tasa_cancelacion': round(tasa_cancelacion, 1),
        'productos_populares': productos_populares
    })


def grafico_reservas(request):
    """
    GET /api/grafico-reservas/?periodo=30
    Datos para el gráfico de reservas
    """
    periodo = request.GET.get('periodo', '30')

    query = """
            SELECT
                DATE (fecha) as fecha, COUNT (*) as total
            FROM reservas
            WHERE fecha >= DATE_SUB(CURDATE() \
                , INTERVAL %s DAY)
              AND estado IN ('confirmada' \
                , 'pendiente')
            GROUP BY DATE (fecha)
            ORDER BY fecha \
            """

    datos = ejecutar_query(query, [periodo])
    return JsonResponse({'datos': datos}, safe=False)