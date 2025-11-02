-- Update vouchers table to new schema with code, discount_type, and discount_amount
-- This migration transforms the existing voucher structure

-- First, add new columns
ALTER TABLE event.vouchers 
    ADD COLUMN code VARCHAR(50),
    ADD COLUMN discount_type VARCHAR(20),
    ADD COLUMN discount_amount DECIMAL(10,2),
    ADD COLUMN max_uses INTEGER,
    ADD COLUMN used_count INTEGER DEFAULT 0;

-- Populate the new columns with data from existing columns
UPDATE event.vouchers SET 
    code = CONCAT('CODE', id),  -- Generate a unique code based on ID
    discount_type = 'percentage',  -- All existing vouchers are percentage-based
    discount_amount = discount_percentage,  -- Copy the percentage value
    max_uses = NULL,  -- Set to unlimited for existing vouchers
    used_count = 0;  -- Start with zero uses

-- Make the new columns NOT NULL after populating them
ALTER TABLE event.vouchers 
    ALTER COLUMN code SET NOT NULL,
    ALTER COLUMN discount_type SET NOT NULL,
    ALTER COLUMN discount_amount SET NOT NULL,
    ALTER COLUMN used_count SET NOT NULL;

-- Drop the old columns
ALTER TABLE event.vouchers 
    DROP COLUMN name,
    DROP COLUMN description,
    DROP COLUMN discount_percentage;

-- Add constraints for the new columns
ALTER TABLE event.vouchers 
    ADD CONSTRAINT vouchers_discount_type_check CHECK (discount_type IN ('percentage', 'fixed')),
    ADD CONSTRAINT vouchers_discount_amount_check CHECK (discount_amount > 0),
    ADD CONSTRAINT vouchers_max_uses_check CHECK (max_uses IS NULL OR max_uses > 0),
    ADD CONSTRAINT vouchers_used_count_check CHECK (used_count >= 0);