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
import { Checkbox } from "@/components/ui/checkbox";
import { Crown, Zap, ArrowLeft, Check, Plus } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";
import { getAuth } from "firebase/auth";
import { toast } from "sonner";
import {
  CORE_PRO_FEATURES,
  ADDON_FEATURES,
  BASE_PRO_PRICE,
  formatPrice,
} from "@/lib/features";

const basePlans = [
  {
    id: "monthly",
    name: "Pro Monthly",
    duration: "monthly" as const,
    description: "Perfect for getting started",
    popular: false,
  },
  {
    id: "yearly",
    name: "Pro Yearly",
    duration: "yearly" as const,
    description: "Best value - 2 months free!",
    popular: true,
  },
];

export default function UpgradePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(
    "yearly"
  );
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [processingPayment, setProcessingPayment] = useState(false);
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
      const diffTime = endDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      setRemainingDays(Math.max(0, diffDays));
      setIsRenewal(true);

      // Pre-select current addon features for renewal
      if (user.subscription.features) {
        const currentAddons = user.subscription.features.filter((featureId) =>
          ADDON_FEATURES.some((addon) => addon.id === featureId)
        );
        setSelectedAddons(currentAddons);
      }
    }
  }, [user]);

  const calculateTotalCost = () => {
    const basePrice = BASE_PRO_PRICE[selectedPlan];
    const addonPrice = selectedAddons.reduce((total, addonId) => {
      const addon = ADDON_FEATURES.find((f) => f.id === addonId);
      return total + (addon?.price || 0);
    }, 0);

    const totalAddonPrice =
      selectedPlan === "yearly" ? addonPrice * 12 : addonPrice;
    const totalPrice = basePrice + totalAddonPrice;

    if (promoApplied && promoDiscount > 0) {
      return totalPrice - (totalPrice * promoDiscount) / 100;
    }

    return totalPrice;
  };

  const handleAddonToggle = (addonId: string) => {
    setSelectedAddons((prev) =>
      prev.includes(addonId)
        ? prev.filter((id) => id !== addonId)
        : [...prev, addonId]
    );
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

  const handleUpgrade = async () => {
    if (!user) {
      toast.error("You must be signed in to upgrade your account.");
      return;
    }

    setProcessingPayment(true);

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        throw new Error("User not authenticated");
      }

      const idToken = await currentUser.getIdToken();
      const totalCost = calculateTotalCost();

      const response = await fetch("/api/payment/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: selectedPlan,
          selectedFeatures: [
            ...CORE_PRO_FEATURES.map((f) => f.id),
            ...selectedAddons,
          ],
          totalAmount: totalCost,
          idToken,
          promoCode: promoApplied ? promoCode : null,
          discount: promoDiscount,
          isRenewal,
          remainingDays,
        }),
      });
// plan, idToken, promoCode, discount, isRenewal, remainingDays
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize payment");
      }

      window.location.href = data.data.authorization_url;
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to process payment"
      );
    } finally {
      setProcessingPayment(false);
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

  const totalCost = calculateTotalCost();
  const basePrice = BASE_PRO_PRICE[selectedPlan];
  const addonsCost = totalCost - basePrice;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
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
              {isRenewal ? "Renew Your Subscription" : "Choose Your Pro Plan"}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {isRenewal
                ? "Continue with your current features or add new ones"
                : "Select the features you need and pay only for what you use"}
            </p>
          </div>

          {/* Current Plan Status */}
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
                    ? `${remainingDays} days remaining - Choose features for your next cycle`
                    : "Limited to 5 menu items"}
                </p>
              </div>
              <Badge variant={isRenewal ? "default" : "secondary"}>
                {isRenewal ? "Premium" : "Free"}
              </Badge>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Plan Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Base Plan Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-orange-500" />
                    Choose Your Base Plan
                  </CardTitle>
                  <CardDescription>
                    All plans include core Pro features
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    {basePlans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedPlan === plan.duration
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-orange-300"
                        }`}
                        onClick={() => setSelectedPlan(plan.duration)}
                      >
                        {plan.popular && (
                          <Badge className="absolute -top-2 left-4 bg-orange-500">
                            <Zap className="h-3 w-3 mr-1" />
                            Best Value
                          </Badge>
                        )}

                        <div className="text-center">
                          <h3 className="font-semibold text-lg">{plan.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {plan.description}
                          </p>
                          <div className="text-2xl font-bold">
                            {formatPrice(BASE_PRO_PRICE[plan.duration])}
                          </div>
                          <div className="text-sm text-gray-500">
                            per {plan.duration}
                          </div>
                          {plan.duration === "yearly" && (
                            <div className="text-sm text-green-600 font-medium mt-1">
                              Save ₦10,000 yearly
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Core Features */}
                  <div className="mt-6">
                    <h4 className="font-medium mb-3 text-gray-900">
                      Included Core Features:
                    </h4>
                    <div className="grid md:grid-cols-2 gap-2">
                      {CORE_PRO_FEATURES.map((feature) => (
                        <div
                          key={feature.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <Check className="h-4 w-4 text-green-500" />
                          <span>{feature.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Addon Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-blue-500" />
                    Optional Add-on Features
                  </CardTitle>
                  <CardDescription>
                    Select additional features you need (optional)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ADDON_FEATURES.map((addon) => (
                      <div
                        key={addon.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedAddons.includes(addon.id)
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id={addon.id}
                            checked={selectedAddons.includes(addon.id)}
                            onCheckedChange={() => handleAddonToggle(addon.id)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <label
                                htmlFor={addon.id}
                                className="font-medium cursor-pointer"
                              >
                                {addon.name}
                              </label>
                              <div className="text-right">
                                <div className="font-semibold">
                                  +{formatPrice(addon.price)}/month
                                </div>
                                {selectedPlan === "yearly" && (
                                  <div className="text-sm text-gray-500">
                                    {formatPrice(addon.price * 12)}/year
                                  </div>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {addon.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              {/* Promo Code */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Promo Code</CardTitle>
                </CardHeader>
                <CardContent>
                  {!promoApplied ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) =>
                          setPromoCode(e.target.value.toUpperCase())
                        }
                        placeholder="Enter promo code"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        disabled={promoLoading}
                      />
                      <Button
                        onClick={() => validatePromoCode(promoCode)}
                        disabled={promoLoading || !promoCode.trim()}
                        className="w-full bg-orange-500 hover:bg-orange-600"
                        size="sm"
                      >
                        {promoLoading ? "Checking..." : "Apply"}
                      </Button>
                      {promoError && (
                        <p className="text-red-600 text-sm">{promoError}</p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-800 font-medium text-sm">
                            "{promoCode}" applied!
                          </p>
                          <p className="text-green-600 text-xs">
                            {promoDiscount}% discount
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
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>
                      Pro {selectedPlan === "yearly" ? "Yearly" : "Monthly"}
                    </span>
                    <span>{formatPrice(basePrice)}</span>
                  </div>

                  {selectedAddons.length > 0 && (
                    <>
                      <div className="border-t pt-2">
                        <div className="text-sm font-medium text-gray-700 mb-2">
                          Add-ons:
                        </div>
                        {selectedAddons.map((addonId) => {
                          const addon = ADDON_FEATURES.find(
                            (f) => f.id === addonId
                          );
                          if (!addon) return null;
                          const price =
                            selectedPlan === "yearly"
                              ? addon.price * 12
                              : addon.price;
                          return (
                            <div
                              key={addonId}
                              className="flex justify-between text-sm"
                            >
                              <span>{addon.name}</span>
                              <span>+{formatPrice(price)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {promoApplied && promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount ({promoDiscount}%)</span>
                      <span>
                        -
                        {formatPrice(
                          ((basePrice + addonsCost) * promoDiscount) / 100
                        )}
                      </span>
                    </div>
                  )}

                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>{formatPrice(totalCost)}</span>
                    </div>
                    {selectedPlan === "yearly" && (
                      <p className="text-sm text-gray-500 text-right">
                        Just {formatPrice(Math.round(totalCost / 12))}/month
                      </p>
                    )}
                  </div>

                  {isRenewal && remainingDays > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded p-3">
                      <p className="text-orange-800 text-sm">
                        <strong>Note:</strong> Your remaining {remainingDays}{" "}
                        days will be added to your new subscription period.
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleUpgrade}
                    disabled={processingPayment}
                    className="w-full bg-orange-600 hover:bg-orange-700 py-3"
                  >
                    {processingPayment
                      ? "Processing..."
                      : `${isRenewal ? "Renew" : "Upgrade"} for ${formatPrice(
                          totalCost
                        )}`}
                  </Button>
                </CardFooter>
              </Card>
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
