"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useTeam, useSales } from "@/lib/store"
import { Trophy, Target, TrendingUp, Award, Users } from "lucide-react"
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts"

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

export function TeamPerformance() {
  const { team } = useTeam()
  const { sales } = useSales()

  const totalTarget = team.reduce((sum, m) => sum + m.target, 0)
  const totalAchieved = team.reduce((sum, m) => sum + m.sales, 0)
  const achievementRate = Math.round((totalAchieved / totalTarget) * 100)

  const topPerformer = team.reduce((top, member) => 
    (member.sales / member.target) > (top.sales / top.target) ? member : top
  , team[0])

  const salesByMember = team.map((member, index) => {
    const memberSales = sales.filter(s => s.salesperson === member.name)
    return {
      name: member.name,
      عمليات: memberSales.length,
      مبيعات: member.sales,
      fill: COLORS[index % COLORS.length]
    }
  })

  const weeklyData = [
    { day: 'السبت', مبيعات: 18000 },
    { day: 'الأحد', مبيعات: 22000 },
    { day: 'الإثنين', مبيعات: 25000 },
    { day: 'الثلاثاء', مبيعات: 19000 },
    { day: 'الأربعاء', مبيعات: 28000 },
    { day: 'الخميس', مبيعات: 32000 },
    { day: 'الجمعة', مبيعات: 12000 },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-white/20">
                <Target className="size-6" />
              </div>
              <div>
                <p className="text-sm text-blue-100">الهدف الإجمالي</p>
                <p className="text-xl font-bold">{totalTarget.toLocaleString('ar-EG')} ج.م</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-white/20">
                <TrendingUp className="size-6" />
              </div>
              <div>
                <p className="text-sm text-emerald-100">المحقق</p>
                <p className="text-xl font-bold">{totalAchieved.toLocaleString('ar-EG')} ج.م</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-white/20">
                <Award className="size-6" />
              </div>
              <div>
                <p className="text-sm text-orange-100">نسبة الإنجاز</p>
                <p className="text-xl font-bold">{achievementRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white border-0 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-white/20">
                <Trophy className="size-6" />
              </div>
              <div>
                <p className="text-sm text-yellow-100">الأفضل أداءً</p>
                <p className="text-xl font-bold">{topPerformer?.name}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle>المبيعات الأسبوعية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => `${value.toLocaleString('ar-EG')} ج.م`}
                    contentStyle={{ direction: 'rtl' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="مبيعات" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle>مبيعات كل مندوب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByMember} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={70} />
                  <Tooltip 
                    formatter={(value: number) => `${value.toLocaleString('ar-EG')} ج.م`}
                    contentStyle={{ direction: 'rtl' }} 
                  />
                  <Bar dataKey="مبيعات" radius={4}>
                    {salesByMember.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users className="size-6" />
            </div>
            <div>
              <CardTitle>أداء فريق المبيعات - TAVOC</CardTitle>
              <CardDescription className="text-blue-100">تتبع تقدم كل عضو نحو هدفه</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {team.map((member, index) => {
              const progress = Math.round((member.sales / member.target) * 100)
              const isOverTarget = progress >= 100
              
              return (
                <div key={member.id} className="p-4 rounded-xl border bg-gradient-to-br from-slate-50 to-white hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-12 border-2" style={{ borderColor: COLORS[index % COLORS.length] }}>
                        <AvatarFallback 
                          className="text-white font-bold"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        >
                          {member.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-lg">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    {isOverTarget && (
                      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1">
                        <Trophy className="size-3" />
                        تجاوز الهدف!
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">المحقق</span>
                      <span className="font-bold">{member.sales.toLocaleString('ar-EG')} / {member.target.toLocaleString('ar-EG')} ج.م</span>
                    </div>
                    <Progress 
                      value={Math.min(progress, 100)} 
                      className="h-3"
                      style={{ 
                        ['--progress-color' as string]: isOverTarget ? '#22c55e' : COLORS[index % COLORS.length]
                      }}
                    />
                    <div className="flex justify-between text-xs">
                      <span className="font-medium" style={{ color: COLORS[index % COLORS.length] }}>{progress}%</span>
                      {!isOverTarget && (
                        <span className="text-muted-foreground">
                          متبقي {(member.target - member.sales).toLocaleString('ar-EG')} ج.م
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
