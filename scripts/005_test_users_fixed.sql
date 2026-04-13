-- 005_test_users_fixed.sql
-- Creates notifications + messages tables and seeds demo profiles

-- ─── Notifications table ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        REFERENCES user_profiles(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL,
  message      TEXT        NOT NULL,
  type         TEXT        DEFAULT 'info'
                           CHECK (type IN ('info','success','warning','error','call','sale','task','lead')),
  is_read      BOOLEAN     DEFAULT false,
  link         TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user   ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- ─── Messages table ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id   UUID        REFERENCES user_profiles(id) ON DELETE SET NULL,
  receiver_id UUID        REFERENCES user_profiles(id) ON DELETE CASCADE,
  content     TEXT        NOT NULL,
  is_read     BOOLEAN     DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_receiver     ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(sender_id, receiver_id);

-- ─── Ensure email column is unique so ON CONFLICT works later ─────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_profiles_email_key'
  ) THEN
    ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_email_key UNIQUE (email);
  END IF;
END $$;

-- ─── Demo profiles (no real auth.users rows needed for preview) ───────────────
INSERT INTO user_profiles (id, email, full_name, role, team_member_name, is_active, phone)
VALUES
  (gen_random_uuid(), 'admin@tavoc.com',     'مدير النظام',   'super_admin', NULL,        true, '01000000000'),
  (gen_random_uuid(), 'manager@tavoc.com',   'مدير المبيعات', 'admin',       NULL,        true, '01000000001'),
  (gen_random_uuid(), 'norhan@tavoc.com',    'نورهان',        'manager',     'نورهان',    true, '01555555555'),
  (gen_random_uuid(), 'christine@tavoc.com', 'كريستين',       'sales',       'كريستين',   true, '01111111111'),
  (gen_random_uuid(), 'hamed@tavoc.com',     'حامد',          'sales',       'حامد',      true, '01222222222'),
  (gen_random_uuid(), 'heba@tavoc.com',      'هبه',           'sales',       'هبه',       true, '01333333333'),
  (gen_random_uuid(), 'ayman@tavoc.com',     'أيمن',          'sales',       'أيمن',      true, '01444444444'),
  (gen_random_uuid(), 'youssef@tavoc.com',   'يوسف',          'sales',       'يوسف',      true, '01666666666'),
  (gen_random_uuid(), 'ilaria@tavoc.com',    'إيلاريا',       'sales',       'إيلاريا',   true, '01777777777'),
  (gen_random_uuid(), 'viewer@tavoc.com',    'مشاهد',         'viewer',      NULL,        true, '01888888888')
ON CONFLICT (email) DO UPDATE SET
  full_name       = EXCLUDED.full_name,
  role            = EXCLUDED.role,
  team_member_name= EXCLUDED.team_member_name,
  is_active       = EXCLUDED.is_active,
  phone           = EXCLUDED.phone;

-- ─── Welcome notifications for every profile ──────────────────────────────────
INSERT INTO notifications (user_id, title, message, type, link)
SELECT
  id,
  'مرحباً بك في TAVOC Academy',
  'تم إنشاء حسابك بنجاح. يمكنك الآن البدء في استخدام النظام.',
  'success',
  '/'
FROM user_profiles
WHERE NOT EXISTS (
  SELECT 1 FROM notifications n WHERE n.user_id = user_profiles.id
);

-- ─── Sample task-notification for admin ───────────────────────────────────────
INSERT INTO notifications (user_id, title, message, type, link)
SELECT id, 'مهمة جديدة', 'تم إسناد مهمة متابعة عميل إليك', 'task', '/'
FROM user_profiles WHERE email = 'admin@tavoc.com';

INSERT INTO notifications (user_id, title, message, type, link)
SELECT id, 'مبيعة جديدة', 'تم تسجيل مبيعة كورس بقيمة 2500 ج.م', 'sale', '/'
FROM user_profiles WHERE email = 'christine@tavoc.com';

-- ─── Sample messages ──────────────────────────────────────────────────────────
DO $$
DECLARE
  admin_id   UUID;
  norhan_id  UUID;
  hamed_id   UUID;
BEGIN
  SELECT id INTO admin_id  FROM user_profiles WHERE email = 'admin@tavoc.com';
  SELECT id INTO norhan_id FROM user_profiles WHERE email = 'norhan@tavoc.com';
  SELECT id INTO hamed_id  FROM user_profiles WHERE email = 'hamed@tavoc.com';

  IF admin_id IS NOT NULL AND norhan_id IS NOT NULL THEN
    INSERT INTO messages (sender_id, receiver_id, content, is_read, created_at) VALUES
      (admin_id,  norhan_id, 'صباح الخير نورهان، كيف تسير المبيعات؟',             true,  now() - interval '2 hours'),
      (norhan_id, admin_id,  'صباح النور، تسير بشكل ممتاز! وصلنا 80% من الهدف.', false, now() - interval '1 hour');
  END IF;

  IF admin_id IS NOT NULL AND hamed_id IS NOT NULL THEN
    INSERT INTO messages (sender_id, receiver_id, content, is_read, created_at) VALUES
      (admin_id, hamed_id,  'حامد، هل تابعت العميل المحتمل؟',  false, now() - interval '30 minutes');
  END IF;
END $$;

-- ─── RLS ─────────────────────────────────────────────────────────────────────
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages      ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notif_select_own" ON notifications;
CREATE POLICY "notif_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_update_own" ON notifications;
CREATE POLICY "notif_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notif_insert_all" ON notifications;
CREATE POLICY "notif_insert_all" ON notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "msg_select_own" ON messages;
CREATE POLICY "msg_select_own" ON messages FOR SELECT USING (auth.uid() IN (sender_id, receiver_id));

DROP POLICY IF EXISTS "msg_insert_own" ON messages;
CREATE POLICY "msg_insert_own" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "msg_update_received" ON messages;
CREATE POLICY "msg_update_received" ON messages FOR UPDATE USING (auth.uid() = receiver_id);
