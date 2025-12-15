import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, SignupData, LoginData } from '@/types';
import { authApiService, userApi, setAccessToken, getAccessToken } from '@/api/client';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isOnboarded: boolean;
  selectedArtists: string[];
  guestSelectedArtists: string[];
  isGuestMode: boolean;
  isLoading: boolean;
  error: string | null;
}

interface SignupDataExtended extends SignupData {
  nickname?: string;
  gender?: string;
  birthDate?: string;
}

interface AuthActions {
  // API actions
  login: (data: LoginData) => Promise<void>;
  signup: (data: SignupDataExtended) => Promise<void>;
  logout: () => Promise<void>;
  getMe: () => Promise<void>;
  // State setters (for React Query hooks)
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  completeLogin: () => void;
  // Onboarding & artists
  completeOnboarding: (artistIds: string[]) => void;
  setSelectedArtists: (artistIds: string[]) => void;
  setGuestSelectedArtists: (artistIds: string[]) => void;
  continueAsGuest: (artistIds: string[]) => void;
  mergeGuestSelectionsOnLogin: () => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      isOnboarded: false,
      selectedArtists: [],
      guestSelectedArtists: [],
      isGuestMode: false,
      isLoading: false,
      error: null,

      login: async (data: LoginData) => {
        set({ isLoading: true, error: null });
        try {
          const { data: loginResponse, error: loginError } = await authApiService.login(data);

          if (loginError) {
            const errorMessage = (loginError as { message?: string }).message || '로그인에 실패했습니다.';
            throw new Error(errorMessage);
          }

          if (!loginResponse?.accessToken) {
            throw new Error('인증 토큰을 받지 못했습니다.');
          }

          // Store access token
          setAccessToken(loginResponse.accessToken);

          // Fetch user info
          const { data: userData, error: userError } = await userApi.getMe();

          if (userError) {
            throw new Error('사용자 정보를 가져오지 못했습니다.');
          }

          if (userData) {
            const user: User = {
              id: String(loginResponse.userId || ''),
              name: userData.nickname || '',
              email: userData.email || '',
              avatar: userData.profileImage,
            };

            // Merge guest selections with existing selections on login
            const { guestSelectedArtists, selectedArtists } = get();
            const mergedArtists = [...new Set([...selectedArtists, ...guestSelectedArtists])];

            set({
              user,
              isLoggedIn: true,
              isLoading: false,
              selectedArtists: mergedArtists,
              guestSelectedArtists: [],
              isGuestMode: false,
              isOnboarded: mergedArtists.length > 0 ? true : get().isOnboarded,
            });
          }
        } catch (error) {
          setAccessToken(null);
          set({
            error: error instanceof Error ? error.message : '로그인에 실패했습니다.',
            isLoading: false
          });
          throw error;
        }
      },

      signup: async (data: SignupDataExtended) => {
        set({ isLoading: true, error: null });
        try {
          // Prepare API request body
          const signupBody = {
            email: data.email,
            password: data.password,
            nickname: data.nickname || data.name,
            gender: data.gender || 'ANY',
            birthDate: data.birthDate || '2000-01-01',
          };

          const { data: signupResponse, error: signupError } = await userApi.signup(signupBody);

          if (signupError) {
            const errorMessage = (signupError as { message?: string }).message || '회원가입에 실패했습니다.';
            throw new Error(errorMessage);
          }

          if (!signupResponse) {
            throw new Error('회원가입에 실패했습니다.');
          }

          // After signup, automatically login
          await get().login({ email: data.email, password: data.password });

          set({ isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : '회원가입에 실패했습니다.',
            isLoading: false
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authApiService.logout();
        } catch (error) {
          console.error('Logout API error:', error);
        } finally {
          // Clear token and state regardless of API response
          setAccessToken(null);
          set({
            user: null,
            isLoggedIn: false,
            isOnboarded: false,
            selectedArtists: [],
            isGuestMode: false,
            error: null
          });
        }
      },

      getMe: async () => {
        const token = getAccessToken();
        if (!token) return;

        try {
          const { data: userData, error: userError } = await userApi.getMe();

          if (userError || !userData) {
            // Invalid token, clear auth state
            setAccessToken(null);
            set({
              user: null,
              isLoggedIn: false,
              isOnboarded: false,
              selectedArtists: [],
            });
            return;
          }

          const user: User = {
            id: String((userData as { userId?: number }).userId || userData.email || ''),
            name: userData.nickname || '',
            email: userData.email || '',
            avatar: userData.profileImage,
          };

          set({ user, isLoggedIn: true });
        } catch (error) {
          console.error('Failed to fetch user info:', error);
        }
      },

      // State setters for React Query hooks
      setUser: (user: User | null) => {
        set({ user, isLoggedIn: !!user });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      completeLogin: () => {
        const { guestSelectedArtists, selectedArtists } = get();
        const mergedArtists = [...new Set([...selectedArtists, ...guestSelectedArtists])];
        set({
          isLoggedIn: true,
          isLoading: false,
          selectedArtists: mergedArtists,
          guestSelectedArtists: [],
          isGuestMode: false,
          isOnboarded: mergedArtists.length > 0 ? true : get().isOnboarded,
        });
      },

      completeOnboarding: (artistIds: string[]) => {
        const { isLoggedIn } = get();
        if (isLoggedIn) {
          set({ isOnboarded: true, selectedArtists: artistIds });
        } else {
          set({ guestSelectedArtists: artistIds, isGuestMode: true });
        }
      },

      setSelectedArtists: (artistIds: string[]) => {
        set({ selectedArtists: artistIds });
      },

      setGuestSelectedArtists: (artistIds: string[]) => {
        set({ guestSelectedArtists: artistIds });
      },

      continueAsGuest: (artistIds: string[]) => {
        set({
          guestSelectedArtists: artistIds,
          isGuestMode: true
        });
      },

      mergeGuestSelectionsOnLogin: () => {
        const { guestSelectedArtists, selectedArtists } = get();
        const mergedArtists = [...new Set([...selectedArtists, ...guestSelectedArtists])];
        set({
          selectedArtists: mergedArtists,
          guestSelectedArtists: [],
          isGuestMode: false,
          isOnboarded: mergedArtists.length > 0,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        isOnboarded: state.isOnboarded,
        selectedArtists: state.selectedArtists,
        guestSelectedArtists: state.guestSelectedArtists,
        isGuestMode: state.isGuestMode,
      }),
    }
  )
);
