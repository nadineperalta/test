import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeToggle } from "@/components/ThemeToggle";
import { DeviceToggle } from "@/components/DeviceToggle";
import { DeviceProvider } from "@/components/DeviceContext";
import { DeviceFrame } from "@/components/DeviceFrame";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#954535" },
    { media: "(prefers-color-scheme: dark)", color: "#1a0f0d" },
  ],
};

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "Track your habits",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Habits",
  },
  icons: {
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        <DeviceProvider>
          <DeviceFrame>
            <nav className="flex items-center justify-end gap-2 px-4 sm:px-6 pt-5 max-w-3xl mx-auto">
              <DeviceToggle />
              <ThemeToggle />
            </nav>
            <ErrorBoundary>{children}</ErrorBoundary>
          </DeviceFrame>
        </DeviceProvider>
      </body>
    </html>
  );
}
