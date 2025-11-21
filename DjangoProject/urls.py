from django.contrib import admin
from django.urls import path
from ProyectoBases import views

urlpatterns = [
    path('', views.pagina_login, name='login'),
    path('login/', views.pagina_login, name='pagina_login'),
    path('dashboard/', views.pagina_dashboard, name='pagina_dashboard'),

    path('productos/', views.listar_productos, name='listar_productos'),
    path('productos/crear/', views.crear_producto, name='crear_producto'),
    path('productos/editar/<int:producto_id>/', views.editar_producto, name='editar_producto'),
    path('productos/eliminar/<int:producto_id>/', views.eliminar_producto, name='eliminar_producto'),

    path('clientes/', views.listar_clientes, name='listar_clientes'),
    path('clientes/crear/', views.crear_cliente, name='crear_cliente'),
    path('clientes/editar/<int:cliente_id>/', views.editar_cliente, name='editar_cliente'),
    path('clientes/eliminar/<int:cliente_id>/', views.eliminar_cliente, name='eliminar_cliente'),

    path('alquileres/', views.listar_alquileres, name='listar_alquileres'),
    path('alquileres/crear/', views.crear_alquiler, name='crear_alquiler'),
    path('alquileres/editar/<int:alquiler_id>/', views.editar_alquiler, name='editar_alquiler'),
    path('alquileres/eliminar/<int:alquiler_id>/', views.eliminar_alquiler, name='eliminar_alquiler'),

    path('estaciones/', views.listar_estaciones, name='listar_estaciones'),
    path('estaciones/crear/', views.crear_estacion, name='crear_estacion'),
    path('estaciones/editar/<int:estacion_id>/', views.editar_estacion, name='editar_estacion'),
    path('estaciones/eliminar/<int:estacion_id>/', views.eliminar_estacion, name='eliminar_estacion'),

    path('pagos/', views.listar_pagos, name='listar_pagos'),
    path('pagos/registrar/', views.registrar_pago, name='registrar_pago'),
    path('pagos/editar/<int:pago_id>/', views.editar_pago, name='editar_pago'),
    path('pagos/eliminar/<int:pago_id>/', views.eliminar_pago, name='eliminar_pago'),

    path('estadisticas/', views.estadisticas_dashboard, name='estadisticas'),

    path('api/login/', views.login_administrador, name='api_login'),
    path('api/registrar/', views.registrar_administrador, name='api_registrar'),

    path('ventas/', views.listar_ventas, name='listar_ventas'),
    path('ventas/crear/', views.crear_venta, name='crear_venta'),
    path('ventas/editar/<int:venta_id>/', views.editar_venta, name='editar_venta'),
    path('ventas/eliminar/<int:venta_id>/', views.eliminar_venta, name='eliminar_venta'),

]