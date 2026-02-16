'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/profile', label: 'Profile' },
    { href: '/stream', label: 'Stream' },
    { href: '/blog', label: 'Blog' },
    { href: '/admin/blog', label: 'Admin' },
    { href: '/register', label: 'Register' },
    { href: '/login', label: 'Login' },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md shadow-md z-[100]"
      style={{ height: '70px' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo/Brand */}
        <div className="flex items-center">
          <Link href="/">
            <h1
              className="font-bold text-green-600 cursor-pointer"
              style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}
            >
              GambleShield
            </h1>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-6 sm:gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`font-medium transition-colors ${
                  isActive
                    ? 'text-green-600 font-bold border-b-2 border-green-600'
                    : 'text-gray-700 hover:text-green-600'
                }`}
                style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)' }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
