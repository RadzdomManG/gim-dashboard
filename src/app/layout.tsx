import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "GIM — Grace in Motion Mission Control",
  description: "Operations platform for Grace in Motion team and client workflows",
  icons: {
    icon: [
      { url: "/gim-mark-green.png", sizes: "32x32", type: "image/png" },
      { url: "/gim-mark-green.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/gim-mark-green.png",
    apple: "/gim-mark-green.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
