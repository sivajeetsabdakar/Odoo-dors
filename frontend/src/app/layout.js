import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import Navbar from "@/components/Navbar"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "StackIt - Q&A Forum",
  description: "A collaborative Q&A platform for developers",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen bg-background">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
