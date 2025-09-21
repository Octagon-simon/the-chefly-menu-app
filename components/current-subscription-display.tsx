"use client";

import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Calendar, Settings, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  CORE_PRO_FEATURES,
  ADDON_FEATURES,
  getFeatureById,
} from "@/lib/features";

export function CurrentSubscriptionDisplay() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  const subscription = user.subscription;
  const isPro = subscription.plan === "pro";
  const isActive = subscription.status === "active";

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysRemaining = () => {
    if (!subscription.endDate) return null;
    const endDate = new Date(subscription.endDate);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysRemaining = getDaysRemaining();
  const userFeatures = subscription.features || [];
  const coreFeatures = userFeatures.filter((featureId) =>
    CORE_PRO_FEATURES.some((core) => core.id === featureId)
  );
  const addonFeatures = userFeatures.filter((featureId) =>
    ADDON_FEATURES.some((addon) => addon.id === featureId)
  );

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Current Subscription</CardTitle>
          </div>
          <Badge
            variant={isPro && isActive ? "default" : "secondary"}
            className={isPro && isActive ? "bg-orange-500" : ""}
          >
            {isPro && isActive ? (
              <>
                <Crown className="h-3 w-3 mr-1" />
                Pro
              </>
            ) : (
              "Free"
            )}
          </Badge>
        </div>
        <CardDescription>Manage your subscription and features</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subscription Details */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2">
              Plan Details
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Plan:</span>
                <span className="font-medium">
                  {isPro ? "Premium" : "Free"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span
                  className={`font-medium ${
                    isActive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {subscription.status || "Active"}
                </span>
              </div>
              {subscription.startDate && (
                <div className="flex justify-between">
                  <span>Started:</span>
                  <span>{formatDate(subscription.startDate)}</span>
                </div>
              )}
              {subscription.endDate && (
                <div className="flex justify-between">
                  <span>Expires:</span>
                  <span>{formatDate(subscription.endDate)}</span>
                </div>
              )}
              {daysRemaining !== null && daysRemaining >= 0 && (
                <div className="flex justify-between">
                  <span>Days Remaining:</span>
                  <span
                    className={`font-medium ${
                      daysRemaining <= 7 ? "text-orange-600" : "text-green-600"
                    }`}
                  >
                    {daysRemaining}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm text-gray-700 mb-2">
              Active Features ({userFeatures.length})
            </h4>
            <div className="space-y-2">
              {isPro && coreFeatures.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Core Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {coreFeatures.slice(0, 3).map((featureId) => {
                      const feature = getFeatureById(featureId);
                      return feature ? (
                        <Badge
                          key={featureId}
                          variant="outline"
                          className="text-xs"
                        >
                          {feature.name}
                        </Badge>
                      ) : null;
                    })}
                    {coreFeatures.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{coreFeatures.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {addonFeatures.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Add-on Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {addonFeatures.map((featureId) => {
                      const feature = getFeatureById(featureId);
                      return feature ? (
                        <Badge
                          key={featureId}
                          variant="default"
                          className="text-xs bg-blue-500"
                        >
                          {feature.name}
                        </Badge>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {!isPro && (
                <p className="text-sm text-gray-500">
                  Limited to 5 menu items and basic features
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 border-t">
          {!isPro || !isActive ? (
            <Button
              onClick={() => router.push("/upgrade")}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Pro
            </Button>
          ) : (
            <>
              <Button onClick={() => router.push("/upgrade")} variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                {daysRemaining && daysRemaining <= 30 ? "Renew" : "Manage"}
              </Button>
              {daysRemaining && daysRemaining > 30 && (
                <Button
                  onClick={() => router.push("/upgrade")}
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Features
                </Button>
              )}
            </>
          )}
        </div>

        {/* Renewal Warning */}
        {isPro &&
          daysRemaining !== null &&
          daysRemaining <= 30 &&
          daysRemaining > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-orange-800 text-sm">
                <strong>Renewal Notice:</strong> Your subscription expires in{" "}
                {daysRemaining} days.
                {daysRemaining <= 7 &&
                  " Renew now to avoid service interruption."}
              </p>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
