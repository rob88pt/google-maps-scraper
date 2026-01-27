import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Leads Command Center",
  description: "Manage Google Maps scraping jobs and explore business leads",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-slate-950 text-slate-50 h-screen overflow-hidden flex flex-col`}>
        <QueryProvider>
          <div className="flex-1 overflow-hidden flex flex-col">
            {children}
          </div>
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
