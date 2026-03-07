'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Image,
  FileText,
  LogOut,
  User,
} from 'lucide-react';
import { useAdminAuth } from '@/lib/hooks/useAdminAuth';
import { useState } from 'react';
import { DeleteConfirmationModal } from '@/components/admin/DeleteConfirmationModal';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    label: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCart,
  },
  {
    label: 'Media',
    href: '/admin/media',
    icon: Image,
  },
  {
    label: 'Content',
    href: '/admin/content',
    icon: FileText,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { username, logout } = useAdminAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isActive = (href: string): boolean => {
    // Exact match for dashboard
    if (href === '/admin') {
      return pathname === '/admin';
    }
    // Prefix match for other sections
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  return (
    <aside className="w-64 border-r bg-background min-h-screen flex flex-col">
      <div className="p-6 flex-1">
        <h2 className="text-lg font-semibold mb-6">Admin Panel</h2>
        <nav className="space-y-2" aria-label="Admin navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={active ? 'default' : 'ghost'}
                  className="w-full justify-start gap-3 transition-colors"
                  size="default"
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User info and logout */}
      <div className="p-6 border-t">
        <div className="flex items-center gap-3 mb-3 px-3 py-2 bg-muted/50 rounded-lg">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{username || 'Admin'}</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
          size="default"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>

      {/* Logout Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Logout"
        message="Are you sure you want to logout? You will need to sign in again to access the admin panel."
      />
    </aside>
  );
}
