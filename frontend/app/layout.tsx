import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/ThemeContext";
import { AuthProvider } from "@/lib/AuthContext";
import { LanguageProvider } from "@/lib/LanguageContext";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "EchoSense | Topological Structural Health Diagnostics",
    template: "%s | EchoSense",
  },
  description:
    "A Topological Machine Learning Framework for Acoustic Emission Precursor Damage Detection across Critical Infrastructure.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark h-full antialiased ${inter.variable}`} suppressHydrationWarning>
      <body className={`min-h-full flex flex-col font-sans ${inter.className} bg-[#19191c] text-[#e4e4e7] transition-colors duration-200 selection:bg-[#FF5500] selection:text-white`}>
        <ThemeProvider>
          <AuthProvider>
            <LanguageProvider>
              {children}
            </LanguageProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
