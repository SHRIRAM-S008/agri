import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgriOx — Smart Agro Value Chain Platform",
  description: "Connecting Farmers, Processors, and Buyers across India's agricultural value chain. Smarter prices, better farmers.",
  keywords: "agri, farmer, crop, marketplace, processor, buyer, India, value chain",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Inter is now imported in globals.css for easier management */}
      </head>
      <body className="antialiased selection:bg-primary/10 selection:text-primary">
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '1.25rem',
                fontSize: '14px',
                padding: '12px 16px',
                boxShadow: 'var(--shadow-premium)',
                backdropFilter: 'blur(8px)',
              },
              success: {
                iconTheme: { primary: 'hsl(var(--primary))', secondary: 'white' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: 'white' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
