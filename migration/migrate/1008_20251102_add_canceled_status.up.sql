-- Add Canceled status (5) to transaction status constraint
-- This allows transactions to be marked as canceled when they exceed 3 days in "Waiting for Confirmation" status

-- Drop existing constraint
ALTER TABLE event.transactions DROP CONSTRAINT IF EXISTS transactions_status_check;

-- Add new constraint including status 5 (Canceled)
ALTER TABLE event.transactions ADD CONSTRAINT transactions_status_check CHECK (status IN (1, 2, 3, 4, 5));

-- Status meanings:
-- 1 = Waiting for Payment
-- 2 = Waiting for Confirmation  
-- 3 = Completed
-- 4 = Expired
-- 5 = Canceled