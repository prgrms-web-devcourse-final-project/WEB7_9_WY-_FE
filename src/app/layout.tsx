import type { Metadata, Viewport } from 'next';
import Providers from '@/providers/Providers';

export const metadata: Metadata = {
  title: 'Fandom App',
  description: 'K-Pop 팬들을 위한 일정 관리 및 팬 커뮤니티 앱',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

// Script to prevent flash of wrong theme - synced with MUI storage key
const themeInitScript = `
  (function() {
    try {
      const stored = localStorage.getItem('mui-mode');
      let theme = 'light';
      if (stored === 'dark') {
        theme = 'dark';
      } else if (stored === 'light') {
        theme = 'light';
      } else if (stored === 'system' || !stored) {
        theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.classList.add(theme);
    } catch (e) {
      document.documentElement.classList.add('light');
    }
  })();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
