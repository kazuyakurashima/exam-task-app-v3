import { clerkMiddleware } from "@clerk/nextjs/server"

// Clerkの認証ミドルウェアを設定
// 静的ファイルやNext.jsの内部ルートを除外し、APIルートを含める
export default clerkMiddleware()

export const config = {
  matcher: [
    // 静的ファイルやNext.jsの内部ルートを除外
    "/((?!.*\\..*|_next).*)",
    // APIルートを含める
    "/(api|trpc)(.*)",
  ],
} 