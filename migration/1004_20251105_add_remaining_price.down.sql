-- Remove remaining_price field from transactions table

DROP INDEX IF EXISTS event.idx_transactions_remaining_price;
ALTER TABLE event.transactions DROP COLUMN IF EXISTS remaining_price;