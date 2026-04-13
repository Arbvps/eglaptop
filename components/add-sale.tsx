"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSales, TEAM_MEMBERS, COURSES } from "@/lib/store"
import { CheckCircle, GraduationCap } from "lucide-react"

export function AddSale() {
  const { addSale } = useSales()
  const [success, setSuccess] = useState(false)
  
  const [form, setForm] = useState({
    customerName: "",
    course: "",
    amount: "",
    quantity: "1",
    salesperson: "",
    status: "completed" as const
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    addSale({
      customerName: form.customerName,
      course: form.course,
      amount: Number(form.amount),
      quantity: Number(form.quantity),
      salesperson: form.salesperson,
      date: new Date().toISOString().split('T')[0],
      status: form.status
    })
    
    setForm({
      customerName: "",
      course: "",
      amount: "",
      quantity: "1",
      salesperson: "",
      status: "completed"
    })
    
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <GraduationCap className="size-6" />
            </div>
            <div>
              <CardTitle>تسجيل عملية بيع جديدة</CardTitle>
              <CardDescription className="text-blue-100">أدخل تفاصيل عملية بيع الكورس</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {success && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-emerald-700">
              <CheckCircle className="size-5" />
              <span>تم تسجيل عملية البيع بنجاح!</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">اسم العميل</Label>
                <Input
                  id="customerName"
                  value={form.customerName}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  placeholder="أدخل اسم العميل"
                  required
                  className="border-slate-200 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label>الكورس</Label>
                <Select
                  value={form.course}
                  onValueChange={(value) => setForm({ ...form, course: value })}
                  required
                >
                  <SelectTrigger className="border-slate-200 focus:border-blue-500">
                    <SelectValue placeholder="اختر الكورس" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSES.map((course) => (
                      <SelectItem key={course} value={course}>
                        {course}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">المبلغ (ج.م)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  placeholder="0"
                  min="0"
                  required
                  className="border-slate-200 focus:border-blue-500"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="quantity">عدد المشتركين</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="1"
                  min="1"
                  required
                  className="border-slate-200 focus:border-blue-500"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>مندوب المبيعات</Label>
                <Select
                  value={form.salesperson}
                  onValueChange={(value) => setForm({ ...form, salesperson: value })}
                  required
                >
                  <SelectTrigger className="border-slate-200 focus:border-blue-500">
                    <SelectValue placeholder="اختر المندوب" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAM_MEMBERS.map((member) => (
                      <SelectItem key={member} value={member}>
                        {member}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>الحالة</Label>
                <Select
                  value={form.status}
                  onValueChange={(value: "completed" | "pending" | "cancelled") => setForm({ ...form, status: value })}
                >
                  <SelectTrigger className="border-slate-200 focus:border-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="pending">معلق</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md">
              تسجيل البيع
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
