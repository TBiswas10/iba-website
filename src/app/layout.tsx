import type { Metadata, Viewport } from "next";
import { Outfit, IBM_Plex_Sans, Noto_Sans_Bengali } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

import { Providers } from "@/components/providers";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

import "./globals.css";

const heading = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
});

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "700"],
});

const bengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-bn",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Illawarra Bengali Association | IBA",
    template: "%s | IBA",
  },
  description: "A living digital home for Bengali families in Illawarra with events, membership, resources, and collective giving.",
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://iba-website-i8fy.vercel.app/",
    siteName: "Illawarra Bengali Association",
    images: [{ url: "/Illawarra-Bengali-Association-Logo.svg" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
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
