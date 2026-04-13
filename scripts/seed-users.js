import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('[v0] Missing SUPABASE env vars')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const TEAM_USERS = [
  { email: 'admin@tavoc.academy',      password: 'Tavoc@2024!', full_name: 'مدير النظام',  role: 'super_admin', team_member_name: null,       phone: '01000000000' },
  { email: 'norhan@tavoc.academy',     password: 'Tavoc@2024!', full_name: 'نورهان',        role: 'manager',     team_member_name: 'نورهان',   phone: '01011111111' },
  { email: 'christine@tavoc.academy',  password: 'Tavoc@2024!', full_name: 'كريستين',       role: 'sales',       team_member_name: 'كريستين',  phone: '01022222222' },
  { email: 'hamed@tavoc.academy',      password: 'Tavoc@2024!', full_name: 'حامد',          role: 'sales',       team_member_name: 'حامد',     phone: '01033333333' },
  { email: 'heba@tavoc.academy',       password: 'Tavoc@2024!', full_name: 'هبه',           role: 'sales',       team_member_name: 'هبه',      phone: '01044444444' },
  { email: 'ayman@tavoc.academy',      password: 'Tavoc@2024!', full_name: 'أيمن',          role: 'sales',       team_member_name: 'أيمن',     phone: '01055555555' },
  { email: 'youssef@tavoc.academy',    password: 'Tavoc@2024!', full_name: 'يوسف',          role: 'sales',       team_member_name: 'يوسف',     phone: '01066666666' },
  { email: 'ilaria@tavoc.academy',     password: 'Tavoc@2024!', full_name: 'إيلاريا',       role: 'sales',       team_member_name: 'إيلاريا',  phone: '01077777777' },
  { email: 'viewer@tavoc.academy',     password: 'Tavoc@2024!', full_name: 'مشاهد',         role: 'viewer',      team_member_name: null,       phone: '01088888888' },
]

async function seedUsers() {
  console.log('[v0] Starting user seed...')

  for (const user of TEAM_USERS) {
    // Create auth user
    const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name,
        role: user.role,
      }
    })

    if (authErr) {
      if (authErr.message?.includes('already been registered')) {
        console.log(`[v0] User already exists: ${user.email} - skipping`)
        continue
      }
      console.error(`[v0] Error creating auth user ${user.email}:`, authErr.message)
      continue
    }

    const userId = authData.user?.id
    if (!userId) {
      console.error(`[v0] No user ID returned for ${user.email}`)
      continue
    }

    console.log(`[v0] Created auth user: ${user.email} (${userId})`)

    // Upsert profile
    const { error: profileErr } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        team_member_name: user.team_member_name,
        phone: user.phone,
        is_active: true,
        status: 'active',
      }, { onConflict: 'id' })

    if (profileErr) {
      console.error(`[v0] Error creating profile for ${user.email}:`, profileErr.message)
    } else {
      console.log(`[v0] Profile created for: ${user.full_name} (${user.role})`)
    }
  }

  // Seed notifications table
  console.log('[v0] Creating notifications table if not exists...')
  const { error: notifErr } = await supabase.rpc('create_notifications_if_not_exists').maybeSingle()
  if (notifErr && !notifErr.message.includes('does not exist')) {
    console.log('[v0] Notifications table note:', notifErr.message)
  }

  console.log('[v0] Done! Users seeded successfully.')
  console.log('[v0] Login credentials:')
  TEAM_USERS.forEach(u => {
    console.log(`[v0]   ${u.full_name.padEnd(12)} | ${u.email.padEnd(30)} | ${u.password} | Role: ${u.role}`)
  })
}

seedUsers().catch(console.error)
