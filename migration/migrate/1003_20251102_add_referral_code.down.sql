-- Remove referral_code column from users table
-- Migration: 1003_20251102_add_referral_code.down.sql

ALTER TABLE event.users 
DROP CONSTRAINT IF EXISTS users_referral_code_unique;

ALTER TABLE event.users 
DROP COLUMN IF EXISTS referral_code;