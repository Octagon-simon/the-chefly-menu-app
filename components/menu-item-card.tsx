"use client"

import { useState } from "react"
import { formatPrice } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { MenuItem } from "@/types/menu"

interface MenuItemCardProps {
  item: MenuItem
}

export const MenuItemCard = ({ item }: MenuItemCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % item.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + item.images.length) % item.images.length)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        {item.images && item.images.length > 0 ? (
          <>
            <img
              src={item.images[currentImageIndex] || "/placeholder.svg"}
              alt={item.name}
              className="w-full h-full object-cover"
            />
            {item.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75"
                >
                  <ChevronRight size={16} />
                </button>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                  {item.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full ${
                        index === currentImageIndex ? "bg-white" : "bg-white bg-opacity-50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-800 mb-2">{item.name}</h3>
        {item.description && <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>}
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-green-600">{formatPrice(item.price)}</span>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">{item.category}</span>
        </div>
      </div>
    </div>
  )
}
