import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Shipment } from '../../entities/shipment.entity';
import { CustomerAccount } from '../../entities/customer-account.entity';

@Injectable()
export class ShipmentManagementService {
  constructor(
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(CustomerAccount)
    private customerAccountRepository: Repository<CustomerAccount>,
  ) {}

  async getAllShipments(
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: string,
    customerId?: string,
  ) {
    const queryBuilder = this.shipmentRepository.createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.customerAccount', 'customer');

    // Apply search filter
    if (search) {
      queryBuilder.where(
        '(shipment.trackingNumber LIKE :search OR shipment.description LIKE :search OR shipment.containerNumber LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Apply status filter
    if (status) {
      if (search) {
        queryBuilder.andWhere('shipment.status = :status', { status });
      } else {
        queryBuilder.where('shipment.status = :status', { status });
      }
    }

    // Apply customer filter
    if (customerId) {
      const condition = 'shipment.customerAccountId = :customerId';
      if (search || status) {
        queryBuilder.andWhere(condition, { customerId });
      } else {
        queryBuilder.where(condition, { customerId });
      }
    }

    // Add pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Order by creation date
    queryBuilder.orderBy('shipment.createdAt', 'DESC');

    const [shipments, total] = await queryBuilder.getManyAndCount();

    return {
      shipments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getShipmentById(shipmentId: string) {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
      relations: ['customerAccount', 'paymentRecords'],
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    return shipment;
  }

  async updateShipmentStatus(
    shipmentId: string,
    updateStatusDto: {
      status: string;
      notes?: string;
      actualArrival?: string;
      actualDeparture?: string;
    },
    adminId: string,
  ) {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    // Update status
    shipment.status = updateStatusDto.status as any;

    // Update actual dates if provided
    if (updateStatusDto.actualArrival) {
      shipment.actualArrival = new Date(updateStatusDto.actualArrival);
    }
    if (updateStatusDto.actualDeparture) {
      shipment.actualDeparture = new Date(updateStatusDto.actualDeparture);
    }

    // Update notes if provided
    if (updateStatusDto.notes) {
      const currentNotes = shipment.notes || '';
      const timestamp = new Date().toISOString();
      const newNote = `[${timestamp}] Status updated to ${updateStatusDto.status}: ${updateStatusDto.notes}`;
      shipment.notes = currentNotes ? `${currentNotes}\n${newNote}` : newNote;
    }

    const updatedShipment = await this.shipmentRepository.save(shipment);

    return {
      message: 'Shipment status updated successfully',
      shipment: {
        id: updatedShipment.id,
        trackingNumber: updatedShipment.trackingNumber,
        status: updatedShipment.status,
        actualArrival: updatedShipment.actualArrival,
        actualDeparture: updatedShipment.actualDeparture,
        updatedAt: updatedShipment.updatedAt,
      },
    };
  }

  async updateShipmentLocation(
    shipmentId: string,
    updateLocationDto: {
      currentLocation: string;
      estimatedArrival?: string;
      vesselName?: string;
      vesselMmsi?: string;
      notes?: string;
    },
    adminId: string,
  ) {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    // Update location information
    if (updateLocationDto.estimatedArrival) {
      shipment.estimatedArrival = new Date(updateLocationDto.estimatedArrival);
    }
    if (updateLocationDto.vesselName) {
      shipment.vesselName = updateLocationDto.vesselName;
    }
    if (updateLocationDto.vesselMmsi) {
      shipment.vesselMMSI = updateLocationDto.vesselMmsi;
    }

    // Add location update to notes
    const timestamp = new Date().toISOString();
    const locationNote = `[${timestamp}] Location updated: ${updateLocationDto.currentLocation}`;
    const additionalNotes = updateLocationDto.notes ? ` - ${updateLocationDto.notes}` : '';
    const newNote = locationNote + additionalNotes;
    
    const currentNotes = shipment.notes || '';
    shipment.notes = currentNotes ? `${currentNotes}\n${newNote}` : newNote;

    const updatedShipment = await this.shipmentRepository.save(shipment);

    return {
      message: 'Shipment location updated successfully',
      shipment: {
        id: updatedShipment.id,
        trackingNumber: updatedShipment.trackingNumber,
        currentLocation: updateLocationDto.currentLocation,
        estimatedArrival: updatedShipment.estimatedArrival,
        vesselName: updatedShipment.vesselName,
        vesselMmsi: updatedShipment.vesselMMSI,
        updatedAt: updatedShipment.updatedAt,
      },
    };
  }

  async markWarehouseArrival(
    shipmentId: string,
    warehouseArrivalDto: {
      arrivalDate?: string;
      warehouseLocation?: string;
      condition?: string;
      notes?: string;
      disableTracking?: boolean;
    },
    adminId: string,
  ) {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    // Set arrival date
    const arrivalDate = warehouseArrivalDto.arrivalDate 
      ? new Date(warehouseArrivalDto.arrivalDate)
      : new Date();

    shipment.actualArrival = arrivalDate;
    shipment.status = 'delivered' as any;

    // Disable tracking by default when arrived at warehouse
    if (warehouseArrivalDto.disableTracking !== false) {
      shipment.enableTracking = false;
    }

    // Add warehouse arrival note
    const timestamp = new Date().toISOString();
    const warehouseNote = `[${timestamp}] ARRIVED AT WAREHOUSE`;
    const locationInfo = warehouseArrivalDto.warehouseLocation 
      ? ` - Location: ${warehouseArrivalDto.warehouseLocation}` 
      : '';
    const conditionInfo = warehouseArrivalDto.condition 
      ? ` - Condition: ${warehouseArrivalDto.condition}` 
      : '';
    const additionalNotes = warehouseArrivalDto.notes 
      ? ` - Notes: ${warehouseArrivalDto.notes}` 
      : '';
    
    const fullNote = warehouseNote + locationInfo + conditionInfo + additionalNotes;
    const currentNotes = shipment.notes || '';
    shipment.notes = currentNotes ? `${currentNotes}\n${fullNote}` : fullNote;

    const updatedShipment = await this.shipmentRepository.save(shipment);

    return {
      message: 'Shipment marked as arrived at warehouse',
      shipment: {
        id: updatedShipment.id,
        trackingNumber: updatedShipment.trackingNumber,
        status: updatedShipment.status,
        actualArrival: updatedShipment.actualArrival,
        warehouseLocation: warehouseArrivalDto.warehouseLocation,
        condition: warehouseArrivalDto.condition,
        enableTracking: updatedShipment.enableTracking,
        updatedAt: updatedShipment.updatedAt,
      },
    };
  }

  async updateTrackingSettings(
    shipmentId: string,
    trackingSettingsDto: {
      enableTracking: boolean;
      containerNumber?: string;
      blNumber?: string;
      bookingNumber?: string;
    },
    adminId: string,
  ) {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    // Update tracking settings
    shipment.enableTracking = trackingSettingsDto.enableTracking;
    
    if (trackingSettingsDto.containerNumber !== undefined) {
      shipment.containerNumber = trackingSettingsDto.containerNumber;
    }
    if (trackingSettingsDto.blNumber !== undefined) {
      shipment.blNumber = trackingSettingsDto.blNumber;
    }
    if (trackingSettingsDto.bookingNumber !== undefined) {
      shipment.bookingNumber = trackingSettingsDto.bookingNumber;
    }

    // Add tracking settings update to notes
    const timestamp = new Date().toISOString();
    const trackingNote = `[${timestamp}] Tracking ${trackingSettingsDto.enableTracking ? 'enabled' : 'disabled'}`;
    const currentNotes = shipment.notes || '';
    shipment.notes = currentNotes ? `${currentNotes}\n${trackingNote}` : trackingNote;

    const updatedShipment = await this.shipmentRepository.save(shipment);

    return {
      message: 'Tracking settings updated successfully',
      shipment: {
        id: updatedShipment.id,
        trackingNumber: updatedShipment.trackingNumber,
        enableTracking: updatedShipment.enableTracking,
        containerNumber: updatedShipment.containerNumber,
        blNumber: updatedShipment.blNumber,
        bookingNumber: updatedShipment.bookingNumber,
        updatedAt: updatedShipment.updatedAt,
      },
    };
  }

  async getShipmentUpdateHistory(shipmentId: string, page: number = 1, limit: number = 20) {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    // Parse notes to extract update history
    const notes = shipment.notes || '';
    const updates = notes.split('\n')
      .filter(note => note.trim().startsWith('['))
      .map((note, index) => {
        const timestampMatch = note.match(/\[([^\]]+)\]/);
        const timestamp = timestampMatch ? timestampMatch[1] : null;
        const content = note.replace(/\[([^\]]+)\]\s*/, '');
        
        return {
          id: `update-${index + 1}`,
          timestamp: timestamp ? new Date(timestamp) : null,
          content,
          rawNote: note,
        };
      })
      .reverse(); // Show most recent first

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedUpdates = updates.slice(offset, offset + limit);

    return {
      updates: paginatedUpdates,
      pagination: {
        page,
        limit,
        total: updates.length,
        totalPages: Math.ceil(updates.length / limit),
      },
      shipment: {
        id: shipment.id,
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
      },
    };
  }

  async updateShipment(shipmentId: string, updateShipmentDto: any, adminId: string) {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    // Update shipment fields
    const updatedFields = [];
    
    if (updateShipmentDto.description !== undefined) {
      shipment.description = updateShipmentDto.description;
      updatedFields.push('description');
    }
    if (updateShipmentDto.weight !== undefined) {
      shipment.weight = updateShipmentDto.weight;
      updatedFields.push('weight');
    }
    if (updateShipmentDto.volume !== undefined) {
      shipment.volume = updateShipmentDto.volume;
      updatedFields.push('volume');
    }
    if (updateShipmentDto.value !== undefined) {
      shipment.value = updateShipmentDto.value;
      updatedFields.push('value');
    }
    if (updateShipmentDto.currency !== undefined) {
      shipment.currency = updateShipmentDto.currency;
      updatedFields.push('currency');
    }
    if (updateShipmentDto.originPort !== undefined) {
      shipment.originPort = updateShipmentDto.originPort;
      updatedFields.push('originPort');
    }
    if (updateShipmentDto.destinationPort !== undefined) {
      shipment.destinationPort = updateShipmentDto.destinationPort;
      updatedFields.push('destinationPort');
    }
    if (updateShipmentDto.estimatedDeparture !== undefined) {
      shipment.estimatedDeparture = new Date(updateShipmentDto.estimatedDeparture);
      updatedFields.push('estimatedDeparture');
    }
    if (updateShipmentDto.estimatedArrival !== undefined) {
      shipment.estimatedArrival = new Date(updateShipmentDto.estimatedArrival);
      updatedFields.push('estimatedArrival');
    }
    if (updateShipmentDto.specialInstructions !== undefined) {
      shipment.specialInstructions = updateShipmentDto.specialInstructions;
      updatedFields.push('specialInstructions');
    }

    // Add update note
    if (updatedFields.length > 0) {
      const timestamp = new Date().toISOString();
      const updateNote = `[${timestamp}] Updated fields: ${updatedFields.join(', ')}`;
      const additionalNotes = updateShipmentDto.notes ? ` - ${updateShipmentDto.notes}` : '';
      const fullNote = updateNote + additionalNotes;
      
      const currentNotes = shipment.notes || '';
      shipment.notes = currentNotes ? `${currentNotes}\n${fullNote}` : fullNote;
    }

    const updatedShipment = await this.shipmentRepository.save(shipment);

    return {
      message: 'Shipment updated successfully',
      updatedFields,
      shipment: updatedShipment,
    };
  }
}
