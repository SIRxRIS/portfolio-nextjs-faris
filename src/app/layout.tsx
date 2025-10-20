import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Providers } from "./providers";
import AnimatedBackground from "@/components/Background";

export const metadata: Metadata = {
  title: "Portfolio - Faris Hazim Supriyadi",
  description: "Showcase Portfolio - Proyek, Sertifikat, dan Tech Stack",
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
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