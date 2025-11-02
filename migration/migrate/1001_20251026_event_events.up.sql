CREATE TABLE event.events (
    id SERIAL PRIMARY KEY,
    uuid CHAR(36) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP,
    available_seats INT NOT NULL,
    description TEXT,
    ticket_type_id VARCHAR(255),
    category_id INT,
    event_type VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(3) NOT NULL DEFAULT 'atv',
    FOREIGN KEY (category_id) REFERENCES event.categories(id) ON DELETE RESTRICT
);


