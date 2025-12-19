# Kalendar API 명세서

> **버전**: beta
> **Base URL**: `http://localhost:8080/api/v1`
> **문서 기준**: OpenAPI 3.1.0

---

## 목차

1. [인증](#인증)
2. [Auth API](#1-auth-api---인증인가)
3. [User API](#2-user-api---사용자-관리)
4. [Artist API](#3-artist-api---아티스트)
5. [Schedule API](#4-schedule-api---스케줄캘린더)
6. [Party API](#5-party-api---파티)
7. [Performance API](#6-performance-api---공연)
8. [Enum 정의](#enum-정의)
9. [에러 응답 형식](#에러-응답-형식)

---

## 인증

JWT Bearer 토큰 인증 방식을 사용합니다.

```
Authorization: Bearer {accessToken}
```

- **Access Token**: Authorization 헤더로 전달
- **Refresh Token**: HttpOnly Secure 쿠키로 전달

---

## 1. Auth API - 인증/인가

Base Path: `/api/v1/auth`

### POST `/login` - 로그인

이메일과 비밀번호로 로그인합니다.

**인증 필요**: ❌

**Request Body**

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| email | string | ✅ | 이메일 (이메일 형식) |
| password | string | ✅ | 비밀번호 |

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 로그인 성공 |
| 400 | 잘못된 요청 |
| 401 | 이메일 또는 비밀번호 불일치 |

**성공 응답**
- Headers: `Authorization: Bearer {accessToken}`
- Cookie: `refreshToken={token}; HttpOnly; Secure`

```json
{
  "userId": 1,
  "nickname": "홍길동",
  "email": "user@example.com",
  "profileImage": "https://example.com/profile.jpg",
  "emailVerified": true
}
```

---

### POST `/logout` - 로그아웃

Access Token과 Refresh Token을 무효화합니다.

**인증 필요**: ✅

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 로그아웃 성공 |
| 401 | 인증 실패 |

---

### POST `/refresh` - 토큰 갱신

Refresh Token으로 새로운 Access Token을 발급받습니다.

**인증 필요**: ❌ (Cookie에 refreshToken 필요)

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 토큰 갱신 성공 |
| 401 | 유효하지 않은/만료된 Refresh Token |

**성공 응답**
- Headers: `Authorization: Bearer {newAccessToken}`
- Cookie: `refreshToken={newRefreshToken}; HttpOnly; Secure`

---

### POST `/email/send` - 이메일 인증 코드 발송

이메일 인증을 위한 인증 코드를 발송합니다.

**인증 필요**: ❌

**Request Body**

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| email | string | ✅ | 이메일 |

```json
{
  "email": "user@example.com"
}
```

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 인증 코드 발송 성공 |
| 400 | 잘못된 요청 / 이미 인증된 이메일 |
| 404 | 유저를 찾을 수 없음 |
| 429 | 인증 코드 발송 횟수 초과 |

---

### POST `/email/verify` - 이메일 인증 확인

발송된 인증 코드를 확인하여 이메일을 인증합니다.

**인증 필요**: ❌

**Request Body**

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| email | string | ✅ | 이메일 |
| code | string | ✅ | 인증 코드 (6자리) |

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 이메일 인증 성공 |
| 400 | 유효하지 않은 인증 코드 |
| 401 | 만료된 인증 코드 |
| 404 | 인증 코드/유저를 찾을 수 없음 |

**성공 응답**
```json
{
  "email": "user@example.com",
  "emailVerified": true
}
```

---

### GET `/email` - 이메일 인증 상태 확인

유저의 이메일 인증 상태를 조회합니다.

**인증 필요**: ✅

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 조회 성공 |
| 401 | 인증 실패 |
| 404 | 유저를 찾을 수 없음 |

**성공 응답**
```json
{
  "userId": 1,
  "email": "user@example.com",
  "emailVerified": true,
  "verifiedAt": "2024-01-01T12:00:00"
}
```

---

### POST `/password/send` - 비밀번호 재설정 이메일 발송

비밀번호 재설정을 위한 이메일을 발송합니다.

**인증 필요**: ❌

**Request Body**

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| email | string | ✅ | 이메일 |

```json
{
  "email": "user@example.com"
}
```

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 이메일 발송 성공 |
| 400 | 잘못된 요청 |
| 404 | 유저를 찾을 수 없음 |

---

### POST `/password/reset` - 비밀번호 재설정

이메일로 받은 토큰을 사용하여 비밀번호를 재설정합니다.

**인증 필요**: ❌

**Request Body**

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| token | string | ✅ | 비밀번호 재설정 토큰 |
| newPassword | string | ✅ | 새 비밀번호 |
| newPasswordConfirm | string | ✅ | 새 비밀번호 확인 |

```json
{
  "token": "reset-token-12345",
  "newPassword": "newPassword123",
  "newPasswordConfirm": "newPassword123"
}
```

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 비밀번호 재설정 성공 |
| 400 | 유효하지 않은 토큰 / 비밀번호 불일치 / 이미 사용된 토큰 |
| 401 | 만료된 토큰 |
| 404 | 토큰을 찾을 수 없음 |

---

## 2. User API - 사용자 관리

Base Path: `/api/v1/user`

### POST `/` - 회원가입

새로운 사용자를 등록합니다.

**인증 필요**: ❌

**Request Body**

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| email | string | ✅ | 이메일 |
| password | string | ✅ | 비밀번호 |
| nickname | string | ✅ | 닉네임 |
| gender | string | ❌ | 성별 (MALE, FEMALE, ANY) |
| birthDate | string | ❌ | 생년월일 (YYYY-MM-DD) |

```json
{
  "email": "newuser@test.com",
  "password": "Test1234!",
  "nickname": "신규유저",
  "gender": "MALE",
  "birthDate": "1995-05-15"
}
```

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 회원가입 성공 |
| 400 | 잘못된 요청 (필수값 누락, 이메일 형식 오류) |
| 409 | 중복된 닉네임/이메일 |

**성공 응답**
```json
{
  "userId": 1,
  "email": "newuser@test.com",
  "nickname": "신규유저",
  "birthDate": "1995-05-15",
  "createdAt": "2025-01-15T10:00:00"
}
```

---

### GET `/me` - 내 정보 조회

로그인한 사용자의 정보를 조회합니다.

**인증 필요**: ✅

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 조회 성공 |
| 401 | 인증 실패 |
| 404 | 사용자를 찾을 수 없음 |

**성공 응답**
```json
{
  "email": "user@example.com",
  "nickname": "테스트유저",
  "profileImage": "https://example.com/profile.jpg",
  "level": 1,
  "age": 28,
  "gender": "FEMALE"
}
```

---

### PATCH `/me` - 내 정보 수정

사용자의 닉네임, 프로필 이미지를 수정합니다.

**인증 필요**: ✅

**Request Body**

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| nickname | string | ❌ | 닉네임 |
| profileImage | string | ❌ | 프로필 이미지 URL |

```json
{
  "nickname": "새닉네임"
}
```

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 수정 성공 |
| 400 | 잘못된 요청 |
| 401 | 인증 실패 |
| 409 | 닉네임 중복 |

---

### POST `/me/profile-image` - 프로필 이미지 업로드

사용자의 프로필 이미지를 업로드합니다.

**인증 필요**: ✅

**Content-Type**: `multipart/form-data`

**Request Body**

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| profile_image | file | ✅ | 이미지 파일 |

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 업로드 성공 |
| 400 | 잘못된 파일 |
| 401 | 인증 실패 |

**성공 응답**
```json
{
  "profileImageUrl": "https://example.com/profile/123.jpg"
}
```

---

## 3. Artist API - 아티스트

Base Path: `/api/v1/artist`

### GET `/` - 전체 아티스트 조회

등록된 전체 아티스트 목록을 조회합니다.

**인증 필요**: ❌

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 조회 성공 |

**성공 응답**
```json
{
  "artists": [
    {
      "artistId": 1,
      "name": "BTS",
      "imageUrl": "https://example.com/bts.jpg"
    },
    {
      "artistId": 2,
      "name": "NewJeans",
      "imageUrl": "https://example.com/newjeans.jpg"
    }
  ]
}
```

---

### GET `/following` - 팔로우한 아티스트 조회

사용자가 팔로우한 아티스트 목록을 조회합니다.

**인증 필요**: ✅

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 조회 성공 |
| 401 | 인증되지 않은 사용자 |

**성공 응답**
```json
{
  "artists": [
    {
      "artistId": 1,
      "name": "BTS",
      "imageUrl": "https://example.com/bts.jpg"
    }
  ]
}
```

---

### POST `/{artistId}/follow` - 아티스트 팔로우

사용자가 특정 아티스트를 팔로우합니다.

**인증 필요**: ✅

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| artistId | integer | 아티스트 ID |

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 팔로우 성공 |
| 401 | 인증되지 않은 사용자 |
| 404 | 아티스트를 찾을 수 없음 |
| 409 | 이미 팔로우한 아티스트 |

---

### DELETE `/{artistId}/unfollow` - 아티스트 언팔로우

사용자가 특정 아티스트 팔로우를 취소합니다.

**인증 필요**: ✅

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| artistId | integer | 아티스트 ID |

**Response**

| 상태 | 설명 |
|------|------|
| 204 | 언팔로우 성공 |
| 400 | 팔로우 상태가 아님 |
| 401 | 인증되지 않은 사용자 |

---

## 4. Schedule API - 스케줄/캘린더

Base Path: `/api/v1/schedule`

### GET `/following` - 캘린더 화면 통합 데이터 조회

특정 년/월의 전체 일정과 다가오는 일정을 한 번에 반환합니다.

**인증 필요**: ✅

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| year | integer | ✅ | 년도 (예: 2025) |
| month | integer | ✅ | 월 (1-12) |
| artistId | integer | ❌ | 특정 아티스트 필터 |

**예시**: `GET /api/v1/schedule/following?year=2025&month=1&artistId=1`

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 조회 성공 |
| 400 | 잘못된 입력 (월 범위 초과) |
| 403 | 팔로우하지 않은 아티스트 필터링 시도 |

**성공 응답**
```json
{
  "monthlySchedules": [
    {
      "scheduleId": 120,
      "artistId": 1,
      "artistName": "NewJeans",
      "title": "뮤직뱅크 출연",
      "scheduleCategory": "BROADCAST",
      "scheduleTime": "2025-12-15T17:00:00",
      "performanceId": null,
      "link": null,
      "location": "KBS 신관 공개홀"
    },
    {
      "scheduleId": 121,
      "artistId": 2,
      "artistName": "BTS",
      "title": "팬사인회",
      "scheduleCategory": "FAN_SIGN",
      "scheduleTime": "2025-12-20T19:00:00",
      "performanceId": null,
      "link": "https://ticket.example.com/bts",
      "location": "코엑스"
    }
  ],
  "upcomingEvents": [
    {
      "scheduleId": 205,
      "artistName": "aespa",
      "title": "미니 4집 발매 콘서트",
      "scheduleCategory": "CONCERT",
      "scheduleTime": "2025-12-25T18:00:00",
      "performanceId": 501,
      "link": "https://ticket.example.com/aespa",
      "daysUntilEvent": 5,
      "location": "고척 스카이돔"
    }
  ]
}
```

---

### GET `/partyList` - 이벤트 선택 목록 조회

파티 생성용 드롭다운 목록을 제공합니다. 팔로우하는 아티스트들의 외부 행사 중 현재 시점부터 31일 이내의 일정만 조회합니다.

**인증 필요**: ✅

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 조회 성공 |
| 403 | 권한 없음 |
| 404 | 일정 조회 실패 |

**성공 응답**
```json
{
  "events": [
    {
      "scheduleId": 120,
      "title": "[BTS] WORLD TOUR 2026"
    },
    {
      "scheduleId": 121,
      "title": "[NewJeans] 미니 3집 발매 팬사인회"
    }
  ]
}
```

---

## 5. Party API - 파티

Base Path: `/api/v1/party`

### POST `/` - 파티 생성

새로운 파티를 생성합니다.

**인증 필요**: ✅

**Request Body**

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| scheduleId | integer | ✅ | 일정 ID |
| partyType | string | ✅ | 파티 타입 (LEAVE, ARRIVE) |
| partyName | string | ✅ | 파티 이름 (2-50자) |
| description | string | ❌ | 파티 설명 (0-500자) |
| departureLocation | string | ✅ | 출발 위치 (0-100자) |
| arrivalLocation | string | ✅ | 도착 위치 (0-100자) |
| transportType | string | ✅ | 이동 수단 |
| maxMembers | integer | ✅ | 최대 인원 (2-10) |
| preferredGender | string | ✅ | 선호 성별 |
| preferredAge | string | ✅ | 선호 연령대 |

```json
{
  "scheduleId": 123,
  "partyType": "LEAVE",
  "partyName": "지민이 최애",
  "description": "같이 즐겁게 콘서트 가요!",
  "departureLocation": "강남역 3번출구",
  "arrivalLocation": "잠실종합운동장",
  "transportType": "TAXI",
  "maxMembers": 4,
  "preferredGender": "ANY",
  "preferredAge": "TWENTY"
}
```

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 생성 성공 |
| 400 | 잘못된 요청 |
| 404 | 일정을 찾을 수 없음 |

**성공 응답**
```json
{
  "partyId": 1,
  "leaderId": 1,
  "status": "생성 완료"
}
```

---

### PUT `/{partyId}` - 파티 수정

파티 정보를 수정합니다. **파티장만 수정할 수 있습니다.**

**인증 필요**: ✅

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| partyId | integer | 파티 ID |

**Request Body**

| 필드 | 타입 | 필수 | 설명 |
|------|------|:----:|------|
| partyName | string | ❌ | 파티 이름 (2-50자) |
| description | string | ❌ | 파티 설명 (0-500자) |
| departureLocation | string | ❌ | 출발 위치 |
| arrivalLocation | string | ❌ | 도착 위치 |
| transportType | string | ❌ | 이동 수단 |
| maxMembers | integer | ❌ | 최대 인원 |
| preferredGender | string | ❌ | 선호 성별 |
| preferredAge | string | ❌ | 선호 연령대 |

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 수정 성공 |
| 400 | 현재 인원보다 적게 최대 인원 설정 불가 |
| 403 | 파티장만 수정 가능 |
| 404 | 파티를 찾을 수 없음 |

---

### DELETE `/{partyId}` - 파티 삭제

파티를 삭제합니다. **파티장만 삭제할 수 있습니다.**

**인증 필요**: ✅

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| partyId | integer | 파티 ID |

**Response**

| 상태 | 설명 |
|------|------|
| 204 | 삭제 성공 |
| 403 | 파티장만 삭제 가능 |
| 404 | 파티를 찾을 수 없음 |

---

### GET `/` - 파티 목록 조회

파티 목록을 조회합니다. 페이징 처리됩니다.

**인증 필요**: ❌

**Query Parameters**

| 파라미터 | 타입 | 기본값 | 설명 |
|---------|------|--------|------|
| page | integer | 0 | 페이지 번호 |
| size | integer | 20 | 페이지 크기 |

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 조회 성공 |

**성공 응답**
```json
{
  "content": [
    {
      "partyId": 1,
      "leader": {
        "userId": 100,
        "nickname": "지민이 최애",
        "age": 23,
        "gender": "FEMALE",
        "profileImage": "https://example.com/profile.jpg"
      },
      "event": {
        "eventId": 123,
        "eventTitle": "BTS WORLD TOUR 2025",
        "venueName": "잠실종합운동장"
      },
      "partyInfo": {
        "partyType": "LEAVE",
        "partyName": "지민이 최애",
        "departureLocation": "강남역",
        "arrivalLocation": "잠실종합운동장",
        "transportType": "TAXI",
        "maxMembers": 4,
        "currentMembers": 2,
        "description": "같이 즐겁게 콘서트 가요!",
        "status": "RECRUITING"
      },
      "isMyParty": false,
      "isApplied": false
    }
  ],
  "totalElements": 45,
  "totalPages": 3,
  "pageNumber": 0
}
```

---

### GET `/schedule/{scheduleId}` - 스케줄별 파티 목록 조회

특정 스케줄에 해당하는 파티 목록을 조회합니다.

**인증 필요**: ❌

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| scheduleId | integer | 스케줄 ID |

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| partyType | string | ❌ | LEAVE, ARRIVE |
| transportType | string | ❌ | TAXI, CARPOOL, SUBWAY, BUS, WALK |
| page | integer | ❌ | 페이지 번호 (기본: 0) |
| size | integer | ❌ | 페이지 크기 (기본: 20) |

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 조회 성공 |
| 404 | 스케줄을 찾을 수 없음 |

---

### POST `/{partyId}/application/apply` - 파티 참가 신청

파티에 참가 신청을 합니다.

**인증 필요**: ✅

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| partyId | integer | 파티 ID |

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 신청 성공 |
| 400 | 본인 파티 신청 불가 / 이미 신청함 / 이미 멤버임 / 인원 가득 참 / 모집중 아님 |
| 404 | 파티를 찾을 수 없음 |

**성공 응답**
```json
{
  "applicantNickName": "이치로",
  "applicantAge": 23,
  "gender": "MALE",
  "partyTitle": "BTS 공연"
}
```

**에러 코드**

| 코드 | 메시지 |
|------|--------|
| 3204 | 본인이 만든 파티에는 신청할 수 없습니다 |
| 3202 | 이미 신청한 파티입니다 |
| 3203 | 이미 참여중인 파티입니다 |
| 3205 | 파티 인원이 가득 찼습니다 |
| 3212 | 모집중인 파티가 아닙니다 |

---

### DELETE `/{partyId}/application/{applicationId}/cancel` - 파티 참가 신청 취소

파티 참가 신청을 취소합니다.

**인증 필요**: ✅

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| partyId | integer | 파티 ID |
| applicationId | integer | 신청 ID |

**Response**

| 상태 | 설명 |
|------|------|
| 204 | 취소 성공 |
| 400 | 승인된 신청은 취소 불가 |
| 403 | 권한 없음 |
| 404 | 신청을 찾을 수 없음 |

---

### PATCH `/{partyId}/application/{applicationId}/accept` - 파티 신청 승인

파티 신청을 승인합니다. **파티장만 승인할 수 있습니다.**

**인증 필요**: ✅

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| partyId | integer | 파티 ID |
| applicationId | integer | 신청 ID |

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 승인 성공 |
| 400 | 이미 처리된 신청 / 파티 인원 가득 참 |
| 403 | 파티장만 승인 가능 |
| 404 | 파티/신청을 찾을 수 없음 |

**성공 응답**
```json
{
  "applicantId": 2,
  "partyTitle": "즐거운 콘서트 관람",
  "chatRoomId": 1
}
```

---

### PATCH `/{partyId}/application/{applicationId}/reject` - 파티 신청 거절

파티 신청을 거절합니다. **파티장만 거절할 수 있습니다.**

**인증 필요**: ✅

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| partyId | integer | 파티 ID |
| applicationId | integer | 신청 ID |

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 거절 성공 |
| 400 | 이미 처리된 신청 |
| 403 | 파티장만 거절 가능 |
| 404 | 파티/신청을 찾을 수 없음 |

---

### GET `/{partyId}/application/applicants` - 파티 신청자 목록 조회

파티에 신청한 사람들의 목록을 조회합니다. **파티장만 조회할 수 있습니다.**

**인증 필요**: ✅

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| partyId | integer | 파티 ID |

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 조회 성공 |
| 403 | 파티장만 조회 가능 |
| 404 | 파티를 찾을 수 없음 |

**성공 응답**
```json
{
  "partyId": 1,
  "applications": [
    {
      "applicationId": 101,
      "applicant": {
        "userId": 200,
        "nickname": "명란 최애",
        "profileImage": "https://example.com/profile.jpg",
        "gender": "FEMALE",
        "age": 23
      },
      "status": "PENDING"
    }
  ],
  "summary": {
    "totalApplications": 5,
    "pendingCount": 3,
    "acceptedCount": 2,
    "rejectedCount": 0
  }
}
```

---

### GET `/{partyId}/members` - 파티 확정 멤버 목록 조회

파티에 확정된 멤버 목록을 조회합니다.

**인증 필요**: ❌

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| partyId | integer | 파티 ID |

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 조회 성공 |
| 404 | 파티를 찾을 수 없음 |

**성공 응답**
```json
{
  "partyId": 1,
  "members": [
    {
      "memberId": 1,
      "userId": 100,
      "nickname": "지민이 최애",
      "profileImage": "https://example.com/profile.jpg",
      "role": "파티장"
    },
    {
      "memberId": 2,
      "userId": 200,
      "nickname": "명란 최애",
      "profileImage": null,
      "role": "멤버"
    }
  ],
  "totalMembers": 2
}
```

---

### GET `/user/me/party/created` - 만든 파티 목록 조회

내가 만든 파티 목록을 조회합니다.

**인증 필요**: ✅

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| status | string | ❌ | 파티 상태 필터 |
| page | integer | ❌ | 페이지 번호 (기본: 0) |
| size | integer | ❌ | 페이지 크기 (기본: 20) |

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 조회 성공 |

**성공 응답**
```json
{
  "content": [
    {
      "partyId": 1,
      "event": {
        "eventId": 123,
        "eventTitle": "BTS WORLD TOUR 2025",
        "venueName": "잠실종합운동장",
        "eventDateTime": "2025-12-15T19:00:00"
      },
      "partyInfo": {
        "partyType": "출발팟",
        "departureLocation": "강남역",
        "currentMembers": 2,
        "maxMembers": 4
      },
      "statistics": {
        "pendingApplicationsCount": 3,
        "acceptedMembersCount": 2,
        "rejectedApplicationsCount": 1
      },
      "description": "같이 즐겁게 콘서트 가요!",
      "chatRoomId": 50,
      "createdAt": "2025-12-01T10:00:00"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "pageNumber": 0
}
```

---

### GET `/user/me/party/application` - 신청한 파티 목록 조회

내가 신청한 파티 목록을 조회합니다.

**인증 필요**: ✅

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|:----:|------|
| status | string | ❌ | 신청 상태 필터 |
| page | integer | ❌ | 페이지 번호 (기본: 0) |
| size | integer | ❌ | 페이지 크기 (기본: 20) |

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 조회 성공 |

---

## 6. Performance API - 공연

Base Path: `/api/v1/performance`

### GET `/{performanceId}` - 공연 상세 정보 조회

특정 공연의 상세 정보를 조회합니다.

**인증 필요**: ❌

**Path Parameters**

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| performanceId | integer | 공연 ID |

**Response**

| 상태 | 설명 |
|------|------|
| 200 | 조회 성공 |
| 404 | 공연/공연장/아티스트를 찾을 수 없음 |

**성공 응답**
```json
{
  "performanceId": 1,
  "title": "BTS 월드투어",
  "posterImageUrl": "https://example.com/poster.jpg",
  "artist": {
    "artistId": 1,
    "artistName": "BTS"
  },
  "startDate": "2025-01-25",
  "endDate": "2025-01-27",
  "runningTime": 180,
  "performanceHall": {
    "performanceHallId": 1,
    "name": "잠실종합운동장",
    "address": "서울특별시 송파구 올림픽로 25",
    "transportationInfo": "2호선 종합운동장역 6번 출구"
  },
  "priceGrades": [
    {
      "priceGradeId": 1,
      "gradeName": "VIP",
      "price": 180000
    },
    {
      "priceGradeId": 2,
      "gradeName": "R석",
      "price": 150000
    }
  ],
  "salesStartTime": "2025-01-10T10:00:00",
  "salesEndTime": "2025-01-24T23:59:59",
  "bookingNotice": "티켓 예매 시 유의사항...",
  "availableDates": ["2025-01-25", "2025-01-26", "2025-01-27"],
  "schedules": [
    {
      "scheduleId": 1,
      "performanceDate": "2025-01-25",
      "startTime": "19:00",
      "PerformanceNo": 1,
      "status": "AVAILABLE"
    }
  ],
  "isBookingOpen": true,
  "secondsUntilOpen": 0
}
```

---

## Enum 정의

### Party 관련

| Enum | 값 | 설명 |
|------|-----|------|
| **PartyType** | `LEAVE` | 출발팟 |
| | `ARRIVE` | 복귀팟 |
| **PartyStatus** | `RECRUITING` | 모집중 |
| | `CLOSED` | 모집마감 |
| | `COMPLETED` | 종료 |
| | `CANCELLED` | 취소됨 |
| **TransportType** | `TAXI` | 택시 |
| | `CARPOOL` | 카풀 |
| | `SUBWAY` | 지하철 |
| | `BUS` | 버스 |
| | `WALK` | 도보 |
| **PreferredAge** | `TEEN` | 10대 |
| | `TWENTY` | 20대 |
| | `THIRTY` | 30대 |
| | `FORTY` | 40대 |
| | `FIFTY_PLUS` | 50대 이상 |
| | `NONE` | 무관 |
| **Gender** | `MALE` | 남성 |
| | `FEMALE` | 여성 |
| | `ANY` | 무관 |
| **MemberRole** | `LEADER` | 파티장 |
| | `MEMBER` | 멤버 |
| **ApplicationStatus** | `PENDING` | 대기중 |
| | `APPROVED` | 승인 |
| | `REJECTED` | 거절 |

### Schedule 관련

| Enum | 값 | 설명 |
|------|-----|------|
| **ScheduleCategory** | `CONCERT` | 콘서트 |
| | `FAN_MEETING` | 팬미팅 |
| | `BROADCAST` | 방송 |
| | `ONLINE_RELEASE` | 온라인 발매 |
| | `BIRTHDAY` | 생일 |
| | `FESTIVAL` | 페스티벌 |
| | `AWARD_SHOW` | 시상식 |
| | `ANNIVERSARY` | 기념일 |
| | `FAN_SIGN` | 팬사인회 |
| | `LIVE_STREAM` | 라이브 스트림 |
| | `ETC` | 기타 |
| **ScheduleStatus** | `READY` | 준비중 |
| | `AVAILABLE` | 예매가능 |
| | `SOLD_OUT` | 매진 |
| | `CLOSED` | 마감 |
| | `CANCELLED` | 취소됨 |

---

## 에러 응답 형식

모든 에러는 다음 형식을 따릅니다:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "status": "400",
    "message": "에러 메시지"
  }
}
```

### 공통 HTTP 상태 코드

| 코드 | 의미 | 설명 |
|------|------|------|
| 200 | OK | 성공 |
| 201 | Created | 생성 성공 |
| 204 | No Content | 삭제 성공 |
| 400 | Bad Request | 잘못된 요청 |
| 401 | Unauthorized | 인증 필요 |
| 403 | Forbidden | 권한 없음 |
| 404 | Not Found | 리소스 없음 |
| 409 | Conflict | 충돌 (중복 등) |
| 429 | Too Many Requests | 요청 횟수 초과 |
| 500 | Internal Server Error | 서버 오류 |

### 주요 에러 코드

| 코드 | 메시지 |
|------|--------|
| `USER_NOT_FOUND` | 유저를 찾을 수 없습니다 |
| `INVALID_CREDENTIALS` | 이메일 또는 비밀번호가 올바르지 않습니다 |
| `DUPLICATE_NICKNAME` | 이미 사용 중인 닉네임입니다 |
| `ARTIST_NOT_FOUND` | 아티스트를 찾을 수 없습니다 |
| `ALREADY_FOLLOWED` | 이미 팔로우한 아티스트입니다 |
| `ARTIST_NOT_FOLLOWED` | 팔로우 상태가 아닙니다 |
| `PERFORMANCE_NOT_FOUND` | 공연을 찾을 수 없습니다 |
| `3001` | 파티를 찾을 수 없습니다 |
| `3102` | 파티장만 이 작업을 수행할 수 있습니다 |
| `3201` | 신청 내역을 찾을 수 없습니다 |
| `3202` | 이미 신청한 파티입니다 |
| `3203` | 이미 참여중인 파티입니다 |
| `3204` | 본인이 만든 파티에는 신청할 수 없습니다 |
| `3205` | 파티 인원이 가득 찼습니다 |
| `3206` | 이미 처리된 신청입니다 |
| `3209` | 승인된 신청은 취소할 수 없습니다 |
| `3212` | 모집중인 파티가 아닙니다 |
| `4001` | 일정을 찾을 수 없습니다 |

---

## Swagger UI

백엔드 서버 실행 시 Swagger 문서 확인:
```
http://localhost:8080/swagger-ui.html
```

---

> **문서 생성일**: 2025-12-20
> **OpenAPI 버전**: 3.1.0
> **API 버전**: beta
