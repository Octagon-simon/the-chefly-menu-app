"use client";

import type React from "react";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UpgradeBanner } from "@/components/upgrade-banner";
import { ComboForm } from "@/components/combo-form";
import { X, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { MenuItemFormProps } from "./types";

export const MenuItemForm = ({
  item,
  categories,
  onSubmit,
  onCancel,
}: MenuItemFormProps) => {
  const { user } = useAuth();
  const isPro = user?.subscription.plan === "pro";
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
    price: item?.price || 0,
    category: item?.category || "",
    images: item?.images || [],
    isCombo: item?.isCombo || false,
    subItems: item?.subItems || [],
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if user can add more images
    if (!isPro && formData.images.length >= 1) {
      alert(
        "Free plan allows only 1 image per menu item. Upgrade to Pro for up to 5 images!"
      );
      return;
    }

    if (isPro && formData.images.length >= 5) {
      alert("Maximum 5 images allowed per menu item");
      return;
    }

    setUploadingImage(true);

    try {
      // Create FormData for Cloudinary upload
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
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, data.secure_url],
        }));
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Image upload error:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.category || formData.price <= 0) {
      alert("Please fill in all required fields");
      return;
    }

    if (formData.images.length === 0) {
      alert("Please add at least one image");
      return;
    }

    if (formData.isCombo && formData.subItems.length === 0) {
      alert("Please add at least one combo item");
      return;
    }

    setLoading(true);

    const itemData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      category: formData.category,
      images: formData.images,
      isCombo: formData.isCombo,
      subItems: formData.isCombo ? formData.subItems : undefined,
      createdAt: item?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      available: typeof item?.available === "boolean" ? item.available : true,
    };

    const result = await onSubmit(itemData);

    if (result.success) {
      onCancel();
    } else {
      alert(result.error || "Failed to save menu item");
    }

    setLoading(false);
  };

  const maxImages = isPro ? 5 : 1;
  const canAddMoreImages = formData.images.length < maxImages;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold">
            {item ? "Edit Menu Item" : "Add New Menu Item"}
          </h3>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {!isPro && (
          <div className="p-4 border-b">
            <UpgradeBanner
              message="Upgrade to Pro to add up to 5 images per menu item!"
              onUpgrade={() => {
                toast.info("Redirecting to upgrade page...");
                router.push("/upgrade");
              }}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Item Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Grilled Chicken"
                required
              />
            </div>

            <div>
              <Label htmlFor="price">Price (₦) *</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: Number.parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your menu item..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isCombo"
                checked={formData.isCombo}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    isCombo: checked as boolean,
                    subItems: checked ? formData.subItems : [],
                  })
                }
              />
              <Label htmlFor="isCombo" className="text-sm font-medium">
                This item has combo options (e.g., add-ons, sides, extras)
              </Label>
            </div>

            {formData.isCombo && (
              <ComboForm
                subItems={formData.subItems}
                onSubItemsChange={(subItems) =>
                  setFormData({ ...formData, subItems })
                }
              />
            )}
          </div>

          <div>
            <Label>
              Images * ({formData.images.length}/{maxImages})
            </Label>

            {/* Image Upload */}
            {canAddMoreImages && (
              <div className="mt-2">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="text-sm text-gray-500">
                      {uploadingImage
                        ? "Uploading..."
                        : "Click to upload image"}
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
              </div>
            )}

            {/* Image Preview */}
            {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!isPro && formData.images.length >= 1 && (
              <p className="text-sm text-gray-500 mt-2">
                Free plan: 1 image limit reached. Upgrade to Pro for up to 5
                images!
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 bg-transparent"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading || uploadingImage}
            >
              {loading ? "Saving..." : item ? "Update Item" : "Add Item"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
