"use client";

import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";

interface SubscriptionBadgeProps {
  plan: "free" | "pro";
}

export const SubscriptionBadge = ({ plan }: SubscriptionBadgeProps) => {
  const baseClasses =
    "inline-flex items-center gap-1 px-2 py-1 text-xs font-medium w-fit";

  if (plan === "pro") {
    return (
      <Badge
        className={`${baseClasses} bg-yellow-500 text-white hover:bg-yellow-600`}
      >
        <Crown className="h-3 w-3" />
        Pro
      </Badge>
    );
  }

  return (
    <Badge className={`${baseClasses} bg-gray-200 text-gray-800`}>Free</Badge>
  );
};
