import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  ShipsGoApiException,
  ShipsGoRateLimitException,
  ShipsGoAuthException,
  ShipsGoNotFoundException
} from '../../common/exceptions/shipsgo.exception';
import {
  ShipsGoV2TrackingResponse,
  ShipsGoV2Milestone,
  ShipsGoV2RoutePoint,
  ShipsGoV2MapResponse,
  ShipsGoV2VesselInfo,
  ShipsGoV2TrackRequest
} from './dto/v2-types.dto';

export interface ShipsGoTrackingResponse {
  success: boolean;
  data: {
    container_number: string;
    bl_number?: string;
    booking_number?: string;
    shipping_line: string;
    vessel_name?: string;
    vessel_imo?: string;
    voyage?: string;
    port_of_loading?: string;
    port_of_discharge?: string;
    loading_country?: string;
    discharge_country?: string;
    estimated_departure?: string;
    estimated_arrival?: string;
    actual_departure?: string;
    actual_arrival?: string;
    loading_date?: string;
    discharge_date?: string;
    status: string;
    status_id?: number;
    eta?: string;
    first_eta?: string;
    milestones: ShipsGoMilestone[];
    location?: {
      latitude: number;
      longitude: number;
      timestamp: string;
    };
    container_type?: string;
    container_teu?: string;
    transit_time?: string;
    co2_emissions?: number;
    live_map_url?: string;
    bl_container_count?: number;
  };
  message?: string;
  timestamp?: string;
}

export interface ShipsGoMilestone {
  event: string;
  location: string;
  date: string;
  status: string;
  description?: string;
}

export interface VesselPosition {
  mmsi?: string;
  imo?: string;
  name?: string;
  latitude: number;
  longitude: number;
  course: number;
  speed: number;
  heading?: number;
  timestamp: Date;
  status?: string;
  destination?: string;
  eta?: Date;
}

export interface VesselInfo {
  id: string;
  mmsi: string;
  imo: string;
  name: string;
  callSign: string;
  vesselType: string;
  flag: string;
  length: number;
  width: number;
  draught: number;
  destination: string;
  eta: Date;
  status: 'underway' | 'at_anchor' | 'moored' | 'not_under_command' | 'restricted_maneuverability';
  position: VesselPosition;
  lastUpdate: Date;
  shipments: string[];
}

@Injectable()
export class ShipsGoTrackingService {
  private readonly logger = new Logger(ShipsGoTrackingService.name);
  private readonly shipsGoApiUrl: string;
  private readonly shipsGoApiKey: string;
  private readonly fallbackToMock: boolean;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    // Use real API credentials provided by user
    this.shipsGoApiUrl = this.configService.get<string>('SHIPSGO_API_URL', 'https://api.shipsgo.com/v1');
    this.shipsGoApiKey = this.configService.get<string>('SHIPSGO_API_KEY', '6eada10b-588f-4c36-9086-38009015b545');
    this.fallbackToMock = this.configService.get<boolean>('SHIPSGO_FALLBACK_TO_MOCK', false);

    // Debug logging
    this.logger.log(`ShipsGo Service Configuration:`);
    this.logger.log(`  - API URL: ${this.shipsGoApiUrl}`);
    this.logger.log(`  - API Key: ${this.shipsGoApiKey ? 'SET (' + this.shipsGoApiKey.substring(0, 8) + '...)' : 'NOT SET'}`);
    this.logger.log(`  - Fallback to Mock: ${this.fallbackToMock}`);
    this.logger.log(`  - Real API Key: ${this.shipsGoApiKey === '6eada10b-588f-4c36-9086-38009015b545' ? '✅ Using real credentials' : '❌ Using fallback'}`);
  }

  /**
   * Track container by container number using ShipsGo Container API v2 with map support
   */
  async trackByContainerNumber(containerNumber: string): Promise<ShipsGoTrackingResponse> {
    try {
      // Use real API credentials
      const apiKey = this.shipsGoApiKey;
      const apiUrl = this.shipsGoApiUrl;

      this.logger.log(`🔍 Debug - API Key: ${apiKey ? 'SET (' + apiKey.substring(0, 8) + '...)' : 'NOT SET'}`);
      this.logger.log(`🔍 Debug - API URL: ${apiUrl}`);
      this.logger.log(`🔍 Debug - Fallback to Mock: ${this.fallbackToMock}`);

      // Use v2 API for more accurate data
      this.logger.log(`🚀 Using ShipsGo API v2 for container ${containerNumber}`);
      return this.trackByContainerNumberV2(containerNumber);

    } catch (error) {
      this.logger.error(`Error tracking container ${containerNumber}:`, error.message);
      
      // Throw proper error instead of returning mock data
      if (error.response?.status === 404) {
        throw new ShipsGoNotFoundException(`Container ${containerNumber} not found`);
      } else if (error.response?.status === 401) {
        throw new ShipsGoAuthException();
      } else if (error.response?.status === 429) {
        throw new ShipsGoRateLimitException();
      } else {
        throw new ShipsGoApiException(`ShipsGo API error: ${error.message}`, error);
      }
    }
  }

  /**
   * Track container using ShipsGo v2 API with map support
   */
  async trackByContainerNumberV2(containerNumber: string): Promise<ShipsGoTrackingResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.shipsGoApiUrl}/track`, {
          params: {
            container_number: containerNumber,
            include_map: 'true',
            include_route: 'true',
            include_milestones: 'true',
          },
          headers: {
            'X-Shipsgo-User-Token': this.shipsGoApiKey,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        })
      );

      this.logger.log(`✅ Successfully retrieved v2 tracking data for container ${containerNumber}`);
      return this.transformShipsGoV2Response(response.data);

    } catch (error) {
      this.logger.error(`❌ Failed to track container ${containerNumber} with v2 API:`, error.message);
      
      // Throw proper error instead of returning mock data
      if (error.response?.status === 404) {
        throw new ShipsGoNotFoundException(`Container ${containerNumber} not found in ShipsGo database`);
      } else if (error.response?.status === 401) {
        throw new ShipsGoAuthException();
      } else if (error.response?.status === 429) {
        throw new ShipsGoRateLimitException();
      } else {
        throw new ShipsGoApiException(`ShipsGo V2 API error: ${error.message}`, error);
      }
    }
  }

  /**
   * Create tracking request using ShipsGo POST API
   */
  private async createTrackingRequest(containerNumber: string): Promise<string> {
    try {
      const postData = new URLSearchParams({
        authCode: this.shipsGoApiKey,
        containerNumber: containerNumber,
        shippingLine: 'OTHERS', // Use OTHERS if shipping line is unknown
      });

      const response = await firstValueFrom(
        this.httpService.post(
          `${this.shipsGoApiUrl}/ContainerService/PostContainerInfo`,
          postData.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
            },
            timeout: 15000,
          }
        )
      );

      this.logger.log(`Successfully created tracking request for container ${containerNumber}`);

      // The response should contain a request ID
      if (response.data && (response.data.requestId || response.data.RequestId)) {
        return response.data.requestId || response.data.RequestId;
      } else {
        // If no request ID, use container number as fallback
        return containerNumber;
      }

    } catch (error) {
      this.logger.error(`Failed to create tracking request for ${containerNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Create tracking request using ShipsGo POST API - Direct version
   */
  private async createTrackingRequestDirect(containerNumber: string, apiKey: string, apiUrl: string): Promise<string> {
    try {
      const postData = new URLSearchParams({
        authCode: apiKey,
        containerNumber: containerNumber,
        shippingLine: 'OTHERS',
      });

      const response = await firstValueFrom(
        this.httpService.post(
          `${apiUrl}/ContainerService/PostContainerInfo`,
          postData.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'Accept': 'application/json',
            },
            timeout: 15000,
          }
        )
      );

      this.logger.log(`✅ Successfully created tracking request for container ${containerNumber}`);

      // The response should contain a request ID
      if (response.data && (response.data.requestId || response.data.RequestId)) {
        return response.data.requestId || response.data.RequestId;
      } else {
        // If no request ID, use container number as fallback
        return containerNumber;
      }

    } catch (error) {
      this.logger.error(`❌ Failed to create tracking request for ${containerNumber}:`, error.message);
      throw error;
    }
  }

  /**
   * Get tracking data using ShipsGo GET API
   */
  private async getTrackingData(requestId: string): Promise<ShipsGoTrackingResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${this.shipsGoApiUrl}/ContainerService/GetContainerInfo/`,
          {
            params: {
              authCode: this.shipsGoApiKey,
              requestId: requestId,
              mapPoint: 'true', // Get vessel coordinates
              co2: 'true', // Get CO2 emissions
              containerType: 'true', // Get container type
            },
            headers: {
              'Accept': 'application/json',
            },
            timeout: 15000,
          }
        )
      );

      this.logger.log(`Successfully retrieved tracking data for request ${requestId}`);
      return this.transformShipsGoResponse(response.data);

    } catch (error) {
      this.logger.error(`Failed to get tracking data for request ${requestId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get tracking data using ShipsGo GET API - Direct version
   */
  private async getTrackingDataDirect(requestId: string, apiKey: string, apiUrl: string): Promise<ShipsGoTrackingResponse> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `${apiUrl}/ContainerService/GetContainerInfo/`,
          {
            params: {
              authCode: apiKey,
              requestId: requestId,
              mapPoint: 'true',
              co2: 'true',
              containerType: 'true',
            },
            headers: {
              'Accept': 'application/json',
            },
            timeout: 15000,
          }
        )
      );

      this.logger.log(`✅ Successfully retrieved tracking data for request ${requestId}`);
      return this.transformShipsGoResponse(response.data);

    } catch (error) {
      this.logger.error(`❌ Failed to get tracking data for request ${requestId}:`, error.message);
      throw error;
    }
  }

  /**
   * Track container by Bill of Lading number
   */
  async trackByBLNumber(blNumber: string): Promise<ShipsGoTrackingResponse> {
    try {
      if (!this.shipsGoApiKey) {
        throw new ShipsGoAuthException();
      }

      const response = await firstValueFrom(
        this.httpService.get(`${this.shipsGoApiUrl}/track`, {
          params: {
            bl_number: blNumber,
          },
          headers: {
          'X-Shipsgo-User-Token': this.shipsGoApiKey,
          'Content-Type': 'application/json',
        },
        }),
      );

      return this.transformShipsGoResponse(response.data);
    } catch (error) {
      this.logger.error(`Failed to track BL ${blNumber} from ShipsGo API`, error);
      if (error.response?.status === 401) {
        throw new ShipsGoAuthException();
      }
      if (error.response?.status === 429) {
        throw new ShipsGoRateLimitException();
      }
      if (error.response?.status === 404) {
        throw new ShipsGoNotFoundException(`Bill of Lading ${blNumber} not found`);
      }
      throw new ShipsGoApiException(`ShipsGo API error: ${error.message}`, error);
    }
  }

  /**
   * Track container by Booking number
   */
  async trackByBookingNumber(bookingNumber: string): Promise<ShipsGoTrackingResponse> {
    try {
      if (!this.shipsGoApiKey) {
        throw new ShipsGoAuthException();
      }

      const response = await firstValueFrom(
        this.httpService.get(`${this.shipsGoApiUrl}/track`, {
          params: {
            booking_number: bookingNumber,
          },
          headers: {
          'X-Shipsgo-User-Token': this.shipsGoApiKey,
          'Accept': 'application/json',
        },
        }),
      );

      return this.transformShipsGoResponse(response.data);
    } catch (error) {
      this.logger.error(`Failed to track booking ${bookingNumber} from ShipsGo API`, error);
      if (error.response?.status === 401) {
        throw new ShipsGoAuthException();
      }
      if (error.response?.status === 429) {
        throw new ShipsGoRateLimitException();
      }
      if (error.response?.status === 404) {
        throw new ShipsGoNotFoundException(`Booking number ${bookingNumber} not found`);
      }
      throw new ShipsGoApiException(`ShipsGo API error: ${error.message}`, error);
    }
  }

  /**
   * Get vessel position by MMSI
   */
  async getVesselPosition(mmsi: string): Promise<VesselPosition | null> {
    try {
      const trackingData = await this.trackByContainerNumber(mmsi);
      
      if (trackingData.success && trackingData.data.location) {
        return {
          mmsi,
          name: trackingData.data.vessel_name || 'Unknown Vessel',
          latitude: trackingData.data.location.latitude,
          longitude: trackingData.data.location.longitude,
          course: 0, // ShipsGo doesn't provide course data
          speed: 0, // ShipsGo doesn't provide speed data
          timestamp: new Date(trackingData.data.location.timestamp),
          status: trackingData.data.status,
          destination: trackingData.data.port_of_discharge,
          eta: trackingData.data.estimated_arrival ? new Date(trackingData.data.estimated_arrival) : undefined,
        };
      }
      
      return null;
    } catch (error) {
      this.logger.error(`Failed to get vessel position for MMSI ${mmsi}`, error);
      return null;
    }
  }

  /**
   * Transform ShipsGo v2 API response to our internal format
   */
  private transformShipsGoV2Response(data: ShipsGoV2TrackingResponse): ShipsGoTrackingResponse {
    return {
      success: data.success,
      message: data.message || 'Tracking data retrieved successfully',
      data: {
        container_number: data.data.containerNumber,
        bl_number: data.data.blNumber,
        booking_number: data.data.bookingNumber,
        shipping_line: data.data.shippingLine,
        vessel_name: data.data.vesselName,
        vessel_imo: data.data.vesselImo,
        voyage: data.data.voyage,
        port_of_loading: data.data.portOfLoading,
        port_of_discharge: data.data.portOfDischarge,
        estimated_departure: data.data.estimatedDeparture,
        estimated_arrival: data.data.estimatedArrival,
        actual_departure: data.data.actualDeparture,
        actual_arrival: data.data.actualArrival,
        status: data.data.status,
        status_id: data.data.statusId,
        milestones: data.data.milestones.map(m => ({
          event: m.event,
          location: m.location,
          date: m.date,
          status: m.status,
          description: m.description,
        })),
        location: {
          latitude: data.data.currentPosition.latitude,
          longitude: data.data.currentPosition.longitude,
          timestamp: data.data.currentPosition.timestamp,
        },
        container_type: data.data.containerType,
        container_teu: data.data.teu?.toString(),
        transit_time: data.data.transitTime,
        co2_emissions: data.data.co2Emissions,
        live_map_url: data.data.mapUrl,
        bl_container_count: 1,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Transform ShipsGo API response to our internal format
   */
  private transformShipsGoResponse(data: any): ShipsGoTrackingResponse {
    try {
      // Handle different response formats
      if (Array.isArray(data) && data.length > 0) {
        data = data[0]; // Take first item if array
      }

      // Parse vessel coordinates if available
      let latitude = null;
      let longitude = null;

      if (data.VesselLatitude && data.VesselLatitude !== 'Not Supported') {
        latitude = parseFloat(data.VesselLatitude);
      }
      if (data.VesselLongitude && data.VesselLongitude !== 'Not Supported') {
        longitude = parseFloat(data.VesselLongitude);
      }

      // Transform transit ports
      const transitPorts = (data.TSPorts || []).map((port: any) => ({
        port: port.Port || '',
        arrivalDate: port.ArrivalDate?.Date || null,
        departureDate: port.DepartureDate?.Date || null,
        isActual: port.ArrivalDate?.IsActual || false,
        vessel: port.Vessel || '',
        vesselIMO: port.VesselIMO || '',
      }));

      return {
        success: true,
        message: data.Message || 'Tracking data retrieved successfully',
        data: {
          container_number: data.ContainerNumber || data.BLReferenceNo || '',
          bl_number: data.BLReferenceNo || '',
          booking_number: data.ReferenceNo || '',
          shipping_line: data.ShippingLine || '',
          vessel_name: data.Vessel || '',
          vessel_imo: data.VesselIMO || '',
          voyage: data.Voyage || '',
          port_of_loading: data.Pol || '',
          port_of_discharge: data.Pod || '',
          loading_country: data.FromCountry || '',
          discharge_country: data.ToCountry || '',
          estimated_departure: data.DepartureDate?.Date || null,
          estimated_arrival: data.ArrivalDate?.Date || null,
          actual_departure: data.DepartureDate?.IsActual ? data.DepartureDate?.Date : null,
          actual_arrival: data.ArrivalDate?.IsActual ? data.ArrivalDate?.Date : null,
          loading_date: data.LoadingDate?.Date || null,
          discharge_date: data.DischargeDate?.Date || null,
          status: data.Status || 'Unknown',
          status_id: data.StatusId || null,
          eta: data.ETA || null,
          first_eta: data.FirstETA || null,
          milestones: transitPorts,
          location: {
            latitude: latitude,
            longitude: longitude,
            timestamp: new Date().toISOString(),
          },
          container_type: data.ContainerType || '',
          container_teu: data.ContainerTEU || '',
          transit_time: data.FormatedTransitTime || '',
          co2_emissions: data.Co2Emission || null,
          live_map_url: data.LiveMapUrl || '',
          bl_container_count: data.BLContainerCount || 1,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error transforming ShipsGo response:', error);
      throw new ShipsGoApiException('Failed to transform API response', error);
    }
  }

  getHealth() {
    const hasApiKey = Boolean(this.shipsGoApiKey);
    return {
      configured: hasApiKey,
      rateLimit: this.configService.get<number>('SHIPSGO_RATE_LIMIT', 100),
      mockMode: !hasApiKey,
      apiUrl: this.shipsGoApiUrl,
      fallbackEnabled: this.fallbackToMock,
      status: hasApiKey ? 'Real API with fallback' : 'Mock mode only'
    };
  }

  /**
   * Get map data for a container using ShipsGo v2 API
   */
  async getContainerMap(containerNumber: string): Promise<ShipsGoV2MapResponse | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.shipsGoApiUrl}/track`, {
          params: {
            container_number: containerNumber,
            include_map: 'true',
          },
          headers: {
            'X-Shipsgo-User-Token': this.shipsGoApiKey,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        })
      );

      if (response.data?.data?.mapUrl) {
        return {
          mapUrl: response.data.data.mapUrl,
          embedUrl: response.data.data.mapUrl.replace('/map/', '/embed/'),
          staticImageUrl: response.data.data.mapUrl.replace('/map/', '/static/'),
          interactive: true,
          bounds: {
            north: response.data.data.currentPosition?.latitude + 5 || 90,
            south: response.data.data.currentPosition?.latitude - 5 || -90,
            east: response.data.data.currentPosition?.longitude + 5 || 180,
            west: response.data.data.currentPosition?.longitude - 5 || -180,
          },
        };
      }

      return null;
    } catch (error) {
      this.logger.error(`Failed to get map data for container ${containerNumber}:`, error.message);
      return null;
    }
  }

  /**
   * Get vessel information using ShipsGo v2 API
   */
  async getVesselInfo(mmsi: string): Promise<ShipsGoV2VesselInfo | null> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.shipsGoApiUrl}/vessel/${mmsi}`, {
          headers: {
            'X-Shipsgo-User-Token': this.shipsGoApiKey,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        })
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get vessel info for MMSI ${mmsi}:`, error.message);
      return null;
    }
  }

  /**
   * Get mock tracking data for testing when API key is not configured
   */
  private getMockTrackingData(identifier: string, type: 'container' | 'bl' | 'booking' = 'container'): ShipsGoTrackingResponse {
    const mockData = {
      success: true,
      data: {
        container_number: type === 'container' ? identifier.toUpperCase() : 'MOCK1234567',
        bl_number: type === 'bl' ? identifier.toUpperCase() : 'BL123456789',
        booking_number: type === 'booking' ? identifier.toUpperCase() : 'BK123456789',
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
        transit_time: '17 days'
      },
      message: 'Mock data - API key not configured'
    };

    this.logger.log(`Returning mock tracking data for ${type}: ${identifier}`);
    return mockData;
  }

}
