import React from 'react';
import {
  Utensils,
  Pizza,
  Cookie,
  Cake,
  Popcorn,
  Coffee,
  UtensilsCrossed,
  ShoppingCart,
  Apple,
  Home,
  Zap,
  Droplets,
  Wifi,
  Smartphone,
  Fuel,
  Car,
  Bus,
  Shirt,
  Footprints,
  Scissors,
  Sparkles,
  Gamepad2,
  Film,
  Dog,
  Gift,
  Coins,
  Package,
  Dumbbell,
  Pill,
  Plane,
  CreditCard,
  Tag,
  Briefcase,
  Laptop,
  TrendingUp,
  Wallet,
  Landmark,
  BookOpen,
  Stethoscope,
  Hotel,
  Tv,
  Music,
  ShoppingBag,
  Heart,
  CarFront,
  Flower2,
  Wrench,
  Hammer,
  Receipt,
  QrCode,
  FileText,
  Beef,
  Flame,
} from 'lucide-react';
import { Category } from '../types/finance';

interface CategoryIconProps {
  icon: string;
  emoji?: string;
  className?: string;
  size?: number;
}

export const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  Utensils,
  Pizza,
  Cookie,
  Cake,
  Popcorn,
  Coffee,
  UtensilsCrossed,
  ShoppingCart,
  Apple,
  Home,
  Zap,
  Droplets,
  Wifi,
  Smartphone,
  Fuel,
  Car,
  CarFront,
  Bus,
  Shirt,
  Footprints,
  Scissors,
  Sparkles,
  Gamepad2,
  Film,
  Dog,
  Gift,
  Coins,
  Package,
  Dumbbell,
  Pill,
  Plane,
  CreditCard,
  Tag,
  Briefcase,
  Laptop,
  TrendingUp,
  Wallet,
  Landmark,
  BookOpen,
  Stethoscope,
  Hotel,
  Tv,
  Music,
  ShoppingBag,
  Heart,
  Flower2,
  Wrench,
  Hammer,
  Receipt,
  QrCode,
  FileText,
  Beef,
  Flame,
};

export const CategoryIcon: React.FC<CategoryIconProps> = ({ icon, emoji, className = 'w-5 h-5', size = 20 }) => {
  const IconComponent = ICON_MAP[icon];

  if (IconComponent) {
    return <IconComponent className={className} size={size} />;
  }

  if (emoji) {
    return <span className="text-base select-none leading-none">{emoji}</span>;
  }

  return <Tag className={className} size={size} />;
};

export const AVAILABLE_ICONS = [
  'Beef', 'Utensils', 'Pizza', 'Cookie', 'Coffee', 'ShoppingCart', 'Apple',
  'Home', 'Zap', 'Droplets', 'Wifi', 'Smartphone', 'Fuel', 'Car',
  'Bus', 'Shirt', 'Footprints', 'Scissors', 'Sparkles', 'Gamepad2',
  'Film', 'Dog', 'Gift', 'Coins', 'Package', 'Dumbbell', 'Pill',
  'Plane', 'CreditCard', 'Briefcase', 'Laptop', 'TrendingUp', 'Wallet',
  'Landmark', 'BookOpen', 'Stethoscope', 'Hotel', 'Tag',
  'Flower2', 'Wrench', 'Hammer', 'Receipt', 'QrCode', 'FileText', 'Flame'
];

// Rich, high-contrast, beautiful palette of 48+ distinctive colors
export const AVAILABLE_COLORS = [
  '#BE123C', // Rose / Açougue
  '#EA1D2C', // iFood Red
  '#EF4444', // Red
  '#F97316', // Orange
  '#EA580C', // Rust
  '#F59E0B', // Amber
  '#FBBF24', // Warm Yellow
  '#EAB308', // Yellow
  '#CA8A04', // Olive Gold
  '#84CC16', // Lime Green
  '#22C55E', // Green
  '#10B981', // Emerald
  '#059669', // Jade Green
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#0891B2', // Deep Cyan
  '#0284C7', // Light Sky
  '#0369A1', // Ocean Blue
  '#2563EB', // Cobalt Blue
  '#3B82F6', // Blue
  '#4F46E5', // Indigo Deep
  '#6366F1', // Indigo
  '#7C3AED', // Royal Violet
  '#8B5CF6', // Violet
  '#9333EA', // Purple
  '#A855F7', // Lilac
  '#C026D3', // Fuchsia
  '#D946EF', // Magenta
  '#EC4899', // Pink
  '#F43F5E', // Coral Rose
  '#FB7185', // Blossom Pink
  '#E11D48', // Crimson
  '#BE185D', // Berry
  '#78350F', // Dark Cocoa
  '#92400E', // Coffee
  '#B45309', // Amber Brown
  '#334155', // Slate
  '#475569', // Cool Gray
  '#64748B', // Blue Gray
  '#71717A', // Zinc
  '#0D9488', // Dark Teal
  '#15803D', // Forest Green
  '#166534', // Deep Green
  '#4338CA', // Midnight Indigo
  '#581C87', // Deep Violet
  '#831843', // Wine Red
  '#9F1239', // Velvet Red
  '#34D399', // Mint
];

/**
 * Returns the next unused distinct color from the palette, ensuring every new category gets a unique color!
 */
export const getNextDistinctColor = (existingCategories: Category[] = []): string => {
  const used = new Set(existingCategories.map((c) => (c.color || '').toUpperCase().trim()));
  
  // Find first color from palette not currently used
  const unused = AVAILABLE_COLORS.find((col) => !used.has(col.toUpperCase()));
  if (unused) return unused;

  // Fallback: generate a distinct golden-ratio hue
  const count = existingCategories.length;
  const hue = Math.round((count * 137.5) % 360);
  return `hsl(${hue}, 85%, 50%)`;
};
