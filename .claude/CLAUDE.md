# Fandom App - 프로젝트 가이드

## 기술 스택
- Next.js 15 (App Router)
- MUI 6 + Emotion
- TypeScript (strict mode)
- Zustand (상태 관리)
- PNPM (패키지 매니저)

## 폴더 구조 규칙
- `src/app/` - 라우트 (page.tsx, layout.tsx만)
- `src/components/` - React 컴포넌트 (도메인별 폴더)
  - `src/components/calendar/` - 캘린더 관련 컴포넌트
  - `src/components/layout/DesktopSidebar.tsx` - 데스크탑 사이드바
- `src/stores/` - Zustand 스토어
- `src/hooks/` - 커스텀 훅
- `src/types/` - TypeScript 타입 정의
- `src/lib/` - 유틸리티, 상수, 테마

## 컴포넌트 작성 규칙
1. 모든 컴포넌트는 TypeScript로 작성
2. Props는 interface로 정의 (ComponentNameProps)
3. 'use client' 지시어는 필요한 경우에만 사용
4. MUI 컴포넌트 우선 사용, 커스텀 필요시 sx prop 활용

## 스타일링 규칙
1. MUI sx prop 우선 사용
2. 복잡한 스타일은 styled() API 사용
3. 테마 토큰 사용 (theme.palette, theme.spacing 등)
4. 하드코딩 색상 금지 - 테마에 정의된 색상만 사용
5. **MUI Card 컴포넌트 사용 지양** - Box + sx prop으로 직접 스타일링

## 상태 관리 규칙
1. 전역 상태: Zustand 스토어
2. 서버 상태: React Query (추후 적용)
3. 로컬 UI 상태: useState
4. 폼 상태: React Hook Form (추후 적용)

## 네이밍 컨벤션
- 컴포넌트: PascalCase (ArtistCard.tsx)
- 훅: camelCase + use 접두사 (useAuth.ts)
- 스토어: camelCase + Store 접미사 (authStore.ts)
- 타입: PascalCase (User, Artist)
- 상수: UPPER_SNAKE_CASE

## 임포트 순서
1. React/Next.js
2. 외부 라이브러리 (MUI, Zustand 등)
3. 내부 컴포넌트
4. 훅, 스토어
5. 타입
6. 스타일, 상수

## 커밋 메시지 규칙
- feat: 새 기능
- fix: 버그 수정
- style: 스타일/UI 변경
- refactor: 리팩토링
- docs: 문서 변경

## SuperClaude Prompt Guide

**⚠️ 모든 프롬프트는 SuperClaude CLI 방식 사용**

### 핵심 명령어
```bash
/sc:implement   # 구현    /sc:test     # 테스트
/sc:analyze     # 분석    /sc:design   # 설계
/sc:build       # 빌드    /sc:improve  # 개선
```

### 필수 플래그
```bash
--scope [file|module|project]     --persona-[backend|frontend|qa|refactorer|architect]
--uc                              --focus [quality|performance|security]
--c7 | --seq | --magic | --play   --wave-mode [progressive|adaptive|systematic]
```

### 템플릿

**컴포넌트 추가**:
```bash
/sc:implement --scope file --persona-frontend --magic --uc \
  "src/components/[domain]/[ComponentName].tsx: React + MUI + TypeScript"
```

**Store 확장**:
```bash
/sc:implement --scope file --persona-backend --uc \
  "src/stores/[name]Store.ts: Zustand store with actions"
```

**페이지 구현**:
```bash
/sc:implement --scope module --persona-frontend --c7 --uc \
  "src/app/[route]/page.tsx: Next.js App Router + MUI"
```

**테스트**:
```bash
/sc:test --validate --persona-qa --play \
  "Integration tests for [feature]"
```

### 페르소나 선택
| 작업 | 페르소나 | 플래그 |
|-----|---------|--------|
| UI 컴포넌트 | frontend | `--persona-frontend --magic` |
| Store/비즈니스 로직 | backend | `--persona-backend --seq` |
| 리팩토링 | refactorer | `--persona-refactorer --seq` |
| 테스트 | qa | `--persona-qa --play` |
| 아키텍처 | architect | `--persona-architect --think-hard` |

## 테스트 규칙
1. **모든 코드 수정 후 Playwright MCP로 해당 구현부 테스트 필수**
   - UI 컴포넌트: 렌더링 및 상호작용 테스트
   - 라우팅: 네비게이션 플로우 테스트
   - 폼: 입력 검증 및 제출 테스트
   - 상태 관리: 상태 업데이트 및 persistence 테스트

2. 테스트 시나리오:
   - 모바일/데스크탑 반응형 확인
   - 게스트 모드 vs 로그인 사용자 플로우
   - 에러 상태 및 로딩 상태

## 주요 기능
- **게스트 모드**: 로그인 없이 아티스트 선택 및 캘린더 조회 가능
- **반응형 레이아웃**: 데스크탑(md+)에서 사이드바 네비게이션
- **캘린더 70/30 분할**: 데스크탑에서 다가오는 일정 사이드바
- **파티 관리**: 탭 기반 (내가 만든/신청한/참여중/종료된 파티)

---

## E2E 테스트 문서

테스트 관련 문서는 `.claude/testing/` 폴더에서 확인하세요:

| 파일 | 설명 |
|------|------|
| [E2E_TEST_SCENARIOS.md](testing/E2E_TEST_SCENARIOS.md) | 52개 테스트 시나리오 상세 |
| [TEST_DATA.md](testing/TEST_DATA.md) | 테스트 데이터 정의 |
| [AUTH_CREDENTIALS.md](testing/AUTH_CREDENTIALS.md) | 테스트 계정 정보 |
| [API_REFERENCE.md](testing/API_REFERENCE.md) | 백엔드 API 스펙 |
| [setup.sql](testing/setup.sql) | DB 초기화 SQL |

### 테스트 계정 (빠른 참조)
| Email | Password | 용도 |
|-------|----------|------|
| user1@test.com | Test1234! | 일반 사용자 |
| leader@test.com | Test1234! | 파티 리더 |
| member@test.com | Test1234! | 파티 멤버 |

### 테스트 데이터 삽입
```bash
# Docker 사용 시
docker exec -i kalender-postgres psql -U postgres -d kalender < .claude/testing/setup.sql

# psql 직접 사용 시
psql -h localhost -p 5432 -U postgres -d kalender -f .claude/testing/setup.sql
```

### Backend API Base URL
- **Local**: `http://localhost:8080/api/v1`
- **Swagger**: `http://localhost:8080/swagger-ui.html`
