from decimal import Decimal
from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('amazon_auth', '0049_profitcalculationsetting_preview_input_gst_rate_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='MarketplaceEstimatedFeeRule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('marketplace', models.CharField(db_index=True, default='Myntra', max_length=50)),
                ('name', models.CharField(max_length=255)),
                ('desc', models.CharField(blank=True, max_length=500, null=True)),
                ('how', models.CharField(choices=[('pct', 'Percentage'), ('flat', 'Flat Amount'), ('pct-slab', 'Percentage Slab'), ('flat-slab', 'Flat Amount Slab'), ('weight', 'Weight Based')], default='pct-slab', max_length=20)),
                ('by_cat', models.BooleanField(default=False)),
                ('on', models.BooleanField(default=True)),
                ('value', models.DecimalField(decimal_places=2, default=Decimal('0.00'), max_digits=12)),
                ('groups', models.JSONField(blank=True, default=list)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='marketplace_estimated_fee_rules', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'db_table': 'amazon_auth_marketplaceestimatedfeerule',
                'ordering': ['id'],
            },
        ),
    ]
