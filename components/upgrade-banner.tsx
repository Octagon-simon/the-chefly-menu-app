"use client"

import { Crown, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface UpgradeBannerProps {
  message: string
  onUpgrade: () => void
}

export const UpgradeBanner = ({ message, onUpgrade }: UpgradeBannerProps) => {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white p-4 rounded-lg mb-6 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="h-6 w-6" />
          <div>
            <h3 className="font-semibold">Upgrade to Pro</h3>
            <p className="text-sm opacity-90">{message}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={onUpgrade}
            variant="secondary"
            size="sm"
            className="bg-white text-yellow-600 hover:bg-gray-100"
          >
            Upgrade Now
          </Button>
          <button onClick={() => setDismissed(true)} className="p-1 hover:bg-white hover:bg-opacity-20 rounded">
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
