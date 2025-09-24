"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Search, Minus } from "lucide-react";
import type { MenuItem } from "@/types/menu";
import { formatPrice } from "@/lib/utils";

interface SearchableMenuSelectorProps {
  menuItems: MenuItem[];
  onAddItem: (
    item: MenuItem,
    selectedCombos?: any[],
    quantity?: number
  ) => void;
}

export const SearchableMenuSelector = ({
  menuItems,
  onAddItem,
}: SearchableMenuSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedCombos, setSelectedCombos] = useState<any[]>([]);
  const [quantity, setQuantity] = useState(1);

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) return menuItems.slice(0, 6); // Show first 6 items by default

    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [menuItems, searchTerm]);

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

  const handleItemSelect = (item: MenuItem) => {
    if (item.isCombo && item.subItems && item.subItems.length > 0) {
      setSelectedItem(item);
      setSelectedCombos([]);
      setQuantity(1);
    } else {
      onAddItem(item, [], 1);
    }
  };

  const handleConfirmItem = () => {
    if (selectedItem) {
      onAddItem(selectedItem, selectedCombos, quantity);
      console.log(selectedItem, selectedCombos, quantity)
      setSelectedItem(null);
      setSelectedCombos([]);
      setQuantity(1);
    }
  };

  const handleCancelSelection = () => {
    setSelectedItem(null);
    setSelectedCombos([]);
    setQuantity(1);
  };

  const getTotalPrice = () => {
    if (!selectedItem) return 0;
    const comboPrice = selectedCombos.reduce(
      (sum, combo) => sum + (combo.price || 0),
      0
    );
    return (selectedItem.price + comboPrice) * quantity;
  };

  return (
    <div>
      <Label>Search and Select Menu Items</Label>
      <div className="space-y-3 mt-2">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search menu items by name, category, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {selectedItem && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedItem.name}</h3>
                  <p className="text-sm text-gray-600">
                    {formatPrice(selectedItem.price)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelSelection}
                >
                  Cancel
                </Button>
              </div>

              {/* Quantity Selector */}
              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block">
                  Quantity
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
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
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Combo Selection */}
              {selectedItem.subItems && selectedItem.subItems.length > 0 && (
                <div className="mb-4">
                  <Label className="text-sm font-medium mb-2 block">
                    Available Combos (Optional)
                  </Label>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedItem.subItems.map((subItem) => (
                      <div
                        key={subItem.id}
                        className={`flex justify-between items-center p-2 rounded border cursor-pointer transition-colors ${
                          selectedCombos.find((c) => c.id === subItem.id)
                            ? "bg-blue-100 border-blue-300"
                            : "bg-white hover:bg-gray-50"
                        }`}
                        onClick={() => toggleCombo(subItem)}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                              selectedCombos.find((c) => c.id === subItem.id)
                                ? "bg-blue-500 border-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {selectedCombos.find(
                              (c) => c.id === subItem.id
                            ) && (
                              <div className="w-2 h-2 bg-white rounded-sm" />
                            )}
                          </div>
                          <span className="text-sm font-medium">
                            {subItem.name}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-green-600">
                          {subItem.price
                            ? `+${formatPrice(subItem.price)}`
                            : "Free"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total and Confirm */}
              <div className="flex justify-between items-center pt-3 border-t">
                <div>
                  <span className="text-sm text-gray-600">Total: </span>
                  <span className="font-semibold text-green-600">
                    {formatPrice(getTotalPrice())}
                  </span>
                </div>
                <Button
                  onClick={handleConfirmItem}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add to Order
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {!selectedItem && (
          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredItems.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                {searchTerm
                  ? "No items found matching your search"
                  : "No menu items available"}
              </div>
            ) : (
              filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-sm truncate">
                            {item.name}
                          </h4>
                          <span className="text-sm font-semibold text-green-600 ml-2">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {item.category}
                          </Badge>
                          {item.isCombo && (
                            <Badge variant="outline" className="text-xs">
                              Combo ({item.subItems?.length || 0} options)
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-gray-600 line-clamp-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleItemSelect(item)}
                        className="shrink-0"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        {item.isCombo && item.subItems?.length
                          ? "Select"
                          : "Add"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {searchTerm && filteredItems.length > 0 && !selectedItem && (
          <p className="text-xs text-gray-500">
            Showing {filteredItems.length} of {menuItems.length} items
          </p>
        )}
      </div>
    </div>
  );
};
