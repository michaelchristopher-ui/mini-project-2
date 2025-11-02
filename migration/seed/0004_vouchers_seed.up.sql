-- Seed sample vouchers for events  
INSERT INTO event.vouchers (uuid, name, description, event_id, discount_percentage, start_date, end_date, status) VALUES 
    ('11111111-2222-3333-4444-555555555501', 'Early Bird Discount', 'Get 20% off with early registration', 100, 20, '2025-11-01 00:00:00', '2025-11-10 23:59:59', 'atv'),
    ('11111111-2222-3333-4444-555555555502', 'Student Discount', 'Special discount for students', 100, 50, '2025-11-01 00:00:00', '2025-11-14 23:59:59', 'atv'),
    ('11111111-2222-3333-4444-555555555503', 'VIP Access', 'Premium access with 10% discount', 100, 10, '2025-11-05 00:00:00', '2025-11-15 18:00:00', 'atv'),
    ('11111111-2222-3333-4444-555555555504', 'Group Discount', 'Discount for groups of 5 or more', 101, 30, '2025-11-01 00:00:00', '2025-11-19 23:59:59', 'atv'),
    ('11111111-2222-3333-4444-555555555505', 'Senior Citizen', 'Special rate for senior citizens', 102, 25, '2025-11-01 00:00:00', '2025-11-24 23:59:59', 'atv'),
    ('11111111-2222-3333-4444-555555555506', 'Workshop Bundle', 'Combo discount for multiple workshops', 103, 40, '2025-11-15 00:00:00', '2025-11-30 23:59:59', 'atv'),
    ('11111111-2222-3333-4444-555555555507', 'Networking Special', 'First-time attendee discount', 104, 15, '2025-11-20 00:00:00', '2025-12-04 23:59:59', 'atv'),
    ('11111111-2222-3333-4444-555555555508', 'Art Lover', 'Discount for art enthusiasts', 105, 35, '2025-12-01 00:00:00', '2025-12-09 23:59:59', 'atv')
ON CONFLICT (uuid) DO NOTHING;