'use client'

import { useState } from 'react'
import { useTeam, useSales, useStudents } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, FileSpreadsheet, Download, Printer } from 'lucide-react'

type ReportType = 'sales' | 'students' | 'team' | 'leads'

export function ExportPanel() {
  const { sales } = useSales()
  const { students } = useStudents()
  const { team } = useTeam()
  const [reportType, setReportType] = useState<ReportType>('sales')
  const [exporting, setExporting] = useState(false)

  const downloadCSV = () => {
    setExporting(true)
    let headers: string[] = []
    let rows: string[][] = []

    if (reportType === 'sales') {
      headers = ['الاسم', 'الكورس', 'المبلغ', 'الكمية', 'المندوب', 'التاريخ', 'الحالة']
      rows = sales.map(s => [s.customerName, s.course, s.amount.toString(), s.quantity.toString(), s.salesperson, s.date, s.status === 'completed' ? 'مكتمل' : s.status === 'pending' ? 'معلق' : 'ملغي'])
    } else if (reportType === 'students') {
      headers = ['الاسم', 'الهاتف', 'البريد', 'الكورس', 'المندوب', 'الإجمالي', 'المدفوع', 'المتبقي']
      rows = students.map(s => [s.name, s.phone, s.email, s.course, s.salesperson, s.totalFees.toString(), s.paidAmount.toString(), (s.totalFees - s.paidAmount).toString()])
    } else if (reportType === 'team') {
      headers = ['الاسم', 'الوظيفة', 'المبيعات', 'الهدف', 'نسبة الإنجاز', 'أيام الحضور']
      rows = team.map(m => [m.name, m.role, m.sales.toString(), m.target.toString(), m.target > 0 ? `${Math.round((m.sales / m.target) * 100)}%` : '0%', m.attendanceDays.toString()])
    }

    const BOM = '\uFEFF'
    const csv = BOM + [headers, ...rows].map(r => r.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tavoc-${reportType}-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
  }

  const printReport = () => {
    window.print()
  }

  const reportOptions: { value: ReportType; label: string; count: number; color: string }[] = [
    { value: 'sales',    label: 'تقرير المبيعات',   count: sales.length,    color: 'bg-orange-100 text-orange-700' },
    { value: 'students', label: 'تقرير الطلاب',      count: students.length, color: 'bg-blue-100 text-blue-700' },
    { value: 'team',     label: 'تقرير الفريق',      count: team.length,     color: 'bg-emerald-100 text-emerald-700' },
  ]

  const current = reportOptions.find(r => r.value === reportType)

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base"><Download className="size-5 text-orange-500" />تصدير التقارير</CardTitle>
        <CardDescription>صدِّر بياناتك بصيغة CSV (متوافقة مع Excel) أو اطبعها مباشرة</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="space-y-1.5 flex-1 min-w-40">
            <label className="text-sm font-medium">نوع التقرير</label>
            <Select value={reportType} onValueChange={v => setReportType(v as ReportType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reportOptions.map(o => (
                  <SelectItem key={o.value} value={o.value}>
                    <div className="flex items-center gap-2">
                      {o.label}
                      <Badge className={`text-xs ${o.color}`}>{o.count}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={downloadCSV}
              disabled={exporting}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
            >
              <FileSpreadsheet className="size-4" />
              {exporting ? 'جاري التصدير...' : 'تصدير Excel/CSV'}
            </Button>
            <Button onClick={printReport} variant="outline" className="gap-2">
              <Printer className="size-4" />
              طباعة
            </Button>
          </div>
        </div>
        {current && (
          <div className="bg-slate-50 rounded-lg p-3 text-sm flex items-center gap-2 text-muted-foreground">
            <FileText className="size-4 shrink-0" />
            سيتم تصدير <Badge className={current.color}>{current.count} سجل</Badge> من {current.label}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
