from django.contrib import admin
from .models import Restaurant, MenuItem, Order, OrderItem, Courier

# C:\Users\black\marocmiam\backend\api\admin.py
from django.contrib import admin
from .models import Restaurant, MenuItem, Order, OrderItem, Courier, FCMToken, UserProfile, Review, PromoCode, ChatMessage

admin.site.register(Restaurant)
admin.site.register(MenuItem)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Courier)
admin.site.register(FCMToken)
admin.site.register(UserProfile)
admin.site.register(Review)
admin.site.register(PromoCode)
admin.site.register(ChatMessage)

@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display  = ['name', 'city', 'category', 'is_open', 'rating']
    list_filter   = ['city', 'category', 'is_open']
    search_fields = ['name', 'city']

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display  = ['name', 'restaurant', 'price', 'category', 'is_available']
    list_filter   = ['category', 'is_available']
    search_fields = ['name']

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display  = ['id', 'customer', 'restaurant', 'status', 'total_price', 'created_at']
    list_filter   = ['status']
    search_fields = ['customer__username']

@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display  = ['order', 'menu_item', 'quantity', 'price']

@admin.register(Courier)
class CourierAdmin(admin.ModelAdmin):
    list_display  = ['user', 'phone', 'is_available']