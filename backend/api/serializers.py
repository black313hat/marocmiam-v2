from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Restaurant, MenuItem, Order, OrderItem, Courier, UserProfile

class UserSerializer(serializers.ModelSerializer):
    profile_role = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'profile_role']
    
    def get_profile_role(self, obj):
        try:
            return obj.profile.role
        except:
            return 'customer'
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )
        return user


class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = '__all__'


class RestaurantSerializer(serializers.ModelSerializer):
    menu_items = MenuItemSerializer(many=True, read_only=True)

    class Meta:
        model = Restaurant
        fields = '__all__'


class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = '__all__'

class OrderSerializer(serializers.ModelSerializer):
    customer_username = serializers.CharField(source='customer.username', read_only=True)
    restaurant_name = serializers.CharField(source='restaurant.name', read_only=True)
    courier_username = serializers.SerializerMethodField()
    order_items = OrderItemSerializer(many=True, read_only=True, source='items')

    class Meta:
        model = Order
        fields = [
            'id', 'customer_username', 'restaurant_name',
            'courier_username', 'status',
            'total_price', 'delivery_fee', 'service_fee', 'payment_method',
            'delivery_address', 'delivery_lat', 'delivery_lng',
            'distance_km', 'commission_rate', 'order_items', 'created_at',
        ]

    def get_courier_username(self, obj):
        try:
            return obj.assigned_courier.first().user.username
        except:
            return None
class CourierSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Courier
        fields = '__all__'


class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = '__all__'