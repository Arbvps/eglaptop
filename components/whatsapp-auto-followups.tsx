'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Send, AlertCircle } from 'lucide-react'

interface FollowUp {
  id: string
  customer_name: string
  phone_number: string
  scheduled_date: string
  message_text: string
  status: 'pending' | 'sent' | 'failed'
  created_at: string
}

export function WhatsAppAutoFollowups() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([
    {
      id: '1',
      customer_name: 'أحمد محمد',
      phone_number: '+201001234567',
      scheduled_date: '2026-04-02',
      message_text: 'مرحباً بك! تذكير برغبتك في الالتحاق بدبلومة التعليق الصوتي. هل تحتاج لأي معلومات إضافية؟',
      status: 'pending',
      created_at: '2026-03-31T10:00:00Z',
    },
    {
      id: '2',
      customer_name: 'فاطمة علي',
      phone_number: '+201009876543',
      scheduled_date: '2026-04-03',
      message_text: 'نتطلع لرؤيتك في الدورة القادمة! اذا كان لديك أي استفسار لا تتردد في التواصل معنا.',
      status: 'pending',
      created_at: '2026-03-31T11:00:00Z',
    },
    {
      id: '3',
      customer_name: 'محمود حسن',
      phone_number: '+201102223333',
      scheduled_date: '2026-03-30',
      message_text: 'تم إرسال الرسالة بنجاح!',
      status: 'sent',
      created_at: '2026-03-30T14:30:00Z',
    },
  ])

  const handleSendNow = (id: string) => {
    console.log('[v0] Sending follow-up', id, 'now')
    setFollowUps(
      followUps.map((f) =>
        f.id === id
          ? { ...f, status: 'sent', scheduled_date: new Date().toISOString().split('T')[0] }
          : f
      )
    )
  }

  const handleRetry = (id: string) => {
    console.log('[v0] Retrying follow-up', id)
    setFollowUps(followUps.map((f) => (f.id === id ? { ...f, status: 'sent' } : f)))
  }

  const pendingCount = followUps.filter((f) => f.status === 'pending').length
  const sentCount = followUps.filter((f) => f.status === 'sent').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">المتابعات التلقائية عبر واتساب</h3>
        <div className="flex gap-2">
          <Badge variant="outline">{pendingCount} قيد الانتظار</Badge>
          <Badge variant="secondary">{sentCount} مرسل</Badge>
        </div>
      </div>

      <p className="text-sm text-gray-600">
        إرسال تلقائي للرسائل المجدولة من جدول المتابعات. يتم إرسالها في الميعاد المحدد أو يمكنك إرسالها الآن.
      </p>

      <div className="grid gap-4">
        {followUps.map((followUp) => (
          <Card
            key={followUp.id}
            className={`p-4 border-l-4 ${
              followUp.status === 'pending'
                ? 'border-l-yellow-400 bg-yellow-50'
                : followUp.status === 'sent'
                  ? 'border-l-green-400 bg-green-50'
                  : 'border-l-red-400 bg-red-50'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold">{followUp.customer_name}</h4>
                  <p className="text-sm text-gray-600">{followUp.phone_number}</p>
                </div>
                <Badge
                  variant={
                    followUp.status === 'pending'
                      ? 'secondary'
                      : followUp.status === 'sent'
                        ? 'default'
                        : 'destructive'
                  }
                >
                  {followUp.status === 'pending' && (
                    <>
                      <Clock className="w-3 h-3 me-1" />
                      قيد الانتظار
                    </>
                  )}
                  {followUp.status === 'sent' && (
                    <>
                      <CheckCircle className="w-3 h-3 me-1" />
                      مرسل
                    </>
                  )}
                  {followUp.status === 'failed' && (
                    <>
                      <AlertCircle className="w-3 h-3 me-1" />
                      فشل
                    </>
                  )}
                </Badge>
              </div>

              <div className="bg-white p-3 rounded text-sm">
                <p className="text-gray-800">{followUp.message_text}</p>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>موعد الإرسال: {new Date(followUp.scheduled_date).toLocaleDateString('ar-EG')}</span>
                {followUp.status === 'pending' && (
                  <Button size="sm" onClick={() => handleSendNow(followUp.id)}>
                    <Send className="w-3 h-3 me-1" />
                    إرسال الآن
                  </Button>
                )}
                {followUp.status === 'failed' && (
                  <Button size="sm" variant="outline" onClick={() => handleRetry(followUp.id)}>
                    إعادة محاولة
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
