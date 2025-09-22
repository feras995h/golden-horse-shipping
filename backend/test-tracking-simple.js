const http = require('http');
const url = require('url');

// Simple HTTP server without dependencies

// Mock ShipsGo tracking data
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
      longitude: -120.7401,
      timestamp: '2024-01-25T10:00:00Z'
    },
    co2_emissions: 1250,
    transit_time: 17
  }
};

// Simple HTTP server
const server = http.createServer((req, res) => {
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

  console.log(`${req.method} ${path}`);

  // Health check endpoint
  if (path === '/api/shipsgo-tracking/health') {
    console.log('Health check requested');
    res.writeHead(200);
    res.end(JSON.stringify({
      configured: true,
      rateLimit: 100,
      message: 'ShipsGo tracking service is running (mock mode)'
    }));
    return;
  }

  // Generic track endpoint
  if (path === '/api/shipsgo-tracking/track') {
    const { container, bl, booking } = query;
    console.log(`Tracking request - container: ${container}, bl: ${bl}, booking: ${booking}`);

    if (!container && !bl && !booking) {
      res.writeHead(400);
      res.end(JSON.stringify({
        success: false,
        message: 'No tracking identifier provided. Provide container, bl, or booking.'
      }));
      return;
    }

    let response = { ...mockTrackingData };

    if (container) {
      response.data.container_number = container.toUpperCase();
    }
    if (bl) {
      response.data.bl_number = bl.toUpperCase();
    }
    if (booking) {
      response.data.booking_number = booking.toUpperCase();
    }

    res.writeHead(200);
    res.end(JSON.stringify(response));
    return;
  }

  // Track by container
  if (path.startsWith('/api/shipsgo-tracking/container/')) {
    const containerNumber = path.split('/').pop();
    console.log(`Tracking container: ${containerNumber}`);

    const response = {
      ...mockTrackingData,
      data: {
        ...mockTrackingData.data,
        container_number: containerNumber.toUpperCase()
      }
    };

    res.writeHead(200);
    res.end(JSON.stringify(response));
    return;
  }

  // 404 for other paths
  res.writeHead(404);
  res.end(JSON.stringify({
    success: false,
    message: 'Endpoint not found'
  }));
});

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`🚀 Mock ShipsGo Tracking API is running on: http://localhost:${port}`);
  console.log(`📚 Health check: http://localhost:${port}/api/shipsgo-tracking/health`);
  console.log(`🔍 Test tracking: http://localhost:${port}/api/shipsgo-tracking/track?container=ABCD1234567`);
});
