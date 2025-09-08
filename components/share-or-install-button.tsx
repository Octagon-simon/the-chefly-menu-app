"use client";

import { Button } from "@/components/ui/button";
import { QrCode, Download } from "lucide-react";
import { usePWAInstall } from "@/hooks/use-pwa-install";

export default function ShareOrInstallButton({
  primaryColor,
  setShowQR,
}: {
  primaryColor: string;
  setShowQR: (show: boolean) => void;
}) {
  const { canInstall, install } = usePWAInstall();

  const handleClick = () => {
    if (canInstall) {
      install();
    } else {
      setShowQR(true);
    }
  };

  return (
    <>
      <Button
        onClick={handleClick}
        className="text-white shadow-lg font-medium"
        style={{ backgroundColor: primaryColor }}
      >
        {canInstall ? (
          <>
            <Download className="w-4 h-4 mr-2" />
            Install App
          </>
        ) : (
          <>
            <QrCode className="w-4 h-4 mr-2" />
            Share Menu
          </>
        )}
      </Button>
    </>
  );
}
