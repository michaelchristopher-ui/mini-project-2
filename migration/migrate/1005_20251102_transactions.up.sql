-- Create transactions table for handling multiple ticket purchases
-- Statuses: 1=Waiting for Payment, 2=Waiting for Confirmation, 3=Completed, 4=Expired, 5=Canceled

CREATE TABLE event.transactions (
    id SERIAL PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    event_id INT NOT NULL,
    status INT NOT NULL CHECK (status IN (1, 2, 3, 4, 5)), -- 1=Waiting for Payment, 2=Waiting for Confirmation, 3=Completed, 4=Expired, 5=Canceled
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by INT, -- For now do not reference anything
    confirmed_at TIMESTAMP,
    confirmed_by INT, -- For now do not reference anything
    FOREIGN KEY (event_id) REFERENCES event.events(id) ON DELETE RESTRICT
);
