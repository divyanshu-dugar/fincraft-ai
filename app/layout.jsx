import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"
import RouteGuard from "@/components/RouteGuard";
import OAuthProviders from "@/components/OAuthProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Fincraft AI - Personal Finance Mentor",
  description: "Manage your expenses, income, and savings efficiently",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <OAuthProviders>
          <RouteGuard>
            <Navbar />
            <main className="min-h-screen">
              {children}
            </main>
          </RouteGuard>
        </OAuthProviders>
      </body>
    </html>
  );
}