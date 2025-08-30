import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Restaurant Name - Fine Dining Experience",
    template: "%s | Restaurant Name",
  },
  description: "Experience exceptional cuisine in an elegant atmosphere. Our restaurant offers the finest dining with carefully crafted dishes and impeccable service.",
  keywords: ["restaurant", "fine dining", "cuisine", "food", "dining experience"],
  authors: [{ name: "Restaurant Name" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Restaurant Name - Fine Dining Experience",
    description: "Experience exceptional cuisine in an elegant atmosphere.",
    siteName: "Restaurant Name",
  },
  twitter: {
    card: "summary_large_image",
    title: "Restaurant Name - Fine Dining Experience",
    description: "Experience exceptional cuisine in an elegant atmosphere.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-white text-gray-900">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
