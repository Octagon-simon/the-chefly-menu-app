"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Minus, ShoppingCart, X } from "lucide-react";
import type { MenuItem } from "@/types/menu";
import type { OrderItem, Customer } from "@/types/order";
import { formatPrice } from "@/lib/utils";
import { SearchableMenuSelector } from "./searchable-menu-selector";
import { toast } from "sonner";

interface ManualOrderFormProps {
  menuItems: MenuItem[];
  onSubmit: (
    userId: string,
    customer: Customer,
    items: OrderItem[],
    notes?: string
  ) => Promise<void>;
  onClose: () => void;
  userId: string
}

export const ManualOrderForm = ({
  menuItems,
  onSubmit,
  onClose,
  userId
}: ManualOrderFormProps) => {
  const [customer, setCustomer] = useState<Customer>({
    name: "",
    phone: "",
    address: "",
  });
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const addItemToOrder = (menuItem: MenuItem) => {
    const existingItem = orderItems.find(
      (item) => item.menuItemId === menuItem.id
    );

    if (existingItem) {
      setOrderItems((prev) =>
        prev.map((item) =>
          item.menuItemId === menuItem.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                totalPrice: (item.quantity + 1) * item.price,
              }
            : item
        )
      );
    } else {
      const newOrderItem: OrderItem = {
        id: `${menuItem.id}-${Date.now()}`,
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        totalPrice: menuItem.price,
      };
      setOrderItems((prev) => [...prev, newOrderItem]);
    }
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
    } else {
      setOrderItems((prev) =>
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

  const removeItem = (itemId: string) => {
    setOrderItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !customer.name.trim() ||
      !customer.phone.trim() ||
      !customer.address.trim()
    ) {
      toast.error("Please fill in all customer details");
      return;
    }

    if (orderItems.length === 0) {
      toast.error("Please add at least one item to the order");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(userId, customer, orderItems, notes.trim() || undefined);
      toast.success("Order created successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to create order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Create Manual Order
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={customer.name}
                  onChange={(e) =>
                    setCustomer((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="customerAddress">Delivery Address *</Label>
                <Textarea
                  id="customerAddress"
                  value={customer.address}
                  onChange={(e) =>
                    setCustomer((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  placeholder="Enter delivery address"
                  rows={2}
                  required
                />
              </div>
            </div>

            <SearchableMenuSelector
              menuItems={menuItems}
              onAddItem={addItemToOrder}
            />

            {/* Order Items */}
            {orderItems.length > 0 && (
              <div>
                <Label>Order Items ({orderItems.length})</Label>
                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                  {orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-xs text-gray-600">
                          {formatPrice(item.price)} each
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateItemQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">
                          {item.quantity}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            updateItemQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          onClick={() => removeItem(item.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="text-sm font-semibold text-green-600 ml-4">
                        {formatPrice(item.totalPrice)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg mt-2">
                  <span className="font-semibold">Total Amount:</span>
                  <span className="text-lg font-bold text-green-600">
                    {formatPrice(totalAmount)}
                  </span>
                </div>
              </div>
            )}

            {/* Order Notes */}
            <div>
              <Label htmlFor="notes">Order Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions or notes"
                rows={2}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || orderItems.length === 0}
                className="flex-1"
              >
                {loading
                  ? "Creating Order..."
                  : `Create Order (${formatPrice(totalAmount)})`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
