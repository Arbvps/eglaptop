"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSales, TEAM_MEMBERS } from "@/lib/store"
import { Search, Download, Trash2, FileText } from "lucide-react"

export function SalesTable() {
  const { sales, deleteSale } = useSales()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [salespersonFilter, setSalespersonFilter] = useState<string>("all")

  const filteredSales = sales.filter((sale) => {
    const matchesSearch = 
      sale.customerName.toLowerCase().includes(search.toLowerCase()) ||
      sale.course.toLowerCase().includes(search.toLowerCase()) ||
      sale.salesperson.toLowerCase().includes(search.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter
    const matchesSalesperson = salespersonFilter === "all" || sale.salesperson === salespersonFilter
    
    let matchesDate = true
    if (dateFilter === "today") {
      matchesDate = sale.date === "2026-03-24"
    } else if (dateFilter === "week") {
      matchesDate = sale.date >= "2026-03-18"
    }
    
    return matchesSearch && matchesStatus && matchesDate && matchesSalesperson
  })

  const totalAmount = filteredSales.reduce((sum, sale) => sum + sale.amount, 0)
  const totalQuantity = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">مكتمل</Badge>
      case "pending":
        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">معلق</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">ملغي</Badge>
      default:
        return null
    }
  }

  const exportCSV = () => {
    const headers = ["العميل", "الكورس", "المبلغ", "الكمية", "المندوب", "التاريخ", "الحالة"]
    const rows = filteredSales.map(sale => [
      sale.customerName,
      sale.course,
      sale.amount,
      sale.quantity,
      sale.salesperson,
      sale.date,
      sale.status
    ])
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n")
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `tavoc-sales-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
          <CardContent className="pt-6">
            <p className="text-sm text-emerald-100">إجمالي المبيعات</p>
            <p className="text-2xl font-bold">{totalAmount.toLocaleString('ar-EG')} ج.م</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-100">عدد العمليات</p>
            <p className="text-2xl font-bold">{filteredSales.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
          <CardContent className="pt-6">
            <p className="text-sm text-orange-100">إجمالي المشتركين</p>
            <p className="text-2xl font-bold">{totalQuantity}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FileText className="size-6" />
              </div>
              <div>
                <CardTitle>تقرير المبيعات</CardTitle>
                <CardDescription className="text-blue-100">عرض وتصفية جميع عمليات البيع</CardDescription>
              </div>
            </div>
            <Button variant="secondary" onClick={exportCSV} className="gap-2 bg-white text-blue-600 hover:bg-blue-50">
              <Download className="size-4" />
              تصدير CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن عميل، كورس، أو مندوب..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="ps-10 border-slate-200"
              />
            </div>
            <Select value={salespersonFilter} onValueChange={setSalespersonFilter}>
              <SelectTrigger className="w-full sm:w-[150px] border-slate-200">
                <SelectValue placeholder="المندوب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المندوبين</SelectItem>
                {TEAM_MEMBERS.map((member) => (
                  <SelectItem key={member} value={member}>{member}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px] border-slate-200">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[150px] border-slate-200">
                <SelectValue placeholder="التاريخ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع التواريخ</SelectItem>
                <SelectItem value="today">اليوم</SelectItem>
                <SelectItem value="week">هذا الأسبوع</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-bold">العميل</TableHead>
                  <TableHead className="font-bold">الكورس</TableHead>
                  <TableHead className="font-bold">المبلغ</TableHead>
                  <TableHead className="font-bold">المشتركين</TableHead>
                  <TableHead className="font-bold">المندوب</TableHead>
                  <TableHead className="font-bold">التاريخ</TableHead>
                  <TableHead className="font-bold">الحالة</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      لا توجد نتائج
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSales.map((sale) => (
                    <TableRow key={sale.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{sale.customerName}</TableCell>
                      <TableCell>{sale.course}</TableCell>
                      <TableCell className="font-bold text-emerald-600">{sale.amount.toLocaleString('ar-EG')} ج.م</TableCell>
                      <TableCell>{sale.quantity}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{sale.salesperson}</Badge>
                      </TableCell>
                      <TableCell>{new Date(sale.date).toLocaleDateString('ar-EG')}</TableCell>
                      <TableCell>{getStatusBadge(sale.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteSale(sale.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
