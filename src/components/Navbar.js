"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import { getSupabaseClient } from "@/lib/supabaseClient";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin } = useUserProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) await supabase.auth.signOut();
    setMobileMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/stream", label: "Stream" },
    ...(user ? [{ href: "/profile", label: "Profile" }] : []),
    { href: "/blog/best-casinos", label: "Best Casinos" },
    { href: "/blog/tips-and-education", label: "Tips & Education" },
    { href: "/blog", label: "Blog" },
    { href: "/faq", label: "FAQ" },
    { href: "/about", label: "About" },
    ...(isAdmin ? [{ href: "/admin/blog", label: "Admin" }] : []),
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const handleNavClick = (_e, _href) => {
    closeMobileMenu();
  };

  // Detect individual blog POST pages (/blog/<slug>) — but NOT list pages
  // like /blog, /blog/best-casinos, /blog/tips-and-education
  const BLOG_LIST_ROUTES = new Set([
    "/blog",
    "/blog/best-casinos",
    "/blog/tips-and-education",
  ]);
  const isBlogPost =
    !!pathname &&
    pathname.startsWith("/blog/") &&
    !BLOG_LIST_ROUTES.has(pathname);

  const textColor = isBlogPost ? "text-white" : "text-black";
  const textColorFaded = isBlogPost ? "text-white/90" : "text-black/90";
  const textColorHover = isBlogPost ? "hover:text-white" : "hover:text-black";
  const activeBorder = isBlogPost ? "border-white" : "border-black";
  const mobileHoverBg = isBlogPost ? "hover:bg-white/20" : "hover:bg-black/20";
  const mobileActiveBg = isBlogPost ? "bg-white/20" : "bg-black/20";
  const mobileBorderColor = isBlogPost ? "border-white/20" : "border-black/20";
  const hamburgerFocusRing = isBlogPost ? "focus:ring-white" : "focus:ring-black";

  const navClassName = "fixed top-0 left-0 right-0 bg-white/0 backdrop-blur-md z-[100]";

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
              alt="GambleShield logo"
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
            const isActive =
              pathname === link.href ||
              (link.href !== "/" &&
                link.href !== "/blog" &&
                pathname?.startsWith(link.href + "/"));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`font-bold transition-colors ${
                  isActive
                    ? `${textColor} border-b-2 ${activeBorder}`
                    : `${textColorFaded} ${textColorHover}`
                }`}
                style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)" }}
              >
                {link.label}
              </Link>
            );
          })}
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className={`font-bold ${textColor} ${textColorHover} transition-colors cursor-pointer`}
              style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)" }}
            >
              Log out
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className={`font-bold transition-colors ${
                  pathname === "/login"
                    ? `${textColor} border-b-2 ${activeBorder}`
                    : `${textColorFaded} ${textColorHover}`
                }`}
                style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)" }}
              >
                Login
              </Link>
              <Link
                href="/register"
                className={`font-bold transition-colors ${
                  pathname === "/register"
                    ? `${textColor} border-b-2 ${activeBorder}`
                    : `${textColorFaded} ${textColorHover}`
                }`}
                style={{ fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)" }}
              >
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile: Hamburger button */}
        <button
          type="button"
          className={`md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg ${textColor} ${mobileHoverBg} focus:outline-none focus:ring-2 ${hamburgerFocusRing}`}
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
      {mobileMenuOpen && (
        <div className="md:hidden overflow-hidden transition-all duration-200 ease-out max-h-[80vh] opacity-100">
          <div className={`border-t ${mobileBorderColor} bg-black/0 backdrop-blur-md px-4 py-4 flex flex-col gap-2`}>
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" &&
                  link.href !== "/blog" &&
                  pathname?.startsWith(link.href + "/"));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`py-3 px-3 rounded-lg font-bold transition-colors ${
                    isActive
                      ? `${textColor} font-bold ${mobileActiveBg}`
                      : `${textColor} ${mobileHoverBg}`
                  }`}
                  style={{ fontSize: "clamp(0.95rem, 2vw, 1.1rem)" }}
                >
                  {link.label}
                </Link>
              );
            })}
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className={`py-3 px-3 rounded-lg font-bold ${textColor} ${mobileHoverBg} transition-colors text-left`}
                style={{ fontSize: "clamp(0.95rem, 2vw, 1.1rem)" }}
              >
                Log out
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeMobileMenu}
                  className={`py-3 px-3 rounded-lg font-bold transition-colors ${
                    pathname === "/login"
                      ? `${textColor} font-bold ${mobileActiveBg}`
                      : `${textColor} ${mobileHoverBg}`
                  }`}
                  style={{ fontSize: "clamp(0.95rem, 2vw, 1.1rem)" }}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={closeMobileMenu}
                  className={`py-3 px-3 rounded-lg font-bold transition-colors ${
                    pathname === "/register"
                      ? `${textColor} font-bold ${mobileActiveBg}`
                      : `${textColor} ${mobileHoverBg}`
                  }`}
                  style={{ fontSize: "clamp(0.95rem, 2vw, 1.1rem)" }}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
