import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "LPPM - Lembaga Penelitian dan Pengabdian Masyarakat",
  description: "Portal resmi Lembaga Penelitian dan Pengabdian kepada Masyarakat (LPPM) Universitas - Sistem pengajuan proposal penelitian dan pengabdian.",
  keywords: ["LPPM", "penelitian", "pengabdian masyarakat", "hibah", "proposal"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
