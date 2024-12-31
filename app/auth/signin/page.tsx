import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { SignInButton } from "@/components/auth/sign-in-button"

export default async function SignInPage() {
  const session = await getServerSession()

  if (session) {
    redirect("/")
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0D1117]">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Grovekeeper</h1>
          <p className="text-zinc-400">Sign in to continue to the application</p>
        </div>
        <div className="space-y-4">
          <SignInButton />
        </div>
      </div>
    </div>
  )
} 