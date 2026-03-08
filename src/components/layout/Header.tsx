'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BRAND_NAME } from '@/lib/constants/site';

const navigationLinks = [
  { href: '/', label: 'HOME' },
  { href: '/about', label: 'ABOUT US' },
  { href: '/products', label: 'PRODUCTS' },
  { href: '/contact', label: 'CONTACT' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
      <div className="container flex h-20 items-center justify-between px-6 lg:px-8">
        {/* Logo and Brand Name */}
        <Link href="/" className="flex items-center space-x-4">
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt={BRAND_NAME}
              width={60}
              height={60}
              className="h-12 w-12 object-contain"
              priority
            />
            <div className="ml-3">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {BRAND_NAME}
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                Premium Delicacies
              </p>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors duration-200 tracking-wide"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA Button - Desktop */}
        <div className="hidden md:block">
          <Button 
            asChild 
            className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
          >
            <Link href="/products">
              VIEW PRODUCTS
            </Link>
          </Button>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Toggle menu" className="h-10 w-10">
                {isOpen ? (
                  <X className="h-6 w-6 text-slate-700" />
                ) : (
                  <Menu className="h-6 w-6 text-slate-700" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-lg">
              {navigationLinks.map((link) => (
                <DropdownMenuItem key={link.href} asChild>
                  <Link
                    href={link.href}
                    className="w-full cursor-pointer font-semibold text-slate-700 hover:text-slate-900 py-3 px-4"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem asChild>
                <Link
                  href="/products"
                  className="w-full cursor-pointer font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 py-3 px-4 rounded-md mx-2 my-2"
                  onClick={() => setIsOpen(false)}
                >
                  VIEW PRODUCTS
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
