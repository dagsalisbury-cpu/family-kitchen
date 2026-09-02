-- 1. Create the checkout_jobs table
CREATE TABLE IF NOT EXISTS checkout_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  logs TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Realtime on the checkout_jobs table
-- This allows the Next.js app and the local Node daemon to subscribe to changes.
ALTER PUBLICATION supabase_realtime ADD TABLE checkout_jobs;

-- 3. Enable Row Level Security (RLS)
ALTER TABLE checkout_jobs ENABLE ROW LEVEL SECURITY;

-- 4. Create policies (For this setup, we allow anon access since we gate via HOST_PIN at the Next.js API level)
CREATE POLICY "Enable read access for all users" ON checkout_jobs FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON checkout_jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON checkout_jobs FOR UPDATE USING (true);
CREATE POLICY "Enable delete for all users" ON checkout_jobs FOR DELETE USING (true);
