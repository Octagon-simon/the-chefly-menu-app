"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { ChevronLeft, ChevronRight, QrCode } from "lucide-react";
import type { MenuItem, Category, Brand } from "@/types/menu";
import Image from "next/image";
import { QRCodeComponent } from "./qr-code";

interface MenuDisplayProps {
  user: { id: string; username: string; subscription: { plan: string } };
  menuItems: MenuItem[];
  categories: Category[];
  brand: Brand | null;
}

export const MenuDisplay = ({
  user,
  menuItems,
  categories,
  brand,
}: MenuDisplayProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showQR, setShowQR] = useState(false);

  const restaurantName = brand?.name
    ? brand.name.charAt(0).toUpperCase() + brand.name.slice(1)
    : "Menu";

  const filteredItems =
    selectedCategory === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const primaryColor = brand?.primaryColor || "#EA5800";
  const secondaryColor = brand?.secondaryColor || "#10B981";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="bg-white shadow-sm border-b"
        style={{ borderBottomColor: primaryColor }}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-2 sm:py-4">
          <div className="flex justify-between items-center h-16 gap-3">
            <div className="flex items-center gap-3">
              {brand?.logo ? (
                <Image
                  src={brand.logo || "/placeholder.svg"}
                  alt={restaurantName}
                  width={50}
                  height={50}
                  className="w-50 h-50 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain"
                />
              ) : (
                <Image
                  src="/cheflymenuapp-transparent.png"
                  alt={"Cheflymenu.app"}
                  width={60}
                  height={60}
                  className="object-contain"
                />
              )}
              <div className="">
                <h1 className="text-md sm:text-2xl font-bold text-gray-900">
                  {restaurantName}
                </h1>
                {brand?.description && (
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                    {brand.description}
                  </p>
                )}
              </div>
            </div>
            {user?.subscription.plan === "free" ? (
              <div className="text-xs text-gray-500">
                Powered by <span className="font-semibold">Chefly Menu</span>
              </div>
            ) : (
              <>
                <Button
                  onClick={() => setShowQR(!showQR)}
                  className={`flex items-center gap-2 px-4 py-2`}
                >
                  <QrCode size={20} />
                  QR Code
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* QR Code Modal */}
        {showQR && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-sm w-full mx-4">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">Share Our Menu</h3>
              </div>
              <QRCodeComponent value={window.location.href} />
              <button
                onClick={() => setShowQR(false)}
                className="w-full mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2 justify-start sm:justify-center">
              <Button
                variant={selectedCategory === "All" ? "default" : "outline"}
                onClick={() => setSelectedCategory("All")}
                style={
                  selectedCategory === "All"
                    ? { backgroundColor: primaryColor }
                    : {}
                }
              >
                All ({menuItems.length})
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.name ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(category.name)}
                  style={
                    selectedCategory === category.name
                      ? { backgroundColor: primaryColor }
                      : {}
                  }
                >
                  {category.name} (
                  {
                    menuItems.filter((item) => item.category === category.name)
                      .length
                  }
                  )
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Menu Items */}
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No items available
            </h3>
            <p className="text-gray-500">
              {selectedCategory === "All"
                ? "This menu is currently being updated"
                : "No items in this category"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <div className="md:flex">
                  {item.images && item.images.length > 0 && (
                    <div className="md:w-48 h-48 md:h-auto relative">
                      <img
                        src={item.images[0] || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                      {item.images.length > 1 && (
                        <Badge className="absolute top-2 right-2 bg-black bg-opacity-70">
                          +{item.images.length - 1}
                        </Badge>
                      )}
                    </div>
                  )}
                  <CardContent className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <span
                        className="text-xl font-bold ml-4"
                        style={{ color: secondaryColor }}
                      >
                        {formatPrice(item.price)}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-gray-600 mb-3">{item.description}</p>
                    )}
                    <Badge variant="secondary">{item.category}</Badge>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Footer */}
        {user.subscription.plan === "free" && (
          <div className="text-center mt-12 py-8 border-t">
            <p className="text-gray-500 text-sm">
              Powered by{" "}
              <a
                href="/"
                className="font-semibold hover:underline"
                style={{ color: primaryColor }}
              >
                CheflyMenu
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      )}
    </div>
  );
};

interface ItemDetailModalProps {
  item: MenuItem;
  onClose: () => void;
  primaryColor: string;
  secondaryColor: string;
}

const ItemDetailModal = ({
  item,
  onClose,
  primaryColor,
  secondaryColor,
}: ItemDetailModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    if (item.images && item.images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % item.images.length);
    }
  };

  const prevImage = () => {
    if (item.images && item.images.length > 1) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + item.images.length) % item.images.length
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-0">
          {item.images && item.images.length > 0 && (
            <div className="relative h-64 md:h-80">
              <img
                src={item.images[currentImageIndex] || "/placeholder.svg"}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              {item.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2"
                    onClick={prevImage}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                    onClick={nextImage}
                  >
                    <ChevronRight size={16} />
                  </Button>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
                    {item.images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex
                            ? "bg-white"
                            : "bg-white bg-opacity-50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{item.name}</h2>
              <span
                className="text-2xl font-bold"
                style={{ color: secondaryColor }}
              >
                {formatPrice(item.price)}
              </span>
            </div>

            {item.description && (
              <p className="text-gray-600 mb-4">{item.description}</p>
            )}

            <div className="flex justify-between items-center">
              <Badge variant="secondary">{item.category}</Badge>
              <Button
                onClick={onClose}
                style={{ backgroundColor: primaryColor }}
              >
                Close
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
