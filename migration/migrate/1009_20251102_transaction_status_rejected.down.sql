-- Rollback Migration: Remove support for status 6 (Rejected) from transactions table
-- Date: 2024-11-02
-- Description: Reverts transaction status constraint to original 5 status values

-- First, update any existing rejected (6) transactions to canceled (5)
UPDATE event.transactions 
SET status = 5, confirmed_at = NOW(), confirmed_by = created_by 
WHERE status = 6;

-- Revert the status constraint to original 5 values
ALTER TABLE event.transactions 
DROP CONSTRAINT IF EXISTS transactions_status_check;

ALTER TABLE event.transactions 
ADD CONSTRAINT transactions_status_check 
CHECK (status IN (1, 2, 3, 4, 5));

-- Revert comment to original status values
COMMENT ON COLUMN event.transactions.status IS 'Transaction status: 1=Waiting for Payment, 2=Waiting for Confirmation, 3=Completed, 4=Expired (auto after 2hrs), 5=Canceled (auto after 3 days)';