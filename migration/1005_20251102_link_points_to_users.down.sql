-- Remove foreign key constraint linking points table to users table
-- Migration: 1005_20251102_link_points_to_users.down.sql

ALTER TABLE event.points 
DROP CONSTRAINT IF EXISTS fk_points_user_id;