-- Add referral_code column to users table
-- Migration: 1003_20251102_add_referral_code.up.sql

ALTER TABLE event.users 
ADD COLUMN referral_code VARCHAR(36) NOT NULL DEFAULT gen_random_uuid()::text;

-- Add unique constraint on referral_code
ALTER TABLE event.users 
ADD CONSTRAINT users_referral_code_unique UNIQUE (referral_code);

-- Update existing users with unique referral codes (if any exist)
UPDATE event.users 
SET referral_code = gen_random_uuid()::text 
WHERE referral_code IS NULL;