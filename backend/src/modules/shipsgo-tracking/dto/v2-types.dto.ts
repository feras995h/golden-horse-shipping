import { ApiProperty } from '@nestjs/swagger';

export class ShipsGoV2TrackingResponse {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: {
    containerNumber: string;
    blNumber?: string;
    bookingNumber?: string;
    shippingLine: string;
    vesselName?: string;
    vesselImo?: string;
    voyage?: string;
    portOfLoading?: string;
    portOfDischarge?: string;
    estimatedDeparture?: string;
    estimatedArrival?: string;
    actualDeparture?: string;
    actualArrival?: string;
    status: string;
    statusId?: number;
    milestones: ShipsGoV2Milestone[];
    currentPosition: {
      latitude: number;
      longitude: number;
      timestamp: string;
      speed?: number;
      course?: number;
      heading?: number;
    };
    route: ShipsGoV2RoutePoint[];
    mapUrl?: string;
    co2Emissions?: number;
    transitTime?: string;
    containerType?: string;
    teu?: number;
  };

  @ApiProperty()
  message?: string;
}

export class ShipsGoV2Milestone {
  @ApiProperty()
  event: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  date: string;

  @ApiProperty()
  status: 'completed' | 'in_progress' | 'pending';

  @ApiProperty()
  description?: string;

  @ApiProperty()
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export class ShipsGoV2RoutePoint {
  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;

  @ApiProperty()
  timestamp: string;

  @ApiProperty()
  type: 'departure' | 'arrival' | 'current' | 'waypoint';

  @ApiProperty()
  location: string;

  @ApiProperty()
  event?: string;
}

export class ShipsGoV2MapResponse {
  @ApiProperty()
  mapUrl: string;

  @ApiProperty()
  embedUrl: string;

  @ApiProperty()
  staticImageUrl: string;

  @ApiProperty()
  interactive: boolean;

  @ApiProperty()
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export class ShipsGoV2TrackRequest {
  @ApiProperty()
  containerNumber?: string;

  @ApiProperty()
  blNumber?: string;

  @ApiProperty()
  bookingNumber?: string;

  @ApiProperty()
  includeMap?: boolean;

  @ApiProperty()
  includeRoute?: boolean;

  @ApiProperty()
  includeMilestones?: boolean;
}

export class ShipsGoV2VesselInfo {
  @ApiProperty()
  mmsi: string;

  @ApiProperty()
  imo: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  callSign: string;

  @ApiProperty()
  vesselType: string;

  @ApiProperty()
  flag: string;

  @ApiProperty()
  length: number;

  @ApiProperty()
  width: number;

  @ApiProperty()
  draught: number;

  @ApiProperty()
  currentPosition: {
    latitude: number;
    longitude: number;
    timestamp: string;
    speed: number;
    course: number;
    heading: number;
  };

  @ApiProperty()
  destination: string;

  @ApiProperty()
  eta: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  lastUpdate: string;
}