import type { Metadata } from "next";
import { ViewTransitions } from "next-view-transitions";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { UmamiAnalytics } from "@/components/analytics/umami-analytics";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.profilebase.in"),
  title: {
    default: "ProfileBase",
    template: "%s | ProfileBase",
  },
  description:
    "The structured skills profile for developers. Build your professional portfolio, showcase projects, and share your unique profile URL.",
  keywords: [
    "developer portfolio",
    "skills profile",
    "resume builder",
    "developer resume",
    "professional profile",
    "tech portfolio",
  ],
  authors: [{ name: "ProfileBase" }],
  creator: "ProfileBase",
  publisher: "ProfileBase",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ProfileBase",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.profilebase.in",
    siteName: "ProfileBase",
    title: "ProfileBase - The Structured Skills Profile for Developers",
    description:
      "Build your professional portfolio, showcase projects, and share your unique profile URL.",
    images: [
      {
        url: "/og-image/og-image.png",
        width: 1200,
        height: 630,
        alt: "ProfileBase - Developer Portfolio Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ProfileBase - The Structured Skills Profile for Developers",
    description:
      "Build your professional portfolio, showcase projects, and share your unique profile URL.",
    images: ["/og-image/og-image.png"],
    site: "@heyyswap",
    creator: "@heyyswap",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="en" className={inter.variable} suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
          <UmamiAnalytics />
        </body>
      </html>
    </ViewTransitions>
  );
}
