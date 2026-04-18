from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import Restaurant, MenuItem, Order, OrderItem, Courier
from .serializers import (
    RestaurantSerializer, MenuItemSerializer,
    OrderSerializer, OrderItemSerializer,
    CourierSerializer, RegisterSerializer, UserSerializer
)


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


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_full_order(request):
    data = request.data
    restaurant_id = data.get('restaurant_id')
    items = data.get('items', [])
    delivery_address = data.get('delivery_address', '')
    delivery_lat = data.get('delivery_lat')
    delivery_lng = data.get('delivery_lng')

    print("ORDER DATA:", data)
    print("ITEMS:", items)

    if not items:
        return Response({'error': 'No items provided'}, status=400)

    if not restaurant_id:
        return Response({'error': 'No restaurant provided'}, status=400)

    try:
        total = sum(float(item['price']) * int(item['quantity']) for item in items)

        order = Order.objects.create(
            customer=request.user,
            restaurant_id=restaurant_id,
            total_price=total,
            delivery_address=delivery_address,
            delivery_lat=delivery_lat,
            delivery_lng=delivery_lng,
        )

        for item in items:
            OrderItem.objects.create(
                order=order,
                menu_item_id=item['menu_item_id'],
                quantity=int(item['quantity']),
                price=float(item['price']),
            )

        print(f"Order #{order.id} created successfully!")
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
        return Response({
            'lat': courier.current_lat,
            'lng': courier.current_lng,
        })
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
    permission_classes = [permissions.IsAdminUser]
    queryset = Order.objects.all()


class AdminRestaurantDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = RestaurantSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Restaurant.objects.all()