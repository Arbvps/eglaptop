"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useTasks, TEAM_MEMBERS } from "@/lib/store"
import { Plus, Trash2, Calendar, User, ListTodo } from "lucide-react"

export function TasksPanel() {
  const { tasks, addTask, toggleTask, deleteTask } = useTasks()
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<string>("all")
  
  const [newTask, setNewTask] = useState({
    title: "",
    assignee: "",
    dueDate: "",
    priority: "medium" as "high" | "medium" | "low"
  })

  const handleAddTask = () => {
    if (newTask.title && newTask.assignee && newTask.dueDate) {
      addTask({
        ...newTask,
        completed: false
      })
      setNewTask({ title: "", assignee: "", dueDate: "", priority: "medium" })
      setIsOpen(false)
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === "completed") return task.completed
    if (filter === "pending") return !task.completed
    if (filter === "high") return task.priority === "high"
    return true
  })

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">عالية</Badge>
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">متوسطة</Badge>
      case "low":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">منخفضة</Badge>
      default:
        return null
    }
  }

  const completedCount = tasks.filter(t => t.completed).length
  const pendingCount = tasks.filter(t => !t.completed).length
  const highPriorityCount = tasks.filter(t => t.priority === "high" && !t.completed).length

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
          <CardContent className="pt-6">
            <p className="text-sm text-emerald-100">مكتملة</p>
            <p className="text-3xl font-bold">{completedCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
          <CardContent className="pt-6">
            <p className="text-sm text-orange-100">معلقة</p>
            <p className="text-3xl font-bold">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-lg">
          <CardContent className="pt-6">
            <p className="text-sm text-red-100">أولوية عالية</p>
            <p className="text-3xl font-bold">{highPriorityCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Card */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <ListTodo className="size-6" />
              </div>
              <div>
                <CardTitle>المهام اليومية</CardTitle>
                <CardDescription className="text-blue-100">إدارة ومتابعة مهام فريق المبيعات</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-[140px] bg-white/20 border-white/30 text-white">
                  <SelectValue placeholder="تصفية" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="pending">معلقة</SelectItem>
                  <SelectItem value="completed">مكتملة</SelectItem>
                  <SelectItem value="high">أولوية عالية</SelectItem>
                </SelectContent>
              </Select>
              
              <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-white text-blue-600 hover:bg-blue-50">
                    <Plus className="size-4" />
                    مهمة جديدة
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>إضافة مهمة جديدة</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>عنوان المهمة</Label>
                      <Input
                        value={newTask.title}
                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                        placeholder="أدخل عنوان المهمة"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>المسؤول</Label>
                      <Select
                        value={newTask.assignee}
                        onValueChange={(value) => setNewTask({ ...newTask, assignee: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المسؤول" />
                        </SelectTrigger>
                        <SelectContent>
                          {TEAM_MEMBERS.map((member) => (
                            <SelectItem key={member} value={member}>
                              {member}
                            </SelectItem>
                          ))}
                          <SelectItem value="الجميع">الجميع</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>تاريخ الاستحقاق</Label>
                      <Input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>الأولوية</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value: "high" | "medium" | "low") => setNewTask({ ...newTask, priority: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">عالية</SelectItem>
                          <SelectItem value="medium">متوسطة</SelectItem>
                          <SelectItem value="low">منخفضة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
                    <Button onClick={handleAddTask} className="bg-blue-500 hover:bg-blue-600">إضافة</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                لا توجد مهام
              </div>
            ) : (
              filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-start gap-4 p-4 rounded-lg border transition-all hover:shadow-md ${
                    task.completed ? "bg-slate-50 opacity-60" : "bg-white"
                  }`}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => toggleTask(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                      {task.title}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="size-3" />
                        {task.assignee}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(task.dueDate).toLocaleDateString('ar-EG')}
                      </span>
                      {getPriorityBadge(task.priority)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteTask(task.id)}
                    className="text-destructive hover:text-destructive shrink-0"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
