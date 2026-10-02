export interface User {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  role: 'Client' | 'Admin' | string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isActive?: boolean;
  createdAt: string;
}

export interface Agent {
  agentId: number;
  fullName: string;
  email: string;
  phone: string;
  specialization: string;
  bio: string;
  profileImgUrl: string;
  isActive?: boolean;
}

export interface PropertyImage {
  imageId: number;
  imageUrl: string;
  sortOrder: number;
}

export interface PropertySummary {
  propertyId: number;
  title: string;
  price: number;
  listingType: 'Sale' | 'Rent' | string;
  address: string;
  city: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  sqFt: number;
  imageUrl: string;
  isFeatured: boolean;
  status: 'Available' | 'Reserved' | 'Sold' | 'Rented' | string;
  agentId?: number;
  agentName?: string;
  createdAt: string;
}

export interface PropertyDetail extends PropertySummary {
  description: string;
  updatedAt: string;
  agent?: Agent | null;
  images: PropertyImage[];
  similarProperties: PropertySummary[];
  isFavorited?: boolean;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SiteSettings {
  companyName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  whatsAppNumber: string;
  address: string;
  facebookUrl?: string;
  instagramUrl?: string;
  linkedInUrl?: string;
  linkedinUrl?: string;
}

export interface PublicStats {
  activeListings: number;
  soldOrRented: number;
  citiesCovered: number;
  registeredClients: number;
}

export interface TourBooking {
  bookingId: number;
  propertyId: number;
  propertyTitle: string;
  propertyAddress: string;
  propertyCity: string;
  propertyImageUrl: string;
  propertyPrice: number;
  propertyListingType: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  preferredDate: string;
  notes?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | string;
  adminNote?: string;
  createdAt: string;
}

export interface Inquiry {
  inquiryId: number;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  propertyId?: number;
  propertyTitle?: string;
  status: 'New' | 'Read' | 'Replied' | string;
  replyMessage?: string;
  repliedAt?: string;
  createdAt: string;
}

export interface Favorite {
  propertyId: number;
  title: string;
  price: number;
  listingType: string;
  address: string;
  city: string;
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  sqFt: number;
  imageUrl: string;
  status: string;
  createdAt: string;
}

export interface DailyBookingStat {
  date: string;
  count: number;
}

export interface AdminDashboard {
  totalProperties: number;
  availableProperties: number;
  pendingTours: number;
  newInquiries: number;
  registeredClients: number;
  bookingsTrend: DailyBookingStat[];
  recentBookings: TourBooking[];
  recentInquiries: Inquiry[];
}

export interface AuthChallengeResponse {
  challengeToken: string;
  maskedEmail: string;
  maskedPhone: string;
}

export interface AuthVerifyResponse {
  message: string;
  user: User;
  redirectUrl: string;
}
