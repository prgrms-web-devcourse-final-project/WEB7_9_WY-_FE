// Auth hooks
export {
  authKeys,
  useUser,
  useLogin,
  useSignup,
  useLogout,
  useRefreshToken,
  useSendEmailVerification,
  useVerifyEmail,
  useSendPasswordReset,
  useResetPassword,
  useUpdateProfile,
  useUploadProfileImage,
} from './useAuth';

// Artist hooks
export {
  artistKeys,
  useArtists,
  useFollowingArtists,
  useFollowArtist,
  useUnfollowArtist,
  useToggleFollow,
} from './useArtists';

// Schedule hooks
export {
  scheduleKeys,
  useFollowingSchedules,
  useSchedulesForParty,
} from './useSchedules';

// Party hooks
export {
  partyKeys,
  useParties,
  useMyCreatedParties,
  useMyAppliedParties,
  usePartyMembers,
  usePartyApplicants,
  useCreateParty,
  useUpdateParty,
  useDeleteParty,
  useApplyToParty,
  useAcceptApplicant,
  useRejectApplicant,
  useCancelApplication,
} from './useParties';

// Chat hooks
export {
  chatKeys,
  useChatRooms,
  useChatRoomInfo,
  useChatMessages,
  useChatParticipants,
  useInvalidateChatQueries,
} from './useChat';

export { useChatWebSocket } from './useChatWebSocket';

// Notification hooks
export { useNotificationSSE } from './useNotificationSSE';
