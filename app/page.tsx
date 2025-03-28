import { ExamForm } from "@/components/exam-form"
import { TaskList } from "@/components/task-list"
import { auth } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function Home() {
  const { userId } = await auth()

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">定期考査タスク分解アプリ</h1>
          <p className="text-gray-600">試験範囲を入力すれば、AIがあなたの学習タスクを自動生成します</p>
        </header>

        {userId ? (
          <>
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">試験範囲を入力</h2>
              <ExamForm />
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-700">学習タスク一覧</h2>
              <TaskList />
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">アプリを使用するにはログインが必要です</h2>
            <p className="text-gray-600 mb-6">タスクの生成や管理を行うには、アカウントにログインしてください。</p>
            <Button asChild>
              <Link href="/sign-in">ログイン / 新規登録</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}

