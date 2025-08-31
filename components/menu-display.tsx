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
  QrCode,
  Search,
  Utensils,
  X,
} from "lucide-react";
import type { MenuItem } from "@/types/menu";
import Image from "next/image";
import { MenuCache } from "@/lib/menuCache";
import type { ItemDetailModalProps, MenuDisplayProps } from "./types";
import { debounce } from "lodash";

const menuCache = new MenuCache();

export const MenuDisplay = ({
  user,
  menuItems,
  categories,
  brand,
}: MenuDisplayProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(() => {
    const cacheKey = `${user.id}-${searchQuery}-${selectedCategory}`;
    const cached = menuCache.get(cacheKey);

    if (cached) {
      return cached;
    }

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

    menuCache.set(cacheKey, filtered);
    return filtered;
  }, [menuItems, searchQuery, selectedCategory, user.id]);

  useEffect(() => {
    return () => {
      menuCache.destroy();
    };
  }, []);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-emerald-50">
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-primary/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {brand?.logo ? (
                <div className="relative">
                  <Image
                    src={brand.logo || "/placeholder.svg"}
                    alt={restaurantName}
                    width={60}
                    height={60}
                    className="w-12 h-12 sm:w-15 sm:h-15 object-cover rounded-full shadow-lg ring-2 ring-primary/20"
                  />
                </div>
              ) : (
                <div
                  className="w-12 h-12 sm:w-15 sm:h-15 rounded-full flex items-center justify-center shadow-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Utensils className="w-6 h-6 text-white" />
                </div>
              )}
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
                <Button
                  onClick={() => setShowQR(!showQR)}
                  className="text-white shadow-lg font-medium"
                  style={{ backgroundColor: primaryColor }}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Share Menu
                </Button>
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
                                  <img
                                    src={item.images[0] || "/placeholder.svg"}
                                    alt={item.name}
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

        {categories.length > 0 && (
          <div className="mb-10">
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant={selectedCategory === "All" ? "default" : "outline"}
                onClick={() => setSelectedCategory("All")}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === "All"
                    ? "text-white shadow-lg scale-105"
                    : "bg-white/80 hover:bg-white border-primary/20 hover:border-primary/40 text-foreground"
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
                      : "bg-white/80 hover:bg-white border-primary/20 hover:border-primary/40 text-foreground"
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
                      <img
                        src={item.images[0] || "/placeholder.svg"}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                      {user.subscription.plan !== "free" &&
                        item.images.length > 1 && (
                          <Badge className="absolute top-3 right-3 bg-black/70 text-white border-0">
                            +{item.images.length - 1} photos
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
                      <p className="text-muted-foreground text-lg leading-relaxed text-pretty first-letter:uppercase">
                        {capitalizeFirstLetter(item.description)}
                      </p>
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
}: ItemDetailModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const displayImages =
    userPlan === "free" && item.images ? [item.images[0]] : item.images || [];

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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
        <CardContent className="p-0">
          {displayImages && displayImages.length > 0 && (
            <div className="relative h-56 md:h-64 pb-3 border-b">
              <img
                src={displayImages[currentImageIndex] || "/placeholder.svg"}
                alt={item.name}
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
                <h2 className="text-lg md:text-xl font-bold text-foreground mb-2 text-balance capitalize">
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

            <div className="flex justify-between items-start sm:items-center gap-4">
              <Badge
                variant="secondary"
                className="text-xs border-0"
                style={{
                  backgroundColor: `${secondaryColor}20`,
                  color: secondaryColor,
                }}
              >
                {item.category}
              </Badge>
              <Button
                onClick={onClose}
                className="text-white px-6 py-2"
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
