'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  separator?: React.ReactNode;
  maxItems?: number;
}

export function Breadcrumb({ 
  items, 
  className = '',
  showHome = true,
  separator,
  maxItems = 5
}: BreadcrumbProps) {
  // Add home item if showHome is true and first item is not home
  const breadcrumbItems = showHome && items[0]?.href !== '/' 
    ? [{ label: 'Home', href: '/', icon: Home }, ...items]
    : items;

  // Truncate items if they exceed maxItems
  const displayItems = breadcrumbItems.length > maxItems
    ? [
        ...breadcrumbItems.slice(0, 1), // Keep first item
        { label: '...', href: '', icon: undefined }, // Ellipsis
        ...breadcrumbItems.slice(-maxItems + 2) // Keep last items
      ]
    : breadcrumbItems;

  const defaultSeparator = separator || <ChevronRight className="h-4 w-4 text-muted-foreground" />;

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center space-x-1 text-sm ${className}`}
    >
      <ol className="flex items-center space-x-1">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isEllipsis = item.label === '...';
          const Icon = item.icon;

          return (
            <li key={`${item.href}-${index}`} className="flex items-center">
              {/* Breadcrumb Item */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center"
              >
                {isEllipsis ? (
                  <span className="text-muted-foreground font-medium px-2">
                    ...
                  </span>
                ) : isLast ? (
                  <span 
                    className="text-foreground font-medium flex items-center"
                    aria-current="page"
                  >
                    {Icon && (
                      <Icon className="h-4 w-4 mr-1.5 flex-shrink-0" />
                    )}
                    <span className="truncate max-w-[200px]">
                      {item.label}
                    </span>
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center group"
                  >
                    {Icon && (
                      <Icon className="h-4 w-4 mr-1.5 flex-shrink-0 group-hover:text-primary transition-colors" />
                    )}
                    <span className="truncate max-w-[150px] group-hover:underline">
                      {item.label}
                    </span>
                  </Link>
                )}
              </motion.div>

              {/* Separator */}
              {!isLast && !isEllipsis && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 + 0.1 }}
                  className="flex items-center ml-1"
                  aria-hidden="true"
                >
                  {defaultSeparator}
                </motion.div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Alternative compact version for mobile
interface CompactBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function CompactBreadcrumb({ items, className = '' }: CompactBreadcrumbProps) {
  if (items.length <= 1) return null;

  const currentItem = items[items.length - 1];
  const parentItem = items[items.length - 2];

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center space-x-2 text-sm ${className}`}
    >
      {items.length > 2 && (
        <>
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Home"
          >
            <Home className="h-4 w-4" />
          </Link>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">...</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </>
      )}
      
      <Link
        href={parentItem.href}
        className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[120px]"
      >
        {parentItem.label}
      </Link>
      
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
      
      <span 
        className="text-foreground font-medium truncate max-w-[120px]"
        aria-current="page"
      >
        {currentItem.label}
      </span>
    </nav>
  );
}

// Structured data component for SEO
interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://sheshape.com'}${item.href}`
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Hook for generating breadcrumbs from pathname
export function useBreadcrumbs(pathname: string, customLabels?: Record<string, string>) {
  const segments = pathname.split('/').filter(Boolean);
  const defaultLabels: Record<string, string> = {
    'blog': 'Blog',
    'programs': 'Programs',
    'nutrition': 'Nutrition',
    'shop': 'Shop',
    'about': 'About',
    'contact': 'Contact',
    'dashboard': 'Dashboard',
    'profile': 'Profile',
    'settings': 'Settings',
    'orders': 'Orders',
    'favorites': 'Favorites',
    'my-programs': 'My Programs',
    'my-nutrition': 'My Nutrition',
    ...customLabels
  };

  const items: BreadcrumbItem[] = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/');
    const label = defaultLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    return {
      label: label.replace(/-/g, ' '),
      href
    };
  });

  return items;
}

// Example usage component
export function BreadcrumbExample() {
  const exampleItems: BreadcrumbItem[] = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Blog', href: '/blog' },
    { label: 'Fitness Tips', href: '/blog/fitness' },
    { label: 'How to Start Your Fitness Journey', href: '/blog/fitness/start-journey' }
  ];

  return (
    <div className="space-y-8 p-6">
      <div>
        <h3 className="font-semibold mb-4">Standard Breadcrumb</h3>
        <Breadcrumb items={exampleItems} />
      </div>

      <div>
        <h3 className="font-semibold mb-4">Without Home Icon</h3>
        <Breadcrumb items={exampleItems} showHome={false} />
      </div>

      <div>
        <h3 className="font-semibold mb-4">Compact Breadcrumb (Mobile)</h3>
        <CompactBreadcrumb items={exampleItems} />
      </div>

      <div>
        <h3 className="font-semibold mb-4">With Custom Separator</h3>
        <Breadcrumb 
          items={exampleItems} 
          separator={<span className="text-muted-foreground mx-2">/</span>}
        />
      </div>

      <div>
        <h3 className="font-semibold mb-4">Max Items (3)</h3>
        <Breadcrumb items={exampleItems} maxItems={3} />
      </div>
    </div>
  );
}