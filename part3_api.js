const express = require('express');
const router = express.Router();

router.get('/api/companies/:company_id/alerts/low-stock', async (req, res) => {
    try {
        const { company_id } = req.params;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const lowStockItems = await db.inventory.findMany({
            where: {
                warehouse: { company_id: parseInt(company_id) },
                quantity: { lt: db.raw('product.low_stock_threshold') },
                last_sold_at: { gte: thirtyDaysAgo } 
            },
            include: {
                product: { include: { supplier: true } },
                warehouse: true
            }});

        const alerts = lowStockItems.map(item => {
            let daysUntilStockout = null;
            if (item.average_daily_sales > 0) {
                daysUntilStockout = Math.ceil(item.quantity / item.average_daily_sales);
            }

          return {
                product_id: item.product.id,
                product_name: item.product.name,
                sku: item.product.sku,
                warehouse_id: item.warehouse.id,
                warehouse_name: item.warehouse.name,
                current_stock: item.quantity,
                threshold: item.product.low_stock_threshold,
                days_until_stockout: daysUntilStockout,
                supplier: item.product.supplier ? {
                    id: item.product.supplier.id,
                    name: item.product.supplier.name,
                    contact_email: item.product.supplier.contact_email
                } : null
            };
        });


        
return res.status(200).json({
            alerts: alerts,
            total_alerts: alerts.length
        });
    } catch (error) {
        console.error("Error fetching low stock alerts:", error);
        return res.status(500).json({ error: "Failed to retrieve alerts" });
    }
});
module.exports = router;
