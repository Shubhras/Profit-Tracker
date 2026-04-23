from .models import *
def update_order_items_from_report(row):
    sku = row.get("sku")

    try:
        item = OrderItem.objects.filter(seller_sku=sku).first()
        if not item:
            return

        item.mrp = float(row.get("item-price", 0)) + float(row.get("item-tax", 0))
        item.selling_price = float(row.get("item-price", 0))

        item.promotion_discount = abs(float(row.get("promotion-discount", 0)))
        item.discount = item.mrp - item.selling_price

        item.net_sales = item.selling_price - item.promotion_discount
        item.total_amount = item.net_sales

        item.save()

    except Exception as e:
        print("Report update error:", e)