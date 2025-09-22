-- Migration: Add tracking fields to shipments table
-- Date: 2024-01-XX
-- Description: Add new fields for ShipsGo tracking integration

ALTER TABLE shipments ADD COLUMN bl_number VARCHAR(255) NULL;
ALTER TABLE shipments ADD COLUMN booking_number VARCHAR(255) NULL;
ALTER TABLE shipments ADD COLUMN shipping_line VARCHAR(255) NULL;
ALTER TABLE shipments ADD COLUMN voyage VARCHAR(255) NULL;
ALTER TABLE shipments ADD COLUMN enable_tracking BOOLEAN DEFAULT FALSE;

-- Add indexes for better performance
CREATE INDEX idx_shipments_bl_number ON shipments(bl_number);
CREATE INDEX idx_shipments_booking_number ON shipments(booking_number);
CREATE INDEX idx_shipments_enable_tracking ON shipments(enable_tracking);

-- Update existing shipments to have enable_tracking = false by default
UPDATE shipments SET enable_tracking = FALSE WHERE enable_tracking IS NULL;

