"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-gray-600 mt-2">Last updated: June 28, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using CheflyMenu ("the Service"), you accept and
              agree to be bound by the terms and provision of this agreement. If
              you do not agree to abide by the above, please do not use this
              service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Description of Service
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              CheflyMenu is a digital menu creation and management platform that
              allows restaurants, cafes, and food businesses to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Create and customize digital menus</li>
              <li>Upload and manage food images</li>
              <li>Generate QR codes for contactless menu access</li>
              <li>Brand customization with Pro subscription</li>
              <li>Manage multiple menu categories and items</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. User Accounts
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Account Creation:</strong> You must provide accurate and
                complete information when creating an account. You are
                responsible for maintaining the confidentiality of your account
                credentials.
              </p>
              <p>
                <strong>Account Security:</strong> You are responsible for all
                activities that occur under your account. Notify us immediately
                of any unauthorized use of your account.
              </p>
              <p>
                <strong>Account Termination:</strong> We reserve the right to
                terminate accounts that violate these terms or engage in
                fraudulent activities.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Subscription Plans
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Free Plan:</strong> Limited to 5 menu items with basic
                features and CheflyMenu branding.
              </p>
              <p>
                <strong>Pro Plan:</strong> Unlimited menu items, multiple images
                per item, custom branding, and advanced features. Available as
                monthly (₦5,000) or yearly (₦50,000) subscriptions.
              </p>
              <p>
                <strong>Payment:</strong> Pro subscriptions are billed in
                advance. All payments are processed securely through Paystack.
              </p>
              <p>
                <strong>Refunds:</strong> Refunds are handled on a case-by-case
                basis. Contact support for refund requests.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Content and Intellectual Property
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>Your Content:</strong> You retain ownership of all
                content you upload to CheflyMenu, including images, menu
                descriptions, and business information.
              </p>
              <p>
                <strong>Content License:</strong> By uploading content, you
                grant CheflyMenu a non-exclusive license to use, store, and
                display your content as necessary to provide the service.
              </p>
              <p>
                <strong>Prohibited Content:</strong> You may not upload content
                that is illegal, offensive, infringing, or violates any
                third-party rights.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Acceptable Use
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Use the service for any illegal or unauthorized purpose</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Transmit any harmful or malicious code</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Create fake accounts or impersonate others</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Service Availability
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We strive to maintain high service availability but do not
              guarantee uninterrupted access. We may perform maintenance,
              updates, or experience technical issues that temporarily affect
              service availability.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed">
              CheflyMenu shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages, including without
              limitation, loss of profits, data, use, goodwill, or other
              intangible losses, resulting from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Data Protection
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We are committed to protecting your privacy and personal data.
              Please review our Privacy Policy to understand how we collect,
              use, and protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. Modifications to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these terms at any time. We will
              notify users of significant changes via email or through the
              service. Continued use of the service after changes constitutes
              acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              11. Termination
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Either party may terminate this agreement at any time. Upon
              termination, your right to use the service will cease immediately.
              We may retain certain information as required by law or for
              legitimate business purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              12. Governing Law
            </h2>
            <p className="text-gray-700 leading-relaxed">
              These terms shall be governed by and construed in accordance with
              the laws of Nigeria. Any disputes arising from these terms shall
              be subject to the exclusive jurisdiction of Nigerian courts.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              13. Contact Information
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms of Service, please
              contact us at:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                <strong>Email:</strong> support@cheflymenu.app
                <br />
                <strong>Address:</strong> Lagos, Nigeria
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
