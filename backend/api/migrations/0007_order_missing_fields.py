from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_restaurant_lat_restaurant_lng'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='delivery_fee',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=6),
        ),
        migrations.AddField(
            model_name='order',
            name='service_fee',
            field=models.DecimalField(decimal_places=2, default=5, max_digits=6),
        ),
        migrations.AddField(
            model_name='order',
            name='payment_method',
            field=models.CharField(
                choices=[('cash', 'Cash'), ('card', 'Card')],
                default='cash',
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name='order',
            name='delivery_lat',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='delivery_lng',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='restaurant_lat',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='restaurant_lng',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='distance_km',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='commission_rate',
            field=models.DecimalField(decimal_places=2, default=20, max_digits=5),
        ),
    ]
