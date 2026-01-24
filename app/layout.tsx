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
  title: "ProfileBase",
  description: "The structured skills profile for developers.",
  icons: {
    icon: "/logo/favicon.png",
    apple: "/logo/favicon.png",
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
