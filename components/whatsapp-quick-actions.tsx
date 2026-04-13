'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MessageCircle, Phone, Send, Clock } from 'lucide-react'

export function WhatsAppQuickActions() {
  return (
    <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">إجراءات واتساب سريعة</h3>
        <p className="text-sm text-gray-600">
          إدارة الرسائل والمكالمات والمتابعات من هنا
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Button
            variant="outline"
            className="h-auto flex-col gap-2 p-4 border-green-200 hover:bg-green-100"
          >
            <MessageCircle className="w-5 h-5 text-green-600" />
            <span className="text-xs font-medium">رسائل</span>
            <span className="text-xs text-gray-600">3 قيد الانتظار</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col gap-2 p-4 border-blue-200 hover:bg-blue-100"
          >
            <Phone className="w-5 h-5 text-blue-600" />
            <span className="text-xs font-medium">مكالمات</span>
            <span className="text-xs text-gray-600">اتصل الآن</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col gap-2 p-4 border-purple-200 hover:bg-purple-100"
          >
            <Clock className="w-5 h-5 text-purple-600" />
            <span className="text-xs font-medium">متابعات</span>
            <span className="text-xs text-gray-600">5 مجدولة</span>
          </Button>

          <Button
            variant="outline"
            className="h-auto flex-col gap-2 p-4 border-orange-200 hover:bg-orange-100"
          >
            <Send className="w-5 h-5 text-orange-600" />
            <span className="text-xs font-medium">إرسال</span>
            <span className="text-xs text-gray-600">رسالة جديدة</span>
          </Button>
        </div>

        <div className="bg-white rounded p-3 text-xs text-gray-700 space-y-1">
          <p>
            <span className="font-semibold text-green-600">✓ متصل:</span> WhatsApp Business
          </p>
          <p>
            <span className="font-semibold text-green-600">✓ متصل:</span> Claude AI
          </p>
          <p className="text-gray-600">Issabel و AutoDialer جاهزين للتكوين</p>
        </div>
      </div>
    </Card>
  )
}
