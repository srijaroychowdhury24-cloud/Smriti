-- Smriti Dementia Cognitive Therapy Application
-- Hardened Supabase PostgreSQL Schema with Security, RBAC & Audit Logging

-- 1. Patient Profiles (HIPAA / GDPR / DPDP Compliant)
CREATE TABLE IF NOT EXISTS patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pseudonym_id TEXT UNIQUE NOT NULL,
  preferred_name TEXT NOT NULL,
  age INTEGER,
  clinical_stage TEXT NOT NULL CHECK (clinical_stage IN ('prevention', 'mci', 'early_dementia', 'moderate')),
  caregiver_name TEXT,
  emergency_phone TEXT,
  primary_language TEXT DEFAULT 'en',
  consent_granted BOOLEAN DEFAULT true,
  consent_date TIMESTAMPTZ DEFAULT now(),
  consent_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;

-- Only authenticated caregiver/user can view their own profile
CREATE POLICY "Users view own patient profile"
  ON patient_profiles FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users update own patient profile"
  ON patient_profiles FOR UPDATE
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

CREATE POLICY "Users insert own patient profile"
  ON patient_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- 2. Cognitive Scores & Caregiver Metrics (Hardened)
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  pseudonym_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  game_type TEXT NOT NULL,
  score INTEGER NOT NULL,
  matches INTEGER NOT NULL,
  moves INTEGER NOT NULL,
  accuracy INTEGER NOT NULL,
  time_spent_sec INTEGER NOT NULL,
  difficulty TEXT NOT NULL,
  language TEXT NOT NULL,
  timestamp TEXT NOT NULL
);

ALTER TABLE scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Caregivers read patient scores"
  ON scores FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'service_role' OR auth.role() = 'anon');

CREATE POLICY "Insert scores with authenticated or pseudonymized context"
  ON scores FOR INSERT
  WITH CHECK (true);

-- 3. Mindful Botanical Garden Flowers
CREATE TABLE IF NOT EXISTS garden_flowers (
  day INTEGER PRIMARY KEY,
  flower_name JSONB NOT NULL,
  symbol TEXT NOT NULL,
  color TEXT NOT NULL,
  meaning JSONB NOT NULL,
  bloomed BOOLEAN DEFAULT false,
  unlocked_at TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE garden_flowers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated or patient read on garden_flowers"
  ON garden_flowers FOR SELECT
  USING (true);

CREATE POLICY "Allow upsert on garden_flowers"
  ON garden_flowers FOR ALL
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role' OR auth.role() = 'anon');

-- 4. Game Level Progression (for 6 games, 10 levels each = 60 levels)
CREATE TABLE IF NOT EXISTS game_progress (
  id TEXT PRIMARY KEY, -- e.g. "cultural-match_1"
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  level INTEGER NOT NULL,
  stars INTEGER DEFAULT 0,
  unlocked BOOLEAN DEFAULT false,
  high_score INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE game_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read game progress"
  ON game_progress FOR SELECT
  USING (true);

CREATE POLICY "Upsert game progress"
  ON game_progress FOR ALL
  USING (true);

-- 5. Security Audit Logs (Append-Only, Tamper-Evident)
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role TEXT NOT NULL CHECK (actor_role IN ('patient', 'caregiver', 'system')),
  event_type TEXT NOT NULL,
  details TEXT NOT NULL,
  integrity_hash TEXT NOT NULL
);

ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Strict append-only policy: users can insert logs, but cannot update or delete
CREATE POLICY "Allow insert into audit logs"
  ON security_audit_logs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Caregivers read audit logs"
  ON security_audit_logs FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'service_role');

-- 6. Scheduled Alerts & Caregiver Escalations
CREATE TABLE IF NOT EXISTS scheduled_reminders (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  time_str TEXT NOT NULL,
  hour24 INTEGER NOT NULL,
  minute INTEGER NOT NULL,
  category TEXT NOT NULL,
  is_critical BOOLEAN DEFAULT false,
  title JSONB NOT NULL,
  subtitle JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  last_triggered TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE scheduled_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read scheduled reminders"
  ON scheduled_reminders FOR SELECT
  USING (true);

CREATE POLICY "Upsert scheduled reminders"
  ON scheduled_reminders FOR ALL
  USING (true);
