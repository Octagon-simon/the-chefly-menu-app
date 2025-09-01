import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import "react-toastify/dist/ReactToastify.css";
import Script from "next/script";
import Providers from "@/config/providers";

export const metadata: Metadata = {
  title: "Chefly Menu - Digital Restaurant Menu",
  description:
    "Create beautiful digital menus for your restaurant with QR codes",
  generator: "Next.js",

  openGraph: {
    title: "Chefly Menu - Digital Restaurant Menu",
    description:
      "Create beautiful digital menus for your restaurant with QR codes",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL + "/og-image.png"}`,
        width: 1200,
        height: 630,
        alt: "Chefly Menu preview",
      },
    ],
    type: "website",
    locale: "en_US",
    siteName: "CheflyMenu",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chefly Menu - Digital Restaurant Menu",
    description:
      "Create beautiful digital menus for your restaurant with QR codes",
    images: [`${process.env.NEXT_PUBLIC_APP_URL + "/og-image.png"}`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-02KPMKGY5G"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-02KPMKGY5G');
          `}
        </Script>
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
