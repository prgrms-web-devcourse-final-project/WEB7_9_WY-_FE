# API Reference

> Kalender Backend API 상세 스펙
> Base URL: `http://localhost:8080/api/v1`

---

## 인증 헤더

대부분의 API는 JWT 인증이 필요합니다:
```
Authorization: Bearer {accessToken}
```

---

## 1. Auth API (`/api/v1/auth`)

### POST `/login`
사용자 로그인

**Request**
```json
{
  "email": "user1@test.com",
  "password": "Test1234!"
}
```

**Response Headers**
```
Authorization: Bearer {accessToken}
Set-Cookie: refreshToken={token}; HttpOnly; Secure
```

**Response Body**: 없음 또는 성공 메시지

**Status Codes**
- 200: 성공
- 401: 비밀번호 불일치
- 404: 이메일 없음

---

### POST `/logout`
로그아웃 (refreshToken 무효화)

**Headers**: `Authorization: Bearer {accessToken}`

**Response**: 200 OK

---

### POST `/refresh`
액세스 토큰 갱신

**Headers**: Cookie에 refreshToken 포함

**Response Headers**
```
Authorization: Bearer {newAccessToken}
Set-Cookie: refreshToken={newRefreshToken}; HttpOnly; Secure
```

**Status Codes**
- 200: 성공
- 401: 유효하지 않은 refreshToken

---

### POST `/email/send`
이메일 인증 코드 발송

**Request**
```json
{
  "email": "user1@test.com"
}
```

**Response**: 200 OK

---

### POST `/email/verify`
이메일 인증 코드 확인

**Request**
```json
{
  "email": "user1@test.com",
  "code": "123456"
}
```

**Status Codes**
- 200: 인증 성공
- 400: 코드 불일치/만료

---

### GET `/email`
이메일 인증 상태 확인

**Headers**: `Authorization: Bearer {accessToken}`

**Response**
```json
{
  "emailVerified": true
}
```

---

### POST `/password/send`
비밀번호 재설정 이메일 발송

**Request**
```json
{
  "email": "user1@test.com"
}
```

---

### POST `/password/reset`
비밀번호 재설정

**Request**
```json
{
  "token": "{reset_token}",
  "newPassword": "NewTest1234!"
}
```

---

## 2. User API (`/api/v1/user`)

### POST `/`
회원가입

**Request**
```json
{
  "email": "newuser@test.com",
  "password": "Test1234!",
  "nickname": "신규유저"
}
```

**Response**: 201 Created

**Status Codes**
- 201: 성공
- 409: 이메일 중복

---

### GET `/me`
내 정보 조회

**Headers**: `Authorization: Bearer {accessToken}`

**Response**
```json
{
  "id": 2,
  "email": "user1@test.com",
  "nickname": "테스트유저1",
  "profileImage": null,
  "gender": "FEMALE",
  "level": 1,
  "birthDate": "1995-05-15",
  "emailVerified": true
}
```

---

### PATCH `/me`
프로필 수정

**Headers**: `Authorization: Bearer {accessToken}`

**Request** (partial update)
```json
{
  "nickname": "새닉네임",
  "gender": "MALE",
  "birthDate": "1995-01-01"
}
```

---

### POST `/me/profile-image`
프로필 이미지 업로드

**Headers**:
- `Authorization: Bearer {accessToken}`
- `Content-Type: multipart/form-data`

**Request**: Form data with `file` field

**Response**
```json
{
  "imageUrl": "https://..."
}
```

---

## 3. Artist API (`/api/v1/artist`)

### GET `/`
전체 아티스트 목록 (Public)

**Response**
```json
[
  {
    "id": 1,
    "name": "BTS",
    "imageUrl": "https://..."
  },
  ...
]
```

---

### GET `/following`
팔로잉 아티스트 목록

**Headers**: `Authorization: Bearer {accessToken}`

**Response**
```json
[
  {
    "id": 1,
    "name": "BTS",
    "imageUrl": "https://..."
  }
]
```

---

### POST `/{artistId}/follow`
아티스트 팔로우

**Headers**: `Authorization: Bearer {accessToken}`

**Example**: `POST /api/v1/artist/1/follow`

**Response**: 200 OK

---

### DELETE `/{artistId}/unfollow`
아티스트 언팔로우

**Headers**: `Authorization: Bearer {accessToken}`

**Example**: `DELETE /api/v1/artist/1/unfollow`

**Response**: 200 OK

---

## 4. Schedule API (`/api/v1/schedule`)

### GET `/following`
팔로잉 아티스트 스케줄 조회

**Headers**: `Authorization: Bearer {accessToken}`

**Query Parameters**
- `year` (required): 년도 (예: 2025)
- `month` (required): 월 (1-12)
- `artistId` (optional): 특정 아티스트 필터

**Example**: `GET /api/v1/schedule/following?year=2025&month=1&artistId=1`

**Response**
```json
{
  "monthlySchedules": [
    {
      "id": 1,
      "artistId": 1,
      "title": "BTS 월드투어 서울 콘서트",
      "scheduleCategory": "CONCERT",
      "scheduleTime": "2025-01-25T19:00:00",
      "location": "잠실종합운동장",
      "link": "https://..."
    }
  ],
  "upcomingEvents": [
    ...
  ]
}
```

---

### GET `/partyList`
파티 생성용 스케줄 목록

**Headers**: `Authorization: Bearer {accessToken}`

**Response**
```json
[
  {
    "id": 1,
    "artistId": 1,
    "artistName": "BTS",
    "title": "BTS 월드투어 서울 콘서트",
    "scheduleTime": "2025-01-25T19:00:00",
    "location": "잠실종합운동장"
  }
]
```

---

## 5. Party API (`/api/v1/party`)

### POST `/`
파티 생성

**Headers**: `Authorization: Bearer {accessToken}`

**Request**
```json
{
  "scheduleId": 1,
  "partyType": "LEAVE",
  "partyName": "BTS 콘서트 같이 가요!",
  "description": "함께 가실 분 구합니다",
  "departureLocation": "강남역",
  "arrivalLocation": "잠실종합운동장",
  "transportType": "TAXI",
  "maxMembers": 4,
  "preferredGender": "ANY",
  "preferredAge": "TWENTY"
}
```

**Response**: 201 Created

---

### PUT `/{partyId}`
파티 수정 (리더만)

**Headers**: `Authorization: Bearer {accessToken}`

**Request**: 생성과 동일 (scheduleId 제외)

**Status Codes**
- 200: 성공
- 403: 권한 없음 (리더가 아님)

---

### DELETE `/{partyId}`
파티 삭제 (리더만)

**Headers**: `Authorization: Bearer {accessToken}`

**Status Codes**
- 200: 성공
- 403: 권한 없음

---

### GET `/`
파티 목록 조회

**Headers**: `Authorization: Bearer {accessToken}`

**Query Parameters**
- `page`: 페이지 번호 (default: 0)
- `size`: 페이지 크기 (default: 20)

**Response**
```json
{
  "content": [
    {
      "id": 1,
      "scheduleId": 1,
      "leaderId": 4,
      "partyType": "LEAVE",
      "partyName": "BTS 콘서트 같이 가요!",
      "transportType": "TAXI",
      "maxMembers": 4,
      "currentMembers": 1,
      "status": "RECRUITING"
    }
  ],
  "pageable": {...},
  "totalPages": 1,
  "totalElements": 10
}
```

---

### GET `/schedule/{scheduleId}`
스케줄별 파티 조회

**Headers**: `Authorization: Bearer {accessToken}`

**Query Parameters**
- `partyType`: LEAVE | ARRIVE
- `transportType`: TAXI | CARPOOL | SUBWAY | BUS | WALK
- `page`, `size`

**Example**: `GET /api/v1/party/schedule/1?partyType=LEAVE&transportType=TAXI`

---

### POST `/{partyId}/application/apply`
파티 신청

**Headers**: `Authorization: Bearer {accessToken}`

**Response**: 201 Created

**Status Codes**
- 201: 신청 성공
- 400: 이미 신청함 / 정원 초과
- 409: 이미 멤버임

---

### DELETE `/{partyId}/application/{applicationId}/cancel`
신청 취소

**Headers**: `Authorization: Bearer {accessToken}`

---

### PATCH `/{partyId}/application/{applicationId}/accept`
신청 수락 (리더만)

**Headers**: `Authorization: Bearer {accessToken}`

**Side Effects**
- application status → APPROVED
- party_members 레코드 생성
- party.currentMembers 증가
- currentMembers == maxMembers 시 status → CLOSED

---

### PATCH `/{partyId}/application/{applicationId}/reject`
신청 거절 (리더만)

**Headers**: `Authorization: Bearer {accessToken}`

---

### GET `/{partyId}/application/applicants`
신청자 목록 (리더만)

**Headers**: `Authorization: Bearer {accessToken}`

**Response**
```json
[
  {
    "id": 1,
    "userId": 2,
    "nickname": "테스트유저1",
    "profileImage": null,
    "applicationStatus": "PENDING",
    "createdAt": "2025-01-15T10:00:00"
  }
]
```

---

### GET `/{partyId}/members`
파티 멤버 목록 (Public)

**Response**
```json
[
  {
    "userId": 4,
    "nickname": "파티장",
    "profileImage": null,
    "memberRole": "LEADER"
  },
  {
    "userId": 2,
    "nickname": "테스트유저1",
    "profileImage": null,
    "memberRole": "MEMBER"
  }
]
```

---

### GET `/user/me/party/created`
내가 만든 파티

**Headers**: `Authorization: Bearer {accessToken}`

**Query Parameters**: `page`, `size`

---

### GET `/user/me/party/application`
내가 신청한 파티

**Headers**: `Authorization: Bearer {accessToken}`

**Query Parameters**: `page`, `size`

---

## 6. Performance API (`/api/v1/performance`)

### GET `/{performanceId}`
공연 상세 조회

**Response**
```json
{
  "id": 1,
  "artistId": 1,
  "performanceHallId": 1,
  "title": "BTS 월드투어",
  "description": "...",
  "schedules": [
    {
      "id": 1,
      "scheduleDate": "2025-01-25T19:00:00",
      "scheduleStatus": "AVAILABLE"
    }
  ],
  "priceGrades": [
    {
      "id": 1,
      "gradeName": "VIP",
      "price": 180000
    }
  ]
}
```

---

## Error Response Format

모든 에러는 다음 형식을 따릅니다:
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "유효하지 않은 요청입니다",
  "timestamp": "2025-01-15T10:00:00",
  "path": "/api/v1/party"
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - 성공 |
| 201 | Created - 생성 성공 |
| 400 | Bad Request - 잘못된 요청 |
| 401 | Unauthorized - 인증 필요 |
| 403 | Forbidden - 권한 없음 |
| 404 | Not Found - 리소스 없음 |
| 409 | Conflict - 충돌 (중복 등) |
| 500 | Internal Server Error - 서버 오류 |

---

## Swagger UI

백엔드 서버 실행 시 Swagger 문서 확인:
```
http://localhost:8080/swagger-ui.html
```
