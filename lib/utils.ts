import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Order } from "@/types/order";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .trim();
}

export function generateRandomUsername(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(price);
}

export function capitalizeFirstLetter(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formatText(name: string): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => capitalizeFirstLetter(word))
    .join(" ");
}

export function exportOrdersToCSV(orders: Order[], filename?: string): void {
  if (orders.length === 0) {
    alert("No orders to export");
    return;
  }

  // Create CSV headers
  const headers = [
    "Order ID",
    "Customer Name",
    "Customer Phone",
    "Customer Address",
    "Order Date",
    "Status",
    "Items",
    "Total Amount",
    "Notes",
  ];

  // Convert orders to CSV rows
  const csvRows = orders.map((order) => {
    const itemsText = order.items
      .map(
        (item) =>
          `${item.name} (x${
            item.quantity
          }) - ₦${item.totalPrice.toLocaleString()}`
      )
      .join("; ");

    return [
      order.id,
      `"${order.customer.name}"`,
      order.customer.phone,
      `"${order.customer.address}"`,
      new Date(order.createdAt).toLocaleDateString(),
      order.status,
      `"${itemsText}"`,
      order.totalAmount,
      order.notes ? `"${order.notes}"` : "",
    ];
  });

  // Combine headers and rows
  const csvContent = [headers, ...csvRows]
    .map((row) => row.join(","))
    .join("\n");

  // Create and download the file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    filename || `orders-export-${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportOrdersSummaryToCSV(
  orders: Order[],
  filename?: string
): void {
  if (orders.length === 0) {
    alert("No orders to export");
    return;
  }

  // Calculate summary data
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order) =>
    ["pending", "confirmed", "preparing", "ready"].includes(order.status)
  ).length;
  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  ).length;
  const cancelledOrders = orders.filter(
    (order) => order.status === "cancelled"
  ).length;
  const totalRevenue = orders
    .filter((order) => order.status === "completed")
    .reduce((sum, order) => sum + order.totalAmount, 0);

  // Create summary CSV
  const summaryData = [
    ["Metric", "Value"],
    ["Total Orders", totalOrders],
    ["Pending Orders", pendingOrders],
    ["Completed Orders", completedOrders],
    ["Cancelled Orders", cancelledOrders],
    ["Total Revenue", `₦${totalRevenue.toLocaleString()}`],
    ["Export Date", new Date().toLocaleDateString()],
  ];

  const csvContent = summaryData.map((row) => row.join(",")).join("\n");

  // Create and download the file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    filename || `orders-summary-${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function filterOrdersByDateRange(
  orders: Order[],
  startDate: string,
  endDate: string
): Order[] {
  if (!startDate && !endDate) return orders;

  return orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    const start = startDate ? new Date(startDate) : new Date("1900-01-01");
    const end = endDate ? new Date(endDate) : new Date("2100-12-31");

    // Set end date to end of day
    end.setHours(23, 59, 59, 999);

    return orderDate >= start && orderDate <= end;
  });
}

export function getFirstWord(text: string): string {
  if (!text) return "";
  return text.trim().split(/\s+/)[0] || "";
}
