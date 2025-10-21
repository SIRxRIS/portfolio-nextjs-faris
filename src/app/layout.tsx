import type { Metadata } from "next";
import { ReactNode } from "react";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import AnimatedBackground from "@/components/Background";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Portfolio - Faris Hazim Supriyadi | Full Stack Developer",
  description: "Portfolio profesional Faris Hazim Supriyadi. Showcase proyek web development, sertifikat coding, dan tech stack. Berpengalaman dalam React, Next.js, Node.js, dan Firebase.",
  keywords: ["portfolio", "developer", "web development", "Next.js", "React", "Full Stack"],
  authors: [{ name: "Faris Hazim Supriyadi" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://faris-portfolio.vercel.app",
    title: "Portfolio - Faris Hazim Supriyadi | Full Stack Developer",
    description: "Showcase proyek web development, sertifikat coding, dan tech stack",
    images: [
      {
        url: "https://faris-portfolio.vercel.app/Meta.png",
        width: 1200,
        height: 630,
        alt: "Faris Hazim Supriyadi Portfolio",
        type: "image/png",
      },
    ],
    siteName: "Faris Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfolio - Faris Hazim Supriyadi | Full Stack Developer",
    description: "Showcase proyek web development, sertifikat coding, dan tech stack",
    images: ["https://faris-portfolio.vercel.app/Meta.png"],
  },
  alternates: {
    canonical: "https://faris-portfolio.vercel.app",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Faris Hazim Supriyadi",
    url: "https://faris-portfolio.vercel.app",
    image: "https://faris-portfolio.vercel.app/Photo.png",
    sameAs: [
      "https://github.com/SIRxRIS",
      "https://linkedin.com",
    ],
    jobTitle: "Full Stack Developer",
    description: "Full Stack Developer berpengalaman dalam React, Next.js, Node.js, dan Firebase",
  } as const;

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          strategy="afterInteractive"
        />
      </head>
      <body className="bg-[#030014]" suppressHydrationWarning>
        <Providers>
          <AnimatedBackground />
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}