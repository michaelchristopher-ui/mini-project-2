-- Remove quantity column from ticket_transactions table
-- Rollback for quantity-based ticket purchasing

ALTER TABLE event.tickets_transactions 
DROP COLUMN IF EXISTS quantity;