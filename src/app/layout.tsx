import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "Track your habits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        <nav className="flex items-center justify-end px-6 pt-5 max-w-3xl mx-auto">
          <ThemeToggle />
        </nav>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
