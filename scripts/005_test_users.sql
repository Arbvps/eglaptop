-- Test users for TAVOC Academy
-- Note: Passwords are hashed using Supabase's crypt function
-- All test passwords are: Test123!

-- First, we need to create users via Supabase Auth API
-- This script creates the user_profiles for existing auth users

-- Insert test user profiles (linking to team members)
-- These will be linked when users sign up through the app

-- For testing, create profiles that can be linked later
INSERT INTO user_profiles (id, email, full_name, role, team_member_name, is_active, phone)
VALUES 
  -- Super Admin
  (gen_random_uuid(), 'admin@tavoc.com', 'مدير النظام', 'super_admin', NULL, true, '01000000000'),
  -- Admins
  (gen_random_uuid(), 'manager@tavoc.com', 'مدير المبيعات', 'admin', NULL, true, '01000000001'),
  -- Team members as sales users
  (gen_random_uuid(), 'christine@tavoc.com', 'كريستين', 'sales', 'كريستين', true, '01111111111'),
  (gen_random_uuid(), 'hamed@tavoc.com', 'حامد', 'sales', 'حامد', true, '01222222222'),
  (gen_random_uuid(), 'heba@tavoc.com', 'هبه', 'sales', 'هبه', true, '01333333333'),
  (gen_random_uuid(), 'ayman@tavoc.com', 'أيمن', 'sales', 'أيمن', true, '01444444444'),
  (gen_random_uuid(), 'norhan@tavoc.com', 'نورهان', 'manager', 'نورهان', true, '01555555555'),
  (gen_random_uuid(), 'youssef@tavoc.com', 'يوسف', 'sales', 'يوسف', true, '01666666666'),
  (gen_random_uuid(), 'ilaria@tavoc.com', 'إيلاريا', 'sales', 'إيلاريا', true, '01777777777'),
  -- Viewer account
  (gen_random_uuid(), 'viewer@tavoc.com', 'مشاهد', 'viewer', NULL, true, '01888888888')
ON CONFLICT (email) DO NOTHING;

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error', 'call', 'sale', 'task', 'lead')),
  is_read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- Create messages table for internal chat
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  receiver_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id);

-- Create conversations view for easier querying
CREATE OR REPLACE VIEW conversations AS
SELECT DISTINCT ON (conversation_partner)
  CASE 
    WHEN sender_id < receiver_id THEN sender_id || '_' || receiver_id
    ELSE receiver_id || '_' || sender_id
  END as conversation_id,
  CASE 
    WHEN sender_id = user_profiles.id THEN receiver_id
    ELSE sender_id
  END as conversation_partner,
  user_profiles.id as user_id,
  content as last_message,
  messages.created_at as last_message_at,
  messages.is_read
FROM messages
CROSS JOIN user_profiles
WHERE sender_id = user_profiles.id OR receiver_id = user_profiles.id
ORDER BY conversation_partner, messages.created_at DESC;

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, link)
SELECT 
  id,
  'مرحباً بك في TAVOC Academy',
  'تم إنشاء حسابك بنجاح. يمكنك الآن البدء في استخدام النظام.',
  'success',
  '/'
FROM user_profiles
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- RLS Policies for messages
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update own received messages" ON messages;
CREATE POLICY "Users can update own received messages" ON messages
  FOR UPDATE USING (auth.uid() = receiver_id);
