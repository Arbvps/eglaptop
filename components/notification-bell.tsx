'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { type UserProfile, ROLE_LABELS, ROLE_COLORS } from '@/lib/auth-types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell, X, CheckCheck, Info, CheckCircle, AlertTriangle, XCircle, PhoneCall, ShoppingCart, ListTodo, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

type Notification = {
  id: string
  title: string
  body: string
  type: string
  is_read: boolean
  link: string | null
  created_at: string
}

const typeIcon: Record<string, React.ElementType> = {
  info: Info, success: CheckCircle, warning: AlertTriangle,
  error: XCircle, lead: PhoneCall, sale: ShoppingCart,
  task: ListTodo, message: MessageSquare,
}
const typeBg: Record<string, string> = {
  info: 'bg-blue-50 text-blue-600', success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600', error: 'bg-red-50 text-red-600',
  lead: 'bg-purple-50 text-purple-600', sale: 'bg-orange-50 text-orange-600',
  task: 'bg-cyan-50 text-cyan-600', message: 'bg-slate-50 text-slate-600',
}

export function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const supabase = createClient()
  const ref = useRef<HTMLDivElement>(null)

  const unread = notifications.filter(n => !n.is_read).length

  const load = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (data) setNotifications(data)
  }

  useEffect(() => {
    load()
    // Realtime subscription
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, () => load())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
  }

  const markAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
  }

  const deleteNotif = async (id: string) => {
    await supabase.from('notifications').delete().eq('id', id)
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const relative = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    if (diff < 60000) return 'الآن'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} د`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} س`
    return new Date(date).toLocaleDateString('ar-EG')
  }

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative size-9 p-0 hover:bg-slate-100"
        onClick={() => setOpen(o => !o)}
      >
        <Bell className="size-5 text-slate-600" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -end-0.5 size-4 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute end-0 top-11 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center gap-2">
              <Bell className="size-4 text-orange-500" />
              <span className="font-bold text-sm">الإشعارات</span>
              {unread > 0 && <Badge className="bg-red-100 text-red-600 text-xs">{unread} جديد</Badge>}
            </div>
            {unread > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs gap-1 text-blue-600 hover:bg-blue-50 h-7">
                <CheckCheck className="size-3" />قراءة الكل
              </Button>
            )}
          </div>

          <ScrollArea className="h-80">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                <Bell className="size-10 mb-2 opacity-20" />
                <p className="text-sm">لا توجد إشعارات</p>
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map(n => {
                  const Icon = typeIcon[n.type] || Info
                  return (
                    <div
                      key={n.id}
                      className={cn('flex gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors', !n.is_read && 'bg-blue-50/40')}
                      onClick={() => markRead(n.id)}
                    >
                      <div className={cn('size-8 rounded-full flex items-center justify-center shrink-0 mt-0.5', typeBg[n.type] || typeBg.info)}>
                        <Icon className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm leading-snug', !n.is_read && 'font-semibold')}>{n.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{relative(n.created_at)}</p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); deleteNotif(n.id) }}
                        className="text-muted-foreground hover:text-red-500 shrink-0 mt-0.5"
                      >
                        <X className="size-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
