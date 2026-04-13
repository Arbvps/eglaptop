-- Users & Roles Schema for TAVOC Academy
-- This creates a complete user management system with roles and permissions

-- Create enum for user roles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'manager', 'sales', 'viewer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create enum for user status
DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create users profile table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'viewer',
  status user_status NOT NULL DEFAULT 'pending',
  team_member_name TEXT REFERENCES team_members(name),
  department TEXT,
  last_login TIMESTAMP WITH TIME ZONE,
  login_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  module TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role_permissions junction table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role user_role NOT NULL,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role, permission_id)
);

-- Create activity_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_sessions table for session management
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  device_info TEXT,
  ip_address TEXT,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default permissions
INSERT INTO permissions (name, description, module) VALUES
  -- Dashboard
  ('view_dashboard', 'عرض لوحة التحكم', 'dashboard'),
  ('view_statistics', 'عرض الإحصائيات', 'dashboard'),
  
  -- Sales
  ('view_sales', 'عرض المبيعات', 'sales'),
  ('create_sales', 'إضافة مبيعات', 'sales'),
  ('edit_sales', 'تعديل المبيعات', 'sales'),
  ('delete_sales', 'حذف المبيعات', 'sales'),
  ('export_sales', 'تصدير المبيعات', 'sales'),
  
  -- Students
  ('view_students', 'عرض الطلاب', 'students'),
  ('create_students', 'إضافة طلاب', 'students'),
  ('edit_students', 'تعديل الطلاب', 'students'),
  ('delete_students', 'حذف الطلاب', 'students'),
  ('view_student_financials', 'عرض المعاملات المالية للطلاب', 'students'),
  ('manage_student_attendance', 'إدارة حضور الطلاب', 'students'),
  
  -- Leads
  ('view_leads', 'عرض الليدز', 'leads'),
  ('create_leads', 'إضافة ليدز', 'leads'),
  ('edit_leads', 'تعديل الليدز', 'leads'),
  ('delete_leads', 'حذف الليدز', 'leads'),
  ('assign_leads', 'توزيع الليدز', 'leads'),
  ('view_all_leads', 'عرض جميع الليدز (كل الموظفين)', 'leads'),
  
  -- Tasks
  ('view_tasks', 'عرض المهام', 'tasks'),
  ('create_tasks', 'إضافة مهام', 'tasks'),
  ('edit_tasks', 'تعديل المهام', 'tasks'),
  ('delete_tasks', 'حذف المهام', 'tasks'),
  ('assign_tasks', 'توزيع المهام', 'tasks'),
  
  -- Team
  ('view_team', 'عرض الفريق', 'team'),
  ('view_team_performance', 'عرض أداء الفريق', 'team'),
  ('manage_team', 'إدارة الفريق', 'team'),
  
  -- Reports
  ('view_reports', 'عرض التقارير', 'reports'),
  ('export_reports', 'تصدير التقارير', 'reports'),
  ('view_financial_reports', 'عرض التقارير المالية', 'reports'),
  
  -- Settings
  ('view_settings', 'عرض الإعدادات', 'settings'),
  ('manage_settings', 'إدارة الإعدادات', 'settings'),
  ('manage_integrations', 'إدارة التكاملات', 'settings'),
  
  -- Users & Permissions
  ('view_users', 'عرض المستخدمين', 'users'),
  ('create_users', 'إضافة مستخدمين', 'users'),
  ('edit_users', 'تعديل المستخدمين', 'users'),
  ('delete_users', 'حذف المستخدمين', 'users'),
  ('manage_roles', 'إدارة الأدوار والصلاحيات', 'users'),
  ('view_activity_logs', 'عرض سجل النشاطات', 'users')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
-- Super Admin: All permissions
INSERT INTO role_permissions (role, permission_id)
SELECT 'super_admin', id FROM permissions
ON CONFLICT DO NOTHING;

-- Admin: Most permissions except role management
INSERT INTO role_permissions (role, permission_id)
SELECT 'admin', id FROM permissions 
WHERE name NOT IN ('manage_roles', 'delete_users')
ON CONFLICT DO NOTHING;

-- Manager: Team and sales management
INSERT INTO role_permissions (role, permission_id)
SELECT 'manager', id FROM permissions 
WHERE name IN (
  'view_dashboard', 'view_statistics',
  'view_sales', 'create_sales', 'edit_sales', 'export_sales',
  'view_students', 'create_students', 'edit_students', 'view_student_financials', 'manage_student_attendance',
  'view_leads', 'create_leads', 'edit_leads', 'assign_leads', 'view_all_leads',
  'view_tasks', 'create_tasks', 'edit_tasks', 'assign_tasks',
  'view_team', 'view_team_performance',
  'view_reports', 'export_reports',
  'view_settings'
)
ON CONFLICT DO NOTHING;

-- Sales: Basic sales operations
INSERT INTO role_permissions (role, permission_id)
SELECT 'sales', id FROM permissions 
WHERE name IN (
  'view_dashboard',
  'view_sales', 'create_sales',
  'view_students', 'create_students',
  'view_leads', 'create_leads', 'edit_leads',
  'view_tasks', 'create_tasks', 'edit_tasks',
  'view_team'
)
ON CONFLICT DO NOTHING;

-- Viewer: Read-only access
INSERT INTO role_permissions (role, permission_id)
SELECT 'viewer', id FROM permissions 
WHERE name LIKE 'view_%'
ON CONFLICT DO NOTHING;

-- Create function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::user_role, 'pending'::user_role),
    'pending'::user_status
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update last login
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_profiles 
  SET 
    last_login = NOW(),
    login_count = COALESCE(login_count, 0) + 1
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role);
