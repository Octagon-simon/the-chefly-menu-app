"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, QrCode } from "lucide-react"
import QRCodeLib from "qrcode"
import { QRCodeGeneratorProps } from "./types"

export const QRCodeGenerator = ({ url, brandName }: QRCodeGeneratorProps) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")
  const [size, setSize] = useState("300")
  const [format, setFormat] = useState("png")
  const [loading, setLoading] = useState(false)

  const generateQRCode = async () => {
    setLoading(true)
    try {
      const qrDataUrl = await QRCodeLib.toDataURL(url, {
        width: Number.parseInt(size),
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      })
      setQrCodeUrl(qrDataUrl)
    } catch (error) {
      console.error("Error generating QR code:", error)
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = () => {
    if (!qrCodeUrl) return

    const link = document.createElement("a")
    link.download = `${brandName.toLowerCase().replace(/\s+/g, "-")}-menu-qr.${format}`
    link.href = qrCodeUrl
    link.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          QR Code Generator
        </CardTitle>
        <CardDescription>
          Generate QR codes for your menu that customers can scan to access your digital menu.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="size">Size (pixels)</Label>
            <Select value={size} onValueChange={setSize}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="200">200x200</SelectItem>
                <SelectItem value="300">300x300</SelectItem>
                <SelectItem value="400">400x400</SelectItem>
                <SelectItem value="500">500x500</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="format">Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
                <SelectItem value="svg">SVG</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={generateQRCode} disabled={loading} className="w-full">
          {loading ? "Generating..." : "Generate QR Code"}
        </Button>

        {qrCodeUrl && (
          <div className="text-center space-y-4">
            <div className="inline-block p-4 bg-white rounded-lg shadow-md">
              <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="mx-auto" />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                Scan this QR code to access your menu at: <br />
                <span className="font-mono text-xs break-all">{url}</span>
              </p>

              <Button onClick={downloadQRCode} variant="outline" className="w-full bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Download QR Code
              </Button>
            </div>
          </div>
        )}

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">How to use your QR code:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Print the QR code and place it on tables</li>
            <li>• Add it to your restaurant's signage</li>
            <li>• Include it in your marketing materials</li>
            <li>• Share it on social media</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
