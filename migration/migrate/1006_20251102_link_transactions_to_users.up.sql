-- Add foreign key constraints linking transactions table to users table
-- Migration: 1006_20251102_link_transactions_to_users.up.sql

-- Add foreign key for created_by field
ALTER TABLE event.transactions 
ADD CONSTRAINT fk_transactions_created_by 
FOREIGN KEY (created_by) REFERENCES event.users(id) ON DELETE SET NULL;

-- Add foreign key for confirmed_by field
ALTER TABLE event.transactions 
ADD CONSTRAINT fk_transactions_confirmed_by 
FOREIGN KEY (confirmed_by) REFERENCES event.users(id) ON DELETE SET NULL;

-- Add comments for documentation
COMMENT ON CONSTRAINT fk_transactions_created_by ON event.transactions 
IS 'Foreign key linking transaction creator to users table with set null on delete';

COMMENT ON CONSTRAINT fk_transactions_confirmed_by ON event.transactions 
IS 'Foreign key linking transaction confirmer to users table with set null on delete';