import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans, Noto_Sans_Bengali } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

const heading = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "600", "700"],
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const bengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-bn",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://iba-website-i8fy.vercel.app/"),
  title: {
    default: "Illawarra Bengali Association | IBA",
    template: "%s | IBA",
  },
  description: "A living digital home for Bengali families in Illawarra with events, membership, resources, and collective giving.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "IBA Inc.",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
    shortcut: "/icon0.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://iba-website-i8fy.vercel.app/",
    siteName: "Illawarra Bengali Association",
    images: [{ url: "/Illawarra-Bengali-Association-Logo.svg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Illawarra Bengali Association | IBA",
    description: "A living digital home for Bengali families in Illawarra with events, membership, resources, and collective giving.",
    images: ["/Illawarra-Bengali-Association-Logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://iba-website-i8fy.vercel.app/",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <meta name="google-site-verification" content="UL4C9a9xEBsiqC-Fbog3btbkUNw2dlvKHxNtsuYEKOI" />
        <meta name="apple-mobile-web-app-title" content="IBA Inc." />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${heading.variable} ${body.variable} ${bengali.variable}`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <div className="orb-bg" />
            <SiteHeader />
            <main id="main-content" className="container page-shell">
              {children}
            </main>
            <SiteFooter />
          </Providers>
        </NextIntlClientProvider>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
