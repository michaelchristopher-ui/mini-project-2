-- Safe add password column if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema='event' AND table_name='users' AND column_name='password'
    ) THEN
        ALTER TABLE event.users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT 'temp_password';
    END IF;
END$$;