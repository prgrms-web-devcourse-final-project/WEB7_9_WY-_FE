/**
 * 예매 시스템 타입 정의
 * 대기열 → 세션 → 좌석 선택 → 결제 플로우
 */

// ============================================
// 대기열 (Queue) 관련 타입
// ============================================

export type QueueStatus = 'WAITING' | 'ADMITTED';

export interface QueueJoinResponse {
  status: string;
  position: number;
  qsid?: string;
}

export interface QueueStatusResponse {
  status: QueueStatus;
  position: number | null;
  waitingToken: string | null;
}

// ============================================
// 예매 세션 (Booking Session) 관련 타입
// ============================================

export interface BookingSessionCreateRequest {
  scheduleId: number;
  waitingToken: string;
  deviceId: string;
}

export interface BookingSessionCreateResponse {
  bookingSessionId: string;
}

// ============================================
// 예매 (Reservation) 관련 타입
// ============================================

export type ReservationStatus = 'PENDING' | 'HOLD' | 'PAID' | 'CANCELLED' | 'EXPIRED';

// BE: POST /booking/schedule/{scheduleId}/reservation - Body 없음
// 예매 생성 응답
export interface CreateReservationResponse {
  reservationId: number;
  status: string; // "PENDING"
  expiresAt: string; // ISO DateTime
  remainingSeconds: number;
}

// ============================================
// 좌석 (Seat) 관련 타입
// ============================================

export type SeatStatus = 'AVAILABLE' | 'HOLD' | 'SOLD' | 'DISABLED';

// BE: GET /performance-seats/schedules/{scheduleId}
// 좌석 기본 정보 (status는 별도 polling으로 조회)
export interface PerformanceSeatResponse {
  performanceSeatId: number;
  floor: number;
  block: string;
  subBlock?: string;
  rowNumber: number;  // BE 필드명
  seatNumber: number; // BE 필드명
  priceGradeId: number;
  // FE 확장 필드 (polling 결과 병합용)
  status?: SeatStatus;
  gradeName?: string;
  price?: number;
}

// BE: GET /schedule/{scheduleId}/seats/changes
export interface SeatChange {
  seatId: number;
  status: SeatStatus;
  userId: number;
  version: number;
  timestamp: string;
}

export interface SeatChangesResponse {
  currentVersion: number;
  changes: SeatChange[];
}

export interface HoldSeatsRequest {
  performanceSeatIds: number[];
}

// BE: hold 응답의 heldSeats 내부 객체
export interface HeldSeatInfo {
  performanceSeatId: number;
  floor: number;
  block: string;
  row: number;     // BE: Integer
  number: number;  // BE: seat number
  priceGrade: string;
  price: number;
}

// FE 내부용 좌석 정보 (UI 표시용)
export interface SeatInfo {
  performanceSeatId: number;
  floor?: number;
  block: string;
  row: string;
  col: number;
  priceGrade: string;
  price: number;
}

// BE: POST /booking/reservation/{reservationId}/seats:hold
export interface HoldSeatsResponse {
  reservationId: number;
  reservationStatus: string; // BE 필드명: "HOLD"
  heldSeats: HeldSeatInfo[]; // BE 필드명
  totalAmount: number;
  expiresAt: string;
  remainingSeconds: number;
  heldSeatCount: number;     // BE 추가 필드
}

export interface SeatConflict {
  performanceSeatId: number;
  currentStatus: SeatStatus;
  reason: 'ALREADY_HELD' | 'SOLD' | 'DISABLED';
}

export interface HoldSeatsFailResponse {
  reservationId: number;
  refreshRequired: boolean;
  conflicts: SeatConflict[];
  updatedAt: string;
}

export interface ReleaseSeatsRequest {
  performanceSeatIds: number[];
}

// BE: POST /booking/reservation/{reservationId}/seats:release
export interface ReleaseSeatsResponse {
  reservationId: number;
  reservationStatus: string;    // BE 필드명
  releasedSeatIds: number[];    // BE 필드명
  remainingSeatCount: number;   // BE 필드명
  totalAmount: number;
  expiresAt: string;
  remainingSeconds: number;
  releasedSeatCount: number;    // BE 추가 필드
}

// ============================================
// 배송/수령 정보 관련 타입
// ============================================

export type DeliveryMethod = 'DELIVERY' | 'PICKUP';

export interface RecipientInfo {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  addressDetail?: string;
  zipCode?: string;
}

// BE Request: { deliveryMethod, recipient: { name, phone, address, zipCode } }
export interface UpdateDeliveryInfoRequest {
  deliveryMethod: DeliveryMethod;
  recipient: {
    name: string;
    phone: string;      // Format: 010-1234-5678
    address?: string;   // Required for DELIVERY
    zipCode?: string;   // Required for DELIVERY
  };
}

// BE Response
export interface UpdateDeliveryInfoResponse {
  reservationId: number;
  deliveryMethod: string;
  updatedAt: string;
  expiresAt: string;
  remainingSeconds: number;
}

// ============================================
// 예매 요약 관련 타입
// ============================================

export interface ReservationSummary {
  reservationId: number;
  status: ReservationStatus;
  performanceTitle: string;
  performanceDate: string;
  venue: string;
  selectedSeats: SeatInfo[];
  totalAmount: number;
  deliveryMethod?: DeliveryMethod;
  recipient?: RecipientInfo;
  expiresAt: string;
  remainingSeconds: number;
}

// ============================================
// 결제 관련 타입
// ============================================

export interface PaymentRequest {
  reservationId: number;
  paymentMethod: 'CARD' | 'VIRTUAL_ACCOUNT' | 'TRANSFER';
  amount: number;
}

export interface PaymentResponse {
  paymentId: string;
  reservationId: number;
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  amount: number;
  paidAt?: string;
}

// ============================================
// 팝업 통신 관련 타입
// ============================================

export type BookingPopupMessageType =
  | 'BOOKING_STARTED'
  | 'BOOKING_COMPLETED'
  | 'BOOKING_CANCELLED'
  | 'BOOKING_ERROR'
  | 'SESSION_EXPIRED';

export interface BookingPopupMessage {
  type: BookingPopupMessageType;
  payload?: {
    reservationId?: number;
    bookingNumber?: string;
    error?: string;
  };
}

// ============================================
// 예매 세션 스토어 상태 타입
// ============================================

export type BookingStep = 'queue' | 'seats' | 'delivery' | 'payment' | 'complete';

export interface BookingSessionState {
  // Device & Queue
  deviceId: string;
  qsid: string | null;
  queueStatus: QueueStatus | null;
  position: number | null;
  waitingToken: string | null;

  // Session
  bookingSessionId: string | null;
  reservationId: number | null;
  scheduleId: number | null;

  // Performance Info
  performanceTitle: string | null;
  performanceDate: string | null;
  venue: string | null;

  // Seats
  performanceSeats: PerformanceSeatResponse[];
  selectedSeatIds: number[];
  totalAmount: number;
  expiresAt: string | null;
  remainingSeconds: number;

  // Delivery
  deliveryMethod: DeliveryMethod | null;
  recipient: RecipientInfo | null;

  // Ping
  pingIntervalId: ReturnType<typeof setInterval> | null;

  // UI
  currentStep: BookingStep;
  isLoading: boolean;
  error: string | null;
}
