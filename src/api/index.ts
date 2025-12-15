// API 클라이언트 및 서비스
export {
  api,
  authApi,
  setAccessToken,
  getAccessToken,
  artistApi,
  authApiService,
  userApi,
  scheduleApi,
  performanceApi,
  partyApi,
} from './client';

// 생성된 타입들
export type { paths, components, operations } from './types';

// 스키마 타입 별칭 (편의를 위해)
import type { components } from './types';

export type ApiSchemas = components['schemas'];

// 개별 스키마 타입 re-export
export type UserSignupRequest = components['schemas']['UserSignupRequest'];
export type UserSignupResponse = components['schemas']['UserSignupResponse'];
export type UserLoginRequest = components['schemas']['UserLoginRequest'];
export type UserLoginResponse = components['schemas']['UserLoginResponse'];
export type UserProfileResponse = components['schemas']['UserProfileResponse'];
export type UpdateProfileRequest = components['schemas']['UpdateProfileRequest'];
export type UploadProfileImgResponse = components['schemas']['UploadProfileImgResponse'];

export type ArtistListResponse = components['schemas']['ArtistListResponse'];

export type FollowingSchedulesListResponse = components['schemas']['FollowingSchedulesListResponse'];
export type EventsListResponse = components['schemas']['EventsListResponse'];

export type CreatePartyRequest = components['schemas']['CreatePartyRequest'];
export type CreatePartyResponse = components['schemas']['CreatePartyResponse'];
export type UpdatePartyRequest = components['schemas']['UpdatePartyRequest'];
export type UpdatePartyResponse = components['schemas']['UpdatePartyResponse'];
export type GetPartiesResponse = components['schemas']['GetPartiesResponse'];
export type GetPartyMembersResponse = components['schemas']['GetPartyMembersResponse'];
export type GetApplicantsResponse = components['schemas']['GetApplicantsResponse'];
export type ApplyToPartyResponse = components['schemas']['ApplyToPartyResponse'];
export type AcceptApplicationResponse = components['schemas']['AcceptApplicationResponse'];
export type RejectApplicationResponse = components['schemas']['RejectApplicationResponse'];
export type GetMyCreatedPartiesResponse = components['schemas']['GetMyCreatedPartiesResponse'];
export type GetMyApplicationsResponse = components['schemas']['GetMyApplicationsResponse'];

export type PerformanceDetailResponse = components['schemas']['PerformanceDetailResponse'];

export type ErrorResponse = components['schemas']['ErrorResponse'];
