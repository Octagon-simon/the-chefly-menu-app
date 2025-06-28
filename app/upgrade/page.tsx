"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Star, ArrowLeft } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { getAuth } from "firebase/auth";
import { toast } from "react-toastify";

const plans = [
  {
    id: "monthly",
    name: "Premium Monthly",
    price: 5000,
    period: "month",
    description: "Perfect for getting started",
    popular: false,
  },
  {
    id: "yearly",
    name: "Premium Yearly",
    price: 50000,
    period: "year",
    description: "Best value - 2 months free!",
    popular: true,
    savings: 10000,
  },
];

export default function UpgradePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const handleUpgrade = async (planId: string) => {
    if (!user) {
      toast.error("You must be signed in to upgrade your account.");
      return;
    }

    setProcessingPlan(planId);

    try {
      // Get Firebase ID token
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      const idToken = await currentUser.getIdToken();

      // Initialize payment
      const response = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: planId,
          idToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize payment");
      }

      // Redirect to Paystack payment page
      window.location.href = data.data.authorization_url;
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to process payment"
      );
    } finally {
      setProcessingPlan(null);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (user.subscription.plan === "pro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8">
              <Crown className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                You're Already Pro! 👑
              </h1>
              <p className="text-gray-600 mb-8">
                You have access to all premium features. Enjoy building amazing
                menus!
              </p>
              <Button
                onClick={() => router.push("/admin")}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Button
              variant="ghost"
              onClick={() => router.push("/admin")}
              className="mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Upgrade to Premium
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Unlock powerful features to create stunning digital menus and grow
              your restaurant business
            </p>
          </div>

          {/* Current Plan */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">
                  Current Plan: Free
                </h3>
                <p className="text-blue-700">Limited to 5 menu items</p>
              </div>
              <Badge variant="secondary">Free</Badge>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-12">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative flex flex-col justify-around border-2 transition-all hover:shadow-lg ${
                  plan.popular
                    ? "border-orange-500 shadow-lg"
                    : "border-gray-200 hover:border-orange-300"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-orange-600 hover:bg-orange-700 text-white">
                      <Zap className="h-3 w-3 mr-1" />
                      Best Value
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    {plan.description}
                  </CardDescription>

                  <div className="mt-6">
                    <div className="text-4xl font-bold">
                      ₦{plan.price.toLocaleString()}
                    </div>
                    <div className="text-gray-600">per {plan.period}</div>

                    {plan.savings && (
                      <div className="mt-2">
                        <span className="text-green-600 font-semibold text-sm bg-green-50 px-3 py-1 rounded-full">
                          Save ₦{plan.savings.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {plan.period === "year" && (
                      <p className="text-sm text-gray-500 mt-2">
                        Just ₦{Math.round(plan.price / 12).toLocaleString()}
                        /month
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  <div className="text-center">
                    <p className="text-gray-600 font-medium">
                      All Premium features included
                    </p>
                    <p className="text-sm text-gray-500">
                      Full access to everything
                    </p>
                  </div>
                </CardContent>

                <CardFooter>
                  <Button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={processingPlan === plan.id}
                    className={`w-full py-3 text-lg font-semibold ${
                      plan.popular
                        ? "bg-orange-600 hover:bg-orange-700"
                        : "bg-gray-900 hover:bg-gray-800"
                    }`}
                  >
                    {processingPlan === plan.id ? (
                      <>
                        Processing...
                      </>
                    ) : (
                      `Choose ${plan.name}`
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* Features Comparison */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <h3 className="text-2xl font-bold text-center mb-8">
              Why Upgrade to Premium?
            </h3>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Crown className="h-8 w-8 text-orange-500" />
                </div>
                <h4 className="font-semibold mb-2">Unlimited Items</h4>
                <p className="text-gray-600">
                  Add as many menu items as you want without restrictions
                </p>
              </div>

              <div className="text-center">
                <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-orange-500" />
                </div>
                <h4 className="font-semibold mb-2">Custom Branding</h4>
                <p className="text-gray-600">
                  Personalize your menu with your restaurant's colors and logo
                </p>
              </div>

              <div className="text-center">
                <div className="bg-orange-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Star className="h-8 w-8 text-orange-500" />
                </div>
                <h4 className="font-semibold mb-2">Priority Support</h4>
                <p className="text-gray-600">
                  Receive dedicated, high-priority support for faster issue
                  resolution.
                </p>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>
              🔒 Secure payment powered by Paystack. Your payment information is
              encrypted and secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
