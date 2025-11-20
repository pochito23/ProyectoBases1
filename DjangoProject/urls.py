"""
URL configuration para SistemaArrendamiento
"""

from django.contrib import admin
from django.urls import path
from ProyectoBases import views

urlpatterns = [
    # ===== PÁGINAS HTML =====
    path('', views.pagina_login, name='login'),
    path('login/', views.pagina_login, name='pagina_login'),
    path('dashboard/', views.pagina_dashboard, name='pagina_dashboard'),

    # ===== PRODUCTOS =====
    path('productos/', views.listar_productos, name='listar_productos'),
    path('productos/crear/', views.crear_producto, name='crear_producto'),
    path('productos/eliminar/<int:producto_id>/', views.eliminar_producto, name='eliminar_producto'),

    # ===== CLIENTES =====
    path('clientes/', views.listar_clientes, name='listar_clientes'),
    path('clientes/crear/', views.crear_cliente, name='crear_cliente'),

    # ===== ALQUILERES =====
    path('alquileres/', views.listar_alquileres, name='listar_alquileres'),
    path('alquileres/crear/', views.crear_alquiler, name='crear_alquiler'),

    # ===== ESTACIONES =====
    path('estaciones/', views.listar_estaciones, name='listar_estaciones'),

    # ===== PAGOS =====
    path('pagos/', views.listar_pagos, name='listar_pagos'),
    path('pagos/registrar/', views.registrar_pago, name='registrar_pago'),

    # ===== ESTADÍSTICAS =====
    path('estadisticas/', views.estadisticas_dashboard, name='estadisticas'),
]

"""
DOCUMENTACIÓN DE RUTAS:

1. GET  http://localhost:8000/productos/
   → Lista todos los productos

2. POST http://localhost:8000/productos/crear/
   Body: {
       "nombre": "Bicicleta de Montaña",
       "disponibles": 5,
       "precio": 150.00,
       "descripcion": "Bicicleta profesional",
       "tipoProducto": "Arrendamiento",
       "idEstacion": 1
   }

3. GET  http://localhost:8000/clientes/
   → Lista todos los clientes

4. POST http://localhost:8000/clientes/crear/
   Body: {
       "dni": "0801-1990-12345",
       "nombre": "Juan",
       "apellido": "Pérez",
       "telefono": "555-0101",
       "email": "juan@email.com",
       "direccion": "Tegucigalpa",
       "tipo": "Premium"
   }

5. GET  http://localhost:8000/alquileres/
   → Lista todos los alquileres

6. POST http://localhost:8000/alquileres/crear/
   Body: {
       "idCliente": 1,
       "idProducto": 1,
       "fechaInicio": "2025-11-20",
       "fechaCorte": "2025-11-27",
       "cantidad": 2,
       "pagoInicial": 100.00,
       "pagoDeposito": 50.00
   }

7. GET  http://localhost:8000/pagos/
   → Lista todos los pagos

8. POST http://localhost:8000/pagos/registrar/
   Body: {
       "idCliente": 1,
       "idAlquiler": 1,
       "monto": 150.00,
       "metodoPago": "Tarjeta"
   }

9. GET  http://localhost:8000/estadisticas/
   → Obtiene estadísticas del dashboard

10. GET  http://localhost:8000/estaciones/
    → Lista todas las estaciones de venta
"""