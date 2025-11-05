-- Remove password field from users table
ALTER TABLE event.users 
DROP COLUMN password;