"use client"

import type React from "react"

import { useSubscription } from "@/hooks/use-subscription"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Crown, Lock } from "lucide-react"
import { useRouter } from "next/navigation"

interface SubscriptionGuardProps {
  children: React.ReactNode
  feature: string
  fallback?: React.ReactNode
}

export function SubscriptionGuard({ children, feature, fallback }: SubscriptionGuardProps) {
  const { isPro, loading } = useSubscription()
  const router = useRouter()

  if (loading) {
    return <div className="animate-pulse bg-gray-200 rounded h-32" />
  }

  if (isPro) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
          <Lock className="h-6 w-6 text-orange-600" />
        </div>
        <CardTitle className="text-orange-900">Pro Feature</CardTitle>
        <CardDescription className="text-orange-700">{feature} is available with a Pro subscription</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button onClick={() => router.push("/upgrade")} className="bg-orange-600 hover:bg-orange-700">
          <Crown className="mr-2 h-4 w-4" />
          Upgrade to Pro
        </Button>
      </CardContent>
    </Card>
  )
}
