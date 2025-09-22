import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

import { ShipsGoTrackingService } from './shipsgo-tracking.service';
import { 
  ShipsGoApiException, 
  ShipsGoRateLimitException, 
  ShipsGoAuthException, 
  ShipsGoNotFoundException 
} from '../../common/exceptions/shipsgo.exception';

describe('ShipsGoTrackingService', () => {
  let service: ShipsGoTrackingService;
  let httpService: HttpService;
  let configService: ConfigService;

  const mockHttpService = {
    get: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShipsGoTrackingService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ShipsGoTrackingService>(ShipsGoTrackingService);
    httpService = module.get<HttpService>(HttpService);
    configService = module.get<ConfigService>(ConfigService);

    // Setup default config values
    mockConfigService.get.mockImplementation((key: string, defaultValue?: any) => {
      const config = {
        SHIPSGO_API_URL: 'https://api.shipsgo.com/v1',
        SHIPSGO_API_KEY: 'test-api-key',
        SHIPSGO_FALLBACK_TO_MOCK: true,
      };
      return config[key] || defaultValue;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('trackByContainerNumber', () => {
    const containerNumber = 'ABCD1234567';

    it('should return tracking data on successful API call', async () => {
      const mockResponse: AxiosResponse = {
        data: {
          success: true,
          data: {
            container_number: containerNumber,
            shipping_line: 'TEST LINE',
            vessel_name: 'TEST VESSEL',
            status: 'In Transit',
            milestones: [],
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.trackByContainerNumber(containerNumber);

      expect(result.success).toBe(true);
      expect(result.data.container_number).toBe(containerNumber);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        `/container/${containerNumber}`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
          }),
        })
      );
    });

    it('should return mock data when API key is not configured', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'SHIPSGO_API_KEY') return null;
        if (key === 'SHIPSGO_FALLBACK_TO_MOCK') return true;
        return 'https://api.shipsgo.com/v1';
      });

      const result = await service.trackByContainerNumber(containerNumber);

      expect(result.success).toBe(true);
      expect(result.data.container_number).toBe(containerNumber);
      expect(mockHttpService.get).not.toHaveBeenCalled();
    });

    it('should throw ShipsGoAuthException on 401 error without fallback', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'SHIPSGO_FALLBACK_TO_MOCK') return false;
        return mockConfigService.get(key);
      });

      const error = { response: { status: 401 } };
      mockHttpService.get.mockReturnValue(throwError(error));

      await expect(service.trackByContainerNumber(containerNumber))
        .rejects.toThrow(ShipsGoAuthException);
    });

    it('should return mock data on 401 error with fallback enabled', async () => {
      const error = { response: { status: 401 } };
      mockHttpService.get.mockReturnValue(throwError(error));

      const result = await service.trackByContainerNumber(containerNumber);

      expect(result.success).toBe(true);
      expect(result.data.container_number).toBe(containerNumber);
    });

    it('should throw ShipsGoRateLimitException on 429 error without fallback', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'SHIPSGO_FALLBACK_TO_MOCK') return false;
        return mockConfigService.get(key);
      });

      const error = { response: { status: 429 } };
      mockHttpService.get.mockReturnValue(throwError(error));

      await expect(service.trackByContainerNumber(containerNumber))
        .rejects.toThrow(ShipsGoRateLimitException);
    });

    it('should throw ShipsGoNotFoundException on 404 error without fallback', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'SHIPSGO_FALLBACK_TO_MOCK') return false;
        return mockConfigService.get(key);
      });

      const error = { response: { status: 404 } };
      mockHttpService.get.mockReturnValue(throwError(error));

      await expect(service.trackByContainerNumber(containerNumber))
        .rejects.toThrow(ShipsGoNotFoundException);
    });

    it('should throw ShipsGoApiException on other errors without fallback', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'SHIPSGO_FALLBACK_TO_MOCK') return false;
        return mockConfigService.get(key);
      });

      const error = { response: { status: 500 }, message: 'Internal Server Error' };
      mockHttpService.get.mockReturnValue(throwError(error));

      await expect(service.trackByContainerNumber(containerNumber))
        .rejects.toThrow(ShipsGoApiException);
    });
  });

  describe('trackByBLNumber', () => {
    const blNumber = 'BL123456';

    it('should return tracking data on successful API call', async () => {
      const mockResponse: AxiosResponse = {
        data: {
          success: true,
          data: {
            bl_number: blNumber,
            shipping_line: 'TEST LINE',
            status: 'Delivered',
            milestones: [],
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.trackByBLNumber(blNumber);

      expect(result.success).toBe(true);
      expect(result.data.bl_number).toBe(blNumber);
    });
  });

  describe('trackByBookingNumber', () => {
    const bookingNumber = 'BOOK123456';

    it('should return tracking data on successful API call', async () => {
      const mockResponse: AxiosResponse = {
        data: {
          success: true,
          data: {
            booking_number: bookingNumber,
            shipping_line: 'TEST LINE',
            status: 'Booked',
            milestones: [],
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.trackByBookingNumber(bookingNumber);

      expect(result.success).toBe(true);
      expect(result.data.booking_number).toBe(bookingNumber);
    });
  });

  describe('getVesselPosition', () => {
    const mmsi = '123456789';

    it('should return vessel position on successful API call', async () => {
      const mockResponse: AxiosResponse = {
        data: {
          success: true,
          data: {
            container_number: mmsi,
            shipping_line: 'TEST LINE',
            vessel_name: 'TEST VESSEL',
            status: 'In Transit',
            milestones: [],
            location: {
              latitude: 25.276987,
              longitude: 55.296249,
              timestamp: '2024-01-01T12:00:00Z',
            },
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as any,
      };

      mockHttpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getVesselPosition(mmsi);

      expect(result).toBeTruthy();
      expect(result?.latitude).toBe(25.276987);
      expect(result?.longitude).toBe(55.296249);
    });
  });
});
