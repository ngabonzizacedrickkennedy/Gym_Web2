// src/lib/utils.ts (Additional utility functions for trainers)
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format price utility
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

// Format date utility
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Format relative date (e.g., "2 days ago")
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return months === 1 ? '1 month ago' : `${months} months ago`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return years === 1 ? '1 year ago' : `${years} years ago`;
  }
}

// Get initials from name
export function getInitials(name: string): string {
  if (!name) return 'U';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Truncate text utility
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, maxLength) + '...';
}

// Generate slug from title
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

// Format duration (e.g., convert days to weeks/months)
export function formatDuration(days: number): string {
  if (days < 7) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  } else if (days < 30) {
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    if (remainingDays === 0) {
      return `${weeks} week${weeks !== 1 ? 's' : ''}`;
    }
    return `${weeks} week${weeks !== 1 ? 's' : ''} ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
  } else {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    if (remainingDays === 0) {
      return `${months} month${months !== 1 ? 's' : ''}`;
    }
    return `${months} month${months !== 1 ? 's' : ''} ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
  }
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone number
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

// Format phone number
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }
  
  return phone; // Return original if can't format
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Capitalize first letter
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Convert camelCase to Title Case
export function camelToTitle(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

// Format number with commas
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

// Calculate percentage
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

// Generate random ID
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Check if string is empty or whitespace
export function isEmpty(str: string): boolean {
  return !str || str.trim().length === 0;
}

// Add this to your existing src/lib/utils.ts file

// Parse markdown content to HTML with styling
export function parseMarkdown(markdown: string): string {
  if (!markdown) return '';

  // Replace headers with Tailwind classes
  let html = markdown
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mb-4 mt-8 text-foreground">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mb-6 mt-10 text-foreground">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mb-8 mt-12 text-foreground">$1</h1>');

  // Replace bold and italic
  html = html
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="font-semibold text-foreground">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em class="italic">$1</em>');

  // Replace unordered lists
  html = html.replace(/^\s*- (.*)$/gim, '<li class="mb-2">$1</li>');
  
  // Wrap consecutive list items in ul tags
  html = html.replace(/(<li[^>]*>.*?<\/li>\s*)+/gim, (match) => {
    return `<ul class="list-disc list-inside mb-6 space-y-2 ml-4">${match}</ul>`;
  });

  // Replace ordered lists
  html = html.replace(/^\s*\d+\. (.*)$/gim, '<li class="mb-2">$1</li>');
  
  // Wrap consecutive numbered list items in ol tags
  html = html.replace(/(<li[^>]*>.*?<\/li>\s*)+/gim, (match) => {
    // Check if this was already wrapped as ul, skip if so
    if (html.includes(`<ul class="list-disc`)) return match;
    return `<ol class="list-decimal list-inside mb-6 space-y-2 ml-4">${match}</ol>`;
  });

  // Replace code blocks (triple backticks)
  html = html.replace(/```([\s\S]*?)```/gim, 
    '<pre class="bg-muted p-4 rounded-lg mb-6 overflow-x-auto border"><code class="text-sm font-mono">$1</code></pre>'
  );

  // Replace inline code (single backticks)
  html = html.replace(/`([^`]+)`/gim, 
    '<code class="bg-muted px-2 py-1 rounded text-sm font-mono border">$1</code>'
  );

  // Replace links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, 
    '<a href="$2" class="text-primary hover:text-primary/80 underline font-medium transition-colors" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Replace line breaks and create paragraphs
  html = html.replace(/\n\s*\n/gim, '</p><p class="mb-4 text-foreground leading-relaxed">');
  
  // Wrap in initial paragraph tag
  html = `<p class="mb-4 text-foreground leading-relaxed">${html}</p>`;

  // Clean up empty paragraphs
  html = html.replace(/<p[^>]*>\s*<\/p>/gim, '');

  // Fix paragraphs that contain only block elements
  html = html.replace(/<p[^>]*>(\s*<(?:h[1-6]|ul|ol|pre|div)[^>]*>.*?<\/(?:h[1-6]|ul|ol|pre|div)>\s*)<\/p>/gim, '$1');

  return html;
}

// Get reading time estimate for markdown content
export function getReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

// Extract plain text from markdown for excerpts
export function extractTextFromMarkdown(markdown: string, maxLength = 150): string {
  if (!markdown) return '';
  
  // Remove markdown syntax
  const text = markdown
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with text
    .replace(/^\s*[-*+]\s+/gm, '') // Remove list markers
    .replace(/^\s*\d+\.\s+/gm, '') // Remove numbered list markers
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength).trim() + '...';
}