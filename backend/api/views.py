from rest_framework import generics, status, permissions
import os
import requests as http_requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import Restaurant, MenuItem, Order, OrderItem, Courier, FCMToken, UserProfile
from .serializers import (
    RestaurantSerializer, MenuItemSerializer,
    OrderSerializer, OrderItemSerializer,
    CourierSerializer, RegisterSerializer, UserSerializer
)
from decimal import Decimal

# ───── AUTH ─────

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


# ───── RESTAURANTS ─────

class RestaurantListView(generics.ListAPIView):
    serializer_class = RestaurantSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get_queryset(self):
        queryset = Restaurant.objects.filter(is_open=True)
        category = self.request.query_params.get('category')
        city = self.request.query_params.get('city')
        search = self.request.query_params.get('search')
        if category:
            queryset = queryset.filter(category__icontains=category)
        if city:
            queryset = queryset.filter(city__icontains=city)
        if search:
            queryset = queryset.filter(name__icontains=search)
        return queryset


class RestaurantDetailView(generics.RetrieveAPIView):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []


# ───── MENU ITEMS ─────

class MenuItemListView(generics.ListAPIView):
    serializer_class = MenuItemSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get_queryset(self):
        restaurant_id = self.kwargs.get('restaurant_id')
        return MenuItem.objects.filter(restaurant_id=restaurant_id, is_available=True)


# ───── ORDERS ─────

class OrderListCreateView(generics.ListCreateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)


class OrderDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user)


import math

def calculate_distance(lat1, lng1, lat2, lng2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlng = math.radians(lng2 - lng1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng/2)**2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))

def calculate_delivery_fee(distance_km):
    if distance_km <= 1: return 10
    elif distance_km <= 3: return 15
    elif distance_km <= 5: return 20
    elif distance_km <= 10: return 25
    else: return 35

def send_order_email(order):
    try:
        from django.core.mail import send_mail
        items_text = '\n'.join([
            f"{item.quantity}x {item.menu_item.name} - {float(item.price) * item.quantity:.0f} MAD"
            for item in order.orderitem_set.all()
        ])
        subject = f"Commande #{order.id} livree - MarocMiam"
        message = f"Bonjour {order.customer.first_name or order.customer.username},\n\nVotre commande a ete livree!\n\n{items_text}\n\nTotal: {float(order.total_price):.0f} MAD\n\nMerci d'avoir choisi MarocMiam!"
        send_mail(subject, message, 'noreply@marocmiam.com', [order.customer.email], fail_silently=True)
    except Exception as e:
        print(f"Email error: {e}")


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_full_order(request):
    data = request.data
    restaurant_id = data.get('restaurant_id')
    items = data.get('items', [])
    delivery_address = data.get('delivery_address', '')
    delivery_lat = data.get('delivery_lat')
    delivery_lng = data.get('delivery_lng')
    payment_method = data.get('payment_method', 'cash')

    if not items:
        return Response({'error': 'No items provided'}, status=400)
    if not restaurant_id:
        return Response({'error': 'No restaurant provided'}, status=400)

    try:
        restaurant = Restaurant.objects.get(id=restaurant_id)
        distance_km = None
        delivery_fee = 15
        if delivery_lat and delivery_lng and restaurant.lat and restaurant.lng:
            distance_km = calculate_distance(
                float(restaurant.lat), float(restaurant.lng),
                float(delivery_lat), float(delivery_lng)
            )
            delivery_fee = calculate_delivery_fee(distance_km)

        service_fee = 5
        items_total = sum(float(item['price']) * int(item['quantity']) for item in items)
        total_price = items_total + delivery_fee + service_fee

        order = Order.objects.create(
            customer=request.user,
            restaurant=restaurant,
            total_price=total_price,
            delivery_fee=delivery_fee,
            service_fee=service_fee,
            payment_method=payment_method,
            delivery_address=delivery_address,
            delivery_lat=delivery_lat,
            delivery_lng=delivery_lng,
            distance_km=distance_km,
            commission_rate=20,
        )

        for item in items:
            OrderItem.objects.create(
                order=order,
                menu_item_id=item['menu_item_id'],
                quantity=int(item['quantity']),
                price=float(item['price']),
            )

        return Response(OrderSerializer(order).data, status=201)

    except Exception as e:
        print(f"ORDER ERROR: {e}")
        return Response({'error': str(e)}, status=400)


# ───── COURIER ─────

@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def update_courier_location(request):
    try:
        courier = Courier.objects.get(user=request.user)
        courier.current_lat = request.data.get('lat', courier.current_lat)
        courier.current_lng = request.data.get('lng', courier.current_lng)
        courier.save()
        return Response({'status': 'location updated'})
    except Courier.DoesNotExist:
        return Response({'error': 'Not a courier'}, status=404)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_courier_location(request, order_id):
    try:
        order = Order.objects.get(id=order_id, customer=request.user)
        courier = Courier.objects.get(current_order=order)
        return Response({'lat': courier.current_lat, 'lng': courier.current_lng})
    except (Order.DoesNotExist, Courier.DoesNotExist):
        return Response({'error': 'Not found'}, status=404)


# ───── ADMIN VIEWS ─────

class AllOrdersView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Order.objects.all().order_by('-created_at')


class AllCouriersView(generics.ListAPIView):
    serializer_class = CourierSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Courier.objects.all()


class CourierDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = CourierSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Courier.objects.all()


class AdminOrderDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Order.objects.all()

    def perform_update(self, serializer):
        order = serializer.save()
        notify_order_status(order)


class AdminRestaurantDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = RestaurantSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Restaurant.objects.all()


# ───── PUSH NOTIFICATIONS ─────

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def save_fcm_token(request):
    token = request.data.get('token')
    if not token:
        return Response({'error': 'No token provided'}, status=400)
    FCMToken.objects.get_or_create(user=request.user, token=token)
    return Response({'status': 'token saved'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def send_notification_to_user(request):
    if not request.user.is_staff:
        return Response({'error': 'Admin only'}, status=403)
    user_id = request.data.get('user_id')
    title = request.data.get('title', 'MarocMiam')
    body = request.data.get('body', '')
    tokens = FCMToken.objects.filter(user_id=user_id).values_list('token', flat=True)
    if not tokens:
        return Response({'error': 'No tokens found'}, status=404)
    send_fcm_notification(list(tokens), title, body)
    return Response({'status': 'sent'})


def send_fcm_notification(tokens, title, body, data=None):
    FCM_SERVER_KEY = os.environ.get('FCM_SERVER_KEY', '')
    if not FCM_SERVER_KEY:
        return
    payload = {
        'registration_ids': tokens,
        'notification': {'title': title, 'body': body, 'icon': 'https://marocmiam.vercel.app/icon.png'},
        'data': data or {},
    }
    try:
        res = http_requests.post(
            'https://fcm.googleapis.com/fcm/send',
            json=payload,
            headers={'Authorization': f'key={FCM_SERVER_KEY}', 'Content-Type': 'application/json'}
        )
        print(f"FCM response: {res.status_code}")
    except Exception as e:
        print(f"FCM error: {e}")


def notify_order_status(order):
    status_messages = {
        'confirmed': ('Order Confirmed', f'Your order #{order.id} has been confirmed!'),
        'preparing': ('Being Prepared', f'Your order #{order.id} is being prepared.'),
        'picked_up': ('On the Way', f'Your order #{order.id} is on its way!'),
        'delivered': ('Delivered', f'Your order #{order.id} has been delivered. Enjoy!'),
        'cancelled': ('Order Cancelled', f'Your order #{order.id} has been cancelled.'),
    }
    if order.status in status_messages:
        title, body = status_messages[order.status]
        tokens = FCMToken.objects.filter(user=order.customer).values_list('token', flat=True)
        if tokens:
            send_fcm_notification(list(tokens), title, body, {'order_id': str(order.id)})


# ───── USER LIST (legacy) ─────

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def list_users(request):
    users = User.objects.all().order_by('-date_joined')
    data = [{
        'id': u.id, 'username': u.username, 'email': u.email,
        'first_name': u.first_name, 'last_name': u.last_name,
        'is_staff': u.is_staff, 'is_superuser': u.is_superuser,
        'date_joined': u.date_joined,
    } for u in users]
    return Response(data)


# ───── USER PROFILES & ROLES ─────

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def apply_restaurant_owner(request):
    data = request.data
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    profile.role = 'restaurant_owner'
    profile.status = 'pending'
    profile.phone = data.get('phone', '')
    profile.city = data.get('city', '')
    profile.restaurant_name = data.get('restaurant_name', '')
    profile.restaurant_address = data.get('restaurant_address', '')
    profile.restaurant_category = data.get('restaurant_category', '')
    profile.save()
    return Response({'status': 'Application submitted - pending approval'})


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def apply_courier(request):
    data = request.data
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    profile.role = 'courier'
    profile.status = 'pending'
    profile.phone = data.get('phone', '')
    profile.city = data.get('city', '')
    profile.vehicle = data.get('vehicle', '')
    profile.id_card = data.get('id_card', '')
    profile.save()
    return Response({'status': 'Application submitted - pending approval'})


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def my_profile(request):
    profile, _ = UserProfile.objects.get_or_create(
        user=request.user,
        defaults={'role': 'customer', 'status': 'approved'}
    )
    from .serializers import UserProfileSerializer
    return Response({
        'user': UserSerializer(request.user).data,
        'profile': UserProfileSerializer(profile).data,
    })


# ───── ADMIN - MANAGE APPLICATIONS ─────

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def list_applications(request):
    role = request.query_params.get('role')
    app_status = request.query_params.get('status', 'pending')
    profiles = UserProfile.objects.filter(status=app_status)
    if role:
        profiles = profiles.filter(role=role)
    from .serializers import UserProfileSerializer
    return Response(UserProfileSerializer(profiles, many=True).data)


@api_view(['PATCH'])
@permission_classes([permissions.IsAdminUser])
def update_application(request, pk):
    try:
        profile = UserProfile.objects.get(pk=pk)
        new_status = request.data.get('status')
        profile.status = new_status
        profile.save()

        if new_status == 'approved' and profile.role == 'restaurant_owner':
            Restaurant.objects.get_or_create(
                name=profile.restaurant_name or f"{profile.user.username}'s Restaurant",
                defaults={
                    'address': profile.restaurant_address or '',
                    'city': profile.city or 'Al Hoceima',
                    'phone': profile.phone or '',
                    'category': profile.restaurant_category or 'Restaurant',
                    'is_open': True, 'rating': 0.0,
                    'description': f"Restaurant by {profile.user.username}",
                    'image_url': '',
                }
            )

        if new_status == 'approved' and profile.role == 'courier':
            Courier.objects.get_or_create(
                user=profile.user,
                defaults={
                    'phone': profile.phone or '', 'is_available': True,
                    'is_online': False, 'vehicle': profile.vehicle or 'moto',
                    'deliveries_count': 0, 'earnings_total': 0,
                }
            )

        return Response({'status': f'Application {new_status}'})
    except UserProfile.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=400)


# ───── COURIER APP ─────

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def courier_me(request):
    try:
        courier = Courier.objects.get(user=request.user)
        return Response(CourierSerializer(courier).data)
    except Courier.DoesNotExist:
        return Response({'error': 'Not a courier'}, status=404)


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def courier_toggle_online(request):
    try:
        courier = Courier.objects.get(user=request.user)
        courier.is_online = request.data.get('is_online', not courier.is_online)
        courier.save()
        return Response({'is_online': courier.is_online})
    except Courier.DoesNotExist:
        return Response({'error': 'Not a courier'}, status=404)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def courier_available_orders(request):
    try:
        Courier.objects.get(user=request.user)
    except Courier.DoesNotExist:
        return Response({'error': 'Not a courier'}, status=404)
    orders = Order.objects.filter(status='preparing').exclude(assigned_courier__isnull=False).order_by('-created_at')
    return Response(OrderSerializer(orders, many=True).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def courier_accept_order(request, order_id):
    try:
        courier = Courier.objects.get(user=request.user)
        order = Order.objects.get(id=order_id, status='preparing')
        if Order.objects.filter(assigned_courier=courier, status='picked_up').exists():
            return Response({'error': 'You already have an active delivery'}, status=400)
        order.status = 'picked_up'
        order.save()
        courier.current_order = order
        courier.save()
        return Response({'status': 'Order accepted', 'order': OrderSerializer(order).data})
    except Courier.DoesNotExist:
        return Response({'error': 'Not a courier'}, status=404)
    except Order.DoesNotExist:
        return Response({'error': 'Order not available'}, status=404)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def courier_deliver_order(request, order_id):
    try:
        courier = Courier.objects.get(user=request.user)
        order = Order.objects.get(id=order_id, status='picked_up')
        order.status = 'delivered'
        order.save()
        send_order_email(order)
        courier.current_order = None
        courier.deliveries_count += 1
        courier.earnings_total += order.total_price * Decimal('0.67')
        courier.save()
        return Response({'status': 'Order delivered successfully'})
    except Courier.DoesNotExist:
        return Response({'error': 'Not a courier'}, status=404)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def courier_update_location(request):
    try:
        courier = Courier.objects.get(user=request.user)
        courier.current_lat = request.data.get('lat', courier.current_lat)
        courier.current_lng = request.data.get('lng', courier.current_lng)
        courier.save()
        if courier.current_order:
            Order.objects.filter(id=courier.current_order.id).update(
                delivery_lat=courier.current_lat,
                delivery_lng=courier.current_lng,
            )
        return Response({'status': 'location updated'})
    except Courier.DoesNotExist:
        return Response({'error': 'Not a courier'}, status=404)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def courier_active_order(request):
    try:
        courier = Courier.objects.get(user=request.user)
        if courier.current_order:
            return Response(OrderSerializer(courier.current_order).data)
        active = Order.objects.filter(assigned_courier=courier, status='picked_up').first()
        if active:
            return Response(OrderSerializer(active).data)
        return Response(None)
    except Courier.DoesNotExist:
        return Response({'error': 'Not a courier'}, status=404)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def courier_earnings(request):
    try:
        courier = Courier.objects.get(user=request.user)
        import datetime
        delivered = Order.objects.filter(assigned_courier=courier, status='delivered').order_by('-created_at')
        today = delivered.filter(created_at__date=datetime.date.today())
        return Response({
            'total_deliveries': courier.deliveries_count,
            'total_earnings': float(courier.earnings_total),
            'today_deliveries': today.count(),
            'today_earnings': float(sum(o.total_price * Decimal('0.67') for o in today)),
        })
    except Courier.DoesNotExist:
        return Response({'error': 'Not a courier'}, status=404)


# ───── RESTAURANT OWNER DASHBOARD ─────

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def owner_my_restaurant(request):
    try:
        profile = UserProfile.objects.get(user=request.user, role='restaurant_owner', status='approved')
        restaurant = Restaurant.objects.get(name=profile.restaurant_name)
        return Response(RestaurantSerializer(restaurant).data)
    except UserProfile.DoesNotExist:
        return Response({'error': 'Not a restaurant owner'}, status=404)
    except Restaurant.DoesNotExist:
        return Response({'error': 'Restaurant not found'}, status=404)


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def owner_update_restaurant(request):
    try:
        profile = UserProfile.objects.get(user=request.user, role='restaurant_owner', status='approved')
        restaurant = Restaurant.objects.get(name=profile.restaurant_name)
        for field in ['is_open', 'description', 'phone', 'image_url']:
            if field in request.data:
                setattr(restaurant, field, request.data[field])
        restaurant.save()
        return Response(RestaurantSerializer(restaurant).data)
    except (UserProfile.DoesNotExist, Restaurant.DoesNotExist):
        return Response({'error': 'Not found'}, status=404)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def owner_orders(request):
    try:
        profile = UserProfile.objects.get(user=request.user, role='restaurant_owner', status='approved')
        restaurant = Restaurant.objects.get(name=profile.restaurant_name)
        orders = Order.objects.filter(restaurant=restaurant).order_by('-created_at')
        return Response(OrderSerializer(orders, many=True).data)
    except (UserProfile.DoesNotExist, Restaurant.DoesNotExist):
        return Response({'error': 'Not found'}, status=404)


@api_view(['PATCH'])
@permission_classes([permissions.IsAuthenticated])
def owner_update_order(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
        if 'status' in request.data:
            order.status = request.data['status']
            order.save()
        return Response(OrderSerializer(order).data)
    except Order.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=400)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def owner_menu(request):
    try:
        profile = UserProfile.objects.get(user=request.user, role='restaurant_owner', status='approved')
        restaurant = Restaurant.objects.get(name=profile.restaurant_name)
        items = MenuItem.objects.filter(restaurant=restaurant)
        return Response(MenuItemSerializer(items, many=True).data)
    except (UserProfile.DoesNotExist, Restaurant.DoesNotExist):
        return Response({'error': 'Not found'}, status=404)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def owner_add_menu_item(request):
    try:
        profile = UserProfile.objects.get(user=request.user, role='restaurant_owner', status='approved')
        restaurant = Restaurant.objects.get(name=profile.restaurant_name)
        item = MenuItem.objects.create(
            restaurant=restaurant,
            name=request.data.get('name', ''),
            description=request.data.get('description', ''),
            price=request.data.get('price', 0),
            category=request.data.get('category', 'Plats'),
            is_available=True,
        )
        return Response(MenuItemSerializer(item).data, status=201)
    except (UserProfile.DoesNotExist, Restaurant.DoesNotExist):
        return Response({'error': 'Not found'}, status=404)


@api_view(['PATCH', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def owner_menu_item(request, item_id):
    try:
        profile = UserProfile.objects.get(user=request.user, role='restaurant_owner', status='approved')
        restaurant = Restaurant.objects.get(name=profile.restaurant_name)
        item = MenuItem.objects.get(id=item_id, restaurant=restaurant)
        if request.method == 'DELETE':
            item.delete()
            return Response({'status': 'deleted'})
        for field in ['name', 'description', 'price', 'category', 'is_available']:
            if field in request.data:
                setattr(item, field, request.data[field])
        item.save()
        return Response(MenuItemSerializer(item).data)
    except (UserProfile.DoesNotExist, Restaurant.DoesNotExist, MenuItem.DoesNotExist):
        return Response({'error': 'Not found'}, status=404)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def owner_stats(request):
    try:
        profile = UserProfile.objects.get(user=request.user, role='restaurant_owner', status='approved')
        restaurant = Restaurant.objects.get(name=profile.restaurant_name)
        import datetime
        today = datetime.date.today()
        all_orders = Order.objects.filter(restaurant=restaurant)
        today_orders = all_orders.filter(created_at__date=today)
        delivered = all_orders.filter(status='delivered')
        today_delivered = today_orders.filter(status='delivered')
        total_revenue = sum(o.total_price for o in delivered)
        today_revenue = sum(o.total_price for o in today_delivered)
        pending = all_orders.filter(status__in=['pending', 'confirmed', 'preparing'])
        return Response({
            'total_orders': all_orders.count(),
            'today_orders': today_orders.count(),
            'pending_orders': pending.count(),
            'total_revenue': float(total_revenue),
            'today_revenue': float(today_revenue),
            'net_revenue': float(total_revenue) * 0.80,
            'net_today_revenue': float(today_revenue) * 0.80,
            'commission_rate': 20,
            'rating': float(restaurant.rating),
            'is_open': restaurant.is_open,
        })
    except (UserProfile.DoesNotExist, Restaurant.DoesNotExist):
        return Response({'error': 'Not found'}, status=404)


# ───── ADMIN USER MANAGEMENT ─────

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def list_users_detailed(request):
    users = User.objects.all().order_by('-date_joined').select_related('profile')
    data = []
    for u in users:
        try:
            profile = u.profile
            profile_role = profile.role
            profile_status = profile.status
            phone = profile.phone
            city = profile.city
        except Exception:
            profile_role = 'customer'
            profile_status = 'approved'
            phone = ''
            city = ''
        data.append({
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'first_name': u.first_name,
            'last_name': u.last_name,
            'is_staff': u.is_staff,
            'is_superuser': u.is_superuser,
            'is_active': u.is_active,
            'date_joined': u.date_joined,
            'profile_role': profile_role,
            'profile_status': profile_status,
            'phone': phone,
            'city': city,
        })
    return Response(data)


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def create_user(request):
    username = request.data.get('username', '').strip()
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '').strip()
    role = request.data.get('role', 'customer')

    if not username or not password:
        return Response({'error': 'Username and password are required'}, status=400)
    if len(password) < 6:
        return Response({'error': 'Password must be at least 6 characters'}, status=400)
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken'}, status=400)

    is_staff = role in ('staff', 'superuser')
    is_superuser = role == 'superuser'

    user = User.objects.create_user(
        username=username, email=email, password=password,
        is_staff=is_staff, is_superuser=is_superuser,
    )
    UserProfile.objects.create(user=user, role='customer', status='approved')

    return Response({
        'status': 'User created',
        'user': {
            'id': user.id, 'username': user.username, 'email': user.email,
            'is_staff': user.is_staff, 'is_superuser': user.is_superuser,
            'date_joined': user.date_joined,
        }
    }, status=201)


@api_view(['DELETE'])
@permission_classes([permissions.IsAdminUser])
def delete_user(request, pk):
    try:
        user = User.objects.get(pk=pk)
        if user.is_superuser:
            return Response({'error': 'Cannot delete superuser'}, status=403)
        user.delete()
        return Response({'status': 'User deleted'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)


@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def reset_user_password(request, pk):
    try:
        user = User.objects.get(pk=pk)
        new_password = request.data.get('password')
        if not new_password or len(new_password) < 6:
            return Response({'error': 'Password must be at least 6 characters'}, status=400)
        user.set_password(new_password)
        user.save()
        return Response({'status': 'Password reset successfully'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)


@api_view(['PATCH'])
@permission_classes([permissions.IsAdminUser])
def update_user_role(request, pk):
    try:
        user = User.objects.get(pk=pk)
        role = request.data.get('role')
        if role == 'superuser':
            user.is_staff = True
            user.is_superuser = True
        elif role == 'staff':
            user.is_staff = True
            user.is_superuser = False
        elif role == 'customer':
            user.is_staff = False
            user.is_superuser = False
        else:
            return Response({'error': 'Invalid role. Use: customer, staff, superuser'}, status=400)
        user.save()
        return Response({'status': f'Role updated to {role}', 'user': {
            'id': user.id, 'username': user.username,
            'is_staff': user.is_staff, 'is_superuser': user.is_superuser,
        }})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)


# ───── ADMIN STATS ─────

@api_view(['GET'])
@permission_classes([permissions.IsAdminUser])
def admin_stats(request):
    import datetime
    today = datetime.date.today()

    all_orders    = Order.objects.all()
    delivered     = all_orders.filter(status='delivered')
    active_orders = all_orders.exclude(status__in=['delivered', 'cancelled'])
    today_orders  = all_orders.filter(created_at__date=today)
    cancelled     = all_orders.filter(status='cancelled')

    revenue       = sum(float(o.total_price) for o in delivered)
    today_revenue = sum(float(o.total_price) for o in today_orders.filter(status='delivered'))

    chart = []
    for i in range(6, -1, -1):
        d = today - datetime.timedelta(days=i)
        day_delivered = delivered.filter(created_at__date=d)
        chart.append({
            'label': d.strftime('%a'),
            'date': d.isoformat(),
            'revenue': round(sum(float(o.total_price) for o in day_delivered), 2),
            'orders': all_orders.filter(created_at__date=d).count(),
        })

    from django.db.models import Count, Sum
    top_restaurants = list(
        Order.objects.filter(status='delivered')
        .values('restaurant__name', 'restaurant__id')
        .annotate(order_count=Count('id'), total=Sum('total_price'))
        .order_by('-order_count')[:5]
    )

    return Response({
        'revenue':           round(revenue, 2),
        'today_revenue':     round(today_revenue, 2),
        'commission':        round(revenue * 0.15, 2),
        'total_orders':      all_orders.count(),
        'today_orders':      today_orders.count(),
        'active_orders':     active_orders.count(),
        'delivered_orders':  delivered.count(),
        'cancelled_orders':  cancelled.count(),
        'total_users':       User.objects.count(),
        'total_restaurants': Restaurant.objects.count(),
        'avg_basket':        round(revenue / delivered.count(), 2) if delivered.count() else 0,
        'chart':             chart,
        'top_restaurants':   top_restaurants,
    })

@api_view(['PATCH'])
@permission_classes([permissions.IsAdminUser])
def update_user_profile_role(request, pk):
    try:
        user = User.objects.get(pk=pk)
        new_role = request.data.get('role')
        if new_role not in ['customer', 'restaurant_owner', 'courier']:
            return Response({'error': 'Invalid role'}, status=400)
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = new_role
        profile.status = 'approved'
        profile.save()
        if new_role == 'courier':
            Courier.objects.get_or_create(
                user=user,
                defaults={'phone': profile.phone or '', 'is_available': True, 'is_online': False, 'vehicle': 'moto', 'deliveries_count': 0, 'earnings_total': 0}
            )
        return Response({'status': f'Profile role updated to {new_role}'})
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    
# Add to views.py

@api_view(['POST'])
@permission_classes([permissions.IsAdminUser])
def assign_restaurant_to_owner(request, pk):
    """Assign an existing or new restaurant to a user as owner"""
    try:
        user = User.objects.get(pk=pk)
        restaurant_id = request.data.get('restaurant_id')
        new_restaurant_name = request.data.get('new_restaurant_name', '').strip()
        category = request.data.get('category', 'Restaurant')
        city = request.data.get('city', '')
        address = request.data.get('address', '')

        # Get or create restaurant
        if restaurant_id:
            restaurant = Restaurant.objects.get(id=restaurant_id)
        elif new_restaurant_name:
            restaurant = Restaurant.objects.create(
                name=new_restaurant_name,
                category=category,
                city=city,
                address=address,
                phone='',
                is_open=True,
                rating=0.0,
                description=f"Restaurant managed by {user.username}",
                image_url='',
            )
        else:
            return Response({'error': 'Provide restaurant_id or new_restaurant_name'}, status=400)

        # Update user profile
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = 'restaurant_owner'
        profile.status = 'approved'
        profile.restaurant_name = restaurant.name
        profile.restaurant_address = restaurant.address
        profile.restaurant_category = restaurant.category
        profile.city = restaurant.city
        profile.save()

        return Response({
            'status': 'Restaurant assigned',
            'restaurant': RestaurantSerializer(restaurant).data,
        })
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=404)
    except Restaurant.DoesNotExist:
        return Response({'error': 'Restaurant not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=400)


# Add to urls.py:
# path('admin/users/<int:pk>/assign-restaurant/', views.assign_restaurant_to_owner),
