-- Create ticket_transactions junction table for many-to-many relationship
-- between transactions and tickets

CREATE TABLE event.tickets_transactions (
    transaction_id INT NOT NULL,
    ticket_id INT NOT NULL,
    PRIMARY KEY (transaction_id, ticket_id),
    FOREIGN KEY (transaction_id) REFERENCES event.transactions(id) ON DELETE RESTRICT,
    FOREIGN KEY (ticket_id) REFERENCES event.tickets(id) ON DELETE RESTRICT
);