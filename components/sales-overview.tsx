"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSales, useTasks, useTeam } from "@/lib/store"
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Users,
  CheckCircle,
  Clock,
  GraduationCap
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']

export function SalesOverview() {
  const { sales } = useSales()
  const { tasks } = useTasks()
  const { team } = useTeam()

  const todaySales = sales.filter(s => s.date === '2026-03-24')
  const totalToday = todaySales.reduce((sum, s) => sum + s.amount, 0)
  const totalSales = sales.reduce((sum, s) => sum + s.amount, 0)
  const completedTasks = tasks.filter(t => t.completed).length
  const pendingTasks = tasks.filter(t => !t.completed).length

  const salesByPerson = team.map((member, index) => ({
    name: member.name,
    مبيعات: member.sales,
    هدف: member.target,
    fill: COLORS[index % COLORS.length]
  }))

  const statusData = [
    { name: 'مكتمل', value: sales.filter(s => s.status === 'completed').length, color: '#22c55e' },
    { name: 'معلق', value: sales.filter(s => s.status === 'pending').length, color: '#f59e0b' },
    { name: 'ملغي', value: sales.filter(s => s.status === 'cancelled').length, color: '#ef4444' },
  ]

  const stats = [
    { title: 'مبيعات اليوم', value: `${totalToday.toLocaleString('ar-EG')} ج.م`, icon: DollarSign, gradient: 'from-emerald-500 to-emerald-600' },
    { title: 'إجمالي المبيعات', value: `${totalSales.toLocaleString('ar-EG')} ج.م`, icon: TrendingUp, gradient: 'from-blue-500 to-blue-600' },
    { title: 'عدد الطلبات', value: sales.length, icon: ShoppingCart, gradient: 'from-orange-500 to-orange-600' },
    { title: 'فريق المبيعات', value: team.length, icon: Users, gradient: 'from-purple-500 to-purple-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className={`bg-gradient-to-br ${stat.gradient} text-white border-0 shadow-lg`}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className="p-3 rounded-full bg-white/20">
                  <stat.icon className="size-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tasks Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">مهام مكتملة</p>
                <p className="text-2xl font-bold">{completedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600">
                <Clock className="size-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">مهام معلقة</p>
                <p className="text-2xl font-bold">{pendingTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Team Member */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle>أداء فريق المبيعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesByPerson} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={70} />
                  <Tooltip 
                    formatter={(value: number) => `${value.toLocaleString('ar-EG')} ج.م`}
                    contentStyle={{ direction: 'rtl' }}
                  />
                  <Bar dataKey="مبيعات" radius={4}>
                    {salesByPerson.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                  <Bar dataKey="هدف" fill="#e5e7eb" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sales Status */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle>حالة المبيعات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="size-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <GraduationCap className="size-6" />
            </div>
            <CardTitle>آخر مبيعات الكورسات</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {sales.slice(0, 6).map((sale, index) => (
              <div key={sale.id} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div 
                    className="size-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  >
                    {sale.customerName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold">{sale.customerName}</p>
                    <p className="text-sm text-muted-foreground">{sale.course}</p>
                  </div>
                </div>
                <div className="text-end">
                  <p className="font-bold text-lg text-emerald-600">{sale.amount.toLocaleString('ar-EG')} ج.م</p>
                  <p className="text-sm text-muted-foreground">{sale.salesperson}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
