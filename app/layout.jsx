import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"
import RouteGuard from "@/components/RouteGuard";
import OAuthProviders from "@/components/OAuthProviders";
import { Toaster } from "react-hot-toast";

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
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <OAuthProviders>
          <RouteGuard>
            <Navbar />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  background: '#1e293b',
                  color: '#e2e8f0',
                  border: '1px solid rgba(99,102,241,0.2)',
                  borderRadius: '12px',
                  fontSize: '14px',
                },
                success: { iconTheme: { primary: '#34d399', secondary: '#1e293b' } },
                error:   { iconTheme: { primary: '#f87171', secondary: '#1e293b' } },
              }}
            />
            <main className="min-h-screen">
              {children}
            </main>
          </RouteGuard>
        </OAuthProviders>
      </body>
    </html>
  );
}