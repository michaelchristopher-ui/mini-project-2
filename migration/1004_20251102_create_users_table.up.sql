-- Create users table for basic user management
-- Simple username-based authentication without passwords for now

CREATE TABLE event.users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    profile_picture TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE UNIQUE INDEX idx_users_username ON event.users(username);

-- Add comments for documentation
COMMENT ON TABLE event.users IS 'User accounts with username-only authentication (no passwords for now)';
COMMENT ON COLUMN event.users.username IS 'Unique username for login identification';
COMMENT ON COLUMN event.users.profile_picture IS 'URL/path to user profile picture (can be long URLs)';