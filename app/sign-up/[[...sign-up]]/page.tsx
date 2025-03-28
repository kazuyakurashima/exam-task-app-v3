import { SignUp } from "@clerk/nextjs"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-white shadow-md rounded-lg",
          },
        }}
        afterSignUpUrl="/"
        redirectUrl="/"
      />
    </div>
  )
} 