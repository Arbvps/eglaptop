'use client'

import { useState, useEffect, useRef } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { type UserProfile, ROLE_LABELS, ROLE_COLORS } from '@/lib/auth-types'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { MessageSquare, Send, Search, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

type Profile = { id: string; full_name: string; role: string; is_active: boolean }
type Message = { id: string; sender_id: string; receiver_id: string; content: string; is_read: boolean; created_at: string }

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function ChatPage({ currentUser }: { currentUser: UserProfile }) {
  const supabase = createClient()
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const { data: users = [] } = useSWR<Profile[]>('/api/admin/users', fetcher)

  const contacts = users.filter(u =>
    u.id !== currentUser.id &&
    (u.full_name.includes(search) || ROLE_LABELS[u.role]?.includes(search))
  )

  const selected = users.find(u => u.id === selectedId)

  const loadMessages = async (otherId: string) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${currentUser.id})`)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)
    // Mark as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('sender_id', otherId)
      .eq('receiver_id', currentUser.id)
      .eq('is_read', false)
  }

  useEffect(() => {
    if (!selectedId) return
    loadMessages(selectedId)
    const channel = supabase.channel(`chat-${selectedId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => loadMessages(selectedId))
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [selectedId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!text.trim() || !selectedId) return
    setSending(true)
    const content = text.trim()
    setText('')
    await supabase.from('messages').insert({
      sender_id: currentUser.id,
      receiver_id: selectedId,
      content,
      is_read: false,
    })
    setSending(false)
  }

  const relative = (date: string) => {
    const d = new Date(date)
    return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
  }

  const initials = (name: string) => name.charAt(0)

  return (
    <div className="h-[calc(100vh-220px)] min-h-[500px] flex rounded-2xl overflow-hidden border bg-white shadow-sm">
      {/* Sidebar */}
      <div className="w-72 border-e flex flex-col shrink-0">
        <div className="p-3 border-b">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="size-4 text-orange-500" />
            <span className="font-bold text-sm">الرسائل</span>
          </div>
          <div className="relative">
            <Search className="absolute end-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="ابحث..."
              className="pe-8 h-8 text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          {contacts.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">لا يوجد مستخدمون</div>
          ) : (
            contacts.map(u => (
              <button
                key={u.id}
                onClick={() => setSelectedId(u.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors text-start',
                  selectedId === u.id && 'bg-orange-50 border-e-2 border-orange-500'
                )}
              >
                <div className="relative">
                  <div className="size-9 rounded-full bg-gradient-to-br from-orange-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {initials(u.full_name)}
                  </div>
                  {u.is_active && <Circle className="absolute bottom-0 end-0 size-2.5 fill-emerald-500 text-emerald-500" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold truncate">{u.full_name}</p>
                  <p className="text-[11px] text-muted-foreground">{ROLE_LABELS[u.role] || u.role}</p>
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat area */}
      {selectedId && selected ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b flex items-center gap-3 bg-slate-50/50">
            <div className="size-9 rounded-full bg-gradient-to-br from-orange-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {initials(selected.full_name)}
            </div>
            <div>
              <p className="font-bold text-sm">{selected.full_name}</p>
              <p className="text-[11px] text-muted-foreground">{ROLE_LABELS[selected.role]}</p>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.length === 0 && (
                <div className="text-center text-muted-foreground text-sm py-10">
                  <MessageSquare className="size-10 mx-auto mb-2 opacity-20" />
                  ابدأ محادثة مع {selected.full_name}
                </div>
              )}
              {messages.map(m => {
                const isMine = m.sender_id === currentUser.id
                return (
                  <div key={m.id} className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
                    <div className={cn(
                      'max-w-[70%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed',
                      isMine
                        ? 'bg-orange-500 text-white rounded-br-sm'
                        : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                    )}>
                      <p>{m.content}</p>
                      <p className={cn('text-[10px] mt-1 text-end', isMine ? 'text-orange-100' : 'text-muted-foreground')}>
                        {relative(m.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t flex gap-2">
            <Input
              placeholder="اكتب رسالة..."
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              className="flex-1"
              disabled={sending}
            />
            <Button
              onClick={sendMessage}
              disabled={!text.trim() || sending}
              className="bg-orange-500 hover:bg-orange-600 size-10 p-0 shrink-0"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <MessageSquare className="size-16 mx-auto mb-3 opacity-10" />
            <p className="font-semibold">اختر محادثة من القائمة</p>
            <p className="text-sm mt-1">تواصل مع أعضاء الفريق مباشرة</p>
          </div>
        </div>
      )}
    </div>
  )
}
