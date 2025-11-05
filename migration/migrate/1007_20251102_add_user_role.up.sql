-- Add role column to users table
-- Migration: 1004_20251102_add_user_role.up.sql

ALTER TABLE event.users 
ADD COLUMN role INT NOT NULL DEFAULT 1 CHECK (role IN (1, 2));

-- Add comment for documentation
COMMENT ON COLUMN event.users.role IS 'User role: 1 = customer, 2 = event_organizer';

-- Update existing users to have default customer role (if any exist)
UPDATE event.users 
SET role = 1 
WHERE role IS NULL;