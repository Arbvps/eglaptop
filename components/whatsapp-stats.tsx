'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, Send, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export function WhatsAppStats() {
  const stats = [
    {
      title: 'رسائل اليوم',
      value: '24',
      icon: MessageCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'رسائل مرسلة',
      value: '18',
      icon: Send,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'قيد المراجعة',
      value: '3',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'معدل الاستجابة',
      value: '89%',
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
                <span>{stat.title}</span>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
