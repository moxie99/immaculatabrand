/**
 * Example usage of AdminSidebar component
 * 
 * This file demonstrates how to use the AdminSidebar component in the admin layout.
 */

import { AdminSidebar } from './AdminSidebar';

/**
 * Example 1: Basic usage in admin layout
 * 
 * The AdminSidebar component is typically used in the admin layout
 * to provide navigation between different admin sections.
 */
export function AdminLayoutExample() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <AdminSidebar />
      
      {/* Main content area */}
      <main className="flex-1 p-8">
        <h1>Admin Dashboard</h1>
        <p>Main content goes here</p>
      </main>
    </div>
  );
}

/**
 * Example 2: With responsive behavior
 * 
 * For mobile devices, you might want to hide the sidebar by default
 * and show it in a drawer/modal when a menu button is clicked.
 */
export function ResponsiveAdminLayoutExample() {
  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      
      {/* Mobile menu button would go here */}
      
      {/* Main content area */}
      <main className="flex-1 p-4 md:p-8">
        <h1>Admin Dashboard</h1>
        <p>Main content goes here</p>
      </main>
    </div>
  );
}

/**
 * Example 3: Full admin layout structure
 * 
 * This shows a complete admin layout with header, sidebar, and content area.
 */
export function CompleteAdminLayoutExample() {
  return (
    <div className="min-h-screen bg-background">
      {/* Admin header (optional) */}
      <header className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Confectionary Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Admin User</span>
            <button className="text-sm text-primary hover:underline">
              Logout
            </button>
          </div>
        </div>
      </header>
      
      {/* Main layout with sidebar */}
      <div className="flex">
        <AdminSidebar />
        
        {/* Content area */}
        <main className="flex-1 p-8">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
            <div className="grid gap-6">
              {/* Dashboard content */}
              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-2">Statistics</h3>
                <p className="text-muted-foreground">
                  Dashboard statistics and metrics go here
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * Navigation behavior notes:
 * 
 * 1. Active state highlighting:
 *    - Dashboard (/admin) uses exact match
 *    - Other sections use prefix match (e.g., /admin/products matches /admin/products/new)
 * 
 * 2. Icons:
 *    - Dashboard: LayoutDashboard icon
 *    - Products: Package icon
 *    - Orders: ShoppingCart icon
 *    - Media: Image icon
 *    - Content: FileText icon
 * 
 * 3. Styling:
 *    - Active items use 'default' button variant (primary color)
 *    - Inactive items use 'ghost' button variant
 *    - All buttons have smooth transition effects
 * 
 * 4. Accessibility:
 *    - Navigation has aria-label="Admin navigation"
 *    - All links are keyboard accessible
 *    - Icons have appropriate sizing for visibility
 */
