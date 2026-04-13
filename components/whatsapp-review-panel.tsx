'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface PendingMessage {
  id: string
  phone_number: string
  contact_name: string
  incoming_message: string
  ai_suggestion: string
  timestamp: string
  status: 'pending' | 'approved' | 'rejected'
}

export function WhatsAppReviewPanel() {
  const [messages, setMessages] = useState<PendingMessage[]>([
    {
      id: '1',
      phone_number: '+201001234567',
      contact_name: 'أحمد محمد',
      incoming_message: 'السلام عليكم، هل لديكم دورات للمبتدئين؟',
      ai_suggestion:
        'وعليكم السلام ورحمة الله وبركاته! نعم بالفعل، لدينا برنامج تدريبي شامل مخصص للمبتدئين. يمكنك البدء بدبلومة التعليق الصوتي المتقدم التي تغطي كل أنواع التعليق.',
      timestamp: new Date().toISOString(),
      status: 'pending',
    },
    {
      id: '2',
      phone_number: '+201009876543',
      contact_name: 'فاطمة علي',
      incoming_message: 'كم تكلفة الدورة؟',
      ai_suggestion:
        'تكلفة دبلومة التعليق الصوتي المتقدم 15,000 جنيه مصري. لكن لا تقلقي، نوفر نظام تقسيط مرن على 3 دفعات. هل تريدين المزيد من المعلومات؟',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'pending',
    },
  ])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editedResponse, setEditedResponse] = useState('')

  const handleApprove = (id: string) => {
    const message = messages.find((m) => m.id === id)
    if (message) {
      console.log('[v0] Approving and sending message to', message.phone_number)
      // Send via WhatsApp API
      setMessages(messages.map((m) => (m.id === id ? { ...m, status: 'approved' } : m)))
    }
  }

  const handleEdit = (id: string, suggestion: string) => {
    setEditingId(id)
    setEditedResponse(suggestion)
  }

  const handleSaveEdit = (id: string) => {
    setMessages(
      messages.map((m) =>
        m.id === id ? { ...m, ai_suggestion: editedResponse, status: 'approved' } : m
      )
    )
    setEditingId(null)
  }

  const handleReject = (id: string) => {
    setMessages(messages.map((m) => (m.id === id ? { ...m, status: 'rejected' } : m)))
  }

  const pendingCount = messages.filter((m) => m.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">مراجعة رسائل واتساب</h2>
        <Badge variant="default" className="text-lg px-3 py-1">
          {pendingCount} قيد الانتظار
        </Badge>
      </div>

      {pendingCount === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">لا توجد رسائل في الانتظار</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <Card
              key={message.id}
              className={`p-6 border-l-4 ${
                message.status === 'pending'
                  ? 'border-l-yellow-400 bg-yellow-50'
                  : message.status === 'approved'
                    ? 'border-l-green-400 bg-green-50'
                    : 'border-l-red-400 bg-red-50'
              }`}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{message.contact_name}</h3>
                    <p className="text-sm text-gray-600">{message.phone_number}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(message.timestamp).toLocaleString('ar-EG')}
                    </p>
                  </div>
                  <Badge
                    variant={
                      message.status === 'pending'
                        ? 'secondary'
                        : message.status === 'approved'
                          ? 'default'
                          : 'destructive'
                    }
                  >
                    {message.status === 'pending'
                      ? 'قيد الانتظار'
                      : message.status === 'approved'
                        ? 'موافق عليه'
                        : 'مرفوض'}
                  </Badge>
                </div>

                {/* Customer Message */}
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm font-medium text-gray-700 mb-1">رسالة العميل:</p>
                  <p className="text-gray-800">{message.incoming_message}</p>
                </div>

                {/* AI Suggestion or Edit */}
                <div className="bg-white p-3 rounded border">
                  <p className="text-sm font-medium text-gray-700 mb-2">الرد المقترح:</p>
                  {editingId === message.id ? (
                    <Textarea
                      value={editedResponse}
                      onChange={(e) => setEditedResponse(e.target.value)}
                      className="min-h-24"
                    />
                  ) : (
                    <p className="text-gray-800">{message.ai_suggestion}</p>
                  )}
                </div>

                {/* Actions */}
                {message.status === 'pending' && (
                  <div className="flex gap-3">
                    {editingId === message.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(message.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          حفظ والموافقة
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingId(null)}
                        >
                          إلغاء
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(message.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          موافق عليه
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(message.id, message.ai_suggestion)}
                        >
                          تعديل
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(message.id)}
                        >
                          رفض
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
