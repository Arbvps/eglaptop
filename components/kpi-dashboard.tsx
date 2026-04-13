'use client'

import useSWR from 'swr'
import { useTeam, useSales } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, TrendingDown, Target, Users, Award, BarChart2, ShoppingCart, AlertCircle } from 'lucide-react'
import { type UserProfile } from '@/lib/auth-types'

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4']

function KPICard({
  title, value, sub, icon: Icon, trend, color
}: {
  title: string; value: string; sub: string
  icon: React.ElementType; trend?: number; color: string
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-xl ${color}`}>
            <Icon className="size-5 text-white" />
          </div>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 text-xs font-semibold ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <p className="text-sm font-semibold text-slate-700 mt-0.5">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  )
}

export function KpiDashboard({ user }: { user: UserProfile }) {
  const { team } = useTeam()
  const { sales } = useSales()

  // Aggregate metrics
  const totalRevenue = sales.reduce((s, x) => s + x.amount, 0)
  const completedSales = sales.filter(s => s.status === 'completed')
  const pendingSales = sales.filter(s => s.status === 'pending')
  const totalDeals = completedSales.length
  const avgDeal = totalDeals > 0 ? Math.round(totalRevenue / totalDeals) : 0
  const conversionRate = sales.length > 0 ? Math.round((completedSales.length / sales.length) * 100) : 0

  // Sales by person
  const salesByPerson = team.map(m => ({
    name: m.name,
    مبيعات: m.sales,
    هدف: m.target,
    نسبة: m.target > 0 ? Math.round((m.sales / m.target) * 100) : 0
  }))

  // Sales by course
  const courseCounts: Record<string, number> = {}
  sales.forEach(s => {
    courseCounts[s.course] = (courseCounts[s.course] || 0) + s.amount
  })
  const byCourse = Object.entries(courseCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, value]) => ({ name: name.replace('كورس ', ''), value }))

  // Monthly trend (last 6 months)
  const monthlyMap: Record<string, number> = {}
  sales.forEach(s => {
    const d = new Date(s.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthlyMap[key] = (monthlyMap[key] || 0) + s.amount
  })
  const monthlyTrend = Object.entries(monthlyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, value]) => ({
      شهر: new Date(month + '-01').toLocaleDateString('ar-EG', { month: 'short' }),
      إيراد: value
    }))

  // Status distribution
  const statusData = [
    { name: 'مكتملة', value: completedSales.length, color: '#10b981' },
    { name: 'معلقة', value: pendingSales.length, color: '#f59e0b' },
    { name: 'ملغاة', value: sales.filter(s => s.status === 'cancelled').length, color: '#ef4444' },
  ].filter(d => d.value > 0)

  // Top performer
  const topPerformer = team.reduce((best, m) => (!best || m.sales > best.sales) ? m : best, team[0])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart2 className="size-6 text-orange-500" />
          لوحة قياس الأداء (KPI)
        </h2>
        <p className="text-sm text-muted-foreground">نظرة شاملة على مؤشرات الأداء الرئيسية</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="إجمالي الإيراد" value={`${(totalRevenue / 1000).toFixed(0)}k ج.م`} sub="كل الفترات" icon={TrendingUp} color="bg-orange-500" trend={12} />
        <KPICard title="صفقات مكتملة" value={totalDeals.toString()} sub={`من ${sales.length} إجمالي`} icon={ShoppingCart} color="bg-blue-500" trend={8} />
        <KPICard title="متوسط الصفقة" value={`${(avgDeal / 1000).toFixed(1)}k`} sub="ج.م لكل صفقة" icon={Target} color="bg-emerald-500" trend={-3} />
        <KPICard title="معدل التحويل" value={`${conversionRate}%`} sub="من ليد لعميل" icon={Users} color="bg-purple-500" trend={5} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Revenue by person */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><Users className="size-4 text-blue-500" />مبيعات الفريق مقابل الهدف</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={salesByPerson} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString('ar-EG')} ج.م`]} />
                <Legend />
                <Bar dataKey="مبيعات" fill="#f97316" radius={[4, 4, 0, 0]} />
                <Bar dataKey="هدف" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Pie */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><ShoppingCart className="size-4 text-orange-500" />توزيع المبيعات</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Monthly Trend */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="size-4 text-emerald-500" />الاتجاه الشهري للإيراد</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={monthlyTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="شهر" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip formatter={(v: number) => [`${v.toLocaleString('ar-EG')} ج.م`]} />
                <Line type="monotone" dataKey="إيراد" stroke="#f97316" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2"><Award className="size-4 text-amber-500" />ترتيب الفريق</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {team
              .slice()
              .sort((a, b) => b.sales - a.sales)
              .slice(0, 5)
              .map((m, i) => (
                <div key={m.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className={`size-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${i === 0 ? 'bg-amber-500' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-orange-400' : 'bg-slate-200 text-slate-600'}`}>{i + 1}</span>
                      <span className="font-medium">{m.name}</span>
                    </div>
                    <span className="font-bold text-slate-700">{m.target > 0 ? `${Math.round((m.sales / m.target) * 100)}%` : '0%'}</span>
                  </div>
                  <Progress value={m.target > 0 ? Math.min((m.sales / m.target) * 100, 100) : 0} className="h-1.5" />
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Course */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2"><BarChart2 className="size-4 text-purple-500" />الإيراد حسب الكورس</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={byCourse} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${v / 1000}k`} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
              <Tooltip formatter={(v: number) => [`${v.toLocaleString('ar-EG')} ج.م`]} />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {byCourse.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
