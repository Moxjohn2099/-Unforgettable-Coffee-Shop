// 🚀 UNFORGETTABLE COFFEE SHOP - BACKEND SERVER
console.log('☕ STARTING UNFORGETTABLE COFFEE SERVER...');

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced CORS configuration for deployment
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files with improved configuration
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '..')));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../public')));

console.log('✅ Middleware loaded');

// Data storage - enhanced for deployment
const dataDir = path.join(__dirname, 'data');
const productsFile = path.join(dataDir, 'products.json');
const ordersFile = path.join(dataDir, 'orders.json');
const contactsFile = path.join(dataDir, 'contacts.json');
const newsletterFile = path.join(dataDir, 'newsletter.json');

// Ensure data directory exists with error handling
try {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('✅ Data directory created');
    }
} catch (error) {
    console.error('❌ Error creating data directory:', error);
}

// Initialize data files if they don't exist
const initializeDataFile = (filePath, initialData = []) => {
    if (!fs.existsSync(filePath)) {
        try {
            fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2));
            console.log(`✅ ${path.basename(filePath)} initialized`);
        } catch (error) {
            console.error(`❌ Error initializing ${filePath}:`, error);
        }
    }
};

// Initialize all data files
initializeDataFile(productsFile, [
    {
        id: 1,
        name: "Ethiopian Yirgacheffe",
        price: 18.99,
        image: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?ixlib=rb-4.0.3&auto=format&fit=crop&w=774&q=80",
        description: "Bright, floral notes with a citrusy finish. A classic Ethiopian coffee.",
        category: "single-origin",
        stock: 50
    },
    {
        id: 2,
        name: "Colombian Supremo",
        price: 16.99,
        image: "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        description: "Well-balanced with notes of caramel and nuts. A crowd-pleaser.",
        category: "single-origin",
        stock: 45
    },
    {
        id: 3,
        name: "Sumatra Mandheling",
        price: 19.99,
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        description: "Full-bodied with earthy tones and low acidity. A bold choice.",
        category: "single-origin",
        stock: 30
    },
    {
        id: 4,
        name: "Guatemalan Antigua",
        price: 17.99,
        image: "https://images.unsplash.com/photo-1568649929103-28ffbefaca1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80",
        description: "Chocolatey with a spicy finish. A complex and satisfying brew.",
        category: "single-origin",
        stock: 40
    }
]);

initializeDataFile(ordersFile);
initializeDataFile(contactsFile);
initializeDataFile(newsletterFile);

console.log('✅ All data files ready');

// Enhanced helper functions with better error handling
function readData(file) {
    try {
        if (!fs.existsSync(file)) {
            console.warn(`⚠️ File ${file} does not exist, returning empty array`);
            return [];
        }
        const data = fs.readFileSync(file, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`❌ Error reading ${file}:`, error);
        return [];
    }
}

function writeData(file, data) {
    try {
        fs.writeFileSync(file, JSON.stringify(data, null, 2));
        console.log(`✅ Data written to ${file}`);
        return true;
    } catch (error) {
        console.error(`❌ Error writing to ${file}:`, error);
        return false;
    }
}

// Generate unique order ID
function generateOrderId() {
    return 'UC-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

// Input validation middleware
const validateOrder = (req, res, next) => {
    const { items, customerInfo, total } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ 
            success: false, 
            error: 'Order must contain at least one item' 
        });
    }
    
    if (!customerInfo || !customerInfo.name || !customerInfo.email) {
        return res.status(400).json({ 
            success: false, 
            error: 'Customer name and email are required' 
        });
    }
    
    if (!total || total <= 0) {
        return res.status(400).json({ 
            success: false, 
            error: 'Valid total amount is required' 
        });
    }
    
    next();
};

const validateEmail = (req, res, next) => {
    const { email } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ 
            success: false, 
            error: 'Valid email address is required' 
        });
    }
    
    next();
};

// ✅ SALES REPORT FUNCTION
function generateSalesReport() {
    try {
        const orders = readData(ordersFile);
        const products = readData(productsFile);
        
        let totalSales = 0;
        let totalOrders = orders.length;
        let popularProducts = {};
        
        orders.forEach(order => {
            totalSales += order.total;
            
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    const productName = item.name || item.product;
                    popularProducts[productName] = (popularProducts[productName] || 0) + item.quantity;
                });
            }
        });
        
        // Sort popular products
        const sortedProducts = Object.entries(popularProducts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        console.log('\n📊 📊 📊 SALES REPORT 📊 📊 📊');
        console.log('══════════════════════════════════════');
        console.log(`💰 Total Sales: $${totalSales.toFixed(2)}`);
        console.log(`📦 Total Orders: ${totalOrders}`);
        console.log(`📈 Average Order: $${(totalSales / totalOrders).toFixed(2)}`);
        console.log('🏆 Top Products:');
        sortedProducts.forEach(([product, quantity], index) => {
            console.log(`   ${index + 1}. ${product} - ${quantity} sold`);
        });
        console.log('══════════════════════════════════════\n');
        
    } catch (error) {
        console.error('❌ Error generating sales report:', error);
    }
}

// ✅ HEALTH CHECK - Enhanced with more info
app.get('/api/health', (req, res) => {
    const healthData = {
        status: 'healthy',
        message: 'Unforgettable Coffee Server is running!',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: '1.0.0'
    };
    res.json(healthData);
});

// ✅ SALES REPORT API
app.get('/api/sales-report', (req, res) => {
    try {
        const orders = readData(ordersFile);
        const products = readData(productsFile);
        
        let totalSales = 0;
        let totalOrders = orders.length;
        let popularProducts = {};
        let dailySales = {};
        
        orders.forEach(order => {
            totalSales += order.total;
            
            // Group by date
            const orderDate = new Date(order.createdAt).toLocaleDateString();
            dailySales[orderDate] = (dailySales[orderDate] || 0) + order.total;
            
            // Count products
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    const productName = item.name || item.product;
                    popularProducts[productName] = (popularProducts[productName] || 0) + item.quantity;
                });
            }
        });
        
        const sortedProducts = Object.entries(popularProducts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
            
        const sortedDailySales = Object.entries(dailySales)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
            .slice(-7); // Last 7 days
        
        res.json({
            success: true,
            report: {
                totalSales: totalSales.toFixed(2),
                totalOrders,
                averageOrder: (totalSales / totalOrders).toFixed(2),
                popularProducts: sortedProducts,
                recentSales: sortedDailySales,
                timestamp: new Date().toISOString()
            }
        });
        
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ ADMIN DASHBOARD - FOR CLIENT TO VIEW ORDERS & SALES
app.get('/admin', (req, res) => {
    try {
        const orders = readData(ordersFile);
        const products = readData(productsFile);
        
        let totalSales = 0;
        let totalOrders = orders.length;
        let popularProducts = {};
        let todaySales = 0;
        let todayOrders = 0;
        
        const today = new Date().toLocaleDateString();
        
        orders.forEach(order => {
            totalSales += order.total;
            
            // Today's sales
            const orderDate = new Date(order.createdAt).toLocaleDateString();
            if (orderDate === today) {
                todaySales += order.total;
                todayOrders++;
            }
            
            // Popular products
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    const productName = item.name || item.product;
                    popularProducts[productName] = (popularProducts[productName] || 0) + item.quantity;
                });
            }
        });
        
        const sortedProducts = Object.entries(popularProducts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Admin Dashboard - Unforgettable Coffee</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        background: #f5f5f5; 
                        padding: 20px;
                    }
                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                    }
                    .header {
                        background: #8B4513;
                        color: white;
                        padding: 2rem;
                        border-radius: 10px;
                        margin-bottom: 2rem;
                        text-align: center;
                    }
                    .stats-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 1rem;
                        margin-bottom: 2rem;
                    }
                    .stat-card {
                        background: white;
                        padding: 1.5rem;
                        border-radius: 10px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        text-align: center;
                    }
                    .stat-number {
                        font-size: 2rem;
                        font-weight: bold;
                        color: #8B4513;
                        margin-bottom: 0.5rem;
                    }
                    .stat-label {
                        color: #666;
                        font-size: 0.9rem;
                    }
                    .orders-section {
                        background: white;
                        padding: 2rem;
                        border-radius: 10px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        margin-bottom: 2rem;
                    }
                    .order-item {
                        border: 1px solid #ddd;
                        padding: 1rem;
                        margin-bottom: 1rem;
                        border-radius: 5px;
                        background: #f9f9f9;
                    }
                    .order-header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 0.5rem;
                        padding-bottom: 0.5rem;
                        border-bottom: 1px solid #eee;
                    }
                    .order-id {
                        font-weight: bold;
                        color: #8B4513;
                    }
                    .order-total {
                        font-weight: bold;
                        color: #2E7D32;
                    }
                    .product-list {
                        margin-top: 0.5rem;
                        padding-left: 1rem;
                    }
                    .product-item {
                        margin: 0.2rem 0;
                        color: #555;
                    }
                    .btn {
                        background: #8B4513;
                        color: white;
                        padding: 10px 20px;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        margin: 5px;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 14px;
                    }
                    .btn:hover {
                        background: #A0522D;
                    }
                    .btn-group {
                        text-align: center;
                        margin: 2rem 0;
                    }
                    .today-highlight {
                        background: #E8F5E8;
                        border-left: 4px solid #4CAF50;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>☕ Unforgettable Coffee - Admin Dashboard</h1>
                        <p>Real-time Business Analytics & Order Management</p>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">$${totalSales.toFixed(2)}</div>
                            <div class="stat-label">Total Sales</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${totalOrders}</div>
                            <div class="stat-label">Total Orders</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">$${(totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : '0.00')}</div>
                            <div class="stat-label">Average Order</div>
                        </div>
                        <div class="stat-card today-highlight">
                            <div class="stat-number">$${todaySales.toFixed(2)}</div>
                            <div class="stat-label">Today's Sales</div>
                        </div>
                        <div class="stat-card today-highlight">
                            <div class="stat-number">${todayOrders}</div>
                            <div class="stat-label">Today's Orders</div>
                        </div>
                    </div>

                    <div class="orders-section">
                        <h2>📦 Recent Orders (Last 10)</h2>
                        ${orders.length === 0 ? 
                            '<p style="text-align: center; color: #666; padding: 2rem;">No orders yet. Orders will appear here when customers place them.</p>' : 
                            orders.slice(-10).reverse().map(order => `
                                <div class="order-item">
                                    <div class="order-header">
                                        <span class="order-id">📦 Order: ${order.orderId}</span>
                                        <span class="order-total">💰 $${order.total}</span>
                                    </div>
                                    <div><strong>👤 Customer:</strong> ${order.customerInfo?.name || 'N/A'} - ${order.customerInfo?.email || 'N/A'}</div>
                                    <div><strong>📞 Phone:</strong> ${order.customerInfo?.phone || 'N/A'}</div>
                                    <div><strong>📅 Date:</strong> ${new Date(order.createdAt).toLocaleString()}</div>
                                    <div><strong>🏠 Address:</strong> ${order.customerInfo?.address || 'N/A'}</div>
                                    <div class="product-list">
                                        <strong>📋 Items:</strong>
                                        ${order.items ? order.items.map(item => `
                                            <div class="product-item">• ${item.quantity}x ${item.name} - $${item.price} each (Total: $${(item.quantity * item.price).toFixed(2)})</div>
                                        `).join('') : '<div class="product-item">No items</div>'}
                                    </div>
                                </div>
                            `).join('')
                        }
                    </div>
                    
                    <div class="btn-group">
                        <a href="/admin/sales-report" class="btn">📊 View Detailed Sales Report</a>
                        <a href="/admin/orders" class="btn">📦 View All Orders</a>
                        <a href="/" target="_blank" class="btn">🌐 Visit Website</a>
                        <button onclick="location.reload()" class="btn">🔄 Refresh Dashboard</button>
                    </div>

                    <div style="text-align: center; margin-top: 2rem; color: #666; font-size: 0.9rem;">
                        <p>💡 <strong>Tip:</strong> Keep this dashboard open to see real-time orders and sales updates.</p>
                        <p>Last updated: ${new Date().toLocaleString()}</p>
                    </div>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send(`
            <html>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h1 style="color: #8B4513;">❌ Error Loading Dashboard</h1>
                <p>There was an error loading the admin dashboard. Please try again.</p>
                <a href="/admin" style="color: #8B4513;">Retry</a>
            </body>
            </html>
        `);
    }
});

// ✅ SALES REPORT UI - BEAUTIFUL INTERFACE
app.get('/admin/sales-report', (req, res) => {
    try {
        const orders = readData(ordersFile);
        const products = readData(productsFile);
        
        let totalSales = 0;
        let totalOrders = orders.length;
        let popularProducts = {};
        let dailySales = {};
        let monthlySales = {};
        
        orders.forEach(order => {
            totalSales += order.total;
            
            // Daily sales
            const orderDate = new Date(order.createdAt).toLocaleDateString();
            dailySales[orderDate] = (dailySales[orderDate] || 0) + order.total;
            
            // Monthly sales
            const monthYear = new Date(order.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long' 
            });
            monthlySales[monthYear] = (monthlySales[monthYear] || 0) + order.total;
            
            // Popular products
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    const productName = item.name || item.product;
                    popularProducts[productName] = (popularProducts[productName] || 0) + item.quantity;
                });
            }
        });
        
        const sortedProducts = Object.entries(popularProducts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
            
        const sortedDailySales = Object.entries(dailySales)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]))
            .slice(-30); // Last 30 days
            
        const sortedMonthlySales = Object.entries(monthlySales)
            .sort((a, b) => new Date(a[0]) - new Date(b[0]));

        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Sales Report - Unforgettable Coffee</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        background: #f5f5f5; 
                        padding: 20px;
                    }
                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                    }
                    .header {
                        background: #2E7D32;
                        color: white;
                        padding: 2rem;
                        border-radius: 10px;
                        margin-bottom: 2rem;
                        text-align: center;
                    }
                    .stats-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 1rem;
                        margin-bottom: 2rem;
                    }
                    .stat-card {
                        background: white;
                        padding: 1.5rem;
                        border-radius: 10px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        text-align: center;
                    }
                    .stat-number {
                        font-size: 2rem;
                        font-weight: bold;
                        color: #2E7D32;
                        margin-bottom: 0.5rem;
                    }
                    .stat-label {
                        color: #666;
                        font-size: 0.9rem;
                    }
                    .section {
                        background: white;
                        padding: 2rem;
                        border-radius: 10px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        margin-bottom: 2rem;
                    }
                    .product-item, .sales-item {
                        display: flex;
                        justify-content: space-between;
                        padding: 0.8rem;
                        border-bottom: 1px solid #eee;
                    }
                    .product-item:hover, .sales-item:hover {
                        background: #f9f9f9;
                    }
                    .btn {
                        background: #8B4513;
                        color: white;
                        padding: 10px 20px;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        margin: 5px;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 14px;
                    }
                    .btn:hover {
                        background: #A0522D;
                    }
                    .btn-group {
                        text-align: center;
                        margin: 2rem 0;
                    }
                    .chart-bar {
                        background: #4CAF50;
                        height: 20px;
                        margin: 5px 0;
                        border-radius: 10px;
                        color: white;
                        padding: 0 10px;
                        display: flex;
                        align-items: center;
                        font-size: 0.8rem;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📊 Sales Analytics Report</h1>
                        <p>Comprehensive Business Performance Analysis</p>
                    </div>
                    
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-number">$${totalSales.toFixed(2)}</div>
                            <div class="stat-label">Total Revenue</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${totalOrders}</div>
                            <div class="stat-label">Total Orders</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">$${(totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : '0.00')}</div>
                            <div class="stat-label">Average Order Value</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${sortedProducts.length}</div>
                            <div class="stat-label">Products Sold</div>
                        </div>
                    </div>

                    <div class="section">
                        <h2>🏆 Top Selling Products</h2>
                        ${sortedProducts.map(([product, quantity], index) => `
                            <div class="product-item">
                                <span>${index + 1}. ${product}</span>
                                <span><strong>${quantity}</strong> sold</span>
                            </div>
                        `).join('')}
                    </div>

                    <div class="section">
                        <h2>📈 Monthly Sales Performance</h2>
                        ${sortedMonthlySales.map(([month, sales]) => `
                            <div class="sales-item">
                                <span>${month}</span>
                                <span><strong>$${sales.toFixed(2)}</strong></span>
                            </div>
                        `).join('')}
                    </div>

                    <div class="section">
                        <h2>📅 Recent Daily Sales (Last 30 Days)</h2>
                        ${sortedDailySales.reverse().map(([date, sales]) => `
                            <div class="sales-item">
                                <span>${date}</span>
                                <span><strong>$${sales.toFixed(2)}</strong></span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="btn-group">
                        <a href="/admin" class="btn">📋 Back to Dashboard</a>
                        <a href="/admin/orders" class="btn">📦 View All Orders</a>
                        <a href="/api/sales-report" target="_blank" class="btn">📄 Raw JSON Data</a>
                        <button onclick="window.print()" class="btn">🖨️ Print Report</button>
                    </div>

                    <div style="text-align: center; margin-top: 2rem; color: #666; font-size: 0.9rem;">
                        <p>Report generated: ${new Date().toLocaleString()}</p>
                    </div>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send(`
            <html>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h1 style="color: #8B4513;">❌ Error Loading Sales Report</h1>
                <p>There was an error generating the sales report. Please try again.</p>
                <a href="/admin/sales-report" style="color: #8B4513;">Retry</a>
            </body>
            </html>
        `);
    }
});

// ✅ ALL ORDERS UI - COMPLETE ORDER MANAGEMENT
app.get('/admin/orders', (req, res) => {
    try {
        const orders = readData(ordersFile);
        
        // Sort orders by date (newest first)
        const sortedOrders = [...orders].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );

        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>All Orders - Unforgettable Coffee</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                        background: #f5f5f5; 
                        padding: 20px;
                    }
                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                    }
                    .header {
                        background: #1976D2;
                        color: white;
                        padding: 2rem;
                        border-radius: 10px;
                        margin-bottom: 2rem;
                        text-align: center;
                    }
                    .order-count {
                        background: white;
                        padding: 1rem;
                        border-radius: 10px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        margin-bottom: 2rem;
                        text-align: center;
                        font-size: 1.2rem;
                    }
                    .orders-section {
                        background: white;
                        padding: 2rem;
                        border-radius: 10px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                        margin-bottom: 2rem;
                    }
                    .order-item {
                        border: 1px solid #ddd;
                        padding: 1.5rem;
                        margin-bottom: 1rem;
                        border-radius: 8px;
                        background: #f9f9f9;
                    }
                    .order-header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 1rem;
                        padding-bottom: 1rem;
                        border-bottom: 2px solid #eee;
                    }
                    .order-id {
                        font-weight: bold;
                        color: #1976D2;
                        font-size: 1.1rem;
                    }
                    .order-total {
                        font-weight: bold;
                        color: #2E7D32;
                        font-size: 1.1rem;
                    }
                    .customer-info {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 1rem;
                        margin-bottom: 1rem;
                    }
                    .info-group {
                        margin-bottom: 0.5rem;
                    }
                    .info-label {
                        font-weight: bold;
                        color: #666;
                        font-size: 0.9rem;
                    }
                    .product-list {
                        margin-top: 1rem;
                    }
                    .product-item {
                        display: flex;
                        justify-content: space-between;
                        padding: 0.5rem;
                        border-bottom: 1px solid #eee;
                    }
                    .btn {
                        background: #8B4513;
                        color: white;
                        padding: 10px 20px;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        margin: 5px;
                        text-decoration: none;
                        display: inline-block;
                        font-size: 14px;
                    }
                    .btn:hover {
                        background: #A0522D;
                    }
                    .btn-group {
                        text-align: center;
                        margin: 2rem 0;
                    }
                    .no-orders {
                        text-align: center;
                        color: #666;
                        padding: 3rem;
                        font-size: 1.1rem;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>📦 Complete Order History</h1>
                        <p>All Customer Orders - Total: ${orders.length} orders</p>
                    </div>
                    
                    <div class="order-count">
                        📊 <strong>${orders.length}</strong> total orders processed
                    </div>

                    <div class="orders-section">
                        ${orders.length === 0 ? 
                            '<div class="no-orders">📭 No orders yet. Orders will appear here when customers place them.</div>' : 
                            sortedOrders.map(order => `
                                <div class="order-item">
                                    <div class="order-header">
                                        <span class="order-id">📦 Order: ${order.orderId}</span>
                                        <span class="order-total">💰 $${order.total}</span>
                                    </div>
                                    
                                    <div class="customer-info">
                                        <div>
                                            <div class="info-group">
                                                <div class="info-label">👤 Customer</div>
                                                <div>${order.customerInfo?.name || 'N/A'}</div>
                                            </div>
                                            <div class="info-group">
                                                <div class="info-label">📧 Email</div>
                                                <div>${order.customerInfo?.email || 'N/A'}</div>
                                            </div>
                                        </div>
                                        <div>
                                            <div class="info-group">
                                                <div class="info-label">📞 Phone</div>
                                                <div>${order.customerInfo?.phone || 'N/A'}</div>
                                            </div>
                                            <div class="info-group">
                                                <div class="info-label">📅 Order Date</div>
                                                <div>${new Date(order.createdAt).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="info-group">
                                        <div class="info-label">🏠 Delivery Address</div>
                                        <div>${order.customerInfo?.address || 'N/A'}</div>
                                    </div>
                                    
                                    <div class="product-list">
                                        <div class="info-label">📋 Order Items:</div>
                                        ${order.items ? order.items.map(item => `
                                            <div class="product-item">
                                                <span>${item.quantity}x ${item.name} @ $${item.price} each</span>
                                                <span><strong>$${(item.quantity * item.price).toFixed(2)}</strong></span>
                                            </div>
                                        `).join('') : '<div>No items in order</div>'}
                                    </div>
                                </div>
                            `).join('')
                        }
                    </div>
                    
                    <div class="btn-group">
                        <a href="/admin" class="btn">📋 Back to Dashboard</a>
                        <a href="/admin/sales-report" class="btn">📊 Sales Analytics</a>
                        <a href="/api/orders" target="_blank" class="btn">📄 Raw JSON Data</a>
                        <button onclick="window.print()" class="btn">🖨️ Print Orders</button>
                    </div>

                    <div style="text-align: center; margin-top: 2rem; color: #666; font-size: 0.9rem;">
                        <p>Last updated: ${new Date().toLocaleString()} • ${orders.length} orders total</p>
                    </div>
                </div>
            </body>
            </html>
        `);
    } catch (error) {
        res.status(500).send(`
            <html>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h1 style="color: #8B4513;">❌ Error Loading Orders</h1>
                <p>There was an error loading the orders. Please try again.</p>
                <a href="/admin/orders" style="color: #8B4513;">Retry</a>
            </body>
            </html>
        `);
    }
});

// ✅ SIMPLE TEST PAGE - Enhanced for deployment
app.get('/test', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Unforgettable Coffee - TEST</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                    text-align: center; 
                    padding: 40px 20px; 
                    background: linear-gradient(135deg, #F5F5DC 0%, #E6D2AA 100%);
                    min-height: 100vh;
                }
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 0 10px 30px rgba(139, 69, 19, 0.2);
                }
                h1 { 
                    color: #8B4513; 
                    font-size: 2.8em;
                    margin-bottom: 20px;
                    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
                }
                .subtitle {
                    color: #A0522D;
                    font-size: 1.2em;
                    margin-bottom: 30px;
                }
                .status {
                    background: #4CAF50;
                    color: white;
                    padding: 15px 30px;
                    border-radius: 50px;
                    font-size: 1.3em;
                    font-weight: bold;
                    margin: 20px 0;
                    display: inline-block;
                    box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
                }
                .btn-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin: 30px 0;
                }
                .btn { 
                    background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%); 
                    color: white; 
                    padding: 15px 25px; 
                    text-decoration: none; 
                    border-radius: 10px; 
                    font-weight: bold;
                    transition: all 0.3s ease;
                    border: none;
                    cursor: pointer;
                    font-size: 1em;
                }
                .btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(139, 69, 19, 0.4);
                }
                .info-box {
                    background: #FFF8E1;
                    border-left: 4px solid #FFA000;
                    padding: 20px;
                    margin: 20px 0;
                    text-align: left;
                    border-radius: 0 8px 8px 0;
                }
                .deployment-ready {
                    background: #E8F5E8;
                    border: 2px solid #4CAF50;
                    padding: 15px;
                    border-radius: 10px;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>☕ Unforgettable Coffee Shop</h1>
                <p class="subtitle">Premium Coffee Experience</p>
                
                <div class="status">🎉 SERVER IS WORKING PERFECTLY!</div>
                
                <div class="deployment-ready">
                    <strong>🚀 READY FOR DEPLOYMENT!</strong>
                    <p>Backend server is fully configured and optimized for production.</p>
                </div>
                
                <div class="info-box">
                    <h3>📊 Server Information:</h3>
                    <p><strong>Port:</strong> ${PORT}</p>
                    <p><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</p>
                    <p><strong>Node.js:</strong> ${process.version}</p>
                    <p><strong>Platform:</strong> ${process.platform}</p>
                </div>

                <div class="info-box">
                    <h3>🎯 Admin & Business Tools:</h3>
                    <p><strong>Admin Dashboard:</strong> <a href="/admin" target="_blank">/admin</a> - View orders & sales</p>
                    <p><strong>Sales Reports:</strong> <a href="/admin/sales-report" target="_blank">/admin/sales-report</a> - Beautiful analytics</p>
                    <p><strong>All Orders:</strong> <a href="/admin/orders" target="_blank">/admin/orders</a> - Complete order management</p>
                </div>
                
                <div class="btn-grid">
                    <a href="/admin" class="btn" target="_blank">Admin Dashboard</a>
                    <a href="/admin/sales-report" class="btn" target="_blank">Sales Report</a>
                    <a href="/admin/orders" class="btn" target="_blank">All Orders</a>
                    <a href="/api/health" class="btn">Health Check API</a>
                    <a href="/api/products" class="btn">Products API</a>
                    <a href="/" class="btn">Main Website</a>
                </div>
                
                <p style="color: #666; margin-top: 30px;">
                    All systems operational • Ready to serve coffee! ☕
                </p>
            </div>
        </body>
        </html>
    `);
});

// Serve frontend - ENHANCED with better logging
app.get('/', (req, res) => {
    console.log('📍 Home page requested - Client IP:', req.ip);
    
    const possiblePaths = [
        path.join(__dirname, '../frontend/index.html'),
        path.join(__dirname, '../public/index.html'),
        path.join(__dirname, '../index.html'),
        path.join(__dirname, 'index.html'),
        path.join(__dirname, 'public/index.html')
    ];
    
    for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
            console.log('✅ Serving index.html from:', filePath);
            return res.sendFile(filePath);
        }
    }
    
    // Enhanced fallback response
    console.log('❌ index.html not found in any location');
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Unforgettable Coffee - Backend Running</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    text-align: center; 
                    padding: 50px; 
                    background: #F5F5DC;
                    color: #333;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    padding: 40px;
                    border-radius: 15px;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                }
                h1 { 
                    color: #8B4513; 
                    font-size: 2.5em;
                    margin-bottom: 20px;
                }
                .btn { 
                    background: #8B4513; 
                    color: white; 
                    padding: 12px 25px; 
                    text-decoration: none; 
                    border-radius: 8px; 
                    margin: 10px;
                    display: inline-block;
                    transition: background 0.3s;
                }
                .btn:hover { background: #A0522D; }
                .warning { 
                    background: #FFF3CD; 
                    border: 1px solid #FFEAA7; 
                    padding: 15px; 
                    border-radius: 8px; 
                    margin: 20px 0;
                    color: #856404;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>☕ Unforgettable Coffee Shop</h1>
                <p>🚀 <strong>BACKEND SERVER IS RUNNING!</strong></p>
                
                <div class="warning">
                    <p><strong>Note:</strong> Frontend files (index.html) not found in expected locations.</p>
                    <p>This is normal if you're only deploying the backend API.</p>
                </div>

                <div style="background: #E8F5E8; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3>🎯 Business Tools Available:</h3>
                    <p><a href="/admin" style="color: #8B4513; font-weight: bold;">Admin Dashboard</a> - View orders & sales reports</p>
                    <p><a href="/admin/sales-report" style="color: #8B4513; font-weight: bold;">Sales Reports</a> - Beautiful analytics dashboard</p>
                    <p><a href="/admin/orders" style="color: #8B4513; font-weight: bold;">All Orders</a> - Complete order management</p>
                </div>
                
                <p>Available endpoints:</p>
                <div style="margin: 20px 0;">
                    <a href="/admin" class="btn">Admin Dashboard</a>
                    <a href="/admin/sales-report" class="btn">Sales Report</a>
                    <a href="/admin/orders" class="btn">All Orders</a>
                    <a href="/test" class="btn">Test Page</a>
                    <a href="/api/health" class="btn">Health Check</a>
                </div>
                
                <p style="margin-top: 30px; color: #666;">
                    Server is ready to handle API requests for your coffee shop application.
                </p>
            </div>
        </body>
        </html>
    `);
});

// Products API - Enhanced with caching headers
app.get('/api/products', (req, res) => {
    try {
        const products = readData(productsFile);
        console.log(`📦 Sending ${products.length} products to client ${req.ip}`);
        
        // Add cache headers for performance
        res.set('Cache-Control', 'public, max-age=300'); // 5 minutes cache
        res.json({
            success: true,
            data: products,
            count: products.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Error fetching products:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch products' 
        });
    }
});

app.get('/api/products/:id', (req, res) => {
    try {
        const products = readData(productsFile);
        const product = products.find(p => p.id === parseInt(req.params.id));
        
        if (!product) {
            return res.status(404).json({ 
                success: false,
                error: 'Product not found' 
            });
        }
        
        res.json({
            success: true,
            data: product
        });
    } catch (error) {
        console.error('❌ Error fetching product:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch product' 
        });
    }
});

// Orders API with validation
app.get('/api/orders', (req, res) => {
    try {
        const orders = readData(ordersFile);
        res.json({
            success: true,
            data: orders,
            count: orders.length
        });
    } catch (error) {
        console.error('❌ Error fetching orders:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch orders' 
        });
    }
});

// ✅ UPDATED ORDERS API WITH TERMINAL NOTIFICATIONS
app.post('/api/orders', validateOrder, (req, res) => {
    try {
        console.log('🛒 Received new order from:', req.body.customerInfo?.email);
        
        const orders = readData(ordersFile);
        const orderId = generateOrderId();
        
        const newOrder = {
            orderId: orderId,
            ...req.body,
            status: 'confirmed',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        orders.push(newOrder);
        
        if (writeData(ordersFile, orders)) {
            // ✅ ORDER NOTIFICATIONS SA TERMINAL
            console.log('\n🎉🎉🎉 NEW COFFEE ORDER! 🎉🎉🎉');
            console.log('═══════════════════════════════════════════════');
            console.log(`📦 Order ID: ${orderId}`);
            console.log(`👤 Customer: ${newOrder.customerInfo?.name || 'N/A'}`);
            console.log(`📧 Email: ${newOrder.customerInfo?.email || 'N/A'}`);
            console.log(`📞 Phone: ${newOrder.customerInfo?.phone || 'N/A'}`);
            console.log(`🏠 Address: ${newOrder.customerInfo?.address || 'N/A'}`);
            console.log(`💰 Total Amount: $${newOrder.total || 0}`);
            console.log(`📅 Order Date: ${new Date().toLocaleString()}`);
            console.log('📋 Order Items:');
            
            if (newOrder.items && Array.isArray(newOrder.items)) {
                newOrder.items.forEach((item, index) => {
                    console.log(`   ${index + 1}. ${item.quantity}x ${item.name || item.product} - $${item.price || 0} each`);
                });
            } else {
                console.log('   No items in order');
            }
            
            console.log('═══════════════════════════════════════════════\n');
            // ✅ END OF NOTIFICATIONS
            
            console.log(`✅ Order ${orderId} saved successfully`);
            
            res.status(201).json({
                success: true,
                message: 'Order placed successfully!',
                orderId: orderId,
                data: newOrder
            });
        } else {
            throw new Error('Failed to write order data');
        }
    } catch (error) {
        console.error('❌ Error creating order:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to create order: ' + error.message 
        });
    }
});

// Contact API with validation
app.post('/api/contact', validateEmail, (req, res) => {
    try {
        console.log('📧 Received contact form from:', req.body.email);
        
        const contacts = readData(contactsFile);
        const newContact = {
            id: Date.now(),
            ...req.body,
            createdAt: new Date().toISOString(),
            ip: req.ip
        };
        
        contacts.push(newContact);
        
        if (writeData(contactsFile, contacts)) {
            res.status(201).json({
                success: true,
                message: 'Contact form submitted successfully! We will get back to you soon.',
                data: newContact
            });
        } else {
            throw new Error('Failed to save contact');
        }
    } catch (error) {
        console.error('❌ Error saving contact:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to save contact message' 
        });
    }
});

// Newsletter API with enhanced validation
app.post('/api/newsletter', validateEmail, (req, res) => {
    try {
        const { email, name } = req.body;
        console.log('📬 Newsletter subscription:', email);
        
        const newsletter = readData(newsletterFile);
        
        // Check if email already exists
        if (newsletter.some(sub => sub.email === email)) {
            return res.status(409).json({ 
                success: false,
                error: 'Email already subscribed to our newsletter' 
            });
        }
        
        const newSubscriber = {
            id: Date.now(),
            email: email,
            name: name || '',
            subscribedAt: new Date().toISOString(),
            ip: req.ip
        };
        
        newsletter.push(newSubscriber);
        
        if (writeData(newsletterFile, newsletter)) {
            res.status(201).json({
                success: true,
                message: 'Successfully subscribed to our newsletter! Welcome to the Unforgettable Coffee family!'
            });
        } else {
            throw new Error('Failed to save subscriber');
        }
    } catch (error) {
        console.error('❌ Error subscribing to newsletter:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to subscribe to newsletter' 
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('🚨 Unhandled Error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'API endpoint not found'
    });
});

// Catch-all route for SPA (Single Page Application)
app.get('*', (req, res) => {
    const indexPaths = [
        path.join(__dirname, '../frontend/index.html'),
        path.join(__dirname, '../public/index.html'),
        path.join(__dirname, '../index.html'),
        path.join(__dirname, 'index.html')
    ];
    
    for (const filePath of indexPaths) {
        if (fs.existsSync(filePath)) {
            return res.sendFile(filePath);
        }
    }
    
    res.status(404).send(`
        <html>
            <head><title>Page Not Found</title></head>
            <body style="text-align: center; padding: 50px;">
                <h1 style="color: #8B4513;">404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
                <a href="/" style="color: #8B4513;">Return to Home</a>
            </body>
        </html>
    `);
});

// Graceful shutdown handling
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down Unforgettable Coffee Server gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

// Start server with enhanced logging
const server = app.listen(PORT, () => {
    console.log('\n🎊 ============================================');
    console.log('🚀 UNFORGETTABLE COFFEE SHOP SERVER');
    console.log('📍 PORT: ' + PORT);
    console.log('🌐 URL: http://localhost:' + PORT);
    console.log('🔗 API: http://localhost:' + PORT + '/api');
    console.log('📊 ADMIN: http://localhost:' + PORT + '/admin');
    console.log('📈 SALES UI: http://localhost:' + PORT + '/admin/sales-report');
    console.log('📦 ORDERS UI: http://localhost:' + PORT + '/admin/orders');
    console.log('🛒 Orders API: http://localhost:' + PORT + '/api/orders');
    console.log('📧 Contact: http://localhost:' + PORT + '/api/contact');
    console.log('📬 Newsletter: http://localhost:' + PORT + '/api/newsletter');
    console.log('🏥 Health: http://localhost:' + PORT + '/api/health');
    console.log('🧪 Test: http://localhost:' + PORT + '/test');
    console.log('✅ SERVER READY FOR DEPLOYMENT!');
    console.log('============================================\n');
    
    // Generate initial sales report
    generateSalesReport();
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error);
    server.close(() => {
        process.exit(1);
    });
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
    server.close(() => {
        process.exit(1);
    });
});

console.log('✅ Server setup completed - Ready to start...');