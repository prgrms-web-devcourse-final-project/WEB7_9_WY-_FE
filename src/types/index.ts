// User & Auth Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: string;
}

// 확장된 사용자 프로필 타입 (백엔드 API 응답과 일치)
export interface UserProfile extends User {
  nickname: string;           // 백엔드 원본 필드
  profileImage?: string;      // 백엔드 원본 필드
  gender?: 'MALE' | 'FEMALE'; // 사용자 성별 (ANY는 파티용)
  birthDate?: string;         // ISO 8601 date format
  emailVerified?: boolean;
  level?: number;
  age?: number;               // 서버에서 계산된 값
}

// 프로필 수정 요청 타입
export interface UpdateProfileRequest {
  nickname?: string;
  gender?: 'MALE' | 'FEMALE';
  birthDate?: string;
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

// Kalendar & Event Types
export type EventType = 'concert' | 'fansign' | 'broadcast' | 'birthday' | 'festival' | 'award' | 'anniversary' | 'livestream' | 'other';
export type ScheduleCategory =
  | 'CONCERT'
  | 'FAN_MEETING'
  | 'BROADCAST'
  | 'ONLINE_RELEASE'
  | 'BIRTHDAY'
  | 'FESTIVAL'
  | 'AWARD_SHOW'
  | 'ANNIVERSARY'
  | 'FAN_SIGN'
  | 'LIVE_STREAM'
  | 'ETC';

export interface KalendarEvent {
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
  artistId?: number; // API 응답에 없을 수 있음
  artistName: string;
  title: string;
  scheduleCategory: ScheduleCategory;
  scheduleTime: string; // ISO 8601
  performanceId?: number;
  link?: string;
  daysUntilEvent: number;
  location: string;
}

export interface KalendarResponse {
  monthlySchedules: MonthlySchedule[];
  upcomingEvents: UpcomingEvent[];
}

export interface KalendarDay {
  date: number;
  month: number;
  year: number;
  events: KalendarEvent[];
  isCurrentMonth: boolean;
  isToday: boolean;
}

// Party Types (Backend API Enum aligned)
export type PartyType = 'LEAVE' | 'ARRIVE';
export type PartyStatus = 'RECRUITING' | 'CLOSED' | 'COMPLETED' | 'CANCELLED';
export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type TransportType = 'TAXI' | 'CARPOOL' | 'SUBWAY' | 'BUS' | 'WALK';
export type PreferredAge = 'TEEN' | 'TWENTY' | 'THIRTY' | 'FORTY' | 'FIFTY_PLUS' | 'NONE';
export type Gender = 'MALE' | 'FEMALE' | 'ANY';
export type MemberRole = 'LEADER' | 'MEMBER';

// API Response Raw Types (중첩 구조)
export interface PartyLeader {
  userId: number;
  nickname: string;
  age: number;
  gender: Gender;
  profileImage: string | null;
}

export interface PartyEventInfo {
  eventId: number;
  eventTitle: string;
  venueName: string;
}

export interface PartyInfo {
  partyType: PartyType;
  partyName: string;
  departureLocation: string;
  arrivalLocation: string;
  transportType: TransportType;
  maxMembers: number;
  currentMembers: number;
  description: string;
  status: PartyStatus;
}

export interface RawPartyResponse {
  partyId: number;
  leader: PartyLeader;
  event: PartyEventInfo;
  partyInfo: PartyInfo;
  isMyParty: boolean;
  isApplied: boolean;
}

// Frontend Party Model (플랫 구조로 변환된 형태)
export interface Party {
  id: string;
  title: string;
  eventId: string;
  eventName?: string;
  eventDate?: string;
  venueName?: string;
  hostId?: string;
  hostName?: string;
  leaderNickname?: string;
  leaderAge?: number;
  leaderGender?: Gender;
  leaderProfileImage?: string;
  type: PartyType;
  departure: string;
  arrival: string;
  departureTime?: string;
  maxMembers: number;
  currentMembers: number;
  status: PartyStatus;
  description?: string;
  createdAt?: string;
  transportType?: TransportType;
  preferredGender?: Gender;
  preferredAge?: PreferredAge;
  isMyParty?: boolean;
  isApplied?: boolean;
  // 내가 신청한 파티용 필드
  applicationId?: number;
  applicationStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface PartyApplicant {
  id: string;
  partyId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  message?: string;
  appliedAt: string;
  status: ApplicationStatus;
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
export interface KalendarFilter {
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
