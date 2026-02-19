'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { getSupabaseClient } from '@/lib/supabaseClient';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin } = useUserProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    if (supabase) await supabase.auth.signOut();
    setMobileMenuOpen(false);
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    ...(user ? [{ href: '/profile', label: 'Profile' }] : []),
    { href: '/stream', label: 'Stream' },
    { href: '/blog', label: 'Blog' },
    ...(isAdmin ? [{ href: '/admin/blog', label: 'Admin' }, { href: '/admin/polls', label: 'Polls' }] : []),
    ...(!user ? [{ href: '/register', label: 'Register' }, { href: '/login', label: 'Login' }] : []),
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 bg-amber-500/20 backdrop-blur-md shadow-md z-[100]"
      style={{ minHeight: '70px' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[70px] flex items-center justify-between">
        {/* Logo/Brand */}
        <div className="flex items-center gap-2">
          <Link href="/" onClick={closeMobileMenu} className="flex items-center gap-2">
            <Image
              src="/1_Home%20page/ShieldLogo.png"
              alt=""
              width={36}
              height={36}
              className="h-8 w-auto object-contain"
            />
            <h1
              className="font-bold text-white cursor-pointer hover:text-white/90"
              style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}
            >
              GambleShield
            </h1>
          </Link>
        </div>

        {/* Desktop: Navigation Links */}
        <div className="hidden md:flex items-center gap-6 sm:gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium transition-colors ${
                  isActive
                    ? 'text-white font-bold border-b-2 border-white'
                    : 'text-white/90 hover:text-white'
                }`}
                style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)' }}
              >
                {link.label}
              </Link>
            );
          })}
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="font-medium text-white hover:text-white/90 transition-colors cursor-pointer"
              style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)' }}
            >
              Log out
            </button>
          )}
        </div>

        {/* Mobile: Hamburger button */}
        <button
          type="button"
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
        >
          <span
            className={`block w-6 h-0.5 bg-current transition-all duration-200 ${
              mobileMenuOpen ? 'rotate-45 translate-y-1' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-current mt-1.5 transition-all duration-200 ${
              mobileMenuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-current mt-1.5 transition-all duration-200 ${
              mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>
      </div>

      {/* Mobile menu panel */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-200 ease-out ${
          mobileMenuOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-amber-600/30 bg-amber-500/20 backdrop-blur-sm px-4 py-4 flex flex-col gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMobileMenu}
                className={`py-3 px-3 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'text-white font-bold bg-white/20'
                    : 'text-white hover:bg-white/20'
                }`}
                style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}
              >
                {link.label}
              </Link>
            );
          })}
          {user && (
            <button
              type="button"
              onClick={handleLogout}
              className="py-3 px-3 rounded-lg font-medium text-white hover:bg-white/20 transition-colors text-left"
              style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}
            >
              Log out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
