from django.contrib import admin
from .models import Restaurant, MenuItem, Order, OrderItem, Courier, FCMToken, UserProfile, Review, PromoCode, ChatMessage

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
    list_display  = ['user', 'phone', 'is_available', 'is_online', 'vehicle']

@admin.register(FCMToken)
class FCMTokenAdmin(admin.ModelAdmin):
    list_display  = ['user', 'created_at']
    search_fields = ['user__username']

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display  = ['user', 'role', 'status', 'city']
    list_filter   = ['role', 'status']
    search_fields = ['user__username', 'restaurant_name']

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display  = ['customer', 'restaurant', 'rating', 'created_at']
    list_filter   = ['rating']
    search_fields = ['customer__username', 'restaurant__name']

@admin.register(PromoCode)
class PromoCodeAdmin(admin.ModelAdmin):
    list_display  = ['code', 'discount', 'max_uses', 'used_count', 'is_active', 'expires_at']
    list_filter   = ['is_active']
    search_fields = ['code']

@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display  = ['order', 'sender', 'message', 'created_at']
    search_fields = ['sender__username']
