"use client";

import { useState, useEffect } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Check, X } from "lucide-react";

interface NotificationSetupProps {
  onPermissionChange?: (permission: NotificationPermission) => void;
}

export const NotificationSetup = ({
  onPermissionChange,
}: NotificationSetupProps) => {
  const { isSupported, permission, requestPermission, showNotification } =
    useNotifications();
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    onPermissionChange?.(permission);
  }, [permission, onPermissionChange]);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const result = await requestPermission();
      if (result === "granted") {
        // Show a test notification
        await showNotification({
          title: "🎉 Notifications Enabled!",
          body: "You'll now receive notifications when new orders arrive.",
          requireInteraction: false,
        });
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const getStatusColor = () => {
    switch (permission) {
      case "granted":
        return "text-green-600";
      case "denied":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  const getStatusIcon = () => {
    switch (permission) {
      case "granted":
        return <Check size={16} className="text-green-600" />;
      case "denied":
        return <X size={16} className="text-red-600" />;
      default:
        return <Bell size={16} className="text-yellow-600" />;
    }
  };

  const getStatusText = () => {
    switch (permission) {
      case "granted":
        return "Notifications enabled";
      case "denied":
        return "Notifications blocked";
      default:
        return "Notifications not enabled";
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <BellOff size={16} />
        <span>Notifications not supported in this browser</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      {permission !== "granted" && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleRequestPermission}
          disabled={isRequesting || permission === "denied"}
          className="flex items-center gap-2 bg-transparent"
        >
          <Bell size={14} />
          {isRequesting ? "Requesting..." : "Enable Notifications"}
        </Button>
      )}
    </div>
  );
};
