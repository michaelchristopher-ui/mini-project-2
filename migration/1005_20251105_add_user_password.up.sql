-- Add password field to users table
ALTER TABLE event.users 
ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT 'temp_password';