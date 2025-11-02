-- Seed categories with specific IDs
INSERT INTO event.categories (id, name) VALUES 
    (1, 'Technology'),
    (2, 'Music'),
    (3, 'Sports'),
    (4, 'Education'),
    (5, 'Business'),
    (6, 'Entertainment'),
    (7, 'Health & Wellness'),
    (8, 'Arts & Culture'),
    (9, 'Food & Drink'),
    (10, 'Networking')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;