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
        ('pending',    'Pending'),
        ('confirmed',  'Confirmed'),
        ('preparing',  'Preparing'),
        ('picked_up',  'Picked Up'),
        ('delivered',  'Delivered'),
        ('cancelled',  'Cancelled'),
    ]
    customer        = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    restaurant      = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    status          = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    total_price     = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_address= models.CharField(max_length=300)
    delivery_lat    = models.FloatField(null=True, blank=True)
    delivery_lng    = models.FloatField(null=True, blank=True)
    created_at      = models.DateTimeField(auto_now_add=True)
    updated_at      = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order #{self.id} - {self.customer.username}"


class OrderItem(models.Model):
    order       = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item   = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity    = models.PositiveIntegerField(default=1)
    price       = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return f"{self.quantity}x {self.menu_item.name}"


class Courier(models.Model):
    user            = models.OneToOneField(User, on_delete=models.CASCADE)
    phone           = models.CharField(max_length=20)
    is_available    = models.BooleanField(default=True)
    current_lat     = models.FloatField(null=True, blank=True)
    current_lng     = models.FloatField(null=True, blank=True)
    current_order   = models.ForeignKey(Order, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f"Courier: {self.user.username}"