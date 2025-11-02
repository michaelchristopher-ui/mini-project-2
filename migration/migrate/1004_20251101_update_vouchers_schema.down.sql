-- Rollback migration: Revert vouchers table to original schema

-- Add back the original columns
ALTER TABLE event.vouchers 
    ADD COLUMN name VARCHAR(255),
    ADD COLUMN description TEXT,
    ADD COLUMN discount_percentage INTEGER;

-- Populate the original columns from the new ones
UPDATE event.vouchers SET 
    name = CONCAT('Voucher ', id),
    description = CONCAT('Discount voucher with ', discount_amount, 
                        CASE 
                            WHEN discount_type = 'percentage' THEN '% off'
                            ELSE ' fixed amount off'
                        END),
    discount_percentage = CASE 
        WHEN discount_type = 'percentage' THEN discount_amount::INTEGER
        ELSE 10  -- Default to 10% for fixed amounts
    END;

-- Make original columns NOT NULL
ALTER TABLE event.vouchers 
    ALTER COLUMN name SET NOT NULL,
    ALTER COLUMN discount_percentage SET NOT NULL;

-- Drop new columns and constraints
ALTER TABLE event.vouchers 
    DROP CONSTRAINT IF EXISTS vouchers_discount_type_check,
    DROP CONSTRAINT IF EXISTS vouchers_discount_amount_check,
    DROP CONSTRAINT IF EXISTS vouchers_max_uses_check,
    DROP CONSTRAINT IF EXISTS vouchers_used_count_check,
    DROP COLUMN code,
    DROP COLUMN discount_type,
    DROP COLUMN discount_amount,
    DROP COLUMN max_uses,
    DROP COLUMN used_count;

-- Add back original constraints
ALTER TABLE event.vouchers 
    ADD CONSTRAINT vouchers_discount_percentage_check CHECK (discount_percentage >= 0 AND discount_percentage <= 100);