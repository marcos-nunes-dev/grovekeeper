"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

interface UserProfileFormProps {
  user: {
    name: string | null;
    email: string | null;
  }
}

interface FormData {
  name: string;
  email: string;
}

export function UserProfileForm({ user }: UserProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: user.name || "",
    email: user.email || "",
  })

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      toast.success("Profile updated successfully")
      router.refresh()
    } catch {
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="grid gap-2">
        <div className="grid gap-1">
          <Label htmlFor="name">
            Name
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            disabled={isLoading}
          />
        </div>
        <div className="grid gap-1">
          <Label htmlFor="email">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          <span>Update profile</span>
        </button>
      </div>
    </form>
  )
} 