-- Remove Canceled status (5) from transaction status constraint
-- Revert to previous status constraint (1, 2, 3, 4)

ALTER TABLE event.transactions DROP CONSTRAINT IF EXISTS transactions_status_check;
ALTER TABLE event.transactions ADD CONSTRAINT transactions_status_check CHECK (status IN (1, 2, 3, 4));