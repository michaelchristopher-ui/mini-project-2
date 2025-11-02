-- Add Expired status (4) to transaction status constraint
-- This allows transactions to be marked as expired when they exceed 2 hours in "Waiting for Payment" status

-- Drop existing constraint
ALTER TABLE event.transactions DROP CONSTRAINT IF EXISTS transactions_status_check;

-- Add new constraint including status 4 (Expired)
ALTER TABLE event.transactions ADD CONSTRAINT transactions_status_check CHECK (status IN (1, 2, 3, 4));

-- Status meanings:
-- 1 = Waiting for Payment
-- 2 = Waiting for Confirmation  
-- 3 = Completed
-- 4 = Expired