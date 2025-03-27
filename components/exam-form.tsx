"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, X } from "lucide-react"
import { useTaskStore } from "@/lib/task-store"
import { v4 as uuidv4 } from "uuid"

// 科目の選択肢
const SUBJECTS = ["英語", "数学", "国語", "理科", "社会"]

type SubjectEntry = {
  id: string
  subject: string
  examScope: string
}

// 初期エントリー用の固定ID
const INITIAL_ENTRY_ID = "initial-subject-entry"

export function ExamForm() {
  const [mounted, setMounted] = useState(false)
  const [subjectEntries, setSubjectEntries] = useState<SubjectEntry[]>([
    { id: INITIAL_ENTRY_ID, subject: "", examScope: "" },
  ])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { setTasks } = useTaskStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  // 科目エントリーを追加
  const addSubjectEntry = () => {
    setSubjectEntries([...subjectEntries, { id: uuidv4(), subject: "", examScope: "" }])
  }

  // 科目エントリーを削除
  const removeSubjectEntry = (id: string) => {
    if (subjectEntries.length > 1) {
      setSubjectEntries(subjectEntries.filter((entry) => entry.id !== id))
    } else {
      toast({
        title: "最低1つの科目が必要です",
        description: "少なくとも1つの科目を設定してください",
        variant: "destructive",
      })
    }
  }

  // 科目の更新
  const updateSubject = (id: string, subject: string) => {
    setSubjectEntries(subjectEntries.map((entry) => (entry.id === id ? { ...entry, subject } : entry)))
  }

  // 試験範囲の更新
  const updateExamScope = (id: string, examScope: string) => {
    setSubjectEntries(subjectEntries.map((entry) => (entry.id === id ? { ...entry, examScope } : entry)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // バリデーション
    const invalidEntries = subjectEntries.filter((entry) => !entry.subject || !entry.examScope.trim())

    if (invalidEntries.length > 0) {
      toast({
        title: "入力エラー",
        description: "すべての科目と試験範囲を入力してください",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/generate-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subjectEntries }),
      })

      if (!response.ok) {
        throw new Error("タスク生成に失敗しました")
      }

      const data = await response.json()
      setTasks(data.tasks)

      toast({
        title: "タスク生成完了",
        description: `${data.tasks.length}個のタスクが生成されました`,
      })
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "エラーが発生しました",
        description: "タスクの生成中にエラーが発生しました。もう一度お試しください。",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {subjectEntries.map((entry, index) => (
        <Card key={entry.id} className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-md font-medium">科目 {index + 1}</h3>
            {subjectEntries.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSubjectEntry(entry.id)}
                aria-label="科目を削除"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={`subject-${entry.id}`}>科目</Label>
              <Select
                defaultValue={entry.subject}
                value={entry.subject}
                onValueChange={(value) => updateSubject(entry.id, value)}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="科目を選択" />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`examScope-${entry.id}`}>試験範囲・内容</Label>
              <Textarea
                id={`examScope-${entry.id}`}
                placeholder="例: 教科書p.20-35、問題集Unit1-3、関数と方程式の応用..."
                value={entry.examScope}
                onChange={(e) => updateExamScope(entry.id, e.target.value)}
                rows={3}
                disabled={loading}
                className="resize-none"
              />
            </div>
          </div>
        </Card>
      ))}

      <Button type="button" variant="outline" className="w-full" onClick={addSubjectEntry} disabled={loading}>
        <Plus className="mr-2 h-4 w-4" />
        科目を追加
      </Button>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            タスク生成中...
          </>
        ) : (
          "学習タスクを生成する"
        )}
      </Button>
    </form>
  )
}
