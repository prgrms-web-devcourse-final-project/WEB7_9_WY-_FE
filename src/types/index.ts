// User & Auth Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Artist Types
export interface Artist {
  id: string;
  name: string;
  shortName: string;
  image?: string;
  scheduleCount: number;
  fanCount: number;
}

// Calendar & Event Types
export type EventType = 'concert' | 'fansign' | 'broadcast' | 'birthday';
export type ScheduleCategory = 'CONCERT' | 'FAN_SIGN' | 'BROADCAST' | 'BIRTHDAY';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: EventType;
  artistId: string;
  artistName?: string;
  venue: string;
  description?: string;
  price?: number;
  availableSeats?: number;
}

// API Response Types
export interface MonthlySchedule {
  scheduleId: number;
  artistId: number;
  artistName: string;
  title: string;
  scheduleCategory: ScheduleCategory;
  scheduleTime: string; // ISO 8601
  performanceId?: number;
  link?: string;
  location: string;
}

export interface UpcomingEvent {
  scheduleId: number;
  artistName: string;
  title: string;
  scheduleCategory: ScheduleCategory;
  scheduleTime: string; // ISO 8601
  performanceId?: number;
  link?: string;
  daysUntilEvent: number;
  location: string;
}

export interface CalendarResponse {
  monthlySchedules: MonthlySchedule[];
  upcomingEvents: UpcomingEvent[];
}

export interface CalendarDay {
  date: number;
  month: number;
  year: number;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

// Party Types
export type PartyType = 'departure' | 'return';
export type PartyStatus = 'recruiting' | 'confirmed' | 'closed';

export interface Party {
  id: string;
  title: string;
  eventId: string;
  eventName?: string;
  eventDate?: string;
  hostId: string;
  hostName?: string;
  type: PartyType;
  departure: string;
  arrival: string;
  departureTime?: string;
  maxMembers: number;
  currentMembers: number;
  status: PartyStatus;
  description?: string;
  createdAt?: string;
  // API specific fields
  transportType?: 'TAXI' | 'CARPOOL' | 'SUBWAY' | 'BUS' | 'WALK';
  preferredGender?: 'MALE' | 'FEMALE' | 'ANY';
  preferredAge?: 'TEEN' | 'TWENTY' | 'THIRTY' | 'FORTY' | 'FIFTY_PLUS' | 'NONE';
}

export interface PartyApplicant {
  id: string;
  partyId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message?: string;
  appliedAt: string;
  status: 'pending' | 'accepted' | 'rejected';
}

// Chat Types
export interface ChatRoom {
  id: string;
  partyId: string;
  title: string;
  participants: ChatParticipant[];
  isOwner: boolean;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface ChatParticipant {
  id: string;
  name: string;
  avatar?: string;
  isOwner?: boolean;
  isOnline?: boolean;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isSystem?: boolean;
  isOwn?: boolean;
}

// Booking Types
export interface SeatSection {
  id: string;
  name: string;
  price: number;
  availableSeats: number;
  totalSeats: number;
  color: string;
}

export interface Seat {
  id: string;
  sectionId: string;
  row: string;
  number: number;
  price: number;
  status: 'available' | 'selected' | 'sold' | 'reserved';
}

export type DeliveryMethod = 'mobile' | 'physical' | 'pickup';

export interface BuyerInfo {
  name: string;
  phone: string;
  email: string;
}

export interface DeliveryInfo {
  method: DeliveryMethod;
  address?: string;
  postalCode?: string;
  detailAddress?: string;
}

export interface BookingData {
  eventId: string;
  eventName: string;
  date: string;
  time: string;
  venue: string;
  section: string;
  sectionName?: string;
  seats: string[];
  totalPrice: number;
  status?: 'pending' | 'confirmed' | 'cancelled';
  bookingNumber?: string;
  buyerInfo?: BuyerInfo;
  deliveryInfo?: DeliveryInfo;
  termsAgreed?: boolean;
}

export interface PaymentInfo {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

// Notification Types
export type NotificationType =
  | 'schedule'
  | 'party_request'
  | 'party_accepted'
  | 'party_rejected'
  | 'party_kicked'
  | 'chat_message'
  | 'booking_confirmed'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time?: string;
  createdAt?: string;
  read: boolean;
  partyId?: string;
  eventId?: string;
  chatRoomId?: string;
}

// Rating Types
export interface Rating {
  id: string;
  partyId: string;
  fromUserId: string;
  toUserId: string;
  score: number;
  comment?: string;
  createdAt: string;
}

// Common Types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Filter Types
export interface CalendarFilter {
  artistIds: string[];
  eventTypes: EventType[];
}

export interface PartyFilter {
  type?: PartyType;
  status?: PartyStatus;
  eventId?: string;
}

// Form Types
export interface PartyFormData {
  title: string;
  eventId: string;
  type: PartyType;
  departure: string;
  arrival: string;
  departureTime: string;
  maxMembers: number;
  description?: string;
}
