import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

// タスクの型定義
type Task = {
  id: string
  title: string
  description: string
  priority: "high" | "medium" | "low"
  completed: boolean
  subject: string // 科目を追加
}

// 科目エントリーの型定義
type SubjectEntry = {
  id: string
  subject: string
  examScope: string
}

// AIからのレスポンスを処理する関数
async function processAIResponse(subjectEntry: SubjectEntry) {
  const { subject, examScope } = subjectEntry

  try {
    // Gemini APIを呼び出す
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY || "",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `科目: ${subject}\n試験範囲: ${examScope}\n\n上記の試験範囲に基づいて、中高生向けの効果的な学習タスクを5-8個程度作成してください。各タスクには、タイトル、詳細な説明、優先度（high/medium/low）を含めてください。以下のJSON形式で返してください:
                [
                  {
                    "title": "タスクのタイトル",
                    "description": "タスクの詳細な説明",
                    "priority": "high" または "medium" または "low"
                  },
                  ...
                ]
                `,
              },
            ],
          },
        ],
      }),
    })

    const data = await response.json()

    // Geminiからのレスポンスを解析
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const textContent = data.candidates[0].content.parts[0].text

      // JSONを抽出（テキスト内にJSONが埋め込まれている場合に対応）
      const jsonMatch = textContent.match(/\[\s*\{.*\}\s*\]/s)
      if (jsonMatch) {
        try {
          const tasksData = JSON.parse(jsonMatch[0])
          // 各タスクにIDと完了フラグ、科目を追加
          const tasks: Task[] = tasksData.map((task: any) => ({
            id: uuidv4(),
            title: task.title,
            description: task.description,
            priority: task.priority,
            completed: false,
            subject: subject, // 科目を追加
          }))

          return tasks
        } catch (parseError) {
          console.error("JSON解析エラー:", parseError)
          // JSONの解析に失敗した場合はモックデータを使用
          return generateMockTasks(subject, examScope)
        }
      }
    }

    // レスポンスの形式が期待と異なる場合はモックデータを使用
    console.warn("Gemini APIからの応答が期待と異なります。モックデータを使用します。")
    return generateMockTasks(subject, examScope)
  } catch (error) {
    console.error("AI API Error:", error)
    // エラーが発生した場合はモックデータを使用
    console.warn("Gemini APIでエラーが発生しました。モックデータを使用します。")
    return generateMockTasks(subject, examScope)
  }
}

// デモ用のモックタスクを生成する関数
function generateMockTasks(subject: string, examScope: string): Task[] {
  const priorities: ("high" | "medium" | "low")[] = ["high", "medium", "low"]
  const tasks: Task[] = []

  // 科目に基づいたタスクのテンプレート
  const taskTemplates: Record<string, { titles: string[]; descriptions: string[] }> = {
    英語: {
      titles: [
        "単語の暗記",
        "文法ルールの確認",
        "リーディング練習",
        "リスニング練習",
        "長文読解の演習",
        "英作文の練習",
        "熟語の暗記",
        "過去問演習",
        "発音練習",
        "模擬テスト実施",
      ],
      descriptions: [
        "試験範囲の単語を50個暗記する",
        "重要文法ポイントをノートにまとめ、例文を作る",
        "教科書の本文を音読し、内容理解を深める",
        "リスニング問題を繰り返し聞いて、聞き取れるようにする",
        "長文読解問題を時間を測って解き、解答を確認する",
        "与えられたテーマについて英作文を書く練習をする",
        "重要熟語30個を暗記し、例文を作る",
        "過去の定期テスト問題を解いて傾向を把握する",
        "発音が難しい単語を繰り返し練習する",
        "時間を測って模擬テストを解き、本番に備える",
      ],
    },
    数学: {
      titles: [
        "基本公式の暗記",
        "計算問題の練習",
        "応用問題の解法理解",
        "過去問演習",
        "間違えた問題の復習",
        "図形問題の解法確認",
        "関数グラフの描画練習",
        "証明問題の解法確認",
        "用語の定義確認",
        "模擬テスト実施",
      ],
      descriptions: [
        "教科書の重要公式をノートにまとめ、暗記する",
        "問題集から基本的な計算問題を20問解く",
        "応用問題の解法手順を理解し、類題を3問解く",
        "過去3年分の定期テスト問題を解いて時間配分を確認する",
        "間違えた問題を再度解き直し、解法を完全に理解する",
        "図形の性質と定理を確認し、関連問題を解く",
        "関数のグラフを描く練習をし、特徴を理解する",
        "証明問題の基本的なアプローチを学び、実践する",
        "教科書の用語定義を確認し、自分の言葉で説明できるようにする",
        "時間を測って模擬テストを解き、本番に備える",
      ],
    },
    国語: {
      titles: [
        "漢字の練習",
        "古典単語の暗記",
        "文学作品の読解",
        "要約の練習",
        "文法の確認",
        "敬語の使い方の復習",
        "小論文の練習",
        "作者と作品の確認",
        "過去問演習",
        "模擬テスト実施",
      ],
      descriptions: [
        "出題範囲の漢字を全て書けるように練習する",
        "古典で使われる重要単語を50語暗記する",
        "文学作品の登場人物や背景を理解し、テーマを考察する",
        "長文を読んで要点をまとめる練習をする",
        "文法の基本ルールを確認し、例文を作る",
        "敬語の種類と使い方を復習し、例文を作る",
        "与えられたテーマについて小論文を書く練習をする",
        "試験範囲の作者と作品について年代順に整理する",
        "過去の定期テスト問題を解いて傾向を把握する",
        "時間を測って模擬テストを解き、本番に備える",
      ],
    },
    理科: {
      titles: [
        "重要用語の暗記",
        "化学反応式の確認",
        "実験内容の復習",
        "図解の作成",
        "計算問題の練習",
        "生物の分類整理",
        "物理法則の確認",
        "過去問演習",
        "図表の読み取り練習",
        "模擬テスト実施",
      ],
      descriptions: [
        "試験範囲の重要用語を暗記カードにまとめる",
        "化学反応式のバランスを取る練習をする",
        "実験の目的、方法、結果をノートにまとめる",
        "複雑な概念を図解して理解を深める",
        "物理・化学の計算問題を10問解く",
        "生物の分類や特徴を表にまとめる",
        "物理法則の公式と適用例を確認する",
        "過去の定期テスト問題を解いて傾向を把握する",
        "グラフや表から情報を読み取る練習をする",
        "時間を測って模擬テストを解き、本番に備える",
      ],
    },
    社会: {
      titles: [
        "年表の作成",
        "地理用語の暗記",
        "歴史的事件の整理",
        "地図の確認",
        "政治制度の理解",
        "経済の仕組みの整理",
        "重要人物の確認",
        "国際関係の把握",
        "過去問演習",
        "模擬テスト実施",
      ],
      descriptions: [
        "重要な出来事を年表にまとめて時系列を理解する",
        "地理用語と定義を暗記カードにまとめる",
        "歴史的事件の原因と結果をノートに整理する",
        "地図上で重要な場所を確認し、特徴を理解する",
        "政治制度の仕組みと役割を図解してまとめる",
        "経済の基本概念と仕組みを整理する",
        "重要人物の業績と影響をまとめる",
        "国際関係や国際機関の役割を整理する",
        "過去の定期テスト問題を解いて傾向を把握する",
        "時間を測って模擬テストを解き、本番に備える",
      ],
    },
  }

  // デフォルトのタスクテンプレート
  const defaultTemplate = {
    titles: [
      "重要ポイントの整理",
      "用語の暗記",
      "問題演習",
      "過去問の解き直し",
      "ノートの見直し",
      "要約作成",
      "図表の整理",
      "関連資料の調査",
      "友達との学習会",
      "模擬テスト実施",
    ],
    descriptions: [
      "試験範囲の重要ポイントをノートにまとめる",
      "重要用語とその定義を暗記カードにまとめる",
      "問題集から関連問題を20問解く",
      "過去の定期テスト問題を解き直し、解法を確認する",
      "授業ノートを見直し、重要ポイントをマーカーでチェックする",
      "各単元の内容を自分の言葉で要約する",
      "重要な図表を自分で描き直して理解を深める",
      "教科書以外の関連資料を調べて知識を広げる",
      "友達と一緒に問題を解き、互いに教え合う",
      "時間を測って模擬テストを解き、本番に備える",
    ],
  }

  // 科目に合わせたテンプレートを選択
  const template = taskTemplates[subject] || defaultTemplate

  // 試験範囲からキーワードを抽出（簡易的な実装）
  const keywords = examScope.split(/[、,\s]+/).filter((k) => k.length > 0)

  // タスク数を決定（5〜8個）
  const taskCount = Math.min(Math.max(5, Math.min(keywords.length, 8)), 8)

  // タスクを生成
  for (let i = 0; i < taskCount; i++) {
    const priority = priorities[Math.floor(Math.random() * 3)]
    const titleIndex = i % template.titles.length
    const descIndex = i % template.descriptions.length

    // キーワードがあれば説明に組み込む
    let description = template.descriptions[descIndex]
    if (keywords.length > 0 && i < keywords.length) {
      description += `（特に「${keywords[i]}」に焦点を当てる）`
    }

    tasks.push({
      id: uuidv4(),
      title: template.titles[titleIndex],
      description: description,
      priority: priority,
      completed: false,
      subject: subject, // 科目を追加
    })
  }

  return tasks
}

export async function POST(request: NextRequest) {
  try {
    const { subjectEntries } = await request.json()

    if (!subjectEntries || !Array.isArray(subjectEntries) || subjectEntries.length === 0) {
      return NextResponse.json({ error: "科目と試験範囲を入力してください" }, { status: 400 })
    }

    // 各科目のタスクを生成して結合
    const allTasksPromises = subjectEntries.map((entry) => processAIResponse(entry))
    const allTasksArrays = await Promise.all(allTasksPromises)
    const allTasks = allTasksArrays.flat()

    return NextResponse.json({ tasks: allTasks })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "タスク生成中にエラーが発生しました" }, { status: 500 })
  }
}

