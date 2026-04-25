from django.db import models
from django.contrib.auth.models import User

class Restaurant(models.Model):
    name        = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    address     = models.CharField(max_length=300)
    city        = models.CharField(max_length=100)
    phone       = models.CharField(max_length=20)
    image       = models.ImageField(upload_to='restaurants/', blank=True)
    image_url = models.URLField(max_length=500, blank=True, default='')
    category    = models.CharField(max_length=100)
    is_open     = models.BooleanField(default=True)
    rating      = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    created_at  = models.DateTimeField(auto_now_add=True)
    lat = models.FloatField(null=True, blank=True)
    lng = models.FloatField(null=True, blank=True)

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    restaurant  = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='menu_items')
    name        = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    price       = models.DecimalField(max_digits=8, decimal_places=2)
    image       = models.ImageField(upload_to='menu/', blank=True)
    category    = models.CharField(max_length=100)
    is_available= models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} - {self.restaurant.name}"

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('preparing', 'Preparing'),
        ('picked_up', 'Picked Up'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    PAYMENT_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Card'),
    ]
    customer = models.ForeignKey(User, on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    service_fee = models.DecimalField(max_digits=6, decimal_places=2, default=5)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_CHOICES, default='cash')
    delivery_address = models.TextField()
    delivery_lat = models.FloatField(null=True, blank=True)
    delivery_lng = models.FloatField(null=True, blank=True)
    restaurant_lat = models.FloatField(null=True, blank=True)
    restaurant_lng = models.FloatField(null=True, blank=True)
    distance_km = models.FloatField(null=True, blank=True)
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2, default=20)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def restaurant_earnings(self):
        return float(self.total_price) * (1 - float(self.commission_rate) / 100)

    def platform_commission(self):
        return float(self.total_price) * float(self.commission_rate) / 100

    def __str__(self):
        return f"Order #{self.id} - {self.customer.username}"


class OrderItem(models.Model):
    order       = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item   = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity    = models.PositiveIntegerField(default=1)
    price       = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.menu_item.name}"

class Review(models.Model):
    order      = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='review')
    customer   = models.ForeignKey(User, on_delete=models.CASCADE)
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name='reviews')
    rating     = models.IntegerField(default=5)  # 1-5
    comment    = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.customer.username} for {self.restaurant.name} - {self.rating}★"

class Courier(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=20)
    is_available = models.BooleanField(default=True)
    is_online = models.BooleanField(default=False)
    current_lat = models.FloatField(null=True, blank=True)
    current_lng = models.FloatField(null=True, blank=True)
    current_order = models.ForeignKey('Order', null=True, blank=True, on_delete=models.SET_NULL, related_name='assigned_courier')
    vehicle = models.CharField(max_length=50, blank=True, default='moto')
    deliveries_count = models.IntegerField(default=0)
    earnings_total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    delivery_history = models.ManyToManyField('Order', blank=True, related_name='delivered_by')
    def __str__(self):
        return f"Courier: {self.user.username}"
    

class FCMToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fcm_tokens')
    token = models.TextField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - FCM Token"
    

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('restaurant_owner', 'Restaurant Owner'),
        ('courier', 'Courier'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='approved')
    phone = models.CharField(max_length=20, blank=True)
    city = models.CharField(max_length=100, blank=True)
    # Restaurant owner fields
    restaurant_name = models.CharField(max_length=200, blank=True)
    restaurant_address = models.CharField(max_length=300, blank=True)
    restaurant_category = models.CharField(max_length=100, blank=True)
    # Courier fields
    vehicle = models.CharField(max_length=50, blank=True)
    id_card = models.CharField(max_length=50, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"
    
    
    
# ── ADD TO models.py ──

# PromoCode model
class PromoCode(models.Model):
    code = models.CharField(max_length=20, unique=True)
    discount = models.IntegerField(default=10)  # percentage
    max_uses = models.IntegerField(default=100)
    used_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    min_order = models.DecimalField(max_digits=8, decimal_places=2, default=0)
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.code} - {self.discount}%"


# ChatMessage model
class ChatMessage(models.Model):
    order = models.ForeignKey('Order', on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Message from {self.sender.username} on Order #{self.order.id}"
