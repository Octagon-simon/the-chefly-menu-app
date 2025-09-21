"use client";

import type React from "react";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useBrand } from "@/hooks/use-brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UpgradeBanner } from "@/components/upgrade-banner";
import { Upload, Crown, MessageCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { hasFeatureAccess } from "@/lib/features";

export const BrandSettings = () => {
  const { user, loading: userLoading } = useAuth();
  const { brand, updateBrand } = useBrand();
  const router = useRouter();

  const isPro = user?.subscription.plan === "pro";
  const hasWhatsAppFeature = user?.subscription.features
    ? hasFeatureAccess(user.subscription.features, "whatsapp_ordering")
    : false;

  const [formData, setFormData] = useState({
    name: brand?.name || "",
    description: brand?.description || "",
    logo: brand?.logo || "",
    primaryColor: brand?.primaryColor || "#3B82F6",
    secondaryColor: brand?.secondaryColor || "#10B981",
    whatsappNumber: brand?.whatsappNumber || "",
  });
  const [loading, setLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userLoading && !isPro) {
      toast.error("Brand logo upload is available for Pro users only");
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ""
      );

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: uploadData,
        }
      );

      const data = await response.json();

      if (data.secure_url) {
        setFormData((prev) => ({ ...prev, logo: data.secure_url }));
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Logo upload error:", error);
      toast.error("Failed to upload logo. Please try again.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPro) {
      toast.error("Brand customization is available for Pro users only");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Brand name is required");
      return;
    }

    if (
      formData.whatsappNumber &&
      !formData.whatsappNumber.match(/^\+?[1-9]\d{1,14}$/)
    ) {
      toast.error(
        "Please enter a valid WhatsApp number (e.g., +2348012345678)"
      );
      return;
    }

    setLoading(true);

    const result = await updateBrand({
      name: formData.name.trim(),
      description: formData.description.trim(),
      logo: formData.logo,
      primaryColor: formData.primaryColor,
      secondaryColor: formData.secondaryColor,
      whatsappNumber: formData.whatsappNumber.trim(),
    });

    if (result.success) {
      toast.success("Brand settings updated successfully!");
    } else {
      toast.error(result.error || "Failed to update brand settings");
    }

    setLoading(false);
  };

  const handleUpgrade = () => {
    toast.info("Redirecting to upgrade page...");
    router.push("/upgrade");
  };

  return (
    <div className="max-w-2xl mx-auto">
      {!userLoading && !isPro && (
        <UpgradeBanner
          message="Unlock brand customization with logo, colors, and custom URL!"
          onUpgrade={handleUpgrade}
        />
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Brand Settings</h2>
          {isPro && <Crown className="h-5 w-5 text-yellow-500" />}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Brand Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Your Restaurant Name"
              disabled={!isPro}
              required
            />
            {!isPro && (
              <p className="text-sm text-gray-500 mt-1">
                Pro feature: Customize your brand name
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Brand Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of your restaurant"
              disabled={!isPro}
              rows={3}
            />
          </div>

          <div>
            <Label>Brand Logo</Label>
            <div className="mt-2">
              {formData.logo ? (
                <div className="flex items-center gap-4">
                  <img
                    src={formData.logo || "/placeholder.svg"}
                    alt="Brand logo"
                    className="w-16 h-16 object-contain border rounded"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setFormData({ ...formData, logo: "" })}
                    disabled={!isPro}
                  >
                    Remove Logo
                  </Button>
                </div>
              ) : (
                <label
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg ${
                    isPro
                      ? "cursor-pointer bg-gray-50 hover:bg-gray-100"
                      : "bg-gray-100 cursor-not-allowed"
                  }`}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="text-sm text-gray-500">
                      {uploadingLogo
                        ? "Uploading..."
                        : isPro
                        ? "Click to upload logo"
                        : "Pro feature: Upload brand logo"}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    disabled={!isPro || uploadingLogo}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex gap-2 mt-1">
                <input
                  id="primaryColor"
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) =>
                    setFormData({ ...formData, primaryColor: e.target.value })
                  }
                  disabled={!isPro}
                  className="w-12 h-10 border rounded disabled:opacity-50"
                />
                <Input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) =>
                    setFormData({ ...formData, primaryColor: e.target.value })
                  }
                  disabled={!isPro}
                  placeholder="#3B82F6"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="secondaryColor">Secondary Color</Label>
              <div className="flex gap-2 mt-1">
                <input
                  id="secondaryColor"
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) =>
                    setFormData({ ...formData, secondaryColor: e.target.value })
                  }
                  disabled={!isPro}
                  className="w-12 h-10 border rounded disabled:opacity-50"
                />
                <Input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) =>
                    setFormData({ ...formData, secondaryColor: e.target.value })
                  }
                  disabled={!isPro}
                  placeholder="#10B981"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="whatsappNumber">WhatsApp Sales Number</Label>
            <div className="flex gap-2 mt-1">
              <MessageCircle className="w-5 h-5 text-green-500 mt-2.5" />
              <div className="flex-1">
                <Input
                  id="whatsappNumber"
                  type="tel"
                  value={formData.whatsappNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsappNumber: e.target.value })
                  }
                  placeholder="+2348012345678"
                  disabled={!hasWhatsAppFeature}
                />
                {!hasWhatsAppFeature ? (
                  <p className="text-sm text-gray-500 mt-1">
                    WhatsApp Ordering feature required (₦2,500/month addon)
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 mt-1">
                    Customers can order directly via WhatsApp using this number
                  </p>
                )}
              </div>
            </div>
          </div>

          {isPro && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                Your Custom URL
              </h3>
              <p className="text-sm text-blue-800">
                {formData.name
                  ? `${
                      typeof window !== "undefined"
                        ? window.location.origin
                        : ""
                    }/${formData.name
                      .toLowerCase()
                      .replace(/[^a-z0-9 -]/g, "")
                      .replace(/\s+/g, "-")
                      .replace(/-+/g, "-")
                      .trim()}`
                  : "Enter a brand name to see your custom URL"}
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!isPro || loading || uploadingLogo}
          >
            {loading ? "Saving..." : "Save Brand Settings"}
          </Button>

          {!isPro && (
            <div className="text-center">
              <Button
                type="button"
                onClick={handleUpgrade}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                <Crown className="h-4 w-4 mr-2" />
                Upgrade to Pro
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
