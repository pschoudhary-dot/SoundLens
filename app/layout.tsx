import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SoundLens - Know Your Music Flow",
  description: "View your Spotify listening statistics with SoundLens",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans bg-primary text-secondary antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
