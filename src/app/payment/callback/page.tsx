"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle, ArrowRight, Crown } from "lucide-react";
import { LoadingSpinner } from "@/components/loading-spinner";

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading"
  );
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get("reference");

      if (!reference) {
        setStatus("failed");
        return;
      }

      try {
        const response = await fetch("/api/payment/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reference }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          setPaymentDetails(data.data);
          // Refresh user data to get updated subscription
          await refreshUser();
        } else {
          setStatus("failed");
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus("failed");
      }
    };

    verifyPayment();
  }, [searchParams]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
            <p className="text-gray-600 text-center">
              Please wait while we confirm your payment...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-900">
              Payment Successful! 🎉
            </CardTitle>
            <CardDescription className="text-green-700">
              Welcome to CheflyMenu Premium! Your account has been upgraded.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {paymentDetails && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-green-900 mb-3">
                  Payment Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Amount:</span>
                    <span className="font-semibold text-green-900">
                      {formatAmount(paymentDetails.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-5">
                    <span className="text-green-700">Reference:</span>
                    <span className="font-mono text-green-900 break-all text-right">
                      {paymentDetails.reference}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Date:</span>
                    <span className="text-green-900">
                      {formatDate(paymentDetails.paid_at)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
              <div className="flex items-center mb-3">
                <Crown className="h-5 w-5 text-orange-500 mr-2" />
                <h3 className="font-semibold text-orange-900">
                  Pro Features Unlocked
                </h3>
              </div>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>✅ Unlimited menu items</li>
                <li>✅ Multiple images per item</li>
                <li>✅ Custom branding</li>
                <li>✅ QR code generation</li>
                <li>✅ Priority support</li>
                <li>✅ Installable menu app</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => router.push("/admin")}
                className="flex-1 bg-orange-500 hover:bg-orange-600"
              >
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push(`/${user?.username}`)}
                className="flex-1 border-orange-500 hover:!bg-transparent text-orange-500 hover:text-orange-600"
              >
                View My Menu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-900">
            Payment Failed
          </CardTitle>
          <CardDescription className="text-red-700">
            We couldn't process your payment. Please try again.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <h3 className="font-semibold text-red-900 mb-2">What happened?</h3>
            <p className="text-sm text-red-800">
              Your payment could not be completed. This might be due to:
            </p>
            <ul className="text-sm text-red-800 mt-2 space-y-1">
              <li>• Insufficient funds</li>
              <li>• Network connectivity issues</li>
              <li>• Payment method declined</li>
              <li>• Session timeout</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => router.push("/upgrade")}
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/admin")}
              className="flex-1"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
