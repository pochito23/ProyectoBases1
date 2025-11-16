"""
URL configuration for DjangoProject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import path

from ProyectoBases import views

"""
urls.py de la app 'reservas'
Define todas las rutas de la API
"""


urlpatterns = [
    # ===== PRODUCTOS =====
    path('productos/', views.listar_productos, name='listar_productos'),
    path('productos/crear/', views.crear_producto, name='crear_producto'),
    path('productos/eliminar/<int:producto_id>/', views.eliminar_producto, name='eliminar_producto'),

    # ===== CLIENTES =====
    path('clientes/', views.listar_clientes, name='listar_clientes'),
    path('clientes/crear/', views.crear_cliente, name='crear_cliente'),

    # ===== RESERVAS =====
    path('reservas/', views.listar_reservas, name='listar_reservas'),
    path('reservas/hoy/', views.reservas_hoy, name='reservas_hoy'),
    path('reservas/crear/', views.crear_reserva, name='crear_reserva'),

    # ===== ESTADÍSTICAS =====
    path('estadisticas/', views.estadisticas_dashboard, name='estadisticas'),
    path('grafico-reservas/', views.grafico_reservas, name='grafico_reservas'),
]

"""
CÓMO USAR ESTAS RUTAS:

1. GET  http://localhost:8000/api/productos/
   → Lista todos los productos

2. POST http://localhost:8000/api/productos/crear/
   Body: {
       "nombre": "PlayStation 5",
       "categoria": "Electrónica",
       "precio": 15,
       "descripcion": "Consola nueva"
   }
   → Crea un producto nuevo

3. GET  http://localhost:8000/api/clientes/
   → Lista todos los clientes

4. POST http://localhost:8000/api/clientes/crear/
   Body: {
       "nombre": "Juan Pérez",
       "email": "juan@email.com",
       "telefono": "555-0101"
   }
   → Crea un cliente

5. GET  http://localhost:8000/api/reservas/
   → Lista todas las reservas

6. GET  http://localhost:8000/api/reservas/hoy/
   → Lista solo las reservas de HOY

7. POST http://localhost:8000/api/reservas/crear/
   Body: {
       "producto_nombre": "PlayStation 5",
       "cliente_nombre": "Juan Pérez",
       "fecha": "2025-11-12",
       "hora_inicio": "09:00",
       "hora_fin": "11:00",
       "estado": "confirmada"
   }
   → Crea una reserva

8. GET  http://localhost:8000/api/estadisticas/
   → Obtiene todas las estadísticas para el dashboard

9. GET  http://localhost:8000/api/grafico-reservas/?periodo=30
   → Datos para los gráficos (últimos 30 días)
"""