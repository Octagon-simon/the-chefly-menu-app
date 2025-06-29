"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600 mt-2">Last updated: June 28, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              1. Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              CheflyApp ("we," "our," or "us") is committed to protecting your
              privacy. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our digital
              menu creation service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              2. Information We Collect
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Personal Information
                </h3>
                <p className="text-gray-700 mb-2">
                  We collect information you provide directly to us:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Name and email address (for account creation)</li>
                  <li>Business name and contact information</li>
                  <li>
                    Payment information (processed securely through Paystack)
                  </li>
                  <li>Profile information and preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Content Information
                </h3>
                <p className="text-gray-700 mb-2">
                  Information related to your menu content:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Menu items, descriptions, and pricing</li>
                  <li>Food images and media files</li>
                  <li>Business branding and customization settings</li>
                  <li>Category and menu organization data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Technical Information
                </h3>
                <p className="text-gray-700 mb-2">
                  Information automatically collected:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Usage patterns and feature interactions</li>
                  <li>Log files and error reports</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              3. How We Use Your Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We use the collected information for:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                <strong>Service Provision:</strong> Creating and managing your
                digital menus
              </li>
              <li>
                <strong>Account Management:</strong> User authentication and
                account security
              </li>
              <li>
                <strong>Payment Processing:</strong> Handling subscription
                payments and billing
              </li>
              <li>
                <strong>Customer Support:</strong> Responding to inquiries and
                providing assistance
              </li>
              <li>
                <strong>Service Improvement:</strong> Analyzing usage to enhance
                features and performance
              </li>
              <li>
                <strong>Communication:</strong> Sending important updates and
                notifications
              </li>
              <li>
                <strong>Legal Compliance:</strong> Meeting legal obligations and
                protecting rights
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              4. Information Sharing and Disclosure
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                <strong>We do not sell your personal information.</strong> We
                may share your information in the following circumstances:
              </p>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Service Providers
                </h3>
                <p>We work with trusted third-party service providers:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>
                    <strong>Firebase:</strong> Database and authentication
                    services
                  </li>
                  <li>
                    <strong>Cloudinary:</strong> Image storage and optimization
                  </li>
                  <li>
                    <strong>Paystack:</strong> Payment processing (they have
                    their own privacy policy)
                  </li>
                  <li>
                    <strong>Vercel:</strong> Hosting and deployment services
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Legal Requirements
                </h3>
                <p>We may disclose information when required by law or to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                  <li>Comply with legal processes or government requests</li>
                  <li>Protect our rights, property, or safety</li>
                  <li>Prevent fraud or security threats</li>
                  <li>Enforce our terms of service</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              5. Data Security
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                We implement appropriate security measures to protect your
                information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Encryption:</strong> Data transmission is encrypted
                  using SSL/TLS
                </li>
                <li>
                  <strong>Access Controls:</strong> Limited access to personal
                  information
                </li>
                <li>
                  <strong>Secure Storage:</strong> Data stored in secure,
                  monitored environments
                </li>
                <li>
                  <strong>Regular Updates:</strong> Security measures are
                  regularly reviewed and updated
                </li>
                <li>
                  <strong>Payment Security:</strong> Payment data is handled by
                  PCI-compliant processors
                </li>
              </ul>
              <p className="mt-4">
                However, no method of transmission over the internet is 100%
                secure. While we strive to protect your information, we cannot
                guarantee absolute security.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              6. Data Retention
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your information for as long as necessary to provide our
              services and fulfill the purposes outlined in this policy. When
              you delete your account, we will delete or anonymize your personal
              information, except where we are required to retain it for legal
              or regulatory purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              7. Your Rights and Choices
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>
                You have the following rights regarding your personal
                information:
              </p>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Access and Portability
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Request access to your personal information</li>
                  <li>Request a copy of your data in a portable format</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Correction and Deletion
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Update or correct your personal information</li>
                  <li>Request deletion of your account and data</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Communication Preferences
                </h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Opt out of marketing communications</li>
                  <li>Manage notification preferences</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              8. Cookies and Tracking
            </h2>
            <div className="space-y-4 text-gray-700">
              <p>We use cookies and similar technologies to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Remember your preferences and settings</li>
                <li>Analyze site usage and performance</li>
                <li>Provide personalized experiences</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
              <p className="mt-4">
                You can control cookies through your browser settings, but
                disabling cookies may affect the functionality of our service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              9. Children's Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              CheflyApp is not intended for children under 13 years of age. We
              do not knowingly collect personal information from children under
              13. If we become aware that we have collected personal information
              from a child under 13, we will take steps to delete such
              information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              10. International Data Transfers
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Your information may be transferred to and processed in countries
              other than your own. We ensure that such transfers comply with
              applicable data protection laws and that appropriate safeguards
              are in place to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              11. Changes to This Privacy Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will
              notify you of any material changes by posting the new Privacy
              Policy on this page and updating the "Last updated" date. We
              encourage you to review this Privacy Policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              12. Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about this Privacy Policy or our privacy
              practices, please contact us:
            </p>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">
                <strong>Support:</strong> support@cheflymenu.app
                <br />
                <strong>Address:</strong> Lagos, Nigeria
              </p>
            </div>
            <p className="text-gray-700 mt-4">
              We will respond to your inquiries within 30 days and work to
              resolve any privacy concerns you may have.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
