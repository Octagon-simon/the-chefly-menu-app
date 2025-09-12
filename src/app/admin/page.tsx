"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMenu } from "@/hooks/use-menu";
import { useBrand } from "@/hooks/use-brand";
import { AdminLogin } from "@/components/admin-login";
import { MenuItemForm } from "@/components/menu-item-form";
import { BrandSettings } from "@/components/brand-settings";
import { LoadingSpinner } from "@/components/loading-spinner";
import { SubscriptionBadge } from "@/components/subscription-badge";
import { UpgradeBanner } from "@/components/upgrade-banner";
import { QRCodeGenerator } from "@/components/qr-code-generator";
import { CategoryForm } from "@/components/category-form";
import { SubscriptionExpiryBanner } from "@/components/subscription-expiry-banner";
import type { MenuItem, Category } from "@/types/menu";
import {
  Plus,
  Edit,
  Trash2,
  LogOut,
  Settings,
  Crown,
  QrCode,
  Eye,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useSubscription } from "@/hooks/use-subscription";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatText } from "@/lib/utils";

export default function AdminPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const { isPro, isExpired, loading: subscriptionLoading } = useSubscription();
  const {
    menuItems,
    categories,
    loading: menuLoading,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useMenu();
  const { brand } = useBrand();
  const router = useRouter();

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeTab, setActiveTab] = useState<
    "menu" | "brand" | "categories" | "qr"
  >("menu");
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (authLoading || subscriptionLoading) return <LoadingSpinner />;
  if (!user) return <AdminLogin />;

  const filteredItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const handleAddItem = async (item: Omit<MenuItem, "id">) => {
    const result = await addMenuItem(item);
    if (result.success) {
      toast.success("Menu item added successfully!");
      setShowForm(false);
    } else {
      toast.error(result.error || "Failed to add item");
    }
    return result;
  };

  const handleUpdateItem = async (item: Omit<MenuItem, "id">) => {
    if (!editingItem) return { success: false, error: "No item selected" };

    const result = await updateMenuItem(editingItem.id, item);
    if (result.success) {
      toast.success("Menu item updated successfully!");
      setEditingItem(null);
    } else {
      toast.error("Failed to update item");
    }
    return result;
  };

  const handleDeleteItem = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const result = await deleteMenuItem(id);
      if (result.success) {
        toast.success("Menu item deleted successfully!");
      } else {
        toast.error(result.error || "Failed to delete item");
      }
    }
  };

  const handleAddCategory = async (category: Omit<Category, "id">) => {
    const result = await addCategory(category);
    if (result.success) {
      toast.success("Category added successfully!");
      setShowCategoryForm(false);
    } else {
      toast.error(result.error || "Failed to add category");
    }
    return result;
  };

  const handleUpdateCategory = async (category: Omit<Category, "id">) => {
    if (!editingCategory)
      return { success: false, error: "No category selected" };

    const result = await updateCategory(editingCategory.id, category);
    if (result.success) {
      toast.success("Category updated successfully!");
      setEditingCategory(null);
    } else {
      toast.error(result.error || "Failed to update category");
    }
    return result;
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      const result = await deleteCategory(id);
      if (result.success) {
        toast.success("Category deleted successfully!");
      } else {
        toast.error(result.error || "Failed to delete category");
      }
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      toast.success("Logged out successfully");
    }
  };

  const handleUpgrade = () => {
    toast.info("Redirecting to upgrade page...");
    router.push("/upgrade");
  };

  const menuUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${user.username}`
      : "";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center gap-2">
              <Link href={"/"}>
                <Image
                  src="/cheflymenuapp-transparent.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="rounded-full sm:w-[50px] sm:h-[50px]"
                />
              </Link>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                Admin Panel
              </h1>
            </div>

            {/* Desktop Header Actions */}
            <div className="hidden lg:flex items-center gap-4">
              <SubscriptionBadge plan={user.subscription.plan} />
              {isExpired && (
                <div className="text-sm text-red-600 font-medium">
                  Subscription Expired
                </div>
              )}
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800"
              >
                <Eye size={16} />
                View Menu
              </a>
              <span className="text-sm text-gray-600 max-w-[150px] truncate">
                Welcome, {formatText(user?.username)}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                <LogOut size={20} />
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4 space-y-4">
              <div className="flex flex-col space-y-3 items-center">
                <SubscriptionBadge plan={user.subscription.plan} />
                {isExpired && (
                  <div className="text-sm text-red-600 font-medium">
                    Subscription Expired
                  </div>
                )}
                <a
                  href={menuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-blue-600 hover:text-blue-800 w-fit"
                >
                  <Eye size={16} />
                  View Menu
                </a>
                <span className="text-sm text-gray-600">
                  Welcome, {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 w-fit"
                >
                  <LogOut size={20} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <SubscriptionExpiryBanner />

        {/* Upgrade Banner for Free Users */}
        {!authLoading && !isPro && (
          <div className="mb-4 sm:mb-6">
            <UpgradeBanner
              message={
                isExpired
                  ? "Your subscription has expired. Upgrade to continue using Pro features!"
                  : "Unlock brand customization, unlimited items, and more with Pro!"
              }
              onUpgrade={handleUpgrade}
            />
          </div>
        )}

        {/* Subscription Renewal Notification for Free Users with Limited Items */}
        {!isPro && filteredItems.length > 5 && (
          <div className="mb-4 sm:mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Crown className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">
                    Menu Items Limited
                  </h3>
                  <p className="text-sm text-amber-700">
                    You have {filteredItems.length} menu items, but only 5 are
                    visible to customers. Upgrade to Pro to display all your
                    items and unlock premium features.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleUpgrade}
                className="px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        )}

        {/* Free Plan Limit Warning */}
        {!isPro && menuItems.length >= 4 && (
          <div className="mb-4 sm:mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="font-semibold text-yellow-800">
                  Approaching Limit
                </h3>
                <p className="text-sm sm:text-base text-yellow-700">
                  You have {menuItems.length}/5 menu items. Upgrade to Pro for
                  unlimited items.
                </p>
              </div>
              <button
                onClick={handleUpgrade}
                className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm sm:text-base whitespace-nowrap"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
              <button
                onClick={() => setActiveTab("menu")}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === "menu"
                    ? "border-[#E44D26] text-[#E44D26]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Menu Items
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === "categories"
                    ? "border-[#E44D26] text-[#E44D26]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Categories
              </button>
              <button
                onClick={() => setActiveTab("qr")}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-1 whitespace-nowrap ${
                  activeTab === "qr"
                    ? "border-[#E44D26] text-[#E44D26]"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <QrCode size={16} />
                QR Code
              </button>
              <button
                onClick={() => setActiveTab("brand")}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-1 whitespace-nowrap ${
                  activeTab === "brand"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Settings size={16} />
                Brand Settings
                {isPro && <Crown size={12} className="text-yellow-500" />}
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "menu" && (
          <>
            {/* Controls */}
            <div className="flex flex-col gap-4 mb-6 sm:mb-8">
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory("All")}
                  className={`px-3 sm:px-4 py-2 rounded-full transition-colors text-sm ${
                    selectedCategory === "All"
                      ? "bg-black text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  All
                  {selectedCategory === "All" && ` (${menuItems.length})`}
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`px-3 sm:px-4 py-2 rounded-full transition-colors text-sm ${
                      selectedCategory === category.name
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {category.name} (
                    {
                      menuItems.filter(
                        (item) => item.category === category.name
                      ).length
                    }
                    )
                  </button>
                ))}
              </div>

              {/* Add Button */}
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    if (!isPro && menuItems.length >= 5) {
                      handleUpgrade();
                    } else {
                      setShowForm(true);
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm sm:text-base"
                >
                  <Plus size={18} className="sm:size-20" />
                  Add New Item
                </Button>
              </div>
            </div>

            {/* Menu Items */}
            {menuLoading ? (
              <LoadingSpinner />
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
                  No items found
                </h3>
                <p className="text-sm sm:text-base text-gray-500">
                  {selectedCategory === "All"
                    ? "Add your first menu item"
                    : "No items in this category"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden"
                  >
                    <div className="relative h-40 sm:h-48 w-full">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0] || "/placeholder.svg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-sm">
                            No Image
                          </span>
                        </div>
                      )}
                      {item.images && item.images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                          +{item.images.length - 1} more
                        </div>
                      )}
                      {item.isCombo && (
                        <div className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                          Combo
                        </div>
                      )}
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-2 line-clamp-2">
                        {item.name}
                      </h3>
                      {item.description && (
                        <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      {item.isCombo &&
                        item.subItems &&
                        item.subItems.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm text-gray-500 mb-1">
                              Combo options:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {item.subItems.slice(0, 3).map((subItem) => (
                                <span
                                  key={subItem.id}
                                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                                >
                                  {subItem.name}
                                </span>
                              ))}
                              {item.subItems.length > 3 && (
                                <span className="text-xs text-gray-500 self-center">
                                  +{item.subItems.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
                        <span className="text-xl sm:text-2xl font-bold text-green-600">
                          ₦{item.price.toLocaleString()}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded w-fit">
                          {item.category}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => setEditingItem(item)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Edit size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.name)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Manage Categories
              </h2>
              <Button
                onClick={() => setShowCategoryForm(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm sm:text-base w-fit"
              >
                <Plus size={18} />
                Add Category
              </Button>
            </div>
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
                  No categories found
                </h3>
                <p className="text-sm sm:text-base text-gray-500">
                  Add your first category to organize your menu items.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="bg-white rounded-lg shadow-md p-4"
                  >
                    <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-2">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-gray-600 text-xs sm:text-sm mb-3 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-gray-500">
                        {
                          menuItems.filter(
                            (item) => item.category === category.name
                          ).length
                        }{" "}
                        items
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingCategory(category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteCategory(category.id, category.name)
                          }
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "qr" && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                QR Code Generator
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Generate and download QR codes for your menu that customers can
                scan to view your menu.
              </p>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs sm:text-sm text-blue-800 break-all">
                  <strong>Your menu URL:</strong> {menuUrl}
                </p>
              </div>
            </div>
            <QRCodeGenerator
              url={menuUrl}
              brandName={brand?.name || user.email.split("@")[0]}
            />
          </div>
        )}

        {activeTab === "brand" && <BrandSettings />}
      </div>

      {/* Forms */}
      {showForm && (
        <MenuItemForm
          categories={categories}
          onSubmit={handleAddItem}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingItem && (
        <MenuItemForm
          item={editingItem}
          categories={categories}
          onSubmit={handleUpdateItem}
          onCancel={() => setEditingItem(null)}
        />
      )}

      {showCategoryForm && (
        <CategoryForm
          onSubmit={handleAddCategory}
          onCancel={() => setShowCategoryForm(false)}
        />
      )}

      {editingCategory && (
        <CategoryForm
          category={editingCategory}
          onSubmit={handleUpdateCategory}
          onCancel={() => setEditingCategory(null)}
        />
      )}
    </div>
  );
}
