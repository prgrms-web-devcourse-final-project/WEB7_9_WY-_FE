import type {
  BackendNotificationType,
  BackendNotificationResponse,
  Notification,
  NotificationType,
} from '@/types';

// Backend -> Frontend NotificationType 매핑
const TYPE_MAP: Record<BackendNotificationType, NotificationType> = {
  EVENT_REMINDER: 'schedule',
  APPLY: 'party_request',
  ACCEPT: 'party_accepted',
  REJECT: 'party_rejected',
  KICK: 'party_kicked',
  SYSTEM_ALERT: 'info',
};

/**
 * BE NotificationType을 FE NotificationType으로 변환
 */
export function mapNotificationType(
  backendType: BackendNotificationType
): NotificationType {
  return TYPE_MAP[backendType] || 'info';
}

/**
 * BE NotificationResponse를 FE Notification으로 변환
 */
export function mapNotificationResponse(
  response: BackendNotificationResponse
): Notification {
  return {
    id: response.notificationId,
    type: mapNotificationType(response.notificationType),
    title: response.title,
    message: response.content,
    createdAt: response.createdAt,
    read: response.isRead,
    partyId: extractPartyId(response.content),
    eventId: extractEventId(response.content),
  };
}

/**
 * BE NotificationResponse 배열을 FE Notification 배열로 변환
 */
export function mapNotificationsPage(
  responses: BackendNotificationResponse[]
): Notification[] {
  return responses.map(mapNotificationResponse);
}

// Helper: content에서 partyId 추출
function extractPartyId(content: string): string | undefined {
  // 파티 관련 알림에서 파티 ID 추출 시도
  const match = content.match(/partyId[:\s]+(\d+)/i);
  return match ? match[1] : undefined;
}

// Helper: content에서 eventId 추출
function extractEventId(content: string): string | undefined {
  // 일정 관련 알림에서 이벤트 ID 추출 시도
  const match = content.match(/eventId[:\s]+(\d+)/i);
  return match ? match[1] : undefined;
}
