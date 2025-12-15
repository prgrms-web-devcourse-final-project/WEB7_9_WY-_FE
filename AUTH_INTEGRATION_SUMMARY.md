# 인증 시스템 API 연동 완료 요약

## 수정된 파일

### 1. src/stores/authStore.ts ✅
**변경 사항:**
- API 클라이언트 임포트 추가: `authApiService`, `userApi`, `setAccessToken`, `getAccessToken`
- `SignupDataExtended` 인터페이스 추가 (nickname, gender, birthDate 필드)
- `login()`: 실제 API 호출로 대체
  - `authApiService.login()` 사용
  - access token 저장
  - `userApi.getMe()`로 사용자 정보 조회
  - 에러 처리 개선
- `signup()`: 실제 API 호출로 대체
  - `userApi.signup()` 사용
  - API 스펙에 맞는 필드 전달 (email, password, nickname, gender, birthDate)
  - 회원가입 후 자동 로그인
- `logout()`: async 함수로 변경
  - `authApiService.logout()` 호출
  - access token 삭제
- `getMe()`: 새 함수 추가
  - `userApi.getMe()`로 사용자 정보 조회
  - 토큰 유효성 검증

### 2. src/app/login/page.tsx ✅
**변경 사항:**
- `handleSubmit()`: try-catch 에러 처리 추가
- 로그인 성공 시 `/calendar` 또는 `/onboarding`으로 리다이렉트
- 에러 발생 시 store의 error 상태 활용

### 3. src/app/signup/page.tsx ✅
**변경 사항:**
- `handleSubmit()`: try-catch 에러 처리 추가
- API 스펙에 맞는 필드 전달:
  ```typescript
  {
    name,
    email,
    password,
    nickname: name,
    gender: 'ANY',
    birthDate: '2000-01-01'
  }
  ```
- 회원가입 성공 시 `/onboarding`으로 리다이렉트

### 4. src/app/mypage/page.tsx ✅
**변경 사항:**
- `useEffect` 추가: 마운트 시 `getMe()` 호출
- `handleLogout()`: async 함수로 변경
- logout 후 `/login`으로 리다이렉트

### 5. src/app/mypage/settings/page.tsx ✅
**변경 사항:**
- 프로필 수정 UI 추가
- `handleProfileUpdate()`: 닉네임 수정
  - `userApi.updateMe()` 사용
  - 성공 시 `getMe()` 호출하여 정보 갱신
- `handleProfileImageUpload()`: 프로필 이미지 업로드
  - 파일 타입 및 크기 검증 (5MB 이하)
  - `userApi.uploadProfileImage()` 사용
  - 성공 시 `getMe()` 호출
- 프로필 편집 Dialog 추가
- Alert 컴포넌트로 에러/성공 메시지 표시

## API 연동 주요 사항

### 토큰 관리
- `setAccessToken()`: localStorage에 access token 저장
- `getAccessToken()`: localStorage에서 access token 조회
- refresh token은 httpOnly secure 쿠키로 자동 관리

### 에러 처리
- API 에러 시 store의 `error` 상태 업데이트
- UI에서 Alert 컴포넌트로 에러 표시
- 401 에러 시 토큰 초기화 (middleware에서 처리)

### 회원가입 필드
```typescript
{
  email: string;
  password: string;
  nickname: string;
  gender: 'MALE' | 'FEMALE' | 'ANY';
  birthDate: string; // 'YYYY-MM-DD'
}
```

### 사용자 정보 조회
```typescript
{
  id: number;
  email: string;
  nickname: string;
  profileImageUrl?: string;
  gender: string;
  birthDate: string;
}
```

## 테스트 체크리스트

### 로그인 페이지
- [ ] 이메일/비밀번호 입력 후 로그인
- [ ] 잘못된 인증정보 입력 시 에러 메시지 표시
- [ ] 로그인 성공 시 캘린더 페이지로 이동

### 회원가입 페이지
- [ ] 필수 약관 동의 체크
- [ ] 비밀번호 확인 일치 검증
- [ ] 회원가입 성공 시 온보딩 페이지로 이동
- [ ] API 에러 시 에러 메시지 표시

### 마이페이지
- [ ] 사용자 정보 표시 (이름, 이메일, 프로필 이미지)
- [ ] 로그아웃 버튼 클릭 시 로그인 페이지로 이동

### 설정 페이지
- [ ] 프로필 수정 다이얼로그에서 닉네임 변경
- [ ] 프로필 이미지 업로드 (파일 선택)
- [ ] 성공/에러 메시지 표시
- [ ] 수정 후 사용자 정보 갱신 확인

## 주의사항

1. **기존 UI/UX 유지**: API 연동만 추가하고 디자인은 변경하지 않음
2. **에러 메시지**: API 응답의 `message` 필드 사용
3. **로딩 상태**: `isLoading` 상태로 버튼 disabled 처리
4. **토큰 관리**: localStorage + httpOnly 쿠키 조합
5. **자동 로그인**: 회원가입 후 자동으로 로그인 처리

## 다음 단계

- [ ] Playwright MCP로 로그인/회원가입 플로우 테스트
- [ ] 프로필 수정 기능 테스트
- [ ] 토큰 만료 시 자동 갱신 로직 구현 (선택)
- [ ] 이메일 인증 플로우 구현 (선택)
