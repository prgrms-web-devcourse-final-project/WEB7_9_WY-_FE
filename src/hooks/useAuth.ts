'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authApiService, userApi, setAccessToken, getAccessToken } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import type { UserProfile } from '@/types';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  emailStatus: () => [...authKeys.all, 'emailStatus'] as const,
};

// Get current user profile
export function useUser() {
  const { setUser, logout } = useAuthStore();

  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const token = getAccessToken();
      if (!token) {
        return null;
      }

      const { data, error } = await userApi.getMe();
      if (error || !data) {
        // Token invalid, clear auth
        setAccessToken(null);
        logout();
        return null;
      }

      const user: UserProfile = {
        id: String((data as { userId?: number }).userId || data.email || ''),
        name: data.nickname || '',
        email: data.email || '',
        avatar: data.profileImage,
        nickname: data.nickname || '',
        profileImage: data.profileImage,
        gender: data.gender as 'MALE' | 'FEMALE' | undefined,
        age: data.age,
        level: data.level,
        emailVerified: (data as { emailVerified?: boolean }).emailVerified,
      };

      setUser(user);
      return user;
    },
    enabled: !!getAccessToken(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
}

// Login mutation
export function useLogin() {
  const queryClient = useQueryClient();
  const { setUser, completeLogin, setError } = useAuthStore();

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
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
        const user: UserProfile = {
          id: String(loginResponse.userId || ''),
          name: userData.nickname || '',
          email: userData.email || '',
          avatar: userData.profileImage,
          nickname: userData.nickname || '',
          profileImage: userData.profileImage,
          gender: userData.gender as 'MALE' | 'FEMALE' | undefined,
          age: userData.age,
          level: userData.level,
          emailVerified: (userData as { emailVerified?: boolean }).emailVerified,
        };
        return user;
      }

      throw new Error('사용자 정보를 가져오지 못했습니다.');
    },
    onSuccess: (user) => {
      setUser(user);
      completeLogin();
      queryClient.setQueryData(authKeys.user(), user);
    },
    onError: (error: Error) => {
      setAccessToken(null);
      setError(error.message);
    },
  });
}

// Signup mutation
export function useSignup() {
  return useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
      nickname: string;
      gender: 'MALE' | 'FEMALE' | 'ANY';
      birthDate: string;
    }) => {
      const signupBody = {
        email: data.email,
        password: data.password,
        nickname: data.nickname,
        gender: data.gender,
        birthDate: data.birthDate,
      };

      const { data: signupResponse, error: signupError } = await userApi.signup(signupBody);

      if (signupError) {
        const errorMessage = (signupError as { message?: string }).message || '회원가입에 실패했습니다.';
        throw new Error(errorMessage);
      }

      if (!signupResponse) {
        throw new Error('회원가입에 실패했습니다.');
      }

      return signupResponse;
    },
  });
}

// Logout mutation
export function useLogout() {
  const queryClient = useQueryClient();
  const { logout } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      await authApiService.logout();
    },
    onSettled: () => {
      setAccessToken(null);
      logout();
      queryClient.removeQueries({ queryKey: authKeys.all });
    },
  });
}

// Token refresh mutation
export function useRefreshToken() {
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await authApiService.refresh();

      if (error || !data?.accessToken) {
        throw new Error('토큰 갱신에 실패했습니다.');
      }

      setAccessToken(data.accessToken);
      return data.accessToken;
    },
  });
}

// Email verification mutations
export function useSendEmailVerification() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await authApiService.sendEmailVerification({ email });
      if (error) {
        const errorMessage = (error as { message?: string }).message || '이메일 인증 코드 발송에 실패했습니다.';
        throw new Error(errorMessage);
      }
    },
  });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: async (data: { email: string; code: string }) => {
      const { error } = await authApiService.verifyEmail(data);
      if (error) {
        const errorMessage = (error as { message?: string }).message || '이메일 인증에 실패했습니다.';
        throw new Error(errorMessage);
      }
    },
  });
}

// Password reset mutations
export function useSendPasswordReset() {
  return useMutation({
    mutationFn: async (email: string) => {
      const { error } = await authApiService.sendPasswordReset({ email });
      if (error) {
        const errorMessage = (error as { message?: string }).message || '비밀번호 재설정 이메일 발송에 실패했습니다.';
        throw new Error(errorMessage);
      }
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (data: { token: string; newPassword: string; newPasswordConfirm: string }) => {
      const { error } = await authApiService.resetPassword(data);
      if (error) {
        const errorMessage = (error as { message?: string }).message || '비밀번호 재설정에 실패했습니다.';
        throw new Error(errorMessage);
      }
    },
  });
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { nickname?: string }) => {
      const { error } = await userApi.updateMe(data);
      if (error) {
        const errorMessage = (error as { message?: string }).message || '프로필 수정에 실패했습니다.';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
}

// Upload profile image mutation
export function useUploadProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profile_image', file);

      const { error } = await userApi.uploadProfileImage(formData);
      if (error) {
        const errorMessage = (error as { message?: string }).message || '프로필 이미지 업로드에 실패했습니다.';
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.user() });
    },
  });
}
