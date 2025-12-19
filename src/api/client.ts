import createClient, { type Middleware } from 'openapi-fetch';
import type { paths } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// 토큰 저장소 (클라이언트 사이드에서만 사용)
let accessToken: string | null = null;
let refreshPromise: Promise<boolean> | null = null;

// Request body를 저장하기 위한 WeakMap (401 재시도 시 body 재사용)
const requestBodyMap = new WeakMap<Request, BodyInit | null>();

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }
};

export const getAccessToken = (): string | null => {
  if (accessToken) return accessToken;
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('accessToken');
  }
  return accessToken;
};

// 토큰 갱신 함수 (refreshPromise만으로 동기화 - null 체크가 atomic함)
const refreshAccessToken = async (): Promise<boolean> => {
  // 이미 갱신 중이면 기존 Promise 반환
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth] Attempting token refresh...');
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include', // 쿠키(refresh token) 전송
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('[Auth] Refresh response status:', response.status);
      }

      if (response.ok) {
        const authHeader = response.headers.get('Authorization');
        if (process.env.NODE_ENV === 'development') {
          console.log('[Auth] Refresh response Authorization header:', authHeader ? `${authHeader.substring(0, 30)}...` : 'NULL');
        }
        if (authHeader) {
          const newToken = authHeader.replace('Bearer ', '').trim();
          if (process.env.NODE_ENV === 'development') {
            console.log('[Auth] Raw authHeader:', JSON.stringify(authHeader));
            console.log('[Auth] Extracted token length:', newToken.length);
            console.log('[Auth] Extracted token:', newToken ? `${newToken.substring(0, 20)}...` : 'EMPTY');
          }
          setAccessToken(newToken);
          // 즉시 확인
          const storedToken = getAccessToken();
          if (process.env.NODE_ENV === 'development') {
            console.log('[Auth] Token after setAccessToken:', storedToken ? `${storedToken.substring(0, 20)}...` : 'NULL');
          }
          return true;
        }
        // CORS 문제 감지용 디버그 로그
        console.warn('[Auth] Token refresh response ok but no Authorization header (check CORS Access-Control-Expose-Headers)');
      } else {
        // 에러 응답 내용 로깅
        try {
          const errorData = await response.json();
          console.error('[Auth] Token refresh failed:', response.status, errorData);
        } catch {
          console.error('[Auth] Token refresh failed:', response.status);
        }
      }
      return false;
    } catch (error) {
      console.error('[Auth] Token refresh error:', error);
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

// 로그아웃 처리 (auth store 순환 참조 방지)
const handleLogout = () => {
  setAccessToken(null);
  if (typeof window !== 'undefined') {
    // auth-storage 클리어
    localStorage.removeItem('auth-storage');
    window.location.href = '/login';
  }
};

// 인증 미들웨어
const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const token = getAccessToken();
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }

    // Body가 있는 요청의 경우 clone하여 저장 (401 재시도용)
    // ReadableStream은 한 번만 consume 가능하므로 clone 필요
    if (request.body) {
      try {
        const clonedRequest = request.clone();
        const contentType = request.headers.get('Content-Type');

        if (contentType?.includes('application/json')) {
          // JSON body를 텍스트로 읽어서 저장
          const bodyText = await clonedRequest.text();
          requestBodyMap.set(request, bodyText);
        } else if (contentType?.includes('multipart/form-data')) {
          // FormData는 blob으로 저장
          const bodyBlob = await clonedRequest.blob();
          requestBodyMap.set(request, bodyBlob);
        } else {
          // 기타 body는 ArrayBuffer로 저장
          const bodyBuffer = await clonedRequest.arrayBuffer();
          requestBodyMap.set(request, bodyBuffer);
        }
      } catch {
        // clone 실패 시 무시 (body가 없거나 이미 consume된 경우)
      }
    }

    return request;
  },
  async onResponse({ request, response }) {
    // 401 에러 시 토큰 갱신 시도
    if (response.status === 401) {
      // refresh 요청 자체가 401이면 → 세션 만료, 로그아웃 처리
      if (request.url.includes('/auth/refresh')) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Auth] Refresh token expired or invalid, logging out...');
        }
        handleLogout();
        return response;
      }

      // logout 요청이 401이면 무시 (이미 로그아웃된 상태)
      if (request.url.includes('/auth/logout')) {
        return response;
      }

      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // 새 토큰으로 원래 요청 재시도
        const newToken = getAccessToken();

        if (process.env.NODE_ENV === 'development') {
          console.log('[Auth] New token after refresh:', newToken ? `${newToken.substring(0, 20)}...` : 'NULL');
        }

        // 토큰이 없으면 재시도하지 않음
        if (!newToken) {
          console.error('[Auth] Token is null after successful refresh, this should not happen');
          handleLogout();
          return response;
        }

        // 저장된 body 조회 (ReadableStream 재사용 불가 문제 해결)
        const savedBody = requestBodyMap.get(request) ?? null;

        // 새 헤더 생성 (기존 헤더 복사 후 Authorization 덮어쓰기)
        const newHeaders = new Headers(request.headers);
        newHeaders.set('Authorization', `Bearer ${newToken}`);

        if (process.env.NODE_ENV === 'development') {
          console.log('[Auth] Retry request Authorization header:', newHeaders.get('Authorization')?.substring(0, 30) + '...');
        }

        const newRequest = new Request(request.url, {
          method: request.method,
          headers: newHeaders,
          body: savedBody,
          credentials: 'include',
        });

        // 정리
        requestBodyMap.delete(request);

        if (process.env.NODE_ENV === 'development') {
          console.log('[Auth] Retrying request after token refresh:', request.method, request.url);
        }

        return fetch(newRequest);
      } else {
        // 갱신 실패 시 로그아웃
        handleLogout();
      }
    }

    // 성공 시에도 WeakMap 정리 (메모리 관리)
    requestBodyMap.delete(request);

    // 새 토큰이 헤더에 있으면 저장
    const newToken = response.headers.get('Authorization');
    if (newToken) {
      const token = newToken.replace('Bearer ', '');
      setAccessToken(token);
    }

    return response;
  },
};

// 기본 API 클라이언트 (인증 필요 없는 요청용)
export const api = createClient<paths>({
  baseUrl: API_BASE_URL,
  credentials: 'include', // 쿠키 전송 (refresh token용)
});

// 인증된 API 클라이언트
export const authApi = createClient<paths>({
  baseUrl: API_BASE_URL,
  credentials: 'include',
});

// 미들웨어 등록
authApi.use(authMiddleware);

// API 헬퍼 함수들
export const artistApi = {
  // 전체 아티스트 조회
  getAll: () => api.GET('/api/v1/artist'),

  // 팔로우한 아티스트 조회
  getFollowing: () => authApi.GET('/api/v1/artist/following'),

  // 아티스트 팔로우
  follow: (artistId: number) =>
    authApi.POST('/api/v1/artist/{artistId}/follow', {
      params: { path: { artistId } }
    }),

  // 아티스트 언팔로우
  unfollow: (artistId: number) =>
    authApi.DELETE('/api/v1/artist/{artistId}/unfollow', {
      params: { path: { artistId } }
    }),
};

export const authApiService = {
  // 로그인 (access token은 Authorization 헤더로 반환됨)
  login: async (body: { email: string; password: string }) => {
    const result = await api.POST('/api/v1/auth/login', { body });
    // Extract access token from Authorization header
    const authHeader = result.response?.headers?.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || null;
    return {
      ...result,
      data: result.data ? { ...result.data, accessToken } : null,
    };
  },

  // 로그아웃
  logout: () => authApi.POST('/api/v1/auth/logout'),

  // 토큰 갱신 (새 access token은 Authorization 헤더로 반환됨)
  refresh: async () => {
    const result = await api.POST('/api/v1/auth/refresh');
    const authHeader = result.response?.headers?.get('Authorization');
    const accessToken = authHeader?.replace('Bearer ', '') || null;
    return {
      ...result,
      data: { accessToken },
    };
  },

  // 이메일 인증 코드 발송
  sendEmailVerification: (body: { email: string }) =>
    api.POST('/api/v1/auth/email/send', { body }),

  // 이메일 인증 확인
  verifyEmail: (body: { email: string; code: string }) =>
    api.POST('/api/v1/auth/email/verify', { body }),

  // 이메일 인증 상태 확인
  getEmailStatus: () => authApi.GET('/api/v1/auth/email'),

  // 비밀번호 재설정 이메일 발송
  sendPasswordReset: (body: { email: string }) =>
    api.POST('/api/v1/auth/password/send', { body }),

  // 비밀번호 재설정
  resetPassword: (body: { token: string; newPassword: string; newPasswordConfirm: string }) =>
    api.POST('/api/v1/auth/password/reset', { body }),
};

export const userApi = {
  // 회원가입
  signup: (body: {
    email: string;
    password: string;
    nickname: string;
    gender: string;
    birthDate: string;
  }) => api.POST('/api/v1/user', { body }),

  // 내 정보 조회
  getMe: () => authApi.GET('/api/v1/user/me'),

  // 내 정보 수정
  updateMe: (body: { nickname?: string; gender?: string; birthDate?: string }) =>
    authApi.PATCH('/api/v1/user/me', { body }),

  // 프로필 이미지 업로드
  uploadProfileImage: (formData: FormData) =>
    authApi.POST('/api/v1/user/me/profile-image', {
      body: formData as unknown as { profile_image: string },
      bodySerializer: (body) => body as unknown as BodyInit,
    }),
};

export const scheduleApi = {
  // 캘린더 화면 통합 데이터 조회
  getFollowing: (params: { year: number; month: number; artistId?: number }) =>
    authApi.GET('/api/v1/schedule/following', {
      params: { query: params }
    }),

  // 이벤트 선택 목록 조회 (파티 생성용)
  getPartyList: () => authApi.GET('/api/v1/schedule/partyList'),
};

export const performanceApi = {
  // 공연 상세 정보 조회
  getDetail: (performanceId: number) =>
    api.GET('/api/v1/performance/{performanceId}', {
      params: { path: { performanceId } }
    }),
};

export const partyApi = {
  // 파티 목록 조회
  getAll: (params?: { page?: number; size?: number }) =>
    authApi.GET('/api/v1/party', { params: { query: params } }),

  // 스케줄별 파티 목록 조회
  getBySchedule: (scheduleId: number, params?: {
    partyType?: 'LEAVE' | 'ARRIVE';
    transportType?: 'TAXI' | 'CARPOOL' | 'SUBWAY' | 'BUS' | 'WALK';
    page?: number;
    size?: number;
  }) => authApi.GET('/api/v1/party/schedule/{scheduleId}', {
    params: { path: { scheduleId }, query: params }
  }),

  // 파티 생성
  create: (body: {
    scheduleId: number;
    partyType: 'LEAVE' | 'ARRIVE';
    partyName: string;
    description?: string;
    departureLocation: string;
    arrivalLocation: string;
    transportType: 'TAXI' | 'CARPOOL' | 'SUBWAY' | 'BUS' | 'WALK';
    maxMembers: number;
    preferredGender: 'MALE' | 'FEMALE' | 'ANY';
    preferredAge: 'TEEN' | 'TWENTY' | 'THIRTY' | 'FORTY' | 'FIFTY_PLUS' | 'NONE';
  }) => authApi.POST('/api/v1/party', { body }),

  // 파티 수정
  update: (partyId: number, body: {
    partyName?: string;
    description?: string;
    departureLocation?: string;
    arrivalLocation?: string;
    transportType?: 'TAXI' | 'CARPOOL' | 'SUBWAY' | 'BUS' | 'WALK';
    maxMembers?: number;
    preferredGender?: 'MALE' | 'FEMALE' | 'ANY';
    preferredAge?: 'TEEN' | 'TWENTY' | 'THIRTY' | 'FORTY' | 'FIFTY_PLUS' | 'NONE';
  }) => authApi.PUT('/api/v1/party/{partyId}', {
    params: { path: { partyId } },
    body
  }),

  // 파티 삭제
  delete: (partyId: number) =>
    authApi.DELETE('/api/v1/party/{partyId}', {
      params: { path: { partyId } }
    }),

  // 파티 확정 멤버 조회
  getMembers: (partyId: number) =>
    authApi.GET('/api/v1/party/{partyId}/members', {
      params: { path: { partyId } }
    }),

  // 파티 신청자 목록 조회 (파티장만)
  getApplicants: (partyId: number) =>
    authApi.GET('/api/v1/party/{partyId}/application/applicants', {
      params: { path: { partyId } }
    }),

  // 파티 참가 신청
  apply: (partyId: number) =>
    authApi.POST('/api/v1/party/{partyId}/application/apply', {
      params: { path: { partyId } }
    }),

  // 파티 신청 승인
  acceptApplication: (partyId: number, applicationId: number) =>
    authApi.PATCH('/api/v1/party/{partyId}/application/{applicationId}/accept', {
      params: { path: { partyId, applicationId } }
    }),

  // 파티 신청 거절
  rejectApplication: (partyId: number, applicationId: number) =>
    authApi.PATCH('/api/v1/party/{partyId}/application/{applicationId}/reject', {
      params: { path: { partyId, applicationId } }
    }),

  // 파티 신청 취소
  cancelApplication: (partyId: number, applicationId: number) =>
    authApi.DELETE('/api/v1/party/{partyId}/application/{applicationId}/cancel', {
      params: { path: { partyId, applicationId } }
    }),

  // 내가 만든 파티 조회
  getMyCreated: (params?: { status?: string; page?: number; size?: number }) =>
    authApi.GET('/api/v1/party/user/me/party/created', {
      params: { query: params }
    }),

  // 내가 신청한 파티 조회
  getMyApplications: (params?: { status?: string; page?: number; size?: number }) =>
    authApi.GET('/api/v1/party/user/me/party/application', {
      params: { query: params }
    }),
};
