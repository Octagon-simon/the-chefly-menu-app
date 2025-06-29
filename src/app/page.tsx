"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Crown,
  QrCode,
  Star,
  UtensilsIcon,
  ZapIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const features = [
  {
    icon: UtensilsIcon,
    title: "Digital Menu Creation",
    description: "Create beautiful, professional digital menus in minutes",
  },
  {
    icon: QrCode,
    title: "QR Code Generation",
    description: "Generate QR codes for contactless menu access",
  },
  {
    icon: ZapIcon,
    title: "Easy Updates",
    description:
      " Update prices, add new items, or change descriptions in real-time without reprinting",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "₦0",
    period: "forever",
    description: "Perfect for small restaurants getting started",
    features: [
      "Up to 5 menu items",
      "Category management",
      "Basic menu display",
      "QR code generation",
      "Random URL",
      "Single image per item",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Premium",
    price: "₦5,000",
    period: "month",
    description: "Everything you need for a professional restaurant",
    features: [
      "Unlimited menu items",
      "Custom brand colors & logo",
      "Custom branded URL",
      "Up to 5 images per item",
      "Priority support",
      "Remove CheflyMenu branding",
    ],
    cta: "Upgrade to Premium",
    popular: true,
  },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    business: "Bella Vista Restaurant",
    content:
      "CheflyMenu transformed how we present our menu. Our customers love the QR code system!",
    rating: 5,
  },
  {
    name: "Michael Chen",
    business: "Spice Garden",
    content:
      "The Pro features are amazing. Custom branding made our menu look so professional.",
    rating: 5,
  },
  {
    name: "Amara Okafor",
    business: "Lagos Kitchen",
    content:
      "Easy to use and our customers can access our menu instantly. Highly recommended!",
    rating: 5,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Link href={"/"}>
                <Image
                  src="/cheflymenuapp-transparent.png"
                  alt="Logo"
                  width={50}
                  height={50}
                  className="rounded-full"
                />
              </Link>
              <span className="text-md sm:text-2xl font-bold text-gray-900">
                CheflyMenu
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/admin">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Create Beautiful
            <span className="text-[#E44D26]"> Digital Menus</span>
            <br />
            in Minutes
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your restaurant with professional digital menus. Generate
            QR codes, customize your brand, and provide a seamless dining
            experience for your customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admin">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Free Today
              </Button>
            </Link>
            <Link href="/octagon">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 bg-transparent"
              >
                View Demo Menu
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            No credit card required • Free forever plan available
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need for Digital Menus
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to help restaurants create professional
              digital menu experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <feature.icon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">
              Choose the plan that's right for your restaurant
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${
                  plan.popular ? "border-2 border-[#E44D26]" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-[#E44D26] text-white">
                      Most Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2">
                    {plan.name}
                    {plan.name === "Premium" && (
                      <Crown className="h-5 w-5 text-yellow-500" />
                    )}
                  </CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500">/{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/admin">
                    <Button
                      className={`w-full ${
                        plan.popular ? "bg-[#E44D26] hover:bg-[#C03F1F]" : ""
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Loved by Restaurant Owners
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers are saying about CheflyMenu
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {testimonial.business}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-100 text-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Transform Your Restaurant?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of restaurants already using CheflyMenu to create
            amazing digital menu experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admin">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Your Free Menu Today
              </Button>
            </Link>
            <Link href="/upgrade">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 bg-transparent"
              >
                View Pro Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/cheflymenuapp-transparent.png"
                  alt="Logo"
                  width={50}
                  height={50}
                  className="rounded-full"
                />
                <span className="text-xl font-bold">CheflyMenu</span>
              </div>
              <p className="text-gray-400">
                The easiest way to create professional digital menus for your
                restaurant.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/upgrade" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-white">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a
                    href="mailto:support@cheflymenu.app"
                    className="hover:text-white"
                  >
                    Contact Us
                  </a>
                </li>
                {/* <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Documentation
                  </a>
                </li> */}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            {/*
                <li>
                  <a href="#" className="hover:text-white">
                    Cookie Policy
                  </a>
                </li>
              </ul>
            </div> */}
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CheflyMenu. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
