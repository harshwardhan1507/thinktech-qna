import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ThinkTech Q&A | Anonymous Live Q&A",
  description: "Anonymous Live Q&A for ThinkTech Orientation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen bg-white text-[#111111] antialiased flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
