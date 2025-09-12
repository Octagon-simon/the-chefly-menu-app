"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import type { SubItem } from "@/types/menu";

interface ComboFormProps {
  subItems: SubItem[];
  onSubItemsChange: (subItems: SubItem[]) => void;
}

export const ComboForm = ({ subItems, onSubItemsChange }: ComboFormProps) => {
  const [newSubItem, setNewSubItem] = useState({ name: "", price: 0 });

  const addSubItem = () => {
    if (!newSubItem.name.trim()) return;

    const subItem: SubItem = {
      id: Date.now().toString(),
      name: newSubItem.name.trim(),
      price: newSubItem.price || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubItemsChange([...subItems, subItem]);
    setNewSubItem({ name: "", price: 0 });
  };

  const removeSubItem = (id: string) => {
    onSubItemsChange(subItems.filter((item) => item.id !== id));
  };

  const updateSubItem = (
    id: string,
    field: "name" | "price",
    value: string | number
  ) => {
    onSubItemsChange(
      subItems.map((item) =>
        item.id === id
          ? { ...item, [field]: value, updatedAt: new Date().toISOString() }
          : item
      )
    );
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Combo Items</Label>

      {/* Existing Sub Items */}
      {subItems.length > 0 && (
        <div className="space-y-3">
          {subItems.map((item) => (
            <div
              key={item.id}
              className="flex gap-3 items-center p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <Input
                  value={item.name}
                  onChange={(e) =>
                    updateSubItem(item.id, "name", e.target.value)
                  }
                  placeholder="Combo item name"
                  className="mb-2"
                />
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.price || 0}
                  onChange={(e) =>
                    updateSubItem(
                      item.id,
                      "price",
                      Number.parseFloat(e.target.value) || 0
                    )
                  }
                  placeholder="Additional price (₦)"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeSubItem(item.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Sub Item */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Label htmlFor="subItemName" className="text-sm">
              Combo Item Name
            </Label>
            <Input
              id="subItemName"
              value={newSubItem.name}
              onChange={(e) =>
                setNewSubItem({ ...newSubItem, name: e.target.value })
              }
              placeholder="e.g., Beef, Salad, Takeaway"
            />
          </div>
          <div className="w-32">
            <Label htmlFor="subItemPrice" className="text-sm">
              Price (₦)
            </Label>
            <Input
              id="subItemPrice"
              type="number"
              min="0"
              step="0.01"
              value={newSubItem.price}
              onChange={(e) =>
                setNewSubItem({
                  ...newSubItem,
                  price: Number.parseFloat(e.target.value) || 0,
                })
              }
              placeholder="1000"
            />
          </div>
          <Button
            type="button"
            onClick={addSubItem}
            className="px-3"
            disabled={!newSubItem.name.trim()}
          >
            <Plus size={16} />
          </Button>
        </div>
      </div>

      {subItems.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          No combo items added yet. Add items that can be paired with this menu
          item.
        </p>
      )}
    </div>
  );
};
