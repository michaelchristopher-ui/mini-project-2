-- Add remaining_price field to transactions table to store final amount due after discounts and points

ALTER TABLE event.transactions 
ADD COLUMN remaining_price DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Add index for price-based queries
CREATE INDEX idx_transactions_remaining_price ON event.transactions(remaining_price);

-- Add comment for documentation
COMMENT ON COLUMN event.transactions.remaining_price IS 'Final amount to be paid after applying discounts and points';