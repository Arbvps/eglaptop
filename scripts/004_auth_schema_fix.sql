-- Addendum migration: align schema with application code
-- Adds user_permissions, fixes role_permissions, and adds is_active to user_profiles

-- 1. Add is_active column to user_profiles (our code uses this instead of status enum)
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
UPDATE public.user_profiles SET is_active = (status = 'active');

-- 2. Create user_permissions table for per-user permission overrides
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_key TEXT NOT NULL,
  granted BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, permission_key)
);

CREATE INDEX IF NOT EXISTS idx_user_permissions_user ON user_permissions(user_id);

-- 3. Drop and recreate role_permissions using permission_key text (simpler)
DROP TABLE IF EXISTS public.role_permissions CASCADE;

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  permission_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role, permission_key)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role2 ON role_permissions(role);

-- 4. Seed role_permissions with text keys matching application code
INSERT INTO role_permissions (role, permission_key) VALUES
-- super_admin: all
('super_admin','sales.view'),('super_admin','sales.create'),('super_admin','sales.edit'),('super_admin','sales.delete'),('super_admin','sales.export'),
('super_admin','students.view'),('super_admin','students.create'),('super_admin','students.edit'),('super_admin','students.delete'),('super_admin','students.financial'),('super_admin','students.attendance'),
('super_admin','leads.view'),('super_admin','leads.create'),('super_admin','leads.edit'),('super_admin','leads.delete'),('super_admin','leads.all'),
('super_admin','reports.view'),('super_admin','reports.export'),('super_admin','reports.all_employees'),
('super_admin','tasks.view'),('super_admin','tasks.create'),('super_admin','tasks.edit'),('super_admin','tasks.delete'),('super_admin','tasks.assign'),
('super_admin','team.view'),('super_admin','team.manage'),
('super_admin','settings.view'),('super_admin','settings.edit'),('super_admin','settings.integrations'),
('super_admin','admin.users'),('super_admin','admin.roles'),('super_admin','admin.logs'),('super_admin','admin.full'),
-- admin: all except admin.full
('admin','sales.view'),('admin','sales.create'),('admin','sales.edit'),('admin','sales.delete'),('admin','sales.export'),
('admin','students.view'),('admin','students.create'),('admin','students.edit'),('admin','students.delete'),('admin','students.financial'),('admin','students.attendance'),
('admin','leads.view'),('admin','leads.create'),('admin','leads.edit'),('admin','leads.delete'),('admin','leads.all'),
('admin','reports.view'),('admin','reports.export'),('admin','reports.all_employees'),
('admin','tasks.view'),('admin','tasks.create'),('admin','tasks.edit'),('admin','tasks.delete'),('admin','tasks.assign'),
('admin','team.view'),('admin','team.manage'),
('admin','settings.view'),('admin','settings.edit'),('admin','settings.integrations'),
('admin','admin.users'),('admin','admin.roles'),('admin','admin.logs'),
-- manager
('manager','sales.view'),('manager','sales.create'),('manager','sales.edit'),('manager','sales.export'),
('manager','students.view'),('manager','students.create'),('manager','students.edit'),('manager','students.financial'),('manager','students.attendance'),
('manager','leads.view'),('manager','leads.create'),('manager','leads.edit'),('manager','leads.all'),
('manager','reports.view'),('manager','reports.export'),('manager','reports.all_employees'),
('manager','tasks.view'),('manager','tasks.create'),('manager','tasks.edit'),('manager','tasks.assign'),
('manager','team.view'),('manager','settings.view'),('manager','admin.logs'),
-- sales
('sales','sales.view'),('sales','sales.create'),
('sales','students.view'),('sales','students.attendance'),
('sales','leads.view'),('sales','leads.create'),('sales','leads.edit'),
('sales','reports.view'),
('sales','tasks.view'),('sales','tasks.create'),('sales','tasks.edit'),
('sales','team.view'),
-- viewer
('viewer','sales.view'),('viewer','students.view'),('viewer','leads.view'),
('viewer','reports.view'),('viewer','tasks.view'),('viewer','team.view')
ON CONFLICT DO NOTHING;

-- 5. Fix activity_logs to accept string details (not JSONB) and string action
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS details_text TEXT;
ALTER TABLE public.activity_logs ADD COLUMN IF NOT EXISTS target_user_id UUID REFERENCES auth.users(id);

-- 6. Enable RLS on sensitive tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own profile
DROP POLICY IF EXISTS "users_read_own_profile" ON user_profiles;
CREATE POLICY "users_read_own_profile" ON user_profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

-- Allow admins full access to user_profiles
DROP POLICY IF EXISTS "admins_full_user_profiles" ON user_profiles;
CREATE POLICY "admins_full_user_profiles" ON user_profiles
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role IN ('super_admin','admin')
    )
  );

-- Allow service_role bypass (for admin API routes)
DROP POLICY IF EXISTS "service_role_bypass_profiles" ON user_profiles;
CREATE POLICY "service_role_bypass_profiles" ON user_profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);
