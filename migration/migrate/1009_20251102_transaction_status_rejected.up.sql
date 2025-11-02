-- Migration: Add support for status 6 (Rejected) to transactions table
-- Date: 2024-11-02
-- Description: Extends transaction status constraint to include rejected status

-- Update the status constraint to allow status 6 (Rejected)
ALTER TABLE event.transactions 
DROP CONSTRAINT IF EXISTS transactions_status_check;

ALTER TABLE event.transactions 
ADD CONSTRAINT transactions_status_check 
CHECK (status IN (1, 2, 3, 4, 5, 6));

-- Add comment explaining status values
COMMENT ON COLUMN event.transactions.status IS 'Transaction status: 1=Waiting for Payment, 2=Waiting for Confirmation, 3=Completed, 4=Expired (auto after 2hrs), 5=Canceled (auto after 3 days), 6=Rejected (manual)';