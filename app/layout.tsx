import type { Metadata } from "next";
import { Geist, Kode_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { UserMenu } from "@/components/user-menu";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "はるni Advent Calendar 2025",
  description: "はるni Advent Calendar 2025 - みんなで作るアドベントカレンダー",
  icons: {
    icon: "/favicon.svg",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

const kodeMono = Kode_Mono({
  variable: "--font-kode-mono",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} ${kodeMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Link href="/" className="fixed top-4 left-4  z-50">
            <Logo />
          </Link>
          <div className="fixed top-4 right-4 z-50">
            <UserMenu />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
