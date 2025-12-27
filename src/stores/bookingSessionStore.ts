import { create } from 'zustand';
import { bookingApi } from '@/api/client';
import type {
  QueueStatus,
  BookingStep,
  PerformanceSeatResponse,
  SeatInfo,
  HeldSeatInfo,
  RecipientInfo,
  DeliveryMethod,
} from '@/types/booking';

// HeldSeatInfo를 SeatInfo로 변환하는 헬퍼 함수
const convertHeldSeatToSeatInfo = (seat: HeldSeatInfo): SeatInfo => ({
  performanceSeatId: seat.performanceSeatId,
  floor: seat.floor,
  block: seat.block,
  row: String(seat.row), // BE: number → FE: string
  col: seat.number,      // BE: number (seat number) → FE: col
  priceGrade: seat.priceGrade,
  price: seat.price,
});

// ============================================
// 상태 인터페이스
// ============================================

interface BookingSessionState {
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
  heldSeats: SeatInfo[];
  totalAmount: number;
  expiresAt: string | null;
  remainingSeconds: number;

  // Delivery
  deliveryMethod: DeliveryMethod | null;
  recipient: RecipientInfo | null;

  // Ping
  pingIntervalId: ReturnType<typeof setInterval> | null;

  // Countdown
  countdownIntervalId: ReturnType<typeof setInterval> | null;

  // UI
  currentStep: BookingStep;
  isLoading: boolean;
  error: string | null;
}

interface BookingSessionActions {
  // Initialization
  initDeviceId: () => string;
  setScheduleInfo: (info: { scheduleId: number; title?: string; date?: string; venue?: string }) => void;
  reset: () => void;

  // Queue
  joinQueue: (scheduleId: number) => Promise<void>;
  pollQueueStatus: (scheduleId: number) => Promise<boolean>;

  // Session
  createBookingSession: (scheduleId: number) => Promise<void>;
  startPing: (scheduleId: number) => void;
  stopPing: () => void;
  leaveSession: (scheduleId: number) => Promise<void>;

  // Reservation
  createReservation: (scheduleId: number) => Promise<void>;
  fetchSeats: (scheduleId: number) => Promise<void>;
  holdSeats: () => Promise<boolean>;
  releaseSeats: (seatIds: number[]) => Promise<void>;

  // Selection
  selectSeat: (seatId: number) => void;
  deselectSeat: (seatId: number) => void;
  toggleSeat: (seatId: number) => void;
  clearSelectedSeats: () => void;

  // Delivery
  setDeliveryInfo: (method: DeliveryMethod, recipient: RecipientInfo) => void;
  saveDeliveryInfo: () => Promise<boolean>;

  // Navigation
  setStep: (step: BookingStep) => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;

  // Countdown
  startCountdown: () => void;
  stopCountdown: () => void;

  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

type BookingSessionStore = BookingSessionState & BookingSessionActions;

// ============================================
// 초기 상태
// ============================================

const initialState: BookingSessionState = {
  // Device & Queue
  deviceId: '',
  qsid: null,
  queueStatus: null,
  position: null,
  waitingToken: null,

  // Session
  bookingSessionId: null,
  reservationId: null,
  scheduleId: null,

  // Performance Info
  performanceTitle: null,
  performanceDate: null,
  venue: null,

  // Seats
  performanceSeats: [],
  selectedSeatIds: [],
  heldSeats: [],
  totalAmount: 0,
  expiresAt: null,
  remainingSeconds: 0,

  // Delivery
  deliveryMethod: null,
  recipient: null,

  // Ping
  pingIntervalId: null,

  // Countdown
  countdownIntervalId: null,

  // UI
  currentStep: 'queue',
  isLoading: false,
  error: null,
};

// ============================================
// Device ID 생성/조회
// ============================================

const generateDeviceId = (): string => {
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  return `device-${uuid}`;
};

const getOrCreateDeviceId = (): string => {
  if (typeof window === 'undefined') return generateDeviceId();

  const storedId = localStorage.getItem('booking_device_id');
  if (storedId) return storedId;

  const newId = generateDeviceId();
  localStorage.setItem('booking_device_id', newId);
  return newId;
};

// ============================================
// 스토어 생성
// ============================================

export const useBookingSessionStore = create<BookingSessionStore>((set, get) => ({
  ...initialState,

  // ─────────────────────────────────────────
  // Initialization
  // ─────────────────────────────────────────

  initDeviceId: () => {
    const deviceId = getOrCreateDeviceId();
    set({ deviceId });
    return deviceId;
  },

  setScheduleInfo: (info) => {
    set({
      scheduleId: info.scheduleId,
      performanceTitle: info.title || null,
      performanceDate: info.date || null,
      venue: info.venue || null,
    });
  },

  reset: () => {
    const { pingIntervalId, countdownIntervalId } = get();

    // 기존 인터벌 정리
    if (pingIntervalId) {
      clearInterval(pingIntervalId);
    }
    if (countdownIntervalId) {
      clearInterval(countdownIntervalId);
    }

    // Device ID는 유지
    const deviceId = get().deviceId || getOrCreateDeviceId();

    set({
      ...initialState,
      deviceId,
    });
  },

  // ─────────────────────────────────────────
  // Queue
  // ─────────────────────────────────────────

  joinQueue: async (scheduleId) => {
    set({ isLoading: true, error: null });

    try {
      const deviceId = get().deviceId || get().initDeviceId();

      const result = await bookingApi.joinQueue(scheduleId, deviceId);

      if (result.error) {
        throw result.error;
      }

      set({
        scheduleId,
        qsid: result.data?.qsid || deviceId, // QSID가 없으면 deviceId 사용
        queueStatus: result.data?.status as QueueStatus,
        position: result.data?.position || null,
        currentStep: 'queue',
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '대기열 진입에 실패했습니다.',
        isLoading: false,
      });
      throw error;
    }
  },

  pollQueueStatus: async (scheduleId) => {
    const { qsid } = get();

    if (!qsid) {
      return false;
    }

    try {
      const result = await bookingApi.getQueueStatus(scheduleId, qsid);

      if (result.error || !result.data) {
        return false;
      }

      set({
        queueStatus: result.data.status,
        position: result.data.position,
        waitingToken: result.data.waitingToken,
      });

      // ADMITTED 상태면 true 반환
      return result.data.status === 'ADMITTED';
    } catch {
      return false;
    }
  },

  // ─────────────────────────────────────────
  // Session
  // ─────────────────────────────────────────

  createBookingSession: async (scheduleId) => {
    const { waitingToken, deviceId } = get();

    if (!waitingToken) {
      throw new Error('대기열 토큰이 없습니다.');
    }

    set({ isLoading: true, error: null });

    try {
      const result = await bookingApi.createSession({
        scheduleId,
        waitingToken,
        deviceId,
      });

      if (result.error || !result.data) {
        throw result.error || new Error('세션 생성에 실패했습니다.');
      }

      set({
        bookingSessionId: result.data.bookingSessionId,
        currentStep: 'seats',
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '세션 생성에 실패했습니다.',
        isLoading: false,
      });
      throw error;
    }
  },

  startPing: (scheduleId) => {
    const { bookingSessionId } = get();

    if (!bookingSessionId) {
      console.warn('[BookingSession] Cannot start ping: no session ID');
      return;
    }

    // 기존 ping 정리
    get().stopPing();

    // 10초마다 ping
    const intervalId = setInterval(async () => {
      const currentSessionId = get().bookingSessionId;
      if (!currentSessionId) {
        get().stopPing();
        return;
      }

      const result = await bookingApi.pingSession(scheduleId, currentSessionId);

      if (result.error) {
        console.error('[BookingSession] Ping failed:', result.error);
        // 세션 만료 처리
        set({ error: '세션이 만료되었습니다.' });
        get().stopPing();
      }
    }, 10000);

    set({ pingIntervalId: intervalId });
  },

  stopPing: () => {
    const { pingIntervalId } = get();
    if (pingIntervalId) {
      clearInterval(pingIntervalId);
      set({ pingIntervalId: null });
    }
  },

  leaveSession: async (scheduleId) => {
    const { bookingSessionId } = get();

    if (!bookingSessionId) {
      return;
    }

    // Ping 중단
    get().stopPing();

    try {
      await bookingApi.leaveSession(scheduleId, bookingSessionId);
    } catch (error) {
      console.error('[BookingSession] Leave session error:', error);
    }
  },

  // ─────────────────────────────────────────
  // Reservation
  // ─────────────────────────────────────────

  createReservation: async (scheduleId) => {
    const { bookingSessionId } = get();

    if (!bookingSessionId) {
      throw new Error('예매 세션이 없습니다.');
    }

    set({ isLoading: true, error: null });

    try {
      // BE: POST /booking/schedule/{scheduleId}/reservation - Body 없음
      const result = await bookingApi.createReservation(scheduleId, bookingSessionId);

      if (result.error || !result.data) {
        throw new Error('예매 생성에 실패했습니다.');
      }

      set({
        reservationId: result.data.reservationId,
        expiresAt: result.data.expiresAt,
        remainingSeconds: result.data.remainingSeconds || 300,
        isLoading: false,
      });

      // 카운트다운 시작
      get().startCountdown();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '예매 생성에 실패했습니다.',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchSeats: async (scheduleId) => {
    const { bookingSessionId } = get();

    if (!bookingSessionId) {
      throw new Error('예매 세션이 없습니다.');
    }

    set({ isLoading: true, error: null });

    try {
      const result = await bookingApi.getSeats(scheduleId, bookingSessionId);

      if (result.error) {
        throw result.error;
      }

      set({
        performanceSeats: result.data as PerformanceSeatResponse[],
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '좌석 정보 조회에 실패했습니다.',
        isLoading: false,
      });
      throw error;
    }
  },

  holdSeats: async () => {
    const { reservationId, bookingSessionId, selectedSeatIds } = get();

    if (!reservationId || !bookingSessionId) {
      throw new Error('예매 정보가 없습니다.');
    }

    if (selectedSeatIds.length === 0) {
      throw new Error('선택된 좌석이 없습니다.');
    }

    set({ isLoading: true, error: null });

    try {
      const result = await bookingApi.holdSeats(reservationId, bookingSessionId, {
        performanceSeatIds: selectedSeatIds,
      });

      if (result.error) {
        if (result.error.message === 'SEAT_CONFLICT') {
          // 좌석 충돌 - 새로고침 필요
          set({
            error: '선택한 좌석이 이미 선점되었습니다. 좌석 목록을 새로고침합니다.',
            isLoading: false,
          });
          return false;
        }
        throw result.error;
      }

      // BE 응답: heldSeats (HeldSeatInfo[]) → FE: heldSeats (SeatInfo[])
      const heldSeats: SeatInfo[] = (result.data?.heldSeats || []).map(convertHeldSeatToSeatInfo);

      set({
        heldSeats,
        totalAmount: result.data?.totalAmount || 0,
        expiresAt: result.data?.expiresAt || null,
        remainingSeconds: result.data?.remainingSeconds || 0,
        currentStep: 'delivery',
        isLoading: false,
      });

      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '좌석 선점에 실패했습니다.',
        isLoading: false,
      });
      return false;
    }
  },

  releaseSeats: async (seatIds) => {
    const { reservationId, bookingSessionId } = get();

    if (!reservationId || !bookingSessionId) {
      return;
    }

    try {
      await bookingApi.releaseSeats(reservationId, bookingSessionId, {
        performanceSeatIds: seatIds,
      });

      // 선택 해제
      set((state) => ({
        selectedSeatIds: state.selectedSeatIds.filter((id) => !seatIds.includes(id)),
        heldSeats: state.heldSeats.filter((seat) => !seatIds.includes(seat.performanceSeatId)),
      }));
    } catch (error) {
      console.error('[BookingSession] Release seats error:', error);
    }
  },

  // ─────────────────────────────────────────
  // Selection
  // ─────────────────────────────────────────

  selectSeat: (seatId) => {
    const { selectedSeatIds, performanceSeats } = get();

    // 최대 4석 제한
    if (selectedSeatIds.length >= 4) {
      set({ error: '최대 4석까지 선택 가능합니다.' });
      return;
    }

    // 이미 선택된 좌석인지 확인
    if (selectedSeatIds.includes(seatId)) {
      return;
    }

    // 좌석 상태 확인
    const seat = performanceSeats.find((s) => s.performanceSeatId === seatId);
    if (!seat || seat.status !== 'AVAILABLE') {
      set({ error: '선택할 수 없는 좌석입니다.' });
      return;
    }

    set({
      selectedSeatIds: [...selectedSeatIds, seatId],
      error: null,
    });
  },

  deselectSeat: (seatId) => {
    set((state) => ({
      selectedSeatIds: state.selectedSeatIds.filter((id) => id !== seatId),
    }));
  },

  toggleSeat: (seatId) => {
    const { selectedSeatIds } = get();
    if (selectedSeatIds.includes(seatId)) {
      get().deselectSeat(seatId);
    } else {
      get().selectSeat(seatId);
    }
  },

  clearSelectedSeats: () => {
    set({ selectedSeatIds: [] });
  },

  // ─────────────────────────────────────────
  // Delivery
  // ─────────────────────────────────────────

  setDeliveryInfo: (method, recipient) => {
    set({
      deliveryMethod: method,
      recipient,
    });
  },

  saveDeliveryInfo: async () => {
    const { reservationId, deliveryMethod, recipient } = get();

    if (!reservationId || !deliveryMethod || !recipient) {
      set({ error: '배송 정보가 올바르지 않습니다.' });
      return false;
    }

    set({ isLoading: true, error: null });

    try {
      // BE 스펙: recipient에는 name, phone, address, zipCode만 전송 (email, addressDetail 제외)
      const result = await bookingApi.updateDelivery(reservationId, {
        deliveryMethod,
        recipient: {
          name: recipient.name,
          phone: recipient.phone,
          address: recipient.address,
          zipCode: recipient.zipCode,
        },
      });

      if (result.error) {
        throw new Error('배송 정보 저장에 실패했습니다.');
      }

      set({
        currentStep: 'payment',
        isLoading: false,
      });

      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '배송 정보 저장에 실패했습니다.',
        isLoading: false,
      });
      return false;
    }
  },

  // ─────────────────────────────────────────
  // Navigation
  // ─────────────────────────────────────────

  setStep: (step) => {
    set({ currentStep: step });
  },

  goToNextStep: () => {
    const { currentStep } = get();
    const steps: BookingStep[] = ['queue', 'seats', 'delivery', 'payment', 'complete'];
    const currentIndex = steps.indexOf(currentStep);

    if (currentIndex < steps.length - 1) {
      set({ currentStep: steps[currentIndex + 1] });
    }
  },

  goToPrevStep: () => {
    const { currentStep } = get();
    const steps: BookingStep[] = ['queue', 'seats', 'delivery', 'payment', 'complete'];
    const currentIndex = steps.indexOf(currentStep);

    if (currentIndex > 0) {
      set({ currentStep: steps[currentIndex - 1] });
    }
  },

  // ─────────────────────────────────────────
  // Countdown
  // ─────────────────────────────────────────

  startCountdown: () => {
    // 기존 카운트다운 정리
    get().stopCountdown();

    const intervalId = setInterval(() => {
      const { remainingSeconds } = get();

      if (remainingSeconds <= 0) {
        get().stopCountdown();
        set({ error: '예매 시간이 만료되었습니다.' });
        return;
      }

      set({ remainingSeconds: remainingSeconds - 1 });
    }, 1000);

    set({ countdownIntervalId: intervalId });
  },

  stopCountdown: () => {
    const { countdownIntervalId } = get();
    if (countdownIntervalId) {
      clearInterval(countdownIntervalId);
      set({ countdownIntervalId: null });
    }
  },

  // ─────────────────────────────────────────
  // Error handling
  // ─────────────────────────────────────────

  setError: (error) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },
}));

// ============================================
// 헬퍼 훅
// ============================================

// 선택된 좌석 상세 정보 조회
export const useSelectedSeatsDetails = () => {
  const { performanceSeats, selectedSeatIds } = useBookingSessionStore();

  return performanceSeats.filter((seat) => selectedSeatIds.includes(seat.performanceSeatId));
};

// 선택된 좌석 총 금액 계산
export const useSelectedSeatsTotal = () => {
  const selectedSeats = useSelectedSeatsDetails();

  // price는 optional이므로 0 fallback
  return selectedSeats.reduce((total, seat) => total + (seat.price || 0), 0);
};

// 남은 시간 포맷팅 (mm:ss)
export const useFormattedRemainingTime = () => {
  const { remainingSeconds } = useBookingSessionStore();

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
