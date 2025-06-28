"use client"

import { useEffect, useRef } from "react"
import QRCode from "qrcode"

interface QRCodeProps {
  value: string
  size?: number
}

export const QRCodeComponent = ({ value, size = 200 }: QRCodeProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, value, {
        width: size,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
    }
  }, [value, size])

  return (
    <div className="flex flex-col items-center gap-2">
      <canvas ref={canvasRef} className="border rounded-lg" />
      <p className="text-sm text-gray-600">Scan to view menu</p>
    </div>
  )
}
