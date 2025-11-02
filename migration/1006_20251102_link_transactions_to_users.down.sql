-- Remove foreign key constraints linking transactions table to users table
-- Migration: 1006_20251102_link_transactions_to_users.down.sql

ALTER TABLE event.transactions 
DROP CONSTRAINT IF EXISTS fk_transactions_created_by;

ALTER TABLE event.transactions 
DROP CONSTRAINT IF EXISTS fk_transactions_confirmed_by;