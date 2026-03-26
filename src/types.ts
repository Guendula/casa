export type UserRole = 'user' | 'admin';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phoneNumber?: string;
  isVerified?: boolean;
  isEmailVerified?: boolean;
  role?: UserRole;
  socialMedia?: {
    /** Facebook profile URL (e.g., https://facebook.com/username) */
    facebook?: string;
    /** Instagram profile URL (e.g., https://instagram.com/username) */
    instagram?: string;
    /** Twitter/X profile URL (e.g., https://twitter.com/username) */
    twitter?: string;
    /** LinkedIn profile URL (e.g., https://linkedin.com/in/username) */
    linkedin?: string;
  };
  createdAt?: any;
}

export type PropertyType = 'venda' | 'aluguel_mensal' | 'aluguel_diario';
export type PropertyCategory = 'casa' | 'quarto' | 'terreno' | 'escritorio';
export type PropertyStatus = 'active' | 'sold' | 'rented' | 'pending';

export interface Property {
  id: string;
  ownerUid: string;
  ownerName?: string;
  ownerPhoto?: string;
  title: string;
  description?: string;
  price: number;
  type: PropertyType;
  category: PropertyCategory;
  city: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  location?: {
    lat: number;
    lng: number;
  };
  images?: string[];
  videoUrl?: string;
  features?: string[];
  status?: PropertyStatus;
  isFeatured?: boolean;
  isBoosted?: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  propertyId: string;
  tenantUid: string;
  ownerUid: string;
  startDate: any;
  endDate: any;
  totalAmount: number;
  status: BookingStatus;
  createdAt?: any;
}

export interface Review {
  id: string;
  targetId: string;
  authorUid: string;
  rating: number;
  comment?: string;
  createdAt?: any;
}

export interface Favorite {
  uid: string;
  propertyId: string;
  createdAt?: any;
}

export interface SavedSearch {
  id: string;
  uid: string;
  name: string;
  criteria: {
    q?: string;
    type?: string;
    category?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
  };
  createdAt?: any;
}

export interface Notification {
  id: string;
  uid: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt?: any;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo?: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}
