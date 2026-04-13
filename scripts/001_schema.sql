-- TAVOC Academy Sales Dashboard - Full Schema Migration
-- Run this script to create all required tables

-- ── Sales ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  course TEXT NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  quantity INTEGER NOT NULL DEFAULT 1,
  salesperson TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed','pending','cancelled')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Tasks ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  assignee TEXT NOT NULL,
  due_date DATE,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high','medium','low')),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Team members ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'مندوب مبيعات',
  target NUMERIC(12,2) NOT NULL DEFAULT 0,
  avatar TEXT,
  attendance_days INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Daily call log ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_name TEXT NOT NULL,
  call_date DATE NOT NULL DEFAULT CURRENT_DATE,
  call_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_name, call_date)
);

-- ── Students ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  course TEXT NOT NULL,
  enrolled_date DATE NOT NULL DEFAULT CURRENT_DATE,
  salesperson TEXT NOT NULL,
  total_fees NUMERIC(12,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Transactions (student payments) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC(12,2) NOT NULL,
  type TEXT NOT NULL DEFAULT 'payment' CHECK (type IN ('payment','refund','discount')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('paid','pending','overdue')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Attendance ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  session_title TEXT NOT NULL,
  lecturer TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present','absent','excused')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Leads ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  interested_course TEXT NOT NULL,
  assigned_to TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','interested','enrolled','lost')),
  source TEXT NOT NULL DEFAULT 'Other',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Feedback (on leads) ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT NOT NULL,
  sentiment TEXT NOT NULL DEFAULT 'neutral' CHECK (sentiment IN ('positive','neutral','negative')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Follow-ups ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','done','cancelled')),
  type TEXT NOT NULL DEFAULT 'call' CHECK (type IN ('call','whatsapp','email','meeting')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── Seed team members ────────────────────────────────────────────────────────
INSERT INTO public.team_members (name, role, target, avatar, attendance_days) VALUES
  ('كريستين', 'مندوب مبيعات', 45000, 'ك', 22),
  ('حامد',    'مندوب مبيعات', 40000, 'ح', 20),
  ('هبه',     'مندوب مبيعات', 40000, 'هـ', 21),
  ('أيمن',    'مندوب مبيعات', 40000, 'أ', 23),
  ('نورهان',  'مندوب مبيعات', 38000, 'ن', 19),
  ('يوسف',    'مندوب مبيعات', 35000, 'ي', 22),
  ('إيلاريا', 'مندوب مبيعات', 42000, 'إ', 21)
ON CONFLICT (name) DO NOTHING;

-- ── Seed sales ───────────────────────────────────────────────────────────────
INSERT INTO public.sales (customer_name, course, amount, quantity, salesperson, date, status) VALUES
  ('أحمد محمد',   'كورس البرمجة الشاملة',   2500, 1, 'كريستين', '2026-03-24', 'completed'),
  ('سارة علي',    'كورس التصميم الجرافيكي', 1800, 2, 'حامد',    '2026-03-24', 'completed'),
  ('خالد عمر',    'كورس اللغة الإنجليزية', 1200, 1, 'هبه',     '2026-03-24', 'pending'),
  ('منى إبراهيم', 'كورس التسويق الرقمي',    2000, 3, 'أيمن',    '2026-03-23', 'completed'),
  ('يوسف حسن',    'كورس إدارة المشاريع',    3000, 1, 'نورهان',  '2026-03-23', 'completed'),
  ('فاطمة أحمد',  'كورس تحليل البيانات',    2800, 1, 'يوسف',    '2026-03-24', 'completed'),
  ('عمر السيد',   'كورس الذكاء الاصطناعي',  3500, 1, 'إيلاريا', '2026-03-24', 'pending'),
  ('نور محمود',   'كورس تطوير المواقع',      2200, 2, 'كريستين', '2026-03-23', 'completed');

-- ── Seed tasks ───────────────────────────────────────────────────────────────
INSERT INTO public.tasks (title, assignee, due_date, priority, completed) VALUES
  ('متابعة عميل مهتم بكورس البرمجة',   'كريستين', '2026-03-24', 'high',   FALSE),
  ('إعداد عرض للكورسات الجديدة',        'حامد',    '2026-03-24', 'medium', TRUE),
  ('التواصل مع طلاب محتملين',           'هبه',     '2026-03-25', 'high',   FALSE),
  ('تحديث قاعدة بيانات الطلاب',         'أيمن',    '2026-03-25', 'low',    FALSE),
  ('اجتماع مراجعة أهداف المبيعات',      'الجميع',  '2026-03-26', 'medium', FALSE),
  ('إرسال عروض الخصم للعملاء',          'نورهان',  '2026-03-24', 'high',   TRUE),
  ('متابعة المدفوعات المعلقة',          'يوسف',    '2026-03-25', 'medium', FALSE),
  ('تحضير تقرير المبيعات الأسبوعي',    'إيلاريا', '2026-03-26', 'high',   FALSE);

-- ── Seed students ────────────────────────────────────────────────────────────
INSERT INTO public.students (id, name, phone, email, course, enrolled_date, salesperson, total_fees, paid_amount) VALUES
  ('00000000-0000-0000-0000-000000000001', 'أحمد محمد علي',    '01001234567', 'ahmed@example.com', 'كورس البرمجة الشاملة',   '2026-03-01', 'كريستين', 5000, 3500),
  ('00000000-0000-0000-0000-000000000002', 'سارة علي حسن',     '01112345678', 'sara@example.com',  'كورس التصميم الجرافيكي', '2026-03-05', 'حامد',    3600, 3600),
  ('00000000-0000-0000-0000-000000000003', 'خالد عمر إبراهيم', '01223456789', 'khaled@example.com','كورس اللغة الإنجليزية',  '2026-03-10', 'هبه',     2400, 1200),
  ('00000000-0000-0000-0000-000000000004', 'منى إبراهيم محمد', '01334567890', 'mona@example.com',  'كورس التسويق الرقمي',   '2026-02-20', 'أيمن',    6000, 6000);

INSERT INTO public.transactions (student_id, date, amount, type, description, status) VALUES
  ('00000000-0000-0000-0000-000000000001', '2026-03-01', 2000, 'payment', 'دفعة أولى',  'paid'),
  ('00000000-0000-0000-0000-000000000001', '2026-03-15', 1500, 'payment', 'دفعة ثانية', 'paid'),
  ('00000000-0000-0000-0000-000000000001', '2026-04-01', 1500, 'payment', 'دفعة ثالثة', 'pending'),
  ('00000000-0000-0000-0000-000000000002', '2026-03-05', 1800, 'payment', 'دفعة أولى',  'paid'),
  ('00000000-0000-0000-0000-000000000002', '2026-03-20', 1800, 'payment', 'دفعة ثانية', 'paid'),
  ('00000000-0000-0000-0000-000000000003', '2026-03-10', 1200, 'payment', 'دفعة أولى',  'paid'),
  ('00000000-0000-0000-0000-000000000003', '2026-04-10', 1200, 'payment', 'دفعة ثانية', 'overdue'),
  ('00000000-0000-0000-0000-000000000004', '2026-02-20', 2000, 'payment', 'دفعة أولى',  'paid'),
  ('00000000-0000-0000-0000-000000000004', '2026-03-05', 2000, 'payment', 'دفعة ثانية', 'paid'),
  ('00000000-0000-0000-0000-000000000004', '2026-03-20', 2000, 'payment', 'دفعة ثالثة', 'paid');

INSERT INTO public.attendance (student_id, session_date, session_title, lecturer, status, notes) VALUES
  ('00000000-0000-0000-0000-000000000001', '2026-03-05', 'مقدمة في البرمجة',    'د. أحمد رضا',       'present', NULL),
  ('00000000-0000-0000-0000-000000000001', '2026-03-10', 'HTML & CSS الأساسيات','م. ليلى فاروق',     'present', NULL),
  ('00000000-0000-0000-0000-000000000001', '2026-03-15', 'JavaScript المتقدم',  'د. أحمد رضا',       'absent',  'لم يحضر بدون اعتذار'),
  ('00000000-0000-0000-0000-000000000001', '2026-03-20', 'React.js',            'م. تامر عبد الله',  'present', NULL),
  ('00000000-0000-0000-0000-000000000002', '2026-03-08', 'أساسيات التصميم',     'أ. ريم الشافعي',   'present', NULL),
  ('00000000-0000-0000-0000-000000000002', '2026-03-12', 'Adobe Photoshop',     'أ. ريم الشافعي',   'present', NULL),
  ('00000000-0000-0000-0000-000000000002', '2026-03-18', 'Adobe Illustrator',   'م. ليلى فاروق',     'excused', 'اعتذرت مسبقاً'),
  ('00000000-0000-0000-0000-000000000003', '2026-03-12', 'Grammar Basics',      'أ. خالد منصور',    'present', NULL),
  ('00000000-0000-0000-0000-000000000003', '2026-03-17', 'Speaking Skills',     'أ. خالد منصور',    'absent',  NULL),
  ('00000000-0000-0000-0000-000000000004', '2026-02-25', 'مقدمة التسويق الرقمي','م. تامر عبد الله', 'present', NULL),
  ('00000000-0000-0000-0000-000000000004', '2026-03-02', 'Social Media Marketing','م. تامر عبد الله','present', NULL);

-- ── Seed leads ───────────────────────────────────────────────────────────────
INSERT INTO public.leads (id, name, phone, email, interested_course, assigned_to, status, source) VALUES
  ('00000000-0000-0000-0001-000000000001', 'ليلى حسن',         '01556789012', 'layla@example.com', 'كورس البرمجة الشاملة',  'كريستين', 'interested', 'Facebook'),
  ('00000000-0000-0000-0001-000000000002', 'محمود سامي',       '01667890123', NULL,                'كورس الذكاء الاصطناعي','كريستين', 'contacted',  'Instagram'),
  ('00000000-0000-0000-0001-000000000003', 'نادية فؤاد',       '01778901234', 'nadia@example.com', 'كورس التصميم الجرافيكي','حامد',   'new',        'Website'),
  ('00000000-0000-0000-0001-000000000004', 'طارق عبد الرحمن',  '01889012345', NULL,                'كورس التسويق الرقمي',   'هبه',    'lost',       'Referral'),
  ('00000000-0000-0000-0001-000000000005', 'رانيا مصطفى',      '01990123456', 'rania@example.com', 'كورس إدارة المشاريع',   'أيمن',   'enrolled',   'Facebook'),
  ('00000000-0000-0000-0001-000000000006', 'عمر فريد',         '01101234567', NULL,                'كورس تحليل البيانات',   'نورهان', 'interested', 'LinkedIn');

INSERT INTO public.feedback (lead_id, date, notes, sentiment) VALUES
  ('00000000-0000-0000-0001-000000000001', '2026-03-20', 'العميلة مهتمة جداً بكورس البرمجة، لديها خلفية في Excel', 'positive'),
  ('00000000-0000-0000-0001-000000000002', '2026-03-22', 'يريد معرفة المزيد عن منهج الكورس والشهادة', 'neutral'),
  ('00000000-0000-0000-0001-000000000004', '2026-03-15', 'السعر مرتفع بالنسبة له، ذهب لمنافس', 'negative'),
  ('00000000-0000-0000-0001-000000000005', '2026-03-18', 'سعيدة بالتسجيل وترحب بالبدء', 'positive'),
  ('00000000-0000-0000-0001-000000000006', '2026-03-21', 'يعمل في مجال المحاسبة ويريد الانتقال لتحليل البيانات', 'positive');

INSERT INTO public.follow_ups (lead_id, scheduled_date, notes, status, type) VALUES
  ('00000000-0000-0000-0001-000000000001', '2026-03-22', 'تم التواصل، ترسل تأكيدها في نهاية الأسبوع', 'done',    'call'),
  ('00000000-0000-0000-0001-000000000001', '2026-03-25', 'متابعة قرار التسجيل',                          'pending', 'whatsapp'),
  ('00000000-0000-0000-0001-000000000002', '2026-03-24', 'إرسال برنامج الكورس التفصيلي',                 'pending', 'email'),
  ('00000000-0000-0000-0001-000000000004', '2026-03-12', 'اتصال للتفاوض على سعر',                        'done',    'call'),
  ('00000000-0000-0000-0001-000000000005', '2026-03-17', 'تأكيد التسجيل وإرسال تفاصيل الكورس',          'done',    'whatsapp'),
  ('00000000-0000-0000-0001-000000000006', '2026-03-26', 'عرض تقديمي للكورس',                            'pending', 'meeting');

-- ── Seed call logs ───────────────────────────────────────────────────────────
INSERT INTO public.call_logs (employee_name, call_date, call_count) VALUES
  ('كريستين', '2026-03-24', 12),
  ('حامد',    '2026-03-24', 9),
  ('هبه',     '2026-03-24', 11),
  ('أيمن',    '2026-03-24', 14),
  ('نورهان',  '2026-03-24', 8),
  ('يوسف',    '2026-03-24', 10),
  ('إيلاريا', '2026-03-24', 13),
  ('كريستين', '2026-03-23', 10),
  ('حامد',    '2026-03-23', 11),
  ('هبه',     '2026-03-23', 7),
  ('أيمن',    '2026-03-23', 15),
  ('نورهان',  '2026-03-23', 9),
  ('يوسف',    '2026-03-23', 8),
  ('إيلاريا', '2026-03-23', 12)
ON CONFLICT (employee_name, call_date) DO NOTHING;
