import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Task = {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  completed: boolean
  subject: string // 科目を追加
}

type TaskStore = {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  toggleTask: (id: string) => void
  getCompletionPercentage: () => number
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      setTasks: (tasks) => set({ tasks }),
      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)),
        })),
      getCompletionPercentage: () => {
        const { tasks } = get()
        if (tasks.length === 0) return 0
        const completedTasks = tasks.filter((task) => task.completed).length
        return Math.round((completedTasks / tasks.length) * 100)
      },
      pletionPercentage: () => {
        const { tasks } = get()
        if (tasks.length === 0) return 0
        const completedTasks = tasks.filter((task) => task.completed).length
        return Math.round((completedTasks / tasks.length) * 100)
      },
    }),
    {
      name: "exam-tasks-storage",
    },
  ),
)

