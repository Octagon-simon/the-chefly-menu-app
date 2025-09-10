"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AlertTriangle, Clock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function SubscriptionExpiryBanner() {
  const { user } = useAuth();
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!user?.subscription?.endDate) return;

    const calculateDaysRemaining = () => {
      if (!user?.subscription?.endDate) return;

      const endDate = new Date(user.subscription.endDate);
      const now = new Date();

      // normalize to midnight (ignore hours/minutes/seconds)
      const endDateMidnight = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        endDate.getDate()
      );
      const nowMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );

      const diffTime = endDateMidnight.getTime() - nowMidnight.getTime();
      const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      setDaysRemaining(diffDays);
      setIsExpired(diffDays <= 0);
    };

    calculateDaysRemaining();
    const interval = setInterval(calculateDaysRemaining, 1000 * 60 * 60); // Update every hour

    return () => clearInterval(interval);
  }, [user?.subscription?.endDate]);

  // Don't show banner if user is on free plan or no expiry date
  if (!user?.subscription?.endDate || user.subscription.plan === "free") {
    return null;
  }

  // Don't show banner if more than 7 days remaining
  if (daysRemaining !== null && daysRemaining > 7 && !isExpired) {
    return null;
  }

  if (isExpired) {
    return (
      <div className="mb-4 sm:mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-800 mb-1">
                Subscription Expired
              </h3>
              <p className="text-sm text-red-700">
                Your Pro subscription has expired. Your account has been
                downgraded to the free plan with limited features.
              </p>
              <div className="mt-2 text-xs text-red-600">
                <p>• Only 5 menu items visible to customers</p>
                <p>• Only 1 image per menu item</p>
                <p>• Limited customization options</p>
              </div>
            </div>
          </div>
          <div className="text-right sm:text-left">
            <Link href="/upgrade">
              <Button className="px-6 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap">
                Renew Subscription
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (daysRemaining !== null && daysRemaining <= 7) {
    return (
      <div className="mb-4 sm:mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-amber-800 mb-1">
                Subscription Expiring Soon
              </h3>
              <p className="text-sm text-amber-700">
                Your Pro subscription expires in{" "}
                <span className="font-semibold">
                  {daysRemaining === 1 ? "1 day" : `${daysRemaining} days`}
                </span>
                . Renew now to continue enjoying Pro features.
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs text-amber-600">
                <Crown className="w-3 h-3" />
                <span>
                  Don't lose unlimited items, custom branding, and more!
                </span>
              </div>
            </div>
          </div>
          <div className="text-right sm:text-left">
            <Link href="/upgrade">
              <Button className="px-6 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap">
                Renew Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
