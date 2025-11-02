-- Drop users table and related indexes
-- Rollback for users table creation

DROP INDEX IF EXISTS event.idx_users_username;
DROP TABLE IF EXISTS event.users;