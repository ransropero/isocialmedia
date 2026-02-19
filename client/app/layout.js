import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Instagram Scheduler",
  description: "Schedule your Instagram posts easily",
};

import CommercialHeader from "@/components/CommercialHeader";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-indigo-500/30`}
      >
        <div className="min-h-screen flex flex-col">
          <CommercialHeader />
          {children}
        </div>
      </body>
    </html>
  );
}
