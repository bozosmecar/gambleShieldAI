"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin } = useUserProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isBlog =
    pathname === "/blog" ||
    pathname === "/blog/best-casinos" ||
    pathname === "/blog/tips-and-education" ||
    pathname?.startsWith("/blog/");

  useEffect(() => {
    if (!isBlog) return;
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isBlog]);

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) await supabase.auth.signOut();
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/", label: "Home" },
    ...(user ? [{ href: "/profile", label: "Profile" }] : []),
    { href: "/stream", label: "Stream" },
    { href: "/blog/best-casinos", label: "Best Casinos" },
    { href: "/blog/tips-and-education", label: "Tips & Education" },
    { href: "/blog", label: "Blog" },
    { href: "/#faq", label: "FAQ" },
    ...(isAdmin ? [{ href: "/admin/blog", label: "Admin" }] : []),
    ...(!user
      ? [
          { href: "/register", label: "Register" },
          { href: "/login", label: "Login" },
        ]
      : []),
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleNavClick = (e, href) => {
    if (href === "/#faq") {
      e.preventDefault();
      closeMobileMenu();
      if (pathname === "/") {
        document.getElementById("faq")?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.location.assign("/#faq");
      }
      return;
    }
    closeMobileMenu();
  };

  const navClassName = isBlog
    ? `fixed top-0 left-0 right-0 bg-transparent z-[100] transition-transform duration-300 ${
        scrolled ? "-translate-y-full pointer-events-none" : "translate-y-0"
      }`
    : "fixed top-0 left-0 right-0 bg-white/0 backdrop-blur-md z-[100]";

  return (
    <nav className={navClassName} style={{ height: "70px" }}>
      <div className="w-full px-4 sm:px-6 lg:px-2 h-full flex items-center justify-around">
        {/* Logo/Brand */}
        <div className="flex align-left gap-2 h-full">
          <Link
            href="/"
            onClick={closeMobileMenu}
            className="flex items-center gap-2 h-full"
          >
            <Image
              src="/1_Home%20page/ShieldLogo.png"
              alt=""
              width={140}
              height={140}
              quality={100}
              className="h-full w-auto object-contain"
            />
          </Link>
        </div>

        {/* Desktop: Navigation Links */}
        <div className="hidden md:flex items-center gap-6 sm:gap-8">
          {navLinks.map((link) => {
            const isHashFaq = link.href === "/#faq";
            const isActive =
              !isHashFaq &&
              (pathname === link.href ||
                (link.href !== "/" &&
                  link.href !== "/blog" &&
                  pathname?.startsWith(link.href + "/")));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`font-bold transition-colors ${
                  isActive
                    ? "text-black border-b-2 border-black"
                    : "text-black/90 hover:text-black"
                }`}
                style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)" }}
              >
                {link.label}
              </Link>
            );
          })}
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="font-bold text-black hover:text-black/90 transition-colors cursor-pointer"
              style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)" }}
            >
              Log out
            </button>
          )}
        </div>

        {/* Mobile: Hamburger button */}
        <button
          type="button"
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg text-black hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-black"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          <span
            className={`block w-6 h-0.5 bg-current transition-all duration-200 ${
              mobileMenuOpen ? "rotate-45 translate-y-1" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-current mt-1.5 transition-all duration-200 ${
              mobileMenuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-current mt-1.5 transition-all duration-200 ${
              mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile menu panel */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-200 ease-out ${
          mobileMenuOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="border-t border-black/20 bg-black/0 backdrop-blur-md px-4 py-4 flex flex-col gap-2">
          {navLinks.map((link) => {
            const isHashFaq = link.href === "/#faq";
            const isActive =
              !isHashFaq &&
              (pathname === link.href ||
                (link.href !== "/" &&
                  link.href !== "/blog" &&
                  pathname?.startsWith(link.href + "/")));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`py-3 px-3 rounded-lg font-bold transition-colors ${
                  isActive
                    ? "text-black font-bold bg-black/20"
                    : "text-black hover:bg-black/20"
                }`}
                style={{ fontSize: "clamp(0.95rem, 2vw, 1.1rem)" }}
              >
                {link.label}
              </Link>
            );
          })}
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="py-3 px-3 rounded-lg font-bold text-black hover:bg-black/20 transition-colors text-left"
              style={{ fontSize: "clamp(0.95rem, 2vw, 1.1rem)" }}
            >
              Log out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
