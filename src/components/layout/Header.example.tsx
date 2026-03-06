/**
 * Header Component Usage Examples
 * 
 * The Header component provides the main navigation for the public-facing site.
 * It includes:
 * - Logo/brand name on the left
 * - Desktop navigation (Home, Products, About, Contact)
 * - Mobile hamburger menu using Shadcn dropdown-menu
 * - Responsive design (desktop: horizontal nav, mobile: hamburger menu)
 * - Sticky positioning at the top of the page
 */

import { Header } from './Header';

// Example 1: Basic usage in a layout
export function BasicLayoutExample() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1>Page Content</h1>
        <p>The header will stick to the top as you scroll.</p>
      </main>
    </div>
  );
}

// Example 2: Usage in Next.js root layout
export function RootLayoutExample({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}

// Example 3: Usage in a page-specific layout
export function PageLayoutExample({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <div className="container mx-auto">
        {children}
      </div>
    </>
  );
}

/**
 * Features:
 * 
 * 1. Responsive Design:
 *    - Desktop (md and up): Horizontal navigation links
 *    - Mobile (below md): Hamburger menu with dropdown
 * 
 * 2. Navigation Links:
 *    - Home (/)
 *    - Products (/products)
 *    - About (/about)
 *    - Contact (/contact)
 * 
 * 3. Styling:
 *    - Sticky positioning (stays at top when scrolling)
 *    - Backdrop blur effect
 *    - Border bottom for visual separation
 *    - Uses Tailwind CSS and Shadcn theme
 * 
 * 4. Accessibility:
 *    - Proper ARIA labels on mobile menu button
 *    - Keyboard navigation support via Shadcn components
 *    - Semantic HTML structure
 * 
 * 5. Mobile Menu:
 *    - Uses Shadcn DropdownMenu component
 *    - Hamburger icon (Menu) when closed
 *    - X icon when open
 *    - Auto-closes when a link is clicked
 */
