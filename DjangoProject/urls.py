from django.contrib import admin
from django.urls import path
from ProyectoBases import views

urlpatterns = [
    # Páginas principales
    path('', views.pagina_login, name='login'),
    path('login/', views.pagina_login, name='pagina_login'),
    path('dashboard/', views.pagina_dashboard, name='pagina_dashboard'),

    # Productos
    path('productos/', views.listar_productos, name='listar_productos'),
    path('productos/crear/', views.crear_producto, name='crear_producto'),
    path('productos/editar/<int:producto_id>/', views.editar_producto, name='editar_producto'),
    path('productos/eliminar/<int:producto_id>/', views.eliminar_producto, name='eliminar_producto'),

    # Clientes
    path('clientes/', views.listar_clientes, name='listar_clientes'),
    path('clientes/crear/', views.crear_cliente, name='crear_cliente'),
    path('clientes/editar/<int:cliente_id>/', views.editar_cliente, name='editar_cliente'),
    path('clientes/eliminar/<int:cliente_id>/', views.eliminar_cliente, name='eliminar_cliente'),

    # Alquileres
    path('alquileres/', views.listar_alquileres, name='listar_alquileres'),
    path('alquileres/crear/', views.crear_alquiler, name='crear_alquiler'),
    path('alquileres/eliminar/<int:alquiler_id>/', views.eliminar_alquiler, name='eliminar_alquiler'),

    # Estaciones
    path('estaciones/', views.listar_estaciones, name='listar_estaciones'),
    path('estaciones/crear/', views.crear_estacion, name='crear_estacion'),

    # Pagos
    path('pagos/', views.listar_pagos, name='listar_pagos'),
    path('pagos/registrar/', views.registrar_pago, name='registrar_pago'),

    # Estadísticas
    path('estadisticas/', views.estadisticas_dashboard, name='estadisticas'),

    #administradores

    path('login/', views.login_administrador, name='iniciarSesion'),
    path('/registrar', views.registrar_administrador, name='registrar'),
]

"""
DOCUMENTACIÓN DE RUTAS ACTUALIZADAS:

=== PRODUCTOS ===
1. GET  /productos/ → Lista todos los productos
2. POST /productos/crear/ → Crea un nuevo producto
3. POST /productos/editar/<id>/ → Edita un producto existente
4. DELETE /productos/eliminar/<id>/ → Elimina un producto

=== CLIENTES ===
5. GET  /clientes/ → Lista todos los clientes
6. POST /clientes/crear/ → Crea un nuevo cliente
7. POST /clientes/editar/<id>/ → Edita un cliente existente
8. DELETE /clientes/eliminar/<id>/ → Elimina un cliente

=== ALQUILERES ===
9. GET  /alquileres/ → Lista todos los alquileres
10. POST /alquileres/crear/ → Crea un nuevo alquiler
11. DELETE /alquileres/eliminar/<id>/ → Elimina un alquiler

=== PAGOS ===
12. GET  /pagos/ → Lista todos los pagos
13. POST /pagos/registrar/ → Registra un nuevo pago

=== ESTACIONES ===
14. GET  /estaciones/ → Lista todas las estaciones
15. POST /estaciones/crear/ → Crea una nueva estación

=== ESTADÍSTICAS ===
16. GET  /estadisticas/ → Obtiene estadísticas del dashboard
"""