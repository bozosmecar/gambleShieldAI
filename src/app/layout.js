import "./globals.css";
import { Libre_Baskerville } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AgeVerification from "@/components/AgeVerification";
import CookieConsent from "@/components/CookieConsent";

const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "GambleShield - Responsible Gambling Platform",
  description:
    "GambleShield is a comprehensive platform dedicated to promoting safe and responsible gambling practices.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={libreBaskerville.className} style={{ fontWeight: 500 }}>
        <AgeVerification />
        <CookieConsent />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
