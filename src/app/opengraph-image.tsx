import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Illawarra Bengali Association | IBA",
  description: "A living digital home for Bengali families in Illawarra with events, membership, resources, and collective giving.",
  openGraph: {
    title: "Illawarra Bengali Association | IBA",
    description: "A living digital home for Bengali families in Illawarra with events, membership, resources, and collective giving.",
    url: "https://iba-website-i8fy.vercel.app/",
    siteName: "Illawarra Bengali Association",
    images: [
      {
        url: "/Illawarra-Bengali-Association-Logo.svg",
        width: 800,
        height: 600,
        alt: "Illawarra Bengali Association Logo",
      },
    ],
    locale: "en_AU",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Illawarra Bengali Association | IBA",
    description: "A living digital home for Bengali families in Illawarra with events, membership, resources, and collective giving.",
    images: ["/Illawarra-Bengali-Association-Logo.svg"],
  },
};
