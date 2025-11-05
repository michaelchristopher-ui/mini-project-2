-- Add password field to users table
-- Default password will be 'password123' for simplicity

ALTER TABLE event.users 
ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT 'password123';

-- Add comment for documentation
COMMENT ON COLUMN event.users.password IS 'User password (plain text for now - should be hashed in production)';

-- Set all existing users to have the default password
UPDATE event.users SET password = 'password123' WHERE password IS NULL OR password = '';
