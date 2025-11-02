-- Seed sample tickets for events (referencing specific seeded event IDs)
INSERT INTO event.tickets (uuid, event_id, price, status) VALUES 
    ('9a3fc986-fc51-41a6-bd0f-ff522a8ed2a4', 100, 99.99, 'atv'),  -- Tech Conference 2025 - Regular ticket
    ('2a65efa2-bd04-4290-88a8-eed1c1aebc97', 100, 149.50, 'atv'), -- Tech Conference 2025 - Premium ticket  
    ('b864dbcc-d2a8-4925-bb6a-97284ab76183', 100, 0.00, 'atv'),   -- Tech Conference 2025 - Free ticket
    ('098b4691-c9d1-4881-a344-2409af577ffb', 101, 75.00, 'atv'),  -- Jazz Festival Downtown
    ('12345678-1234-5678-9abc-123456789def', 102, 125.00, 'atv'), -- Championship Football Match
    ('87654321-4321-8765-dcba-fedcba987654', 103, 199.99, 'atv'), -- AI & Machine Learning Workshop
    ('abcdef12-3456-7890-abcd-ef1234567890', 104, 25.00, 'atv'),  -- Business Networking Mixer
    ('fedcba98-7654-3210-fedc-ba9876543210', 105, 50.00, 'atv')   -- Art Gallery Opening
ON CONFLICT (uuid) DO NOTHING;