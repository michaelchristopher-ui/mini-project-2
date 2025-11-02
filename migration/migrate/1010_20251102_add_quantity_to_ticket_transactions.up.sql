-- Add quantity column to ticket_transactions table
-- This allows tracking multiple seats of the same ticket type in one transaction

ALTER TABLE event.tickets_transactions 
ADD COLUMN quantity INT NOT NULL DEFAULT 1;

-- Add comment to explain the quantity field
COMMENT ON COLUMN event.tickets_transactions.quantity IS 'Number of seats/tickets of this type purchased in the transaction';