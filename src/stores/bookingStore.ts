import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { BookingData, SeatSection, Seat, KalendarEvent, PaymentInfo, BuyerInfo, DeliveryInfo } from '@/types';

interface BookingState {
  currentEvent: KalendarEvent | null;
  sections: SeatSection[];
  selectedSection: SeatSection | null;
  seats: Seat[];
  selectedSeats: string[];
  selectedScheduleId: number | null;
  bookingData: BookingData | null;
  bookingHistory: BookingData[];
  step: 'event' | 'section' | 'seats' | 'confirm' | 'payment' | 'complete';
  isLoading: boolean;
  error: string | null;
}

interface BookingActions {
  setCurrentEvent: (event: KalendarEvent | null) => void;
  setSections: (sections: SeatSection[]) => void;
  selectSection: (section: SeatSection | null) => void;
  setSeats: (seats: Seat[]) => void;
  selectSeat: (seatId: string) => void;
  deselectSeat: (seatId: string) => void;
  toggleSeat: (seatId: string) => void;
  clearSelectedSeats: () => void;
  setSelectedScheduleId: (scheduleId: number | null) => void;
  setBookingData: (data: BookingData | null) => void;
  setBuyerInfo: (info: BuyerInfo) => void;
  setDeliveryInfo: (info: DeliveryInfo) => void;
  setTermsAgreed: (agreed: boolean) => void;
  setStep: (step: BookingState['step']) => void;
  processPayment: (paymentInfo: PaymentInfo) => Promise<boolean>;
  calculateTotalPrice: () => number;
  getSelectedSeatDetails: () => Seat[];
  getBookingHistory: () => BookingData[];
  resetBooking: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type BookingStore = BookingState & BookingActions;

export const useBookingStore = create<BookingStore>()(
  persist(
    (set, get) => ({
  currentEvent: null,
  sections: [],
  selectedSection: null,
  seats: [],
  selectedSeats: [],
  selectedScheduleId: null,
  bookingData: null,
  bookingHistory: [],
  step: 'event',
  isLoading: false,
  error: null,

  setCurrentEvent: (event: KalendarEvent | null) => {
    set({ currentEvent: event, step: event ? 'section' : 'event' });
  },

  setSections: (sections: SeatSection[]) => {
    set({ sections });
  },

  selectSection: (section: SeatSection | null) => {
    set({
      selectedSection: section,
      selectedSeats: [],
      step: section ? 'seats' : 'section',
    });
  },

  setSeats: (seats: Seat[]) => {
    set({ seats });
  },

  selectSeat: (seatId: string) => {
    const { selectedSeats, seats } = get();
    const seat = seats.find((s) => s.id === seatId);

    if (seat && seat.status === 'available' && selectedSeats.length < 4) {
      set({
        selectedSeats: [...selectedSeats, seatId],
        seats: seats.map((s) =>
          s.id === seatId ? { ...s, status: 'selected' as const } : s
        ),
      });
    }
  },

  deselectSeat: (seatId: string) => {
    const { selectedSeats, seats } = get();
    set({
      selectedSeats: selectedSeats.filter((id) => id !== seatId),
      seats: seats.map((s) =>
        s.id === seatId ? { ...s, status: 'available' as const } : s
      ),
    });
  },

  toggleSeat: (seatId: string) => {
    const { selectedSeats } = get();
    if (selectedSeats.includes(seatId)) {
      get().deselectSeat(seatId);
    } else {
      get().selectSeat(seatId);
    }
  },

  clearSelectedSeats: () => {
    const { seats } = get();
    set({
      selectedSeats: [],
      seats: seats.map((s) =>
        s.status === 'selected' ? { ...s, status: 'available' as const } : s
      ),
    });
  },

  setSelectedScheduleId: (scheduleId: number | null) => {
    set({ selectedScheduleId: scheduleId });
  },

  setBookingData: (data: BookingData | null) => {
    set({ bookingData: data });
  },

  setBuyerInfo: (info: BuyerInfo) => {
    const { bookingData } = get();
    if (bookingData) {
      set({ bookingData: { ...bookingData, buyerInfo: info } });
    }
  },

  setDeliveryInfo: (info: DeliveryInfo) => {
    const { bookingData } = get();
    if (bookingData) {
      set({ bookingData: { ...bookingData, deliveryInfo: info } });
    }
  },

  setTermsAgreed: (agreed: boolean) => {
    const { bookingData } = get();
    if (bookingData) {
      set({ bookingData: { ...bookingData, termsAgreed: agreed } });
    }
  },

  setStep: (step: BookingState['step']) => {
    set({ step });
  },

  processPayment: async (paymentInfo: PaymentInfo) => {
    set({ isLoading: true, error: null });
    try {
      // Mock payment processing - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Validate card info (basic validation)
      if (!paymentInfo.cardNumber || !paymentInfo.expiryDate || !paymentInfo.cvv) {
        throw new Error('카드 정보를 모두 입력해주세요.');
      }

      const { currentEvent, selectedSection, selectedSeats, seats, bookingData: currentBookingData } = get();
      const selectedSeatDetails = seats.filter((s) => selectedSeats.includes(s.id));

      // Generate booking number
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const bookingNumber = `BK${timestamp}${random}`;

      const bookingData: BookingData = {
        eventId: currentEvent?.id || '',
        eventName: currentEvent?.title || '',
        date: currentEvent?.date || '',
        time: currentEvent?.time || '',
        venue: currentEvent?.venue || '',
        section: selectedSection?.id || '',
        sectionName: selectedSection?.name,
        seats: selectedSeatDetails.map((s) => `${s.row}${s.number}`),
        totalPrice: get().calculateTotalPrice(),
        status: 'confirmed',
        bookingNumber,
        buyerInfo: currentBookingData?.buyerInfo,
        deliveryInfo: currentBookingData?.deliveryInfo,
        termsAgreed: currentBookingData?.termsAgreed,
      };

      // 예매 내역에 추가
      const { bookingHistory } = get();
      set({
        bookingData,
        bookingHistory: [...bookingHistory, bookingData],
        step: 'complete',
        isLoading: false,
      });

      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '결제 처리에 실패했습니다.',
        isLoading: false,
      });
      return false;
    }
  },

  calculateTotalPrice: () => {
    const { selectedSeats, seats } = get();
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats.find((s) => s.id === seatId);
      return total + (seat?.price || 0);
    }, 0);
  },

  getSelectedSeatDetails: () => {
    const { selectedSeats, seats } = get();
    return seats.filter((s) => selectedSeats.includes(s.id));
  },

  getBookingHistory: () => {
    return get().bookingHistory;
  },

  resetBooking: () => {
    set({
      currentEvent: null,
      sections: [],
      selectedSection: null,
      seats: [],
      selectedSeats: [],
      selectedScheduleId: null,
      bookingData: null,
      step: 'event',
      error: null,
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}),
    {
      name: 'booking-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        bookingHistory: state.bookingHistory,
      }),
    }
  )
);
