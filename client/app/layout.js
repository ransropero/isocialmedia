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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://isocialmedia.com.br'),
  title: {
    default: "iSocialMedia | Sua Vitrine Estratégica no Instagram",
    template: "%s | iSocialMedia"
  },
  description: "Transforme sua bio em uma central de vendas. Agendamento inteligente, Bio Pages premium e analytics para o seu Instagram.",
  keywords: ["instagram", "bio link", "agendamento instagram", "bio page", "marketing digital", "isocialmedia"],
  authors: [{ name: "iSocialMedia Team" }],
  creator: "iSocialMedia",
  publisher: "iSocialMedia",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "iSocialMedia | Sua Vitrine Estratégica no Instagram",
    description: "Agendamento inteligente e Bio Pages premium para profissionais.",
    url: "https://isocialmedia.com.br",
    siteName: "iSocialMedia",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "iSocialMedia - Bio Pages & Agendamento",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "iSocialMedia | Sua Vitrine Estratégica no Instagram",
    description: "Agendamento inteligente e Bio Pages premium para profissionais.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};


import { Suspense } from 'react';
import SiteTracker from "@/components/SiteTracker";
import CommercialHeader from "@/components/CommercialHeader";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-indigo-500/30`}
      >
        <div className="min-h-screen flex flex-col">
          <CommercialHeader />
          <Suspense fallback={null}>
            <SiteTracker>
              {children}
            </SiteTracker>
          </Suspense>
        </div>
      </body>
    </html>
  );
}
