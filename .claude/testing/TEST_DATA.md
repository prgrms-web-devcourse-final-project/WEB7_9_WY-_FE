# 테스트 데이터 정의 (확장판)

> Kalender E2E 테스트용 데이터 명세
> 데이터 삽입: `setup.sql` 실행
> **Updated**: 2025-01-15 - 대량 데이터 확장

## 데이터 요약

| 항목 | 기존 | 확장 후 |
|------|------|---------|
| Artists | 10 | **25** |
| Users | 5 | **10** |
| Schedules | 20 | **80** |
| Parties | 10 | **50** |
| Party Members | 20 | **104** |
| Party Applications | 15 | **60** |

## 데이터베이스 정보
- **Type**: PostgreSQL 16
- **Host**: localhost
- **Port**: 5432
- **Database**: kalender
- **Username**: postgres
- **Password**: your_password

---

## 1. Artists (아티스트) - 25개

### Top Tier Groups (1-10)
| ID | Name |
|----|------|
| 1 | BTS |
| 2 | BLACKPINK |
| 3 | NewJeans |
| 4 | aespa |
| 5 | IVE |
| 6 | LE SSERAFIM |
| 7 | SEVENTEEN |
| 8 | Stray Kids |
| 9 | TWICE |
| 10 | EXO |

### Additional Popular Groups (11-20)
| ID | Name |
|----|------|
| 11 | NCT 127 |
| 12 | NCT DREAM |
| 13 | Red Velvet |
| 14 | ITZY |
| 15 | TXT |
| 16 | ENHYPEN |
| 17 | NMIXX |
| 18 | ATEEZ |
| 19 | THE BOYZ |
| 20 | TREASURE |

### Rising Groups (21-25)
| ID | Name |
|----|------|
| 21 | RIIZE |
| 22 | ZEROBASEONE |
| 23 | BOYNEXTDOOR |
| 24 | ILLIT |
| 25 | BABYMONSTER |

---

## 2. Users (사용자) - 10명

| ID | Email | Nickname | Gender | Level | 용도 |
|----|-------|----------|--------|-------|------|
| 1 | admin@test.com | 관리자 | ANY | 99 | Admin |
| 2 | user1@test.com | 테스트유저1 | FEMALE | 1 | 일반 사용자 |
| 3 | user2@test.com | 테스트유저2 | MALE | 1 | 일반 사용자 |
| 4 | leader@test.com | 파티장 | FEMALE | 5 | 파티 리더 |
| 5 | member@test.com | 파티원 | MALE | 2 | 파티 멤버 |
| 6 | fan1@test.com | 열정팬 | FEMALE | 3 | 활발한 팬 |
| 7 | fan2@test.com | 덕후왕 | MALE | 4 | 열성 팬 |
| 8 | newbie@test.com | 뉴비팬 | FEMALE | 1 | 신규 사용자 |
| 9 | concert@test.com | 콘서트마니아 | ANY | 6 | 콘서트 마니아 |
| 10 | kpoplover@test.com | 케이팝러버 | FEMALE | 2 | K-pop 팬 |

### BCrypt 해시
모든 계정의 비밀번호 `Test1234!`의 BCrypt 해시:
```
$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.PhiNPqyN3JG2T.BgeK
```

---

## 3. Artist Follows (팔로우 관계)

| User | Followed Artists |
|------|------------------|
| user1 | BTS, BLACKPINK, NewJeans, IVE, aespa (5명) |
| user2 | aespa, IVE, LE SSERAFIM, ITZY, NMIXX (5명) |
| leader | BTS, SEVENTEEN, Stray Kids, NCT 127, EXO (5명) |
| member | TWICE, EXO, Red Velvet, NCT DREAM (4명) |
| fan1 | NewJeans, LE SSERAFIM, ILLIT, RIIZE (4명) |
| fan2 | Stray Kids, ATEEZ, ENHYPEN, TXT, THE BOYZ (5명) |
| newbie | BLACKPINK, NewJeans, IVE (3명) |
| concert | BTS, BLACKPINK, SEVENTEEN, TWICE, EXO, NCT 127 (6명) |
| kpoplover | aespa, IVE, NewJeans, ITZY, NMIXX, Red Velvet (6명) |

---

## 4. Schedules (스케줄) - 80개

### 월별 분포

| 월 | 이벤트 수 | 주요 이벤트 |
|----|----------|------------|
| 1월 | 15 | BTS 월드투어, 블핑 쇼케이스, 뉴진스 앨범 발매 |
| 2월 | 16 | BTS 팬미팅, 블핑 월드투어, 세븐틴 팬콘 |
| 3월 | 19 | 뉴진스 콘서트, 세븐틴 콘서트, TXT 콘서트 |
| 4월 | 12 | EXO 완전체 콘서트, ATEEZ 월드투어, ENHYPEN |
| 5월 | 8 | RIIZE 팬미팅, ZEROBASEONE 콘서트 |
| 7-8월 | 7 | 여름 페스티벌, 캐럿랜드 |
| 10-12월 | 3 | 트와이스 9주년, 연말 콘서트 |

### 카테고리별 분포

| Category | 개수 |
|----------|------|
| CONCERT | 28 |
| FAN_MEETING | 14 |
| BROADCAST | 13 |
| FAN_SIGN | 7 |
| BIRTHDAY | 5 |
| ANNIVERSARY | 5 |
| ONLINE_RELEASE | 3 |
| LIVE_STREAM | 2 |
| FESTIVAL | 2 |
| AWARD_SHOW | 1 |

### 주요 이벤트 (테스트용)

| ID | Artist | Title | Date | Location |
|----|--------|-------|------|----------|
| 1 | BTS | BTS WORLD TOUR 2025 - 서울 Day 1 | 2025-01-25 19:00 | 잠실종합운동장 |
| 2 | BTS | BTS WORLD TOUR 2025 - 서울 Day 2 | 2025-01-26 18:00 | 잠실종합운동장 |
| 18 | BLACKPINK | BLACKPINK WORLD TOUR - 서울 | 2025-02-22 19:00 | 고척스카이돔 |
| 20 | NewJeans | NewJeans 팬미팅 | 2025-02-15 15:00 | 올림픽공원 체조경기장 |
| 35 | NewJeans | NewJeans 콘서트 Bunnies | 2025-03-22 18:00 | KSPO DOME |
| 42 | SEVENTEEN | SEVENTEEN 콘서트 FOLLOW | 2025-03-15 18:00 | 잠실실내체육관 |
| 53 | EXO | EXO 완전체 콘서트 | 2025-04-12 18:00 | 잠실종합운동장 |

---

## 5. Parties (파티) - 50개

### 상태별 분포

| Status | 개수 | 설명 |
|--------|------|------|
| RECRUITING | 30 | 모집중 (테스트 가능) |
| CLOSED | 5 | 모집마감 |
| COMPLETED | 8 | 완료됨 |
| CANCELLED | 7 | 취소됨 |

### 모집중 파티 (RECRUITING) - 테스트용

| ID | Schedule | Leader | Type | Name | Transport | Members |
|----|----------|--------|------|------|-----------|---------|
| 1 | BTS 콘서트 Day1 | leader | LEAVE | BTS 콘서트 같이 가요! | TAXI | 1/4 |
| 2 | BTS 콘서트 Day1 | user1 | ARRIVE | BTS 콘서트 끝나고 복귀팟 | SUBWAY | 2/6 |
| 3 | BTS 콘서트 Day2 | fan1 | LEAVE | BTS Day2 출발팟 | BUS | 3/8 |
| 5 | 블핑 콘서트 | leader | LEAVE | 블핑 콘서트 택시팟 | TAXI | 2/4 |
| 8 | 뉴진스 팬미팅 | fan1 | LEAVE | 뉴진스 팬미팅 출발팟 | TAXI | 2/4 |
| 10 | 뉴진스 콘서트 | leader | LEAVE | 뉴진스 콘서트 출발팟 | WALK | 2/6 |
| 16 | 세븐틴 콘서트 | leader | LEAVE | 세븐틴 FOLLOW 콘서트 | SUBWAY | 2/6 |
| 18 | 스키즈 콘서트 | fan2 | LEAVE | 스키즈 MANIAC 출발팟 | SUBWAY | 3/8 |
| 21 | EXO 콘서트 | concert | LEAVE | EXO 완전체 콘서트 출발팟 | TAXI | 1/4 |

### 마감 파티 (CLOSED)

| ID | Schedule | Members |
|----|----------|---------|
| 31 | SEVENTEEN 팬콘 | 4/4 |
| 32 | SEVENTEEN 팬콘 복귀 | 4/4 |
| 33 | Stray Kids 팬미팅 | 4/4 |
| 34 | NCT DREAM 팬미팅 | 6/6 |
| 35 | Red Velvet 콘서트 | 5/5 |

---

## 6. Party Applications (파티 신청) - 60개

### 상태별 분포

| Status | 개수 |
|--------|------|
| PENDING | 20 |
| APPROVED | 35 |
| REJECTED | 5 |

### PENDING (대기중) - 테스트용

| Party ID | Party Name | User |
|----------|------------|------|
| 1 | BTS 콘서트 같이 가요! | user1, user2, member |
| 3 | BTS Day2 출발팟 | user1 |
| 5 | 블핑 콘서트 택시팟 | user2 |
| 8 | 뉴진스 팬미팅 출발팟 | user2 |
| 10 | 뉴진스 콘서트 출발팟 | fan1 |
| 16 | 세븐틴 FOLLOW 콘서트 | user2 |
| 18 | 스키즈 MANIAC 출발팟 | user1 |
| 21 | EXO 완전체 콘서트 출발팟 | user2 |

---

## Enum 값 참조

### PartyType
- `LEAVE`: 출발팟
- `ARRIVE`: 복귀팟

### TransportType
- `TAXI`: 택시
- `CARPOOL`: 카풀
- `SUBWAY`: 지하철
- `BUS`: 버스
- `WALK`: 도보

### PartyStatus
- `RECRUITING`: 모집중
- `CLOSED`: 모집마감
- `COMPLETED`: 종료
- `CANCELLED`: 취소됨

### PreferredAge
- `TEEN`: 10대
- `TWENTY`: 20대
- `THIRTY`: 30대
- `FORTY`: 40대
- `FIFTY_PLUS`: 50대 이상
- `NONE`: 무관

### Gender
- `MALE`: 남성
- `FEMALE`: 여성
- `ANY`: 무관

### ApplicationStatus
- `PENDING`: 대기중
- `APPROVED`: 승인
- `REJECTED`: 거절

### ScheduleCategory
- `CONCERT`
- `FAN_MEETING`
- `BROADCAST`
- `ONLINE_RELEASE`
- `BIRTHDAY`
- `FESTIVAL`
- `AWARD_SHOW`
- `ANNIVERSARY`
- `FAN_SIGN`
- `LIVE_STREAM`
- `ETC`

---

## 데이터 삽입 방법

### Docker 사용 시
```bash
# 컨테이너에서 SQL 실행
docker exec -i kalender-postgres psql -U postgres -d kalender < .claude/testing/setup.sql
```

### psql 직접 사용 시
```bash
psql -h localhost -p 5432 -U postgres -d kalender -f .claude/testing/setup.sql
```

### DBeaver/DataGrip 사용 시
1. 데이터베이스 연결
2. SQL Editor에서 setup.sql 내용 실행

---

## 테스트 시나리오별 데이터

### 파티 생성 테스트
- 사용할 Schedule: ID 1-30 (1-3월 이벤트)
- 추천 계정: leader@test.com

### 파티 신청 테스트
- RECRUITING 파티: ID 1-30
- PENDING 신청: Party 1, 3, 5, 8, 10, 16, 18, 21 등
- 추천 계정: user1@test.com, user2@test.com

### 파티 수락/거절 테스트
- 리더 계정: leader@test.com (Party 1, 5, 10, 16 등)
- 대기중 신청자 있는 파티 확인 필요

### 캘린더 조회 테스트
- 팔로우 많은 계정: concert@test.com (6명 팔로우)
- 월별 이벤트 확인: 1-3월 집중
