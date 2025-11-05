-- Remove role column from users table
-- Migration: 1004_20251102_add_user_role.down.sql

ALTER TABLE event.users 
DROP COLUMN IF EXISTS role;