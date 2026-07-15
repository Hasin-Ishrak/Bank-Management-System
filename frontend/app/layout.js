import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Import the global AuthProvider you created in hooks/useAuth.js
import { AuthProvider } from "../hooks/useAuth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Bank Management System",
  description: "Secure Digital Banking System Portal",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        {/* Wrap children with the AuthProvider context */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}