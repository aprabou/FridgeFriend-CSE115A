import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { InventoryProvider } from "./contexts/InventoryContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Food Inventory App",
  description: "Manage your food inventory with expiration tracking",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <InventoryProvider>{children}</InventoryProvider>
      </body>
    </html>
  )
}
