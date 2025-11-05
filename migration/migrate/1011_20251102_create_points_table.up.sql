-- Create points table for user points management
-- Points can be earned and spent, with optional expiry dates

CREATE TABLE event.points (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    points_count INT NOT NULL,
    expiry TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint to users table
    CONSTRAINT fk_points_user_id FOREIGN KEY (user_id) REFERENCES event.users(id) ON DELETE CASCADE
);

-- Add indexes for better query performance
CREATE INDEX idx_points_user_id ON event.points(user_id);
CREATE INDEX idx_points_expiry ON event.points(expiry);
CREATE INDEX idx_points_user_expiry ON event.points(user_id, expiry);

-- Add comments for documentation
COMMENT ON TABLE event.points IS 'User points system - tracks earned/spent points with optional expiry';
COMMENT ON COLUMN event.points.user_id IS 'User identifier - references users.id';
COMMENT ON COLUMN event.points.points_count IS 'Number of points (positive for earned, negative for spent)';
COMMENT ON COLUMN event.points.expiry IS 'When these points expire (NULL for no expiry)';