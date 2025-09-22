# ShipsGo API Integration

## Overview

This document describes the integration of ShipsGo real-time container tracking API into the Golden Horse Shipping system, replacing the previous mock vessel tracking system.

## Features

- **Real-time Container Tracking**: Track containers using container number, BL number, or booking number
- **Vessel Position Tracking**: Get real-time vessel positions using MMSI
- Optional mock fallback (development only): available for local testing; disabled in production
- **Rate Limiting**: Built-in rate limiting to respect ShipsGo's 100 requests/minute limit
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Multi-language Support**: Arabic and English support

## API Endpoints

### ShipsGo Tracking Endpoints

- `GET /api/shipsgo-tracking/container/:containerNumber` - Track by container number
- `GET /api/shipsgo-tracking/bl/:blNumber` - Track by Bill of Lading number
- `GET /api/shipsgo-tracking/booking/:bookingNumber` - Track by booking number
- `GET /api/shipsgo-tracking/vessel/:mmsi/position` - Get vessel position
- `GET /api/shipsgo-tracking/track` - Generic tracking with query parameters

### Enhanced Shipment Endpoints

- `GET /api/shipments/:id/tracking` - Get real-time tracking for shipment
- `GET /api/shipments/track/:trackingNumber` - Public tracking by tracking number

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# ShipsGo API Configuration
SHIPSGO_API_URL=https://api.shipsgo.com/v1
SHIPSGO_API_KEY=your-shipsgo-api-key-here
SHIPSGO_FALLBACK_TO_MOCK=false

# Rate Limiting
SHIPSGO_RATE_LIMIT=100
```

### Getting ShipsGo API Key

1. Visit [ShipsGo.com](https://shipsgo.com)
2. Sign up for an API account
3. Generate your API key from the dashboard
4. Add the key to your environment variables

## Data Structure

### ShipsGo Response Format

```typescript
interface ShipsGoTrackingResponse {
  success: boolean;
  data: {
    container_number: string;
    bl_number?: string;
    booking_number?: string;
    shipping_line: string;
    vessel_name?: string;
    voyage?: string;
    port_of_loading?: string;
    port_of_discharge?: string;
    estimated_departure?: string;
    estimated_arrival?: string;
    actual_departure?: string;
    actual_arrival?: string;
    status: string;
    milestones: ShipsGoMilestone[];
    location?: {
      latitude: number;
      longitude: number;
      timestamp: string;
    };
    co2_emissions?: number;
    transit_time?: number;
  };
}
```

## Error Handling

The system includes comprehensive error handling:

- **Authentication Errors**: When API key is invalid
- **Rate Limiting**: When exceeding 100 requests/minute
- **Not Found**: When container/BL/booking not found
- **API Errors**: General API connectivity issues

In production, mock fallbacks are disabled (`SHIPSGO_FALLBACK_TO_MOCK=false`); API errors are surfaced with appropriate HTTP status codes and messages.

## Frontend Integration

### New Components

- `ShipsGoTrackingCard`: Enhanced tracking display component
- Updated tracking page with container number support

### API Usage

```typescript
import { shipsGoAPI } from '@/lib/api';

// Track by container number
const trackingData = await shipsGoAPI.trackByContainer('ABCD1234567');

// Track by BL number
const trackingData = await shipsGoAPI.trackByBL('BL123456');

// Generic tracking
const trackingData = await shipsGoAPI.trackShipment({
  container: 'ABCD1234567'
});
```

## Testing

### Manual Testing

1. **Container Number**: Test with format `ABCD1234567` (4 letters + 7 digits)
2. **BL Number**: Test with various BL number formats
3. **Rate Limiting**: Make multiple requests to test rate limiting
4. **API errors**: Test with invalid API key and ensure a clear error is shown (no mock fallback in production)

### Test Cases

```bash
# Test container tracking
curl -X GET "http://localhost:3001/api/shipsgo-tracking/container/ABCD1234567"

# Test BL tracking
curl -X GET "http://localhost:3001/api/shipsgo-tracking/bl/BL123456"

# Test public tracking
curl -X GET "http://localhost:3001/api/shipments/track/GH123ABC"
```

## Migration from Mock System

### What Changed

1. **VesselTrackingService**: Still available for legacy support
2. **ShipmentsService**: Enhanced with real-time tracking methods
3. **Frontend**: New tracking components and improved UX
4. **API**: New endpoints for ShipsGo integration

### Backward Compatibility

- All existing endpoints continue to work
- No mock fallback in production; development-only mocks may be used locally
- No breaking changes to existing functionality

## Performance Considerations

- **Caching**: Consider implementing Redis caching for frequently requested data
- **Rate Limiting**: Built-in rate limiting prevents API quota exhaustion
- **Graceful degradation**: Surface clear errors and guidance; no mock fallback in production

## Security

- API keys are stored securely in environment variables
- Rate limiting prevents abuse
- Error messages don't expose sensitive information

## Monitoring

Monitor the following metrics:

- ShipsGo API response times
- Error rates and types
- Rate limiting hits
- Upstream API error rate and throttle events

## Support

For issues related to:

- **ShipsGo API**: Contact ShipsGo support
- **Integration Issues**: Check logs for detailed error messages
- **Rate Limiting**: Verify your API plan limits

## Future Enhancements

- **Webhook Support**: Real-time updates via webhooks
- **Bulk Tracking**: Track multiple containers simultaneously
- **Analytics**: Track usage patterns and performance metrics
- **Caching**: Implement intelligent caching strategies
