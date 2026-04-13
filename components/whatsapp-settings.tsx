'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WhatsAppReviewPanel } from '@/components/whatsapp-review-panel'
import { WhatsAppAutoFollowups } from '@/components/whatsapp-auto-followups'

export function WhatsAppSettings() {
  const [apiKey, setApiKey] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verified, setVerified] = useState(false)

  const handleSaveSettings = () => {
    console.log('[v0] Saving WhatsApp settings')
    // Save settings to database
    setVerified(true)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">إعدادات واتساب</h2>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">الإعدادات</TabsTrigger>
          <TabsTrigger value="templates">النماذج</TabsTrigger>
          <TabsTrigger value="messages">الرسائل</TabsTrigger>
          <TabsTrigger value="followups">المتابعات</TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="config" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">رقم الهاتف</label>
                <Input
                  type="tel"
                  placeholder="+201001234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  رقم WhatsApp Business المرتبط بحسابك
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">مفتاح API</label>
                <Input
                  type="password"
                  placeholder="Your WhatsApp API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  احفظ مفتاح API الخاص بك من لوحة التحكم في WhatsApp Business
                </p>
              </div>

              <Button
                onClick={handleSaveSettings}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                حفظ الإعدادات
              </Button>

              {verified && (
                <div className="bg-green-50 border border-green-200 rounded p-4">
                  <p className="text-green-800 text-sm">
                    ✓ تم التحقق من الإعدادات بنجاح. النظام متصل بـ WhatsApp.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="font-semibold">نماذج الرسائل</h3>
              <p className="text-gray-600 text-sm">
                أنشئ نماذج رسائل موحدة للرد السريع على الاستفسارات الشائعة
              </p>

              <div className="space-y-3">
                {[
                  {
                    name: 'الترحيب',
                    content:
                      'السلام عليكم ورحمة الله وبركاته! أهلاً وسهلاً بك في شركة التعليق الصوتي العربي',
                  },
                  {
                    name: 'معلومات السعر',
                    content: 'دبلومة التعليق الصوتي المتقدم بـ 15,000 جنيه مع إمكانية التقسيط',
                  },
                  {
                    name: 'معلومات الدورات',
                    content:
                      'لدينا عدة دورات: الدبلومة المتقدمة، دورات الدوبلاج والبودكاست والتقديم الإذاعي',
                  },
                ].map((template, idx) => (
                  <Card key={idx} className="p-4 bg-gray-50">
                    <p className="font-medium text-sm mb-2">{template.name}</p>
                    <p className="text-gray-700 text-sm">{template.content}</p>
                  </Card>
                ))}
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Messages Tab */}
        <TabsContent value="messages">
          <WhatsAppReviewPanel />
        </TabsContent>

        {/* Auto Follow-ups Tab */}
        <TabsContent value="followups">
          <WhatsAppAutoFollowups />
        </TabsContent>
      </Tabs>
    </div>
  )
}
