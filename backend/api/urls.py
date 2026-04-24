from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Auth
    path('auth/register/', views.register),
    path('auth/login/', views.login),
    path('auth/refresh/', TokenRefreshView.as_view()),

    # Users (legacy)
    path('admin/users/<int:pk>/profile-role/', views.update_user_profile_role),
    path('users/', views.list_users),

    # Restaurants (public)
    path('restaurants/', views.RestaurantListView.as_view()),
    path('restaurants/<int:pk>/', views.RestaurantDetailView.as_view()),

    # Menu (public)
    path('restaurants/<int:restaurant_id>/menu/', views.MenuItemListView.as_view()),

    # Orders (customer)
    path('orders/', views.OrderListCreateView.as_view()),
    path('orders/create/', views.create_full_order),
    path('orders/all/', views.AllOrdersView.as_view()),
    path('orders/<int:pk>/', views.OrderDetailView.as_view()),

    # Admin order detail
    path('admin/orders/<int:pk>/', views.AdminOrderDetailView.as_view()),
    path('admin/users/<int:pk>/assign-restaurant/', views.assign_restaurant_to_owner),
    # Couriers
    path('couriers/', views.AllCouriersView.as_view()),
    path('couriers/<int:pk>/', views.CourierDetailView.as_view()),

    # Courier tracking
    path('courier/location/', views.update_courier_location),
    path('courier/location/<int:order_id>/', views.get_courier_location),

    # Push notifications
    path('notifications/token/', views.save_fcm_token),
    path('notifications/send/', views.send_notification_to_user),

    # User profiles & applications
    path('profile/me/', views.my_profile),
    path('apply/restaurant/', views.apply_restaurant_owner),
    path('apply/courier/', views.apply_courier),
    path('admin/applications/', views.list_applications),
    path('admin/applications/<int:pk>/', views.update_application),

    # Admin stats
    path('admin/stats/', views.admin_stats),

    # Admin user management
    path('admin/users/', views.list_users_detailed),
    path('admin/users/create/', views.create_user),
    path('admin/users/<int:pk>/delete/', views.delete_user),
    path('admin/users/<int:pk>/reset-password/', views.reset_user_password),
    path('admin/users/<int:pk>/role/', views.update_user_role),

    # Admin restaurant
    path('admin/restaurants/<int:pk>/', views.AdminRestaurantDetailView.as_view()),

    # Courier app
    path('courier/me/', views.courier_me),
    path('courier/online/', views.courier_toggle_online),
    path('courier/available/', views.courier_available_orders),
    path('courier/accept/<int:order_id>/', views.courier_accept_order),
    path('courier/deliver/<int:order_id>/', views.courier_deliver_order),
    path('courier/active/', views.courier_active_order),
    path('courier/earnings/', views.courier_earnings),
    path('courier/update-location/', views.courier_update_location),
    path('courier/history/', views.courier_history),
    # Restaurant owner dashboard
    path('owner/restaurant/', views.owner_my_restaurant),
    path('owner/restaurant/update/', views.owner_update_restaurant),
    path('owner/orders/', views.owner_orders),
    path('owner/orders/<int:order_id>/', views.owner_update_order),
    path('owner/menu/', views.owner_menu),
    path('owner/menu/add/', views.owner_add_menu_item),
    path('owner/menu/<int:item_id>/', views.owner_menu_item),
    path('owner/stats/', views.owner_stats),
]
