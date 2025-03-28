import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    // 静的ファイルや Next.js の内部ルートを除外
    '/((?!_next|.*\\..*).*)',
    // APIルートも対象にする
    '/(api|trpc)(.*)',
  ],
} 