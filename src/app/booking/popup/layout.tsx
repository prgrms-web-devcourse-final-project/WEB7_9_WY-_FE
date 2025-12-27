import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '티켓 예매 - Kalendar',
  description: '공연 티켓을 예매하세요',
};

/**
 * 예매 팝업 전용 레이아웃
 * - 네비게이션 바, 사이드바 없이 심플하게 구성
 * - 부모 RootLayout에서 Providers를 통해 테마가 적용됨
 */
export default function BookingPopupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
