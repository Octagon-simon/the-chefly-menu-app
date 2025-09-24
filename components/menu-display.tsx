"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { capitalizeFirstLetter, formatPrice, formatText } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Search,
  Utensils,
  X,
  MessageCircle,
  ShoppingCart,
  Plus,
  Minus,
  Phone,
} from "lucide-react";
import type { MenuItem } from "@/types/menu";
import Image from "next/image";
import type {
  CartModalProps,
  ItemDetailModalProps,
  MenuDisplayProps,
} from "./types";
import { debounce } from "lodash";
import { hasFeatureAccess } from "@/lib/features";
import { QRCodeComponent } from "./qr-code";
import ShareOrInstallButton from "./share-or-install-button";
import type { OrderItem } from "@/types/order";
import { useOrders } from "@/hooks/use-orders";
import { toast } from "sonner";

export const MenuDisplay = ({
  user,
  menuItems,
  categories,
  brand,
}: MenuDisplayProps) => {
  console.log(user, "sees");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);

  const filteredItems = useMemo(() => {
    const filtered = menuItems.filter((item) => {
      const matchesSearch =
        searchQuery === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        searchQuery !== "" ||
        selectedCategory === "All" ||
        item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    return filtered;
  }, [menuItems, searchQuery, selectedCategory]);

  const searchResults = useMemo(() => {
    if (debouncedSearchQuery === "") return [];

    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        item.description
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
    );
  }, [menuItems, debouncedSearchQuery]);

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setDebouncedSearchQuery(query);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchQuery, debouncedSearch]);

  useEffect(() => {
    if (debouncedSearchQuery.length > 0) {
      setShowSearchDropdown(true);
    } else {
      setShowSearchDropdown(false);
    }
  }, [debouncedSearchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSearchItemSelect = (item: MenuItem) => {
    setSelectedItem(item);
    setShowSearchDropdown(false);
    setSearchQuery("");
    setDebouncedSearchQuery("");
  };

  const restaurantName = brand?.name ? formatText(brand.name) : "Menu";

  const displayItems =
    user.subscription.plan === "free"
      ? filteredItems.slice(0, 5)
      : filteredItems;

  const primaryColor =
    brand?.primaryColor?.toLowerCase() === "#fff" ||
    brand?.primaryColor?.toLowerCase() === "#ffffff"
      ? "#d97706"
      : brand?.primaryColor || "#d97706";
  const secondaryColor =
    brand?.secondaryColor?.toLowerCase() === "#fff" ||
    brand?.secondaryColor?.toLowerCase() === "#ffffff"
      ? "#059669"
      : brand?.secondaryColor || "#059669";

  const addToCart = (
    menuItem: MenuItem,
    selectedCombos: any[] = [],
    itemQuantity = 1
  ) => {
    const comboPrice = selectedCombos.reduce(
      (sum, combo) => sum + (combo.price || 0),
      0
    );
    const totalItemPrice = menuItem.price + comboPrice;

    const existingItem = cart.find(
      (item) =>
        item.menuItemId === menuItem.id &&
        JSON.stringify(item.selectedCombos) === JSON.stringify(selectedCombos)
    );

    if (existingItem) {
      setCart((prev) =>
        prev.map((item) =>
          item.id === existingItem.id
            ? {
                ...item,
                quantity: item.quantity + itemQuantity,
                totalPrice: (item.quantity + itemQuantity) * totalItemPrice,
              }
            : item
        )
      );
    } else {
      const newOrderItem: OrderItem = {
        id: `${menuItem.id}-${Date.now()}-${Math.random()}`,
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: totalItemPrice,
        quantity: itemQuantity,
        selectedCombos: selectedCombos.map((combo) => ({
          id: combo.id,
          name: combo.name,
          price: combo.price || 0,
        })),
        totalPrice: totalItemPrice * itemQuantity,
      };
      setCart((prev) => [...prev, newOrderItem]);
    }

    toast.success("Cart has been updated");
  };

  const updateCartItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((item) => item.id !== itemId));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity: newQuantity,
                totalPrice: newQuantity * item.price,
              }
            : item
        )
      );
    }
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50">
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-primary/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4 md:gap-0">
            <div className="flex items-center gap-4">
              <Image
                src={brand?.logo || "/cheflymenuapp-192.png"}
                alt={restaurantName}
                width={60}
                height={60}
                className="w-12 h-12 sm:w-15 sm:h-15 object-cover rounded-full shadow-lg ring-2 ring-primary/20"
              />
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                {restaurantName}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              {user?.subscription.plan === "free" ? (
                <div className="text-xs text-muted-foreground bg-card px-3 py-1 rounded-full border">
                  Powered by{" "}
                  <span
                    className="font-semibold"
                    style={{ color: primaryColor }}
                  >
                    CheflyMenu
                  </span>
                </div>
              ) : (
                <ShareOrInstallButton
                  primaryColor={primaryColor}
                  setShowQR={setShowQR}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {brand?.description && (
        <section className="bg-white/60 backdrop-blur-sm border-b border-primary/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
              {capitalizeFirstLetter(brand.description)}
            </p>
          </div>
        </section>
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="relative max-w-md mx-auto" ref={searchContainerRef}>
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 z-10 text-muted-foreground w-5 h-5" />
            <Input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-15 pr-4 py-3 text-lg bg-white/80 backdrop-blur-sm border-primary/20 focus:border-primary shadow-lg rounded-full"
              style={{
                borderColor: `${primaryColor}20`,
              }}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchDropdown(false);
                }}
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </Button>
            )}

            {showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-primary/10 z-50 max-h-96 overflow-hidden">
                {searchResults.length > 0 ? (
                  <>
                    <div className="p-4 border-b border-primary/10 bg-gray-50/50">
                      <h3 className="text-sm font-semibold text-muted-foreground">
                        Search Results ({searchResults.length})
                      </h3>
                    </div>
                    <div className="overflow-y-auto max-h-80">
                      {searchResults
                        .slice(
                          0,
                          user.subscription.plan === "free"
                            ? 5
                            : searchResults.length
                        )
                        .map((item) => (
                          <div
                            key={item.id}
                            className="p-4 border-b border-primary/5 hover:bg-primary/5 cursor-pointer transition-colors last:border-b-0"
                            onClick={() => handleSearchItemSelect(item)}
                          >
                            <div className="flex items-center gap-3">
                              {item.images && item.images.length > 0 && (
                                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                  <Image
                                    src={item.images[0] || "/placeholder.svg"}
                                    alt={item.name}
                                    width={12}
                                    height={12}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-foreground truncate text-sm">
                                  {formatText(item.name)}
                                </h4>
                                <p className="text-xs text-muted-foreground line-clamp-1">
                                  {capitalizeFirstLetter(item.description)}
                                </p>
                                <div className="flex items-center justify-between gap-2 mt-1">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs border-0 px-2 py-0"
                                    style={{
                                      backgroundColor: `${secondaryColor}20`,
                                      color: secondaryColor,
                                    }}
                                  >
                                    {item.category}
                                  </Badge>
                                  <span
                                    className="text-xs font-semibold"
                                    style={{ color: secondaryColor }}
                                  >
                                    {formatPrice(item.price)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                ) : (
                  <div className="p-6 text-center">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                      style={{ backgroundColor: `${primaryColor}20` }}
                    >
                      <Search
                        className="w-6 h-6"
                        style={{ color: primaryColor }}
                      />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">
                      No items found
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      No menu items match "{debouncedSearchQuery}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* QR Code Modal */}
        {showQR && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-foreground">
                  Share Our Menu
                </h3>
                <p className="text-muted-foreground mt-2">
                  Scan to view our digital menu
                </p>
              </div>
              <QRCodeComponent value={window.location.href} />
              <Button
                onClick={() => setShowQR(false)}
                className="w-full mt-6 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                Close
              </Button>
            </div>
          </div>
        )}

        {categories.length > 0 && (
          <div className="mb-10">
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant={selectedCategory === "All" ? "default" : "outline"}
                onClick={() => setSelectedCategory("All")}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === "All"
                    ? "text-white shadow-lg scale-105"
                    : "bg-white/80 hover:bg-white border-primary/20 hover:border-primary/40 text-foreground hover:text-primary/60"
                }`}
                style={
                  selectedCategory === "All"
                    ? { backgroundColor: primaryColor }
                    : {}
                }
              >
                All Items ({menuItems.length})
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.name ? "default" : "outline"
                  }
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                    selectedCategory === category.name
                      ? "text-white shadow-lg scale-105"
                      : "bg-white/80 hover:bg-white border-primary/20 hover:border-primary/40 text-foreground hover:text-primary/60"
                  }`}
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

        {displayItems.length === 0 ? (
          <div className="text-center py-16">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <Utensils className="w-12 h-12" style={{ color: primaryColor }} />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-3">
              {searchQuery ? "No items found" : "No items available"}
            </h3>
            <p className="text-muted-foreground text-lg">
              {searchQuery
                ? `No menu items match "${searchQuery}". Try a different search term.`
                : selectedCategory === "All"
                ? "This menu is currently being updated"
                : "No items in this category"}
            </p>
            {searchQuery && (
              <Button
                onClick={() => setSearchQuery("")}
                variant="outline"
                className="mt-4"
              >
                Clear Search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-8">
            {displayItems.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white border-primary/10 hover:border-primary/30 hover:scale-[1.02]"
                onClick={() => setSelectedItem(item)}
              >
                <div className="lg:flex">
                  {item.images && item.images.length > 0 && (
                    <div className="lg:w-80 h-48 lg:h-56 relative overflow-hidden flex-shrink-0">
                      <Image
                        src={item.images[0] || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                      {user.subscription.plan !== "free" &&
                        item.images.length > 1 && (
                          <Badge className="absolute top-3 right-3 bg-black/70 text-white border-0">
                            +{item.images.length - 1} photos
                          </Badge>
                        )}
                      {item.isCombo && (
                        <Badge className="absolute top-2 left-2 bg-[#d97706] text-white px-2 py-1 rounded text-xs font-medium">
                          Combo
                        </Badge>
                      )}
                    </div>
                  )}
                  <CardContent className="flex-1 p-8">
                    <div className="flex justify-between lg:items-start mb-4 gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-2 text-balance">
                          {formatText(item.name)}
                        </h3>
                        <Badge
                          variant="secondary"
                          className="border-0 mb-3"
                          style={{
                            backgroundColor: `${secondaryColor}20`,
                            color: secondaryColor,
                          }}
                        >
                          {item.category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <span
                          className="text-2xl lg:text-3xl font-bold"
                          style={{ color: secondaryColor }}
                        >
                          {formatPrice(item.price)}
                        </span>
                      </div>
                    </div>
                    {item.description && (
                      <p className="text-muted-foreground text-lg leading-relaxed text-pretty first-letter:uppercase mb-4">
                        {capitalizeFirstLetter(item.description)}
                      </p>
                    )}
                    {item.isCombo &&
                      item.subItems &&
                      item.subItems.length > 0 && (
                        <div className="">
                          <p className="text-sm text-gray-500 mb-1">
                            Combo options:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {item.subItems.slice(0, 3).map((subItem) => (
                              <span
                                key={subItem.id}
                                className="text-xs px-2 py-1 rounded"
                                style={{
                                  backgroundColor: `${secondaryColor}20`,
                                  color: secondaryColor,
                                }}
                              >
                                {subItem.name}
                              </span>
                            ))}
                            {item.subItems.length > 3 && (
                              <span className="text-xs self-center text-gray-500">
                                +{item.subItems.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}

        {user.subscription.plan === "free" && (
          <div className="text-center mt-16 py-8 border-t border-primary/20">
            <p className="text-muted-foreground">
              Powered by{" "}
              <a
                href="/"
                className="font-semibold hover:opacity-80 transition-colors"
                style={{ color: primaryColor }}
              >
                CheflyMenu
              </a>
            </p>
          </div>
        )}
      </div>

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          userPlan={user.subscription.plan}
          userFeatures={user.subscription.features || []}
          brand={brand}
          onAddToCart={addToCart}
          cart={cart}
          setShowCart={setShowCart}
        />
      )}

      {cartItemCount > 0 && (
        <CartModal
          cart={cart}
          onUpdateQuantity={updateCartItemQuantity}
          onRemoveItem={removeFromCart}
          onClearCart={clearCart}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          userFeatures={user.subscription.features || []}
          brand={brand}
          showCart={showCart}
          setShowCart={setShowCart}
          userId={user.id}
        />
      )}

      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 w-12 h-12 rounded-full shadow-2xl text-white z-40 hover:scale-110 transition-all duration-300"
          style={{ backgroundColor: primaryColor }}
        >
          <ChevronUp className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
};

const ItemDetailModal = ({
  item,
  onClose,
  primaryColor,
  secondaryColor,
  userPlan,
  userFeatures,
  brand,
  onAddToCart,
  setShowCart,
  cart,
}: ItemDetailModalProps & {
  onAddToCart: (
    item: MenuItem,
    selectedCombos: any[],
    itemQuantity: number
  ) => void;
  setShowCart: (x: boolean) => void;
  cart: OrderItem[];
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedCombos, setSelectedCombos] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);

  const displayImages =
    userPlan === "free" && item.images ? [item.images[0]] : item.images || [];

  const hasOrderingFeature = ["whatsapp_ordering", "manual_ordering"].some(
    (f) => userFeatures.includes(f)
  );

  const nextImage = () => {
    if (displayImages && displayImages.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
    }
  };

  const prevImage = () => {
    if (displayImages && displayImages.length > 1) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + displayImages.length) % displayImages.length
      );
    }
  };

  const toggleCombo = (combo: any) => {
    setSelectedCombos((prev) => {
      const exists = prev.find((c) => c.id === combo.id);
      if (exists) {
        return prev.filter((c) => c.id !== combo.id);
      } else {
        return [...prev, combo];
      }
    });
  };

  const handleAddToCart = () => {
    onAddToCart(item, selectedCombos, quantity);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
        <CardContent className="p-0">
          {displayImages && displayImages.length > 0 && (
            <div className="relative h-56 md:h-64 border-b">
              <Image
                src={displayImages[currentImageIndex] || "/placeholder.svg"}
                alt={item.name}
                fill
                className="w-full h-full object-contain"
              />
              {displayImages.length > 1 && (
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
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                    {displayImages.map((_, index) => (
                      <div
                        key={index}
                        className={`w-3 h-3 rounded-full transition-all ${
                          index === currentImageIndex
                            ? "bg-white shadow-lg"
                            : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="p-6">
            <div className="flex justify-between mb-4 gap-3">
              <div className="flex-1">
                <h2 className="text-lg md:text-xl font-bold text-foreground text-balance capitalize">
                  {formatText(item.name)}
                </h2>
              </div>
              <div className="text-right">
                <span
                  className="text-xl md:text-2xl font-bold"
                  style={{ color: secondaryColor }}
                >
                  {formatPrice(item.price)}
                </span>
              </div>
            </div>

            {item.description && (
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed mb-6 text-pretty">
                {capitalizeFirstLetter(item.description)}
              </p>
            )}

            {hasOrderingFeature ? (
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm font-medium">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-8 text-center font-medium">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : null}

            {item.isCombo && item.subItems && item.subItems.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Available Combos (Optional):
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {item.subItems.map((subItem) => (
                    <div
                      key={subItem.id}
                      className={`flex justify-between items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedCombos.find((c) => c.id === subItem.id)
                          ? "bg-blue-50 border-blue-200"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                      onClick={() => toggleCombo(subItem)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                            selectedCombos.find((c) => c.id === subItem.id)
                              ? "bg-blue-500 border-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedCombos.find((c) => c.id === subItem.id) && (
                            <div className="w-2 h-2 bg-white rounded-sm" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {subItem.name}
                        </span>
                      </div>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: secondaryColor }}
                      >
                        {subItem.price
                          ? `+${formatPrice(subItem.price)}`
                          : "Free"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-start sm:items-center gap-4">
              <Badge
                variant="secondary"
                className="text-xs border-0 self-center"
                style={{
                  backgroundColor: `${secondaryColor}20`,
                  color: secondaryColor,
                }}
              >
                {item.category}
              </Badge>

              <div className="flex flex-col sm:flex-row gap-2">
                {hasOrderingFeature && (
                  <>
                    {/* Add to Cart Button */}
                    <Button
                      onClick={handleAddToCart}
                      className="text-white px-4 py-2 flex items-center gap-2"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart (
                      {formatPrice(
                        (item.price +
                          selectedCombos.reduce(
                            (sum, combo) => sum + (combo.price || 0),
                            0
                          )) *
                          quantity
                      )}
                      )
                    </Button>

                    {/* Manual Order Button */}
                    {cart.length > 0 && (
                      <Button
                        onClick={() => {
                          setShowCart(true);
                        }}
                        variant="outline"
                        className="px-4 py-2 flex items-center gap-2"
                      >
                        View Cart
                      </Button>
                    )}
                  </>
                )}
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="px-6 py-2 bg-transparent"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const CartModal = ({
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  primaryColor,
  secondaryColor,
  brand,
  userFeatures,
  showCart,
  setShowCart,
  userId
}: CartModalProps) => {
  const [showManualOrderForm, setShowManualOrderForm] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });
  const { createOrder } = useOrders();
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const hasWhatsAppFeature = hasFeatureAccess(userFeatures, [
    "whatsapp_ordering",
  ]);

  const hasManualOrdering = hasFeatureAccess(userFeatures, ["manual_ordering"]);

  const generateWhatsAppOrderLink = () => {
    if (!brand?.whatsappNumber || !hasWhatsAppFeature) return "#";

    const restaurantName = brand?.name || "Restaurant";
    const itemsList = cart
      .map((item) => {
        const combosText =
          item.selectedCombos && item.selectedCombos.length > 0
            ? ` (${item.selectedCombos.map((c) => c.name).join(", ")})`
            : "";
        return `    • ${item.quantity}x ${
          item.name
        }${combosText} - ${formatPrice(item.totalPrice)}`;
      })
      .join("\n");

    const message = `Hello ${restaurantName}!\n\nI would like to order:\n${itemsList}\n\nDelivery Details:\n    • Seat Number: [Please fill if valid]\n    • Address: [Please fill if valid]\n\nTotal Amount: ${formatPrice(
      cartTotal
    )}\n\nThank you!`;

    const encodedMessage = encodeURIComponent(message);
    const cleanNumber = brand.whatsappNumber.replace(/[^\d]/g, "");

    return `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
  };

  const handleManualOrder = async () => {
    if (
      !customerInfo.name.trim() ||
      !customerInfo.phone.trim() ||
      !customerInfo.address.trim()
    ) {
      toast.error("Please fill in all required customer details");
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const orderItems = cart.map((item) => ({
        id: item.id,
        menuItemId: item.menuItemId,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedCombos: item.selectedCombos,
        totalPrice: item.totalPrice,
      }));

      const customer = {
        name: customerInfo.name.trim(),
        phone: customerInfo.phone.trim(),
        address: customerInfo.address.trim(),
      };

      const result = await createOrder(
        userId,
        customer,
        orderItems,
        customerInfo.notes.trim() || undefined
      );

      if (result.success) {
        toast.success(
          "Your order has been saved and will be processed shortly."
        );
        setCustomerInfo({ name: "", phone: "", address: "", notes: "" });
        onClearCart();
        setShowManualOrderForm(false);
        setShowCart(false);
      } else {
        toast.error(
          `Failed to place order: ${result.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error placing manual order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (!showCart) {
    return (
      <Button
        onClick={() => setShowCart(true)}
        className="fixed bottom-40 right-6 w-14 h-14 rounded-full shadow-2xl text-white hover:scale-110 transition-all duration-300 z-40"
        style={{ backgroundColor: primaryColor }}
      >
        <ShoppingCart className="w-6 h-6" />
        <Badge className="absolute -top-2 -right-2 bg-red-500 text-white border-0 min-w-[1.5rem] h-6 flex items-center justify-center text-xs">
          {cartItemCount}
        </Badge>
      </Button>
    );
  }

  if (showManualOrderForm) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Manual Order Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowManualOrderForm(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-2 bg-gray-50 rounded"
                  >
                    <div>
                      <span className="font-medium">
                        {item.quantity}x {item.name}
                      </span>
                      {item.selectedCombos &&
                        item.selectedCombos.length > 0 && (
                          <div className="text-xs text-gray-600">
                            Combos:{" "}
                            {item.selectedCombos.map((c) => c.name).join(", ")}
                          </div>
                        )}
                    </div>
                    <span
                      className="font-semibold"
                      style={{ color: secondaryColor }}
                    >
                      {formatPrice(item.totalPrice)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg mt-3">
                <span className="font-bold">Total:</span>
                <span className="text-lg font-bold text-green-600">
                  {formatPrice(cartTotal)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Customer Name *
                </label>
                <Input
                  value={customerInfo.name}
                  onChange={(e) =>
                    setCustomerInfo((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number *
                </label>
                <Input
                  value={customerInfo.phone}
                  onChange={(e) =>
                    setCustomerInfo((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  placeholder="Enter your phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Delivery Address *
                </label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={customerInfo.address}
                  onChange={(e) =>
                    setCustomerInfo((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Enter your delivery address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Special Notes (Optional)
                </label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={2}
                  value={customerInfo.notes}
                  onChange={(e) =>
                    setCustomerInfo((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Any special instructions"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowManualOrderForm(false)}
                className="flex-1"
              >
                Back to Cart
              </Button>
              <Button
                onClick={handleManualOrder}
                className="flex-1 text-white"
                style={{ backgroundColor: primaryColor }}
                disabled={isSubmittingOrder}
              >
                {isSubmittingOrder ? "Placing Order..." : "Place Manual Order"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Your Cart ({cartItemCount} items)
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCart(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      {item.selectedCombos &&
                        item.selectedCombos.length > 0 && (
                          <p className="text-xs text-gray-600">
                            Combos:{" "}
                            {item.selectedCombos.map((c) => c.name).join(", ")}
                          </p>
                        )}
                      <p className="text-sm text-gray-600">
                        {formatPrice(item.price)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity - 1)
                        }
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          onUpdateQuantity(item.id, item.quantity + 1)
                        }
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: secondaryColor }}
                    >
                      {formatPrice(item.totalPrice)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg mb-6">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-xl font-bold text-green-600">
                  {formatPrice(cartTotal)}
                </span>
              </div>

              <div className="space-y-3">
                {brand?.whatsappNumber && hasWhatsAppFeature && (
                  <Button
                    onClick={() =>
                      window.open(generateWhatsAppOrderLink(), "_blank")
                    }
                    className="w-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Order via WhatsApp
                  </Button>
                )}
                {hasManualOrdering && (
                  <Button
                    onClick={() => setShowManualOrderForm(true)}
                    className="w-full text-white flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <Phone className="w-4 h-4" />
                    Place Manual Order
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={onClearCart}
                    className="flex-1 bg-transparent"
                  >
                    Clear Cart
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCart(false)}
                    className="flex-1"
                  >
                    Continue Shopping
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
