// Core Data Types
export interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  validFrom: Date;
  validUntil: Date;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  capacity?: number;
  image?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RestaurantContent {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
    ctaText: string;
    ctaLink: string;
  };
  about: {
    title: string;
    description: string;
    images: string[];
  };
  menu: {
    title: string;
    subtitle: string;
    categories: MenuCategory[];
  };
  contact: {
    address: string;
    phone: string;
    email: string;
    hours: {
      [key: string]: string;
    };
    socialLinks: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
    };
  };
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  items: MenuItem[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  isAvailable: boolean;
  ingredients?: string[];
  allergens?: string[];
}

// Form Data Types
export interface PromotionFormData {
  title: string;
  description: string;
  discount: number;
  validFrom: Date;
  validUntil: Date;
  image?: File | string;
  isActive: boolean;
}

export interface EventFormData {
  title: string;
  description: string;
  date: Date;
  time: string;
  capacity?: number;
  image?: File | string;
  isPublished: boolean;
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  message: string;
  subject?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User and Auth Types
export interface User {
  id: string;
  name?: string;
  email: string;
  role: 'admin' | 'user';
  emailVerified?: Date;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  user: User;
  expires: string;
}

// Component Props Types
export interface HeroSectionProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
  ctaText: string;
  ctaLink: string;
}

export interface PromotionCardProps {
  promotion: Promotion;
  className?: string;
  onClick?: () => void;
}

export interface EventCardProps {
  event: Event;
  className?: string;
  onClick?: () => void;
}

export interface MenuItemProps {
  item: MenuItem;
  className?: string;
  showPrice?: boolean;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<any>;
  isExternal?: boolean;
  children?: NavItem[];
}

// Modal and Dialog Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Table Types
export interface TableColumn<T = any> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
  onRowClick?: (item: T) => void;
}

// Filter and Search Types
export interface FilterOptions {
  search?: string;
  category?: string;
  status?: 'active' | 'inactive' | 'all';
  dateFrom?: Date;
  dateTo?: Date;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Image Upload Types
export interface ImageUploadProps {
  onUpload: (file: File) => Promise<string>;
  currentImage?: string;
  placeholder?: string;
  className?: string;
  accept?: string;
  maxSize?: number;
}

// Dashboard Types
export interface DashboardStats {
  totalPromotions: number;
  activePromotions: number;
  totalEvents: number;
  publishedEvents: number;
  upcomingEvents: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'promotion' | 'event' | 'content';
  action: 'created' | 'updated' | 'deleted';
  title: string;
  timestamp: Date;
  user?: string;
}

// Utility Types
export type CreatePromotion = Omit<Promotion, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePromotion = Partial<CreatePromotion>;
export type CreateEvent = Omit<Event, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateEvent = Partial<CreateEvent>;

// Validation Schema Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState {
  isSubmitting: boolean;
  errors: ValidationError[];
  isDirty: boolean;
  isValid: boolean;
}

// Theme and Styling Types
export type ThemeColors = 'primary' | 'secondary' | 'accent' | 'neutral' | 'success' | 'warning' | 'error';
export type ButtonVariants = 'solid' | 'outline' | 'ghost' | 'link';
export type ButtonSizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Animation Types
export interface AnimationProps {
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  delay?: number;
  duration?: number;
}

// SEO and Meta Types
export interface SEOProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
}