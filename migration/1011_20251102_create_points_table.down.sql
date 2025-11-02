-- Drop points table and related indexes
-- Rollback for points table creation

DROP INDEX IF EXISTS event.idx_points_user_expiry;
DROP INDEX IF EXISTS event.idx_points_expiry;
DROP INDEX IF EXISTS event.idx_points_user_id;

DROP TABLE IF EXISTS event.points;