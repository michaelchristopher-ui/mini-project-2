-- Add foreign key constraint linking points table to users table
-- Migration: 1005_20251102_link_points_to_users.up.sql

ALTER TABLE event.points 
ADD CONSTRAINT fk_points_user_id 
FOREIGN KEY (user_id) REFERENCES event.users(id) ON DELETE CASCADE;

-- Add comment for documentation
COMMENT ON CONSTRAINT fk_points_user_id ON event.points 
IS 'Foreign key linking points to users table with cascade delete';