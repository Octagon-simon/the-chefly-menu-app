import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "Chefly Menu - Digital Restaurant Menu",
  description:
    "Create beautiful digital menus for your restaurant with QR codes",
  generator: "Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={true}
        />
        {children}
      </body>
    </html>
  );
}
