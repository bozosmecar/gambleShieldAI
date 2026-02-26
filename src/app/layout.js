import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FontProvider } from "@/context/FontContext";
import FontWrapper from "@/components/FontWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "GambleShield - Responsible Gambling Platform",
  description:
    "GambleShield is a comprehensive platform dedicated to promoting safe and responsible gambling practices.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <FontProvider>
          <FontWrapper>
            <Navbar />
            {children}
            <Footer />
          </FontWrapper>
        </FontProvider>
      </body>
    </html>
  );
}
