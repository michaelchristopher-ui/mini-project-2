-- Remove seeded tickets
DELETE FROM event.tickets WHERE uuid IN (
    '9a3fc986-fc51-41a6-bd0f-ff522a8ed2a4',
    '2a65efa2-bd04-4290-88a8-eed1c1aebc97',
    '098b4691-c9d1-4881-a344-2409af577ffb',
    'b864dbcc-d2a8-4925-bb6a-97284ab76183',
    '12345678-1234-5678-9abc-123456789def',
    '87654321-4321-8765-dcba-fedcba987654',
    'abcdef12-3456-7890-abcd-ef1234567890',
    'fedcba98-7654-3210-fedc-ba9876543210'
);