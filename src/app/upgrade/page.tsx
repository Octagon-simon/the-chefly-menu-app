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
import { Crown, Zap, ArrowLeft, Smartphone } from "lucide-react";
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
  const [promoCode, setPromoCode] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const [isRenewal, setIsRenewal] = useState(false);
  const [remainingDays, setRemainingDays] = useState(0);

  useEffect(() => {
    if (user && user.subscription.plan === "pro" && user.subscription.endDate) {
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

      setRemainingDays(diffDays);
      setIsRenewal(diffDays > 0);
    }
  }, [user]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount);
  };

  const validatePromoCode = async (code: string) => {
    if (!code.trim()) {
      setPromoError("Please enter a promo code");
      return;
    }

    setPromoLoading(true);
    setPromoError("");

    try {
      const { getDatabase, ref, get } = await import("firebase/database");
      const db = getDatabase();
      const promoRef = ref(db, `promos/${code.toLowerCase()}`);
      const snapshot = await get(promoRef);

      if (!snapshot.exists()) {
        setPromoError("Invalid promo code");
        setPromoLoading(false);
        return;
      }

      const promoData = snapshot.val();
      const now = new Date();
      const expiryDate = new Date(promoData.expiry);

      if (now > expiryDate) {
        setPromoError("This promo code has expired");
        setPromoLoading(false);
        return;
      }

      // Apply discount
      setPromoDiscount(promoData.discount);
      setPromoApplied(true);
      setPromoError("");
      toast.success(`Promo code applied! ${promoData.discount}% discount`);
    } catch (error) {
      console.error("Error validating promo code:", error);
      setPromoError("Failed to validate promo code");
    } finally {
      setPromoLoading(false);
    }
  };

  const removePromoCode = () => {
    setPromoCode("");
    setPromoDiscount(0);
    setPromoApplied(false);
    setPromoError("");
  };

  const calculateDiscountedPrice = (originalPrice: number) => {
    if (promoDiscount > 0) {
      return originalPrice - (originalPrice * promoDiscount) / 100;
    }
    return originalPrice;
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
          promoCode: promoApplied ? promoCode : null,
          discount: promoDiscount,
          isRenewal,
          remainingDays,
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

  const plansWithDiscount = plans.map((plan) => ({
    ...plan,
    originalPrice: plan.price,
    discountedPrice: calculateDiscountedPrice(plan.price),
    savings:
      promoDiscount > 0
        ? plan.price - calculateDiscountedPrice(plan.price)
        : plan.savings,
  }));

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
              {isRenewal ? "Renew Your Subscription" : "Upgrade to Premium"}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {isRenewal
                ? "Continue enjoying premium features with seamless renewal"
                : "Unlock powerful features to create stunning digital menus and grow your restaurant business"}
            </p>
          </div>

          {/* Current Plan */}
          <div
            className={`mb-8 p-4 rounded-lg border ${
              isRenewal
                ? "bg-orange-50 border-orange-200"
                : "bg-blue-50 border-blue-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3
                  className={`font-semibold ${
                    isRenewal ? "text-orange-900" : "text-blue-900"
                  }`}
                >
                  Current Plan: {isRenewal ? "Premium" : "Free"}
                </h3>
                <p className={isRenewal ? "text-orange-700" : "text-blue-700"}>
                  {isRenewal
                    ? `${
                        remainingDays && remainingDays === 1
                          ? remainingDays + " day"
                          : remainingDays + " days"
                      } remaining - Renewal will extend your subscription`
                    : "Limited to 5 menu items"}
                </p>
              </div>
              <Badge variant={isRenewal ? "default" : "secondary"}>
                {isRenewal ? "Premium" : "Free"}
              </Badge>
            </div>
          </div>

          {/* Promo Code Section */}
          <div className="mb-8 max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Have a promo code?
              </h3>

              {!promoApplied ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) =>
                        setPromoCode(e.target.value.toUpperCase())
                      }
                      placeholder="Enter promo code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      disabled={promoLoading}
                    />
                    <Button
                      onClick={() => validatePromoCode(promoCode)}
                      disabled={promoLoading || !promoCode.trim()}
                      className="bg-orange-500 hover:bg-orange-600"
                    >
                      {promoLoading ? "Checking..." : "Apply"}
                    </Button>
                  </div>

                  {promoError && (
                    <p className="text-red-600 text-sm">{promoError}</p>
                  )}
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-800 font-medium">
                        Promo code "{promoCode}" applied!
                      </p>
                      <p className="text-green-600 text-sm">
                        {promoDiscount}% discount on your subscription
                      </p>
                    </div>
                    <Button
                      onClick={removePromoCode}
                      variant="outline"
                      size="sm"
                      className="text-green-700 border-green-300 hover:bg-green-100 bg-transparent"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto mb-12">
            {plansWithDiscount.map((plan) => (
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
                    {promoApplied && promoDiscount > 0 ? (
                      <div>
                        <div className="text-2xl text-gray-500 line-through">
                          ₦{plan.originalPrice.toLocaleString()}
                        </div>
                        <div className="text-4xl font-bold text-green-600">
                          ₦{plan.discountedPrice.toLocaleString()}
                        </div>
                        <div className="text-green-600 font-semibold text-sm">
                          Save ₦
                          {(
                            plan.originalPrice - plan.discountedPrice
                          ).toLocaleString()}{" "}
                          with {promoCode}
                        </div>
                      </div>
                    ) : (
                      <div className="text-4xl font-bold">
                        ₦{plan.price.toLocaleString()}
                      </div>
                    )}
                    <div className="text-gray-600">per {plan.period}</div>

                    {isRenewal && remainingDays > 0 && (
                      <div className="mt-2">
                        <span className="text-orange-600 font-semibold text-sm bg-orange-50 px-3 py-1 rounded-full">
                          +
                          {remainingDays && remainingDays === 1
                            ? remainingDays + " day"
                            : remainingDays + " days"}{" "}
                          will be added to your new subscription
                        </span>
                      </div>
                    )}

                    {plan.savings && !promoApplied && (
                      <div className="mt-2">
                        <span className="text-green-600 font-semibold text-sm bg-green-50 px-3 py-1 rounded-full">
                          Save ₦{plan.savings.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {plan.period === "year" && (
                      <p className="text-sm text-gray-500 mt-2">
                        Just ₦
                        {Math.round(
                          (promoApplied ? plan.discountedPrice : plan.price) /
                            12
                        ).toLocaleString()}
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
                      <>Processing...</>
                    ) : (
                      `${isRenewal ? "Renew with" : "Choose"} ${plan.name}`
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
                  <Smartphone className="h-8 w-8 text-orange-500" />
                </div>
                <h4 className="font-semibold mb-2">Installable Menu App (PWA)</h4>
                <p className="text-gray-600">
                  Customers can save your menu to their phone and use it like an
                  app.
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
