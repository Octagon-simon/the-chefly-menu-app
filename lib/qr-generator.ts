import QRCode from "qrcode"

export const generateQRCode = async (text: string, format: "png" | "svg" = "png", size = 512): Promise<string> => {
  const options = {
    width: size,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  }

  if (format === "svg") {
    return QRCode.toString(text, { ...options, type: "svg" })
  }

  return QRCode.toDataURL(text, options)
}

export const downloadQRCode = (dataUrl: string, filename: string, format: "png" | "jpg" | "svg") => {
  const link = document.createElement("a")
  link.download = `${filename}.${format}`
  link.href = dataUrl
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
