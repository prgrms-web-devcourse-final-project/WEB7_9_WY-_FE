# 테스트 인증 정보

> **주의**: 이 파일은 로컬 개발/테스트 환경 전용입니다.
> 절대 프로덕션 환경에서 사용하지 마세요.

---

## 테스트 계정

### Admin Account
```yaml
email: admin@test.com
password: Test1234!
nickname: 관리자
role: Admin
userId: 1
```

### User Accounts
```yaml
# User 1 - 일반 사용자 (여성, 20대)
email: user1@test.com
password: Test1234!
nickname: 테스트유저1
gender: FEMALE
birthDate: 1995-05-15
userId: 2
follows: [BTS, BLACKPINK, NewJeans]

# User 2 - 일반 사용자 (남성, 20대)
email: user2@test.com
password: Test1234!
nickname: 테스트유저2
gender: MALE
birthDate: 1998-08-20
userId: 3
follows: [aespa, IVE, LE SSERAFIM]
```

### Party Accounts
```yaml
# Party Leader - 파티 생성/관리자
email: leader@test.com
password: Test1234!
nickname: 파티장
gender: FEMALE
birthDate: 1997-03-10
userId: 4
follows: [BTS, SEVENTEEN, Stray Kids]
ownedParties: [1, 3, 5, 7, 10]

# Party Member - 파티 참가자
email: member@test.com
password: Test1234!
nickname: 파티원
gender: MALE
birthDate: 1999-12-25
userId: 5
follows: [TWICE, EXO]
```

---

## 비밀번호 해시

모든 테스트 계정은 동일한 비밀번호를 사용합니다:
- **Plain text**: `Test1234!`
- **BCrypt Hash**: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.PhiNPqyN3JG2T.BgeK`

---

## JWT 토큰 정보

### 토큰 설정
```yaml
accessToken:
  expiration: 1800 seconds (30분)
  algorithm: HS256
  header: Authorization: Bearer {token}

refreshToken:
  expiration: 14 days
  storage: httpOnly secure cookie
  cookieName: refreshToken
```

### 토큰 구조
```
Header: {"alg": "HS256", "typ": "JWT"}
Payload: {"sub": "{userId}", "iat": timestamp, "exp": timestamp}
```

---

## 로그인 API

### Request
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user1@test.com",
  "password": "Test1234!"
}
```

### Response
```http
HTTP/1.1 200 OK
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIyIiwiaWF0IjoxNzA1MjIwMDAwLCJleHAiOjE3MDUyMjE4MDB9.xxxxx
Set-Cookie: refreshToken=eyJhbGciOiJIUzI1NiJ9.xxxxx; Path=/; HttpOnly; Secure

{
  "message": "로그인 성공"
}
```

---

## 테스트용 curl 명령어

### 로그인
```bash
# user1 로그인
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"Test1234!"}' \
  -i -c cookies.txt

# leader 로그인
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"leader@test.com","password":"Test1234!"}' \
  -i -c cookies.txt
```

### 토큰 추출 (bash)
```bash
# Authorization 헤더에서 토큰 추출
ACCESS_TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"Test1234!"}' \
  -i | grep -i "Authorization:" | cut -d ' ' -f 3)

echo $ACCESS_TOKEN
```

### 인증된 요청
```bash
# 내 정보 조회
curl http://localhost:8080/api/v1/user/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 팔로잉 아티스트 조회
curl http://localhost:8080/api/v1/artist/following \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## 테스트 시나리오별 계정 사용

### 기본 테스트
- **로그인/회원가입**: `user1@test.com` 또는 새 계정 생성

### 파티 테스트
- **파티 생성/관리**: `leader@test.com` (userId: 4)
- **파티 신청/참가**: `member@test.com` (userId: 5)
- **제3자 관점**: `user1@test.com` 또는 `user2@test.com`

### 다중 사용자 테스트
1. `leader@test.com` - 파티 리더 역할
2. `user1@test.com` - 첫 번째 신청자
3. `user2@test.com` - 두 번째 신청자
4. `member@test.com` - 세 번째 신청자

---

## 회원가입 테스트용 새 계정

```yaml
# 새 계정 생성 시 사용 (DB에 없음)
email: newuser@test.com
password: Test1234!
nickname: 신규유저

email: testuser2025@test.com
password: Test1234!
nickname: 테스트2025
```

---

## 환경 변수 (Backend)

백엔드 서버 실행 시 필요한 환경 변수:
```bash
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/kalender
export SPRING_DATASOURCE_USERNAME=postgres
export SPRING_DATASOURCE_PASSWORD=your_password
export JWT_SECRET=your_jwt_secret_key_here_at_least_32_characters
```

---

## 빠른 참조 테이블

| 계정 | Email | Password | 주 용도 |
|------|-------|----------|---------|
| Admin | admin@test.com | Test1234! | 관리자 기능 |
| User1 | user1@test.com | Test1234! | 일반 사용자 테스트 |
| User2 | user2@test.com | Test1234! | 다중 사용자 테스트 |
| Leader | leader@test.com | Test1234! | 파티 리더 테스트 |
| Member | member@test.com | Test1234! | 파티 멤버 테스트 |
