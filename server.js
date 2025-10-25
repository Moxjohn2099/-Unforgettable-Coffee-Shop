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
                
                <div class="btn-grid">
                    <a href="/api/health" class="btn">Health Check API</a>
                    <a href="/api/products" class="btn">Products API</a>
                    <a href="/api/orders" class="btn">Orders API</a>
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
                
                <p>Available endpoints:</p>
                <div style="margin: 20px 0;">
                    <a href="/test" class="btn">Test Page</a>
                    <a href="/api/health" class="btn">Health Check</a>
                    <a href="/api/products" class="btn">Products API</a>
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
            console.log(`✅ Order ${orderId} saved successfully`);
            
            // In a real application, you would send email confirmation here
            // await sendOrderConfirmationEmail(newOrder);
            
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
            // In a real application, you would send email notification here
            // await sendContactNotification(newContact);
            
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
            // In a real application, you would send welcome email here
            // await sendWelcomeEmail(email, name);
            
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
    console.log('🛒 Orders: http://localhost:' + PORT + '/api/orders');
    console.log('📧 Contact: http://localhost:' + PORT + '/api/contact');
    console.log('📬 Newsletter: http://localhost:' + PORT + '/api/newsletter');
    console.log('🏥 Health: http://localhost:' + PORT + '/api/health');
    console.log('🧪 Test: http://localhost:' + PORT + '/test');
    console.log('✅ SERVER READY FOR DEPLOYMENT!');
    console.log('============================================\n');
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