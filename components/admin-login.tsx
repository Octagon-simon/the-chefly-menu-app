"use client";

import type React from "react";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const AdminLogin = () => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (
    e: React.FormEvent,
    action: "signin" | "signup"
  ) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    const result =
      action === "signin"
        ? await signIn(formData.email, formData.password)
        : await signUp(formData.email, formData.password);

    if (!result.success) {
      setError(result.error || "Authentication failed");
    }

    setLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!resetEmail) {
      setError("Please enter your email address");
      return;
    }

    setResetLoading(true);

    const result = await resetPassword(resetEmail);

    if (result.success) {
      setResetSent(true);
    } else {
      setError(result.error || "Failed to send reset email");
    }

    setResetLoading(false);
  };

  const resetForm = () => {
    setShowResetForm(false);
    setResetEmail("");
    setResetSent(false);
    setError("");
  };

  if (showResetForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Image
                src="/cheflymenuapp-transparent.png"
                alt="Logo"
                width={60}
                height={60}
                className="rounded-full"
              />
              <span className="text-3xl font-bold text-gray-900">
                Chefly Menu
              </span>
            </div>
            <p className="text-gray-600">Reset your password</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                  className="p-1 h-8 w-8"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <CardTitle className="text-lg">Password Reset</CardTitle>
                  <CardDescription>
                    {resetSent
                      ? "Check your email"
                      : "Enter your email to reset password"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {resetSent ? (
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Email Sent!</h3>
                    <p className="text-gray-600 mb-4">
                      We've sent a password reset link to{" "}
                      <span className="font-medium">{resetEmail}</span>
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Check your inbox and click the link to reset your
                      password. Don't forget to check your spam folder!
                    </p>
                  </div>
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="w-full bg-transparent"
                  >
                    Back to Sign In
                  </Button>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div>
                    <Label htmlFor="reset-email">Email Address</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={resetLoading}
                    >
                      {resetLoading ? (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Sending Reset Link...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Reset Link
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="w-full bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Link href={"/"}>
              <Image
                src="/cheflymenuapp-transparent.png"
                alt="Logo"
                width={60}
                height={60}
                className="rounded-full"
              />
            </Link>
            <span className="text-3xl font-bold text-gray-900">
              Chefly Menu
            </span>
          </div>
          <p className="text-gray-600">Access your restaurant admin panel</p>
        </div>

        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>Sign in to your admin account</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => handleSubmit(e, "signin")}
                  className="space-y-4"
                >
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div>
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing In..." : "Sign In"}
                  </Button>
                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setShowResetForm(true)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Forgot your password?
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create Account</CardTitle>
                <CardDescription>Start your free trial today</CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  onSubmit={(e) => handleSubmit(e, "signup")}
                  className="space-y-4"
                >
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div>
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating Account..." : "Create Account"}
                  </Button>
                </form>
                <p className="text-xs text-gray-500 mt-4 text-center">
                  By signing up, you agree to our{" "}
                  <Link href={"/terms"}>Terms of Service</Link> and{" "}
                  <Link href={"/privacy"}>Privacy Policy</Link>.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
