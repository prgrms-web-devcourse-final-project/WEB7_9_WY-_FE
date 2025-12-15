# E2E 테스트 시나리오

> Fandom App (Kalender) 전체 API 및 UI 테스트 시나리오
> 총 52개 테스트 케이스

## 테스트 환경
- **Frontend**: `http://localhost:3000`
- **Backend API**: `http://localhost:8080/api/v1`
- **Database**: PostgreSQL 16 (kalender)

## 테스트 계정 (setup.sql 참조)
| ID | Email | Password | Role |
|----|-------|----------|------|
| 1 | admin@test.com | Test1234! | Admin |
| 2 | user1@test.com | Test1234! | User |
| 3 | user2@test.com | Test1234! | User |
| 4 | leader@test.com | Test1234! | Party Leader |
| 5 | member@test.com | Test1234! | Party Member |

---

## 1. 인증 API 테스트 (10 케이스)

### TC-AUTH-001: 정상 회원가입
**API**: `POST /api/v1/user`
```json
{
  "email": "newuser@test.com",
  "password": "Test1234!",
  "nickname": "신규유저"
}
```
**Expected**: 201 Created
**UI Flow**: /signup 페이지 → 폼 입력 → 가입 버튼 클릭

---

### TC-AUTH-002: 중복 이메일 회원가입 (실패)
**API**: `POST /api/v1/user`
```json
{
  "email": "user1@test.com",
  "password": "Test1234!",
  "nickname": "중복테스트"
}
```
**Expected**: 409 Conflict (이미 존재하는 이메일)
**UI Flow**: 에러 메시지 표시

---

### TC-AUTH-003: 정상 로그인
**API**: `POST /api/v1/auth/login`
```json
{
  "email": "user1@test.com",
  "password": "Test1234!"
}
```
**Expected**: 200 OK
- Response Header: `Authorization: Bearer {accessToken}`
- Response Cookie: `refreshToken` (httpOnly)
**UI Flow**: /login 페이지 → 이메일/비밀번호 입력 → 로그인 → /calendar 리다이렉트

---

### TC-AUTH-004: 잘못된 비밀번호 (실패)
**API**: `POST /api/v1/auth/login`
```json
{
  "email": "user1@test.com",
  "password": "WrongPassword!"
}
```
**Expected**: 401 Unauthorized
**UI Flow**: 에러 메시지 "비밀번호가 일치하지 않습니다" 표시

---

### TC-AUTH-005: 존재하지 않는 이메일 (실패)
**API**: `POST /api/v1/auth/login`
```json
{
  "email": "notexist@test.com",
  "password": "Test1234!"
}
```
**Expected**: 404 Not Found
**UI Flow**: 에러 메시지 "존재하지 않는 계정입니다" 표시

---

### TC-AUTH-006: 토큰 갱신
**API**: `POST /api/v1/auth/refresh`
**Headers**: Cookie에 refreshToken 포함
**Expected**: 200 OK, 새로운 accessToken 발급
**UI Flow**: 자동 (401 발생 시 자동 갱신)

---

### TC-AUTH-007: 로그아웃
**API**: `POST /api/v1/auth/logout`
**Headers**: `Authorization: Bearer {accessToken}`
**Expected**: 200 OK, refreshToken 무효화
**UI Flow**: 마이페이지 → 로그아웃 버튼 → /login 리다이렉트

---

### TC-AUTH-008: 이메일 인증 코드 발송
**API**: `POST /api/v1/auth/email/send`
```json
{
  "email": "user1@test.com"
}
```
**Expected**: 200 OK
**Note**: 실제 이메일 발송 (테스트 환경에서는 콘솔 로그 확인)

---

### TC-AUTH-009: 이메일 인증 완료
**API**: `POST /api/v1/auth/email/verify`
```json
{
  "email": "user1@test.com",
  "code": "123456"
}
```
**Expected**: 200 OK (올바른 코드), 400 Bad Request (잘못된 코드)

---

### TC-AUTH-010: 비밀번호 재설정
**API Flow**:
1. `POST /api/v1/auth/password/send` - 재설정 이메일 발송
2. `POST /api/v1/auth/password/reset` - 새 비밀번호 설정
```json
{
  "token": "{reset_token}",
  "newPassword": "NewTest1234!"
}
```
**Expected**: 200 OK

---

## 2. 사용자 API 테스트 (5 케이스)

### TC-USER-001: 내 정보 조회
**API**: `GET /api/v1/user/me`
**Headers**: `Authorization: Bearer {accessToken}`
**Expected**: 200 OK
```json
{
  "id": 2,
  "email": "user1@test.com",
  "nickname": "테스트유저1",
  "profileImage": null,
  "gender": "FEMALE",
  "emailVerified": true
}
```
**UI Flow**: 마이페이지 접속 시 자동 호출

---

### TC-USER-002: 닉네임 변경
**API**: `PATCH /api/v1/user/me`
**Headers**: `Authorization: Bearer {accessToken}`
```json
{
  "nickname": "변경된닉네임"
}
```
**Expected**: 200 OK
**UI Flow**: 마이페이지 → 설정 → 프로필 수정

---

### TC-USER-003: 프로필 이미지 업로드
**API**: `POST /api/v1/user/me/profile-image`
**Headers**: `Authorization: Bearer {accessToken}`
**Content-Type**: `multipart/form-data`
**Body**: file (이미지 파일)
**Expected**: 200 OK, 이미지 URL 반환

---

### TC-USER-004: 성별/생년 업데이트
**API**: `PATCH /api/v1/user/me`
**Headers**: `Authorization: Bearer {accessToken}`
```json
{
  "gender": "MALE",
  "birthDate": "1995-05-15"
}
```
**Expected**: 200 OK

---

### TC-USER-005: 미인증 접근 (401 실패)
**API**: `GET /api/v1/user/me`
**Headers**: 없음 (토큰 없이)
**Expected**: 401 Unauthorized
**UI Flow**: 로그인 페이지로 리다이렉트

---

## 3. 아티스트 API 테스트 (8 케이스)

### TC-ARTIST-001: 전체 아티스트 목록 조회
**API**: `GET /api/v1/artist`
**Headers**: 없음 (public)
**Expected**: 200 OK
```json
[
  {"id": 1, "name": "BTS", "imageUrl": "..."},
  {"id": 2, "name": "BLACKPINK", "imageUrl": "..."},
  ...
]
```
**UI Flow**: /artists 페이지, /onboarding 페이지

---

### TC-ARTIST-002: 아티스트 팔로우
**API**: `POST /api/v1/artist/{artistId}/follow`
**Headers**: `Authorization: Bearer {accessToken}`
**Example**: `POST /api/v1/artist/1/follow`
**Expected**: 200 OK
**UI Flow**: 아티스트 카드 하트 버튼 클릭

---

### TC-ARTIST-003: 아티스트 언팔로우
**API**: `DELETE /api/v1/artist/{artistId}/unfollow`
**Headers**: `Authorization: Bearer {accessToken}`
**Example**: `DELETE /api/v1/artist/1/unfollow`
**Expected**: 200 OK
**UI Flow**: 팔로우된 아티스트 하트 버튼 재클릭

---

### TC-ARTIST-004: 팔로잉 목록 조회
**API**: `GET /api/v1/artist/following`
**Headers**: `Authorization: Bearer {accessToken}`
**Expected**: 200 OK
```json
[
  {"id": 1, "name": "BTS", "imageUrl": "..."},
  {"id": 2, "name": "BLACKPINK", "imageUrl": "..."}
]
```
**UI Flow**: 캘린더 필터, 마이페이지

---

### TC-ARTIST-005: 중복 팔로우 (실패)
**API**: `POST /api/v1/artist/1/follow` (이미 팔로우 상태에서)
**Headers**: `Authorization: Bearer {accessToken}`
**Expected**: 409 Conflict 또는 200 OK (idempotent)

---

### TC-ARTIST-006: 존재하지 않는 아티스트 (실패)
**API**: `POST /api/v1/artist/9999/follow`
**Headers**: `Authorization: Bearer {accessToken}`
**Expected**: 404 Not Found

---

### TC-ARTIST-007: 비로그인 팔로우 시도 (실패)
**API**: `POST /api/v1/artist/1/follow`
**Headers**: 없음
**Expected**: 401 Unauthorized
**UI Flow**: 로그인 모달 또는 /login 리다이렉트

---

### TC-ARTIST-008: 팔로우 후 캘린더 필터 연동
**Scenario**:
1. 아티스트 A 팔로우
2. 캘린더 조회 시 아티스트 A 일정 표시
**UI Flow**: 온보딩 완료 → 캘린더 자동 필터링

---

## 4. 스케줄 API 테스트 (6 케이스)

### TC-SCHED-001: 월별 스케줄 조회
**API**: `GET /api/v1/schedule/following?year=2025&month=1`
**Headers**: `Authorization: Bearer {accessToken}`
**Expected**: 200 OK
```json
{
  "monthlySchedules": [...],
  "upcomingEvents": [...]
}
```
**UI Flow**: /calendar 페이지 메인 뷰

---

### TC-SCHED-002: 특정 아티스트 필터
**API**: `GET /api/v1/schedule/following?year=2025&month=1&artistId=1`
**Headers**: `Authorization: Bearer {accessToken}`
**Expected**: 200 OK (BTS 일정만)
**UI Flow**: 캘린더 상단 아티스트 필터 선택

---

### TC-SCHED-003: 다가오는 일정 목록
**API**: `GET /api/v1/schedule/following?year=2025&month=1`
**Response Field**: `upcomingEvents` 배열
**Expected**: 현재 날짜 이후 일정만 포함
**UI Flow**: 데스크탑 캘린더 우측 사이드바

---

### TC-SCHED-004: 파티 생성용 스케줄 목록
**API**: `GET /api/v1/schedule/partyList`
**Headers**: `Authorization: Bearer {accessToken}`
**Expected**: 200 OK, 파티 생성 가능한 스케줄 목록
**UI Flow**: /party/create 페이지 스케줄 드롭다운

---

### TC-SCHED-005: 빈 월 조회 (빈 배열)
**API**: `GET /api/v1/schedule/following?year=2024&month=1`
**Headers**: `Authorization: Bearer {accessToken}`
**Expected**: 200 OK, `monthlySchedules: []`

---

### TC-SCHED-006: 유효하지 않은 날짜 (실패)
**API**: `GET /api/v1/schedule/following?year=2025&month=13`
**Expected**: 400 Bad Request

---

## 5. 파티 API 테스트 (15 케이스)

### TC-PARTY-001: 파티 생성 (출발팟)
**API**: `POST /api/v1/party`
**Headers**: `Authorization: Bearer {accessToken}` (leader@test.com)
```json
{
  "scheduleId": 1,
  "partyType": "LEAVE",
  "partyName": "테스트 출발팟",
  "description": "함께 가요!",
  "departureLocation": "강남역",
  "arrivalLocation": "잠실종합운동장",
  "transportType": "TAXI",
  "maxMembers": 4,
  "preferredGender": "ANY",
  "preferredAge": "TWENTY"
}
```
**Expected**: 201 Created
**UI Flow**: /party/create 페이지 폼 제출

---

### TC-PARTY-002: 파티 생성 (복귀팟)
**API**: `POST /api/v1/party`
```json
{
  "scheduleId": 1,
  "partyType": "ARRIVE",
  "partyName": "테스트 복귀팟",
  ...
}
```
**Expected**: 201 Created

---

### TC-PARTY-003: 파티 목록 조회
**API**: `GET /api/v1/party?page=0&size=20`
**Headers**: `Authorization: Bearer {accessToken}`
**Expected**: 200 OK, 페이지네이션된 파티 목록
**UI Flow**: /party 페이지

---

### TC-PARTY-004: 스케줄별 파티 조회 + 필터
**API**: `GET /api/v1/party/schedule/1?partyType=LEAVE&transportType=TAXI`
**Headers**: `Authorization: Bearer {accessToken}`
**Expected**: 200 OK, 필터링된 파티 목록
**UI Flow**: 이벤트 상세 → 파티 탭

---

### TC-PARTY-005: 파티 수정 (리더만)
**API**: `PUT /api/v1/party/1`
**Headers**: `Authorization: Bearer {accessToken}` (리더 계정)
```json
{
  "partyName": "수정된 파티명",
  "description": "수정된 설명",
  ...
}
```
**Expected**: 200 OK
**UI Flow**: 파티 상세 → 수정 버튼 (리더에게만 표시)

---

### TC-PARTY-006: 파티 삭제 (리더만)
**API**: `DELETE /api/v1/party/1`
**Headers**: `Authorization: Bearer {accessToken}` (리더 계정)
**Expected**: 200 OK
**UI Flow**: 파티 상세 → 삭제 버튼 (리더에게만 표시)

---

### TC-PARTY-007: 파티 신청
**API**: `POST /api/v1/party/1/application/apply`
**Headers**: `Authorization: Bearer {accessToken}` (member@test.com)
**Expected**: 201 Created
**UI Flow**: 파티 상세 → 신청하기 버튼

---

### TC-PARTY-008: 신청 취소
**API**: `DELETE /api/v1/party/1/application/1/cancel`
**Headers**: `Authorization: Bearer {accessToken}` (신청자 본인)
**Expected**: 200 OK
**UI Flow**: 내 파티 → 신청한 파티 → 취소 버튼

---

### TC-PARTY-009: 신청 수락 (리더)
**API**: `PATCH /api/v1/party/1/application/1/accept`
**Headers**: `Authorization: Bearer {accessToken}` (leader@test.com)
**Expected**: 200 OK
**Side Effect**:
- `party_applications` 상태 → APPROVED
- `party_members` 새 레코드 생성
- `parties.current_members` 증가
**UI Flow**: 파티 관리 → 신청자 → 수락 버튼

---

### TC-PARTY-010: 신청 거절 (리더)
**API**: `PATCH /api/v1/party/1/application/1/reject`
**Headers**: `Authorization: Bearer {accessToken}` (leader@test.com)
**Expected**: 200 OK
**UI Flow**: 파티 관리 → 신청자 → 거절 버튼

---

### TC-PARTY-011: 신청자 목록 조회
**API**: `GET /api/v1/party/1/application/applicants`
**Headers**: `Authorization: Bearer {accessToken}` (leader@test.com)
**Expected**: 200 OK
```json
[
  {
    "id": 1,
    "userId": 2,
    "nickname": "테스트유저1",
    "applicationStatus": "PENDING"
  }
]
```
**UI Flow**: 파티 상세 → 신청자 관리 탭 (리더만)

---

### TC-PARTY-012: 멤버 목록 조회
**API**: `GET /api/v1/party/1/members`
**Headers**: 없음 (public)
**Expected**: 200 OK
```json
[
  {
    "userId": 4,
    "nickname": "파티장",
    "memberRole": "LEADER"
  }
]
```
**UI Flow**: 파티 상세 → 멤버 목록

---

### TC-PARTY-013: 내가 만든 파티 목록
**API**: `GET /api/v1/party/user/me/party/created?page=0&size=10`
**Headers**: `Authorization: Bearer {accessToken}`
**Expected**: 200 OK
**UI Flow**: /party/my-parties → "내가 만든" 탭

---

### TC-PARTY-014: 내가 신청한 파티 목록
**API**: `GET /api/v1/party/user/me/party/application?page=0&size=10`
**Headers**: `Authorization: Bearer {accessToken}`
**Expected**: 200 OK
**UI Flow**: /party/my-parties → "신청한" 탭

---

### TC-PARTY-015: 권한 없는 수정/삭제 (실패)
**API**: `PUT /api/v1/party/1` 또는 `DELETE /api/v1/party/1`
**Headers**: `Authorization: Bearer {accessToken}` (리더가 아닌 계정)
**Expected**: 403 Forbidden
**UI Flow**: 수정/삭제 버튼 미표시 또는 에러 알림

---

## 6. 공연 API 테스트 (3 케이스)

### TC-PERF-001: 공연 상세 조회
**API**: `GET /api/v1/performance/1`
**Expected**: 200 OK
```json
{
  "id": 1,
  "title": "BTS 월드투어",
  "artistId": 1,
  "performanceHallId": 1,
  "description": "..."
}
```
**UI Flow**: /event/[eventId] 페이지

---

### TC-PERF-002: 존재하지 않는 공연 (실패)
**API**: `GET /api/v1/performance/9999`
**Expected**: 404 Not Found

---

### TC-PERF-003: 좌석 정보 포함 조회
**API**: `GET /api/v1/performance/1` (좌석 정보 포함된 경우)
**Expected**: 200 OK with seat sections
**UI Flow**: 예매 페이지 좌석 선택

---

## 7. 통합 시나리오 테스트 (5 케이스)

### TC-E2E-001: 완전한 회원 여정
**Steps**:
1. `/signup` - 회원가입 (newuser@test.com)
2. 이메일 인증 완료
3. `/login` - 로그인
4. `/onboarding` - 아티스트 3팀 선택 (BTS, BLACKPINK, NewJeans)
5. `/calendar` - 선택한 아티스트 일정 표시 확인
6. 일정 클릭 → 상세 페이지
7. `/party/create` - 파티 생성
8. `/party/my-parties` - 내가 만든 파티 확인
9. `/mypage` - 설정 → 프로필 수정
10. 로그아웃

**Expected**: 모든 단계 정상 완료

---

### TC-E2E-002: 게스트 → 회원 전환
**Steps**:
1. `/onboarding` - 게스트 모드로 아티스트 선택
2. `/calendar` - 목데이터로 캘린더 표시
3. `/party` - 파티 상세 → 신청하기 클릭
4. 로그인 필요 알림 → `/login` 리다이렉트
5. 회원가입 또는 로그인
6. 게스트 선택 아티스트 자동 병합 확인
7. `/calendar` - API 데이터로 캘린더 표시

**Expected**: 게스트 선택이 회원 데이터로 병합됨

---

### TC-E2E-003: 파티 라이프사이클
**Steps** (2명의 사용자):
1. **리더(leader@test.com)**: 파티 생성
2. **멤버(member@test.com)**: 파티 신청
3. **리더**: 신청자 목록에서 확인
4. **리더**: 신청 수락
5. **멤버**: 내 파티에서 "참여중" 확인
6. **리더**: 파티 상태 → CLOSED (정원 도달 시)
7. 이벤트 종료 후 → COMPLETED

**Expected**: 파티 상태 전환 정상 동작

---

### TC-E2E-004: 다중 사용자 파티 상호작용
**Scenario**: 파티 정원 4명, 3명 신청
1. 리더가 파티 생성 (max: 4)
2. user1 신청 → 수락 (current: 2)
3. user2 신청 → 수락 (current: 3)
4. member 신청 → 수락 (current: 4, status: CLOSED)
5. 새로운 유저 신청 시도 → 실패 (정원 초과)

**Expected**: 정원 관리 및 상태 전환 정상

---

### TC-E2E-005: 에러 복구 시나리오
**Scenarios**:
1. 토큰 만료 → 자동 갱신 → 요청 재시도
2. 네트워크 오류 → 재시도 버튼 표시
3. 서버 500 에러 → 에러 페이지 표시
4. 잘못된 입력 → 유효성 검사 메시지

**Expected**: 각 에러 상황에 적절한 UI 피드백

---

## 테스트 실행 방법

### 1. API 테스트 (curl 예시)
```bash
# 로그인
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"Test1234!"}' \
  -i

# 아티스트 목록
curl http://localhost:8080/api/v1/artist

# 인증 필요 API
curl http://localhost:8080/api/v1/user/me \
  -H "Authorization: Bearer {accessToken}"
```

### 2. Playwright 브라우저 테스트
Playwright MCP를 사용하여 UI 테스트 실행:
1. `browser_navigate` → 페이지 이동
2. `browser_snapshot` → 현재 상태 캡처
3. `browser_click` → 버튼/링크 클릭
4. `browser_type` → 폼 입력
5. `browser_take_screenshot` → 스크린샷 저장

---

## 테스트 우선순위

### P0 (Critical)
- TC-AUTH-001 ~ TC-AUTH-003 (회원가입, 로그인)
- TC-USER-001 (내 정보 조회)
- TC-ARTIST-001, TC-ARTIST-002 (아티스트 조회, 팔로우)
- TC-SCHED-001 (캘린더 조회)

### P1 (High)
- TC-PARTY-001 ~ TC-PARTY-004 (파티 CRUD)
- TC-PARTY-007, TC-PARTY-009, TC-PARTY-010 (파티 신청 플로우)
- TC-E2E-001 (완전한 회원 여정)

### P2 (Medium)
- TC-AUTH-004 ~ TC-AUTH-010 (에러 케이스, 비밀번호 재설정)
- TC-PARTY-005 ~ TC-PARTY-015 (파티 상세 기능)
- TC-E2E-002 ~ TC-E2E-004 (통합 시나리오)

### P3 (Low)
- TC-PERF-001 ~ TC-PERF-003 (공연 API)
- TC-E2E-005 (에러 복구)
