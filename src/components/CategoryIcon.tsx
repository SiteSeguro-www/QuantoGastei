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
} from 'lucide-react';

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
  'Utensils', 'Pizza', 'Cookie', 'Coffee', 'ShoppingCart', 'Apple',
  'Home', 'Zap', 'Droplets', 'Wifi', 'Smartphone', 'Fuel', 'Car',
  'Bus', 'Shirt', 'Footprints', 'Scissors', 'Sparkles', 'Gamepad2',
  'Film', 'Dog', 'Gift', 'Coins', 'Package', 'Dumbbell', 'Pill',
  'Plane', 'CreditCard', 'Briefcase', 'Laptop', 'TrendingUp', 'Wallet',
  'Landmark', 'BookOpen', 'Stethoscope', 'Hotel', 'Tag'
];

export const AVAILABLE_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#14B8A6',
  '#06B6D4', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7',
  '#EC4899', '#F43F5E', '#64748B', '#71717A'
];
