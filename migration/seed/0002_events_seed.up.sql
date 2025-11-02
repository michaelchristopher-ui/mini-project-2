-- Seed sample events with specific IDs for ticket referencing
INSERT INTO event.events (id, uuid, name, description, start_date, end_date, available_seats, category_id) VALUES 
    (100, gen_random_uuid(), 'Tech Conference 2025', 'Annual technology conference featuring latest innovations', '2025-11-15 09:00:00', '2025-11-15 18:00:00', 500, 1),
    (101, gen_random_uuid(), 'Jazz Festival Downtown', 'Three-day jazz music festival in downtown area', '2025-11-20 19:00:00', '2025-11-22 23:00:00', 200, 2),
    (102, gen_random_uuid(), 'Championship Football Match', 'Regional championship game', '2025-11-25 14:00:00', '2025-11-25 16:00:00', 1000, 3),
    (103, gen_random_uuid(), 'AI & Machine Learning Workshop', 'Hands-on workshop for beginners and professionals', '2025-12-01 10:00:00', '2025-12-01 17:00:00', 50, 1),
    (104, gen_random_uuid(), 'Business Networking Mixer', 'Connect with local business leaders', '2025-12-05 18:00:00', '2025-12-05 21:00:00', 150, 10),
    (105, gen_random_uuid(), 'Art Gallery Opening', 'Contemporary art exhibition opening night', '2025-12-10 19:00:00', '2025-12-10 22:00:00', 100, 8),
    (106, gen_random_uuid(), 'Startup Pitch Competition', 'Local startups present to investors', '2025-12-15 14:00:00', '2025-12-15 17:00:00', 200, 5),
    (107, gen_random_uuid(), 'Holiday Concert Series', 'Classical music holiday concert', '2025-12-20 19:30:00', '2025-12-20 21:30:00', 300, 2),
    (108, gen_random_uuid(), 'New Year Fitness Bootcamp', 'Start the new year with fitness goals', '2026-01-02 08:00:00', '2026-01-02 10:00:00', 75, 7),
    (109, gen_random_uuid(), 'Food Truck Festival', 'Local food vendors and live music', '2026-01-15 11:00:00', '2026-01-15 20:00:00', 2000, 9)
ON CONFLICT (id) DO UPDATE SET
    uuid = EXCLUDED.uuid,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    available_seats = EXCLUDED.available_seats,
    category_id = EXCLUDED.category_id;