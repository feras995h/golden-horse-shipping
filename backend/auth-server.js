const http = require('http');
const url = require('url');

console.log('🔐 Starting Golden Horse Authentication Server...');

// Mock tracking data
const mockTrackingData = {
  success: true,
  data: {
    container_number: 'ABCD1234567',
    bl_number: 'BL123456789',
    booking_number: 'BK123456789',
    shipping_line: 'MSC',
    vessel_name: 'MSC OSCAR',
    voyage: 'MSC001E',
    port_of_loading: 'Shanghai, China',
    port_of_discharge: 'Los Angeles, USA',
    estimated_departure: '2024-01-15T10:00:00Z',
    estimated_arrival: '2024-02-01T14:00:00Z',
    actual_departure: '2024-01-15T12:30:00Z',
    actual_arrival: null,
    status: 'In Transit',
    milestones: [
      {
        event: 'Container loaded',
        location: 'Shanghai, China',
        date: '2024-01-15T12:30:00Z',
        status: 'completed',
        description: 'Container loaded onto vessel'
      },
      {
        event: 'Vessel departed',
        location: 'Shanghai, China',
        date: '2024-01-15T14:00:00Z',
        status: 'completed',
        description: 'Vessel departed from port'
      },
      {
        event: 'In transit',
        location: 'Pacific Ocean',
        date: '2024-01-20T08:00:00Z',
        status: 'in progress',
        description: 'Container in transit'
      },
      {
        event: 'Arrival at destination',
        location: 'Los Angeles, USA',
        date: '2024-02-01T14:00:00Z',
        status: 'pending',
        description: 'Expected arrival at destination port'
      }
    ],
    location: {
      latitude: 35.1796,
      longitude: -120.7401
    },
    co2_emissions: 1250,
    transit_time: 17
  },
  message: 'Mock data - Development server'
};

// Mock settings
const mockSettings = {
  siteName: 'Golden Horse Shipping',
  supportEmail: 'support@goldenhorseshipping.com',
  supportPhone: '+218-21-123-4567',
  trackingEnabled: true,
  notificationsEnabled: true,
  languages: ['ar', 'en'],
  defaultLanguage: 'ar',
  features: {
    realTimeTracking: true,
    notifications: true,
    multiLanguage: true,
    mobileApp: false
  }
};

// Helper function to parse request body
function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const data = body ? JSON.parse(body) : {};
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON'));
      }
    });
    
    req.on('error', reject);
  });
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const query = parsedUrl.query;

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${path}`);

  try {
    // Settings endpoints
    if (path === '/api/settings/public') {
      res.writeHead(200);
      res.end(JSON.stringify(mockSettings));
      return;
    }

    // Auth login endpoint
    if (path === '/api/auth/login' && req.method === 'POST') {
      try {
        const requestBody = await parseRequestBody(req);
        console.log('Raw request body:', requestBody);

        // Support both email and username fields
        const { email, username, password } = requestBody;
        const loginIdentifier = email || username;

        console.log(`Login attempt: ${loginIdentifier || 'undefined'}`);
        console.log(`Password provided: ${password ? 'yes' : 'no'}`);

        // Check credentials - accept both email and username
        if ((loginIdentifier === 'admin@goldenhorse.ly' || loginIdentifier === 'admin') && password === 'admin123') {
          const response = {
            success: true,
            message: 'Login successful',
            user: {
              id: 1,
              email: 'admin@goldenhorse.ly',
              name: 'System Administrator',
              role: 'admin'
            },
            token: 'dev-token-' + Date.now(),
            expiresIn: '7d'
          };
          
          console.log('✅ Login successful');
          res.writeHead(200);
          res.end(JSON.stringify(response));
        } else {
          console.log('❌ Invalid credentials');
          console.log(`Expected: admin@goldenhorse.ly or admin / admin123`);
          console.log(`Received: ${loginIdentifier || 'undefined'} / ${password ? '[provided]' : '[missing]'}`);
          res.writeHead(401);
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid credentials',
            error: 'Username/Email or password is incorrect',
            debug: {
              loginIdentifierReceived: !!loginIdentifier,
              passwordReceived: !!password,
              expectedCredentials: 'admin@goldenhorse.ly or admin / admin123'
            }
          }));
        }
      } catch (error) {
        console.log('❌ Login error:', error.message);
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          message: 'Invalid request',
          error: error.message
        }));
      }
      return;
    }

    // Auth profile endpoint
    if (path === '/api/auth/profile' && req.method === 'GET') {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer dev-token-')) {
        res.writeHead(200);
        res.end(JSON.stringify({
          success: true,
          user: {
            id: 1,
            email: 'admin@goldenhorse.ly',
            name: 'System Administrator',
            role: 'admin'
          }
        }));
      } else {
        res.writeHead(401);
        res.end(JSON.stringify({
          success: false,
          message: 'Unauthorized',
          error: 'Invalid or missing token'
        }));
      }
      return;
    }

    // Health check endpoint
    if (path === '/api/shipsgo-tracking/health') {
      res.writeHead(200);
      res.end(JSON.stringify({
        configured: true,
        rateLimit: 100,
        mockMode: true,
        apiUrl: 'https://api.shipsgo.com/v1',
        fallbackEnabled: true,
        status: 'Development server with authentication',
        message: 'ShipsGo tracking service is running (development mode)'
      }));
      return;
    }

    // Tracking endpoints
    if (path === '/api/shipsgo-tracking/track') {
      const { container, bl, booking } = query;
      
      if (!container && !bl && !booking) {
        res.writeHead(400);
        res.end(JSON.stringify({
          success: false,
          error: 'No tracking identifier provided. Provide container, bl, or booking.'
        }));
        return;
      }

      // Customize response based on tracking type
      const responseData = { ...mockTrackingData };
      
      if (container) {
        responseData.data.container_number = container.toUpperCase();
      } else if (bl) {
        responseData.data.bl_number = bl.toUpperCase();
        responseData.data.container_number = 'MSCU' + Math.random().toString().substr(2, 7);
      } else if (booking) {
        responseData.data.booking_number = booking.toUpperCase();
        responseData.data.container_number = 'MSCU' + Math.random().toString().substr(2, 7);
      }

      res.writeHead(200);
      res.end(JSON.stringify(responseData));
      return;
    }

    // Default 404 response
    res.writeHead(404);
    res.end(JSON.stringify({
      success: false,
      error: 'Endpoint not found',
      message: 'Available endpoints: /api/settings/public, /api/auth/login, /api/auth/profile, /api/shipsgo-tracking/health, /api/shipsgo-tracking/track'
    }));

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({
      success: false,
      error: 'Internal server error',
      message: error.message
    }));
  }
});

// Error handling
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error('❌ Port 3001 is already in use. Please stop other servers or use a different port.');
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed gracefully');
    process.exit(0);
  });
});

// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log('✅ Authentication server started successfully!');
  console.log(`🌐 Server running at: http://localhost:${PORT}`);
  console.log('📋 Available endpoints:');
  console.log('   - GET  /api/settings/public');
  console.log('   - POST /api/auth/login');
  console.log('   - GET  /api/auth/profile');
  console.log('   - GET  /api/shipsgo-tracking/health');
  console.log('   - GET  /api/shipsgo-tracking/track');
  console.log('\n🔐 Login Credentials:');
  console.log('   Email: admin@goldenhorse.ly');
  console.log('   Password: admin123');
  console.log('\n🔧 Press Ctrl+C to stop the server');
  console.log('='.repeat(50));
});
