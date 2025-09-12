"use client";

import { Badge } from "@/components/ui/badge";
import { Search, Globe, TrendingUp } from "lucide-react";

interface ProSEOBannerProps {
  restaurantName: string;
  isVisible?: boolean;
}

export function ProSEOBanner({
  restaurantName,
  isVisible = true,
}: ProSEOBannerProps) {
  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-50 to-amber-50 border border-emerald-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
          PRO SEO Active
        </Badge>
        <Globe className="h-4 w-4 text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-amber-600" />
          <span className="text-gray-700">Search Engine Optimized</span>
        </div>

        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-emerald-600" />
          <span className="text-gray-700">Rich Snippets Enabled</span>
        </div>

        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-blue-600" />
          <span className="text-gray-700">Sitemap Generated</span>
        </div>
      </div>

      <p className="text-xs text-gray-600 mt-2">
        {restaurantName} is discoverable on Google, Bing, and other search
        engines with enhanced visibility.
      </p>
    </div>
  );
}
