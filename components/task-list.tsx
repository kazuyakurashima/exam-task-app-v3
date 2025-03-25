"use client"

import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTaskStore } from "@/lib/task-store"
import { Progress } from "@/components/ui/progress"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Task = {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  completed: boolean
  subject: string
}

export function TaskList() {
  const { tasks, toggleTask, getCompletionPercentage } = useTaskStore()
  const [activeTab, setActiveTab] = useState<string>("all")

  if (tasks.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>タスクがありません</AlertTitle>
        <AlertDescription>上の入力フォームから試験範囲を入力して、学習タスクを生成してください。</AlertDescription>
      </Alert>
    )
  }

  // 科目ごとにタスクをグループ化
  const subjects = ["all", ...Array.from(new Set(tasks.map((task) => task.subject)))]

  // フィルタリングされたタスク
  const filteredTasks = activeTab === "all" ? tasks : tasks.filter((task) => task.subject === activeTab)

  // 科目別の完了率を計算
  const getSubjectCompletionPercentage = (subject: string) => {
    const subjectTasks = tasks.filter((task) => subject === "all" || task.subject === subject)
    if (subjectTasks.length === 0) return 0
    const completedTasks = subjectTasks.filter((t) => t.completed).length
    return Math.round((completedTasks / subjectTasks.length) * 100)
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">全体の進捗状況: {getCompletionPercentage()}%</span>
          <span className="text-sm text-gray-500">
            {tasks.filter((t) => t.completed).length}/{tasks.length} 完了
          </span>
        </div>
        <Progress value={getCompletionPercentage()} className="h-2" />
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex flex-wrap">
          {subjects.map((subject) => (
            <TabsTrigger key={subject} value={subject} className="flex-grow">
              {subject === "all" ? "すべて" : subject}
            </TabsTrigger>
          ))}
        </TabsList>

        {subjects.map((subject) => (
          <TabsContent key={subject} value={subject} className="mt-0">
            {subject !== "all" && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">
                    {subject}の進捗状況: {getSubjectCompletionPercentage(subject)}%
                  </span>
                  <span className="text-sm text-gray-500">
                    {tasks.filter((t) => t.subject === subject && t.completed).length}/
                    {tasks.filter((t) => t.subject === subject).length} 完了
                  </span>
                </div>
                <Progress value={getSubjectCompletionPercentage(subject)} className="h-2" />
              </div>
            )}

            <div className="space-y-4">
              {filteredTasks.map((task) => (
                <TaskItem key={task.id} task={task} onToggle={toggleTask} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function TaskItem({ task, onToggle }: { task: Task; onToggle: (id: string) => void }) {
  const priorityColors = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-green-100 text-green-800 border-green-200",
  }

  const priorityLabels = {
    high: "重要",
    medium: "標準",
    low: "補足",
  }

  return (
    <Card
      className={`p-4 border-l-4 ${task.completed ? "bg-gray-50 border-gray-300" : `border-l-${task.priority === "high" ? "red" : task.priority === "medium" ? "yellow" : "green"}-400`}`}
    >
      <div className="flex items-start gap-3">
        <Checkbox
          id={`task-${task.id}`}
          checked={task.completed}
          onCheckedChange={() => onToggle(task.id)}
          className="mt-1"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <label
                htmlFor={`task-${task.id}`}
                className={`font-medium ${task.completed ? "line-through text-gray-500" : "text-gray-900"}`}
              >
                {task.title}
              </label>
              <Badge variant="outline" className="text-xs">
                {task.subject}
              </Badge>
            </div>
            <Badge className={priorityColors[task.priority]}>{priorityLabels[task.priority]}</Badge>
          </div>
          <p className={`text-sm ${task.completed ? "text-gray-400" : "text-gray-600"}`}>{task.description}</p>
        </div>
      </div>
    </Card>
  )
}

