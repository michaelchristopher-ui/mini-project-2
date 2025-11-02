-- Create coupons table for user discount coupons
-- Migration: 1007_20251102_create_coupons_table.up.sql

CREATE TABLE event.coupons (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    discount_amount INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint to users table
    CONSTRAINT fk_coupons_user_id FOREIGN KEY (user_id) REFERENCES event.users(id) ON DELETE RESTRICT
);

-- Add indexes for better query performance
CREATE INDEX idx_coupons_user_id ON event.coupons(user_id);
CREATE INDEX idx_coupons_created_at ON event.coupons(created_at);

-- Add comments for documentation
COMMENT ON TABLE event.coupons IS 'User discount coupons system';
COMMENT ON COLUMN event.coupons.user_id IS 'User identifier - references users.id';
COMMENT ON COLUMN event.coupons.discount_amount IS 'Discount amount for the coupon';
COMMENT ON COLUMN event.coupons.created_at IS 'When the coupon was created';