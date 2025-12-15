-- ============================================================
-- Kalender E2E Test Data Setup Script (EXPANDED VERSION)
-- Database: PostgreSQL 16
-- Created: 2025-01-15
-- Updated: 2025-01-15 - Massive data expansion
-- ============================================================

-- Clean up existing test data (in correct order due to foreign keys)
TRUNCATE TABLE party_applications CASCADE;
TRUNCATE TABLE party_members CASCADE;
TRUNCATE TABLE parties CASCADE;
TRUNCATE TABLE schedules CASCADE;
TRUNCATE TABLE artist_follows CASCADE;
TRUNCATE TABLE refresh_tokens CASCADE;
TRUNCATE TABLE email_verifications CASCADE;
TRUNCATE TABLE password_reset_tokens CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE artists CASCADE;

-- Reset sequences
ALTER SEQUENCE artists_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;
ALTER SEQUENCE schedules_id_seq RESTART WITH 1;
ALTER SEQUENCE parties_id_seq RESTART WITH 1;
ALTER SEQUENCE party_applications_id_seq RESTART WITH 1;
ALTER SEQUENCE party_members_id_seq RESTART WITH 1;
ALTER SEQUENCE artist_follows_id_seq RESTART WITH 1;

-- ============================================================
-- ARTISTS (25 K-pop Artists - Expanded)
-- ============================================================
INSERT INTO artists (id, name, image_url, created_at, updated_at) VALUES
-- Top Tier Groups
(1, 'BTS', 'https://i.imgur.com/bts_profile.jpg', NOW(), NOW()),
(2, 'BLACKPINK', 'https://i.imgur.com/blackpink_profile.jpg', NOW(), NOW()),
(3, 'NewJeans', 'https://i.imgur.com/newjeans_profile.jpg', NOW(), NOW()),
(4, 'aespa', 'https://i.imgur.com/aespa_profile.jpg', NOW(), NOW()),
(5, 'IVE', 'https://i.imgur.com/ive_profile.jpg', NOW(), NOW()),
(6, 'LE SSERAFIM', 'https://i.imgur.com/lesserafim_profile.jpg', NOW(), NOW()),
(7, 'SEVENTEEN', 'https://i.imgur.com/seventeen_profile.jpg', NOW(), NOW()),
(8, 'Stray Kids', 'https://i.imgur.com/straykids_profile.jpg', NOW(), NOW()),
(9, 'TWICE', 'https://i.imgur.com/twice_profile.jpg', NOW(), NOW()),
(10, 'EXO', 'https://i.imgur.com/exo_profile.jpg', NOW(), NOW()),
-- Additional Popular Groups
(11, 'NCT 127', 'https://i.imgur.com/nct127_profile.jpg', NOW(), NOW()),
(12, 'NCT DREAM', 'https://i.imgur.com/nctdream_profile.jpg', NOW(), NOW()),
(13, 'Red Velvet', 'https://i.imgur.com/redvelvet_profile.jpg', NOW(), NOW()),
(14, 'ITZY', 'https://i.imgur.com/itzy_profile.jpg', NOW(), NOW()),
(15, 'TXT', 'https://i.imgur.com/txt_profile.jpg', NOW(), NOW()),
(16, 'ENHYPEN', 'https://i.imgur.com/enhypen_profile.jpg', NOW(), NOW()),
(17, 'NMIXX', 'https://i.imgur.com/nmixx_profile.jpg', NOW(), NOW()),
(18, 'ATEEZ', 'https://i.imgur.com/ateez_profile.jpg', NOW(), NOW()),
(19, 'THE BOYZ', 'https://i.imgur.com/theboyz_profile.jpg', NOW(), NOW()),
(20, 'TREASURE', 'https://i.imgur.com/treasure_profile.jpg', NOW(), NOW()),
-- Rising Groups
(21, 'RIIZE', 'https://i.imgur.com/riize_profile.jpg', NOW(), NOW()),
(22, 'ZEROBASEONE', 'https://i.imgur.com/zb1_profile.jpg', NOW(), NOW()),
(23, 'BOYNEXTDOOR', 'https://i.imgur.com/bnd_profile.jpg', NOW(), NOW()),
(24, 'ILLIT', 'https://i.imgur.com/illit_profile.jpg', NOW(), NOW()),
(25, 'BABYMONSTER', 'https://i.imgur.com/babymonster_profile.jpg', NOW(), NOW());

-- Update sequence
SELECT setval('artists_id_seq', 25);

-- ============================================================
-- USERS (10 Test Accounts - Expanded)
-- Password: Test1234! -> BCrypt hash
-- ============================================================
INSERT INTO users (id, email, password, nickname, profile_image, gender, level, birth_date, email_verified, created_at, updated_at) VALUES
(1, 'admin@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.PhiNPqyN3JG2T.BgeK', '관리자', NULL, 'ANY', 99, '1990-01-01', true, NOW(), NOW()),
(2, 'user1@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.PhiNPqyN3JG2T.BgeK', '테스트유저1', NULL, 'FEMALE', 1, '1995-05-15', true, NOW(), NOW()),
(3, 'user2@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.PhiNPqyN3JG2T.BgeK', '테스트유저2', NULL, 'MALE', 1, '1998-08-20', true, NOW(), NOW()),
(4, 'leader@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.PhiNPqyN3JG2T.BgeK', '파티장', NULL, 'FEMALE', 5, '1997-03-10', true, NOW(), NOW()),
(5, 'member@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.PhiNPqyN3JG2T.BgeK', '파티원', NULL, 'MALE', 2, '1999-12-25', true, NOW(), NOW()),
(6, 'fan1@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.PhiNPqyN3JG2T.BgeK', '열정팬', NULL, 'FEMALE', 3, '2000-02-14', true, NOW(), NOW()),
(7, 'fan2@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.PhiNPqyN3JG2T.BgeK', '덕후왕', NULL, 'MALE', 4, '1996-07-07', true, NOW(), NOW()),
(8, 'newbie@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.PhiNPqyN3JG2T.BgeK', '뉴비팬', NULL, 'FEMALE', 1, '2003-11-11', true, NOW(), NOW()),
(9, 'concert@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.PhiNPqyN3JG2T.BgeK', '콘서트마니아', NULL, 'ANY', 6, '1994-04-04', true, NOW(), NOW()),
(10, 'kpoplover@test.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.PhiNPqyN3JG2T.BgeK', '케이팝러버', NULL, 'FEMALE', 2, '2001-09-09', true, NOW(), NOW());

-- Update sequence
SELECT setval('users_id_seq', 10);

-- ============================================================
-- ARTIST_FOLLOWS (User-Artist relationships - Expanded)
-- ============================================================
INSERT INTO artist_follows (id, user_id, artist_id, created_at) VALUES
-- user1 follows: BTS, BLACKPINK, NewJeans, IVE, aespa
(1, 2, 1, NOW()), (2, 2, 2, NOW()), (3, 2, 3, NOW()), (4, 2, 5, NOW()), (5, 2, 4, NOW()),
-- user2 follows: aespa, IVE, LE SSERAFIM, ITZY, NMIXX
(6, 3, 4, NOW()), (7, 3, 5, NOW()), (8, 3, 6, NOW()), (9, 3, 14, NOW()), (10, 3, 17, NOW()),
-- leader follows: BTS, SEVENTEEN, Stray Kids, NCT 127, EXO
(11, 4, 1, NOW()), (12, 4, 7, NOW()), (13, 4, 8, NOW()), (14, 4, 11, NOW()), (15, 4, 10, NOW()),
-- member follows: TWICE, EXO, Red Velvet, NCT DREAM
(16, 5, 9, NOW()), (17, 5, 10, NOW()), (18, 5, 13, NOW()), (19, 5, 12, NOW()),
-- fan1 follows: NewJeans, LE SSERAFIM, ILLIT, RIIZE
(20, 6, 3, NOW()), (21, 6, 6, NOW()), (22, 6, 24, NOW()), (23, 6, 21, NOW()),
-- fan2 follows: Stray Kids, ATEEZ, ENHYPEN, TXT, THE BOYZ
(24, 7, 8, NOW()), (25, 7, 18, NOW()), (26, 7, 16, NOW()), (27, 7, 15, NOW()), (28, 7, 19, NOW()),
-- newbie follows: BLACKPINK, NewJeans, IVE
(29, 8, 2, NOW()), (30, 8, 3, NOW()), (31, 8, 5, NOW()),
-- concert follows: BTS, BLACKPINK, SEVENTEEN, TWICE, EXO, NCT 127
(32, 9, 1, NOW()), (33, 9, 2, NOW()), (34, 9, 7, NOW()), (35, 9, 9, NOW()), (36, 9, 10, NOW()), (37, 9, 11, NOW()),
-- kpoplover follows: aespa, IVE, NewJeans, ITZY, NMIXX, Red Velvet
(38, 10, 4, NOW()), (39, 10, 5, NOW()), (40, 10, 3, NOW()), (41, 10, 14, NOW()), (42, 10, 17, NOW()), (43, 10, 13, NOW());

-- Update sequence
SELECT setval('artist_follows_id_seq', 43);

-- ============================================================
-- SCHEDULES (80 Events - Massive expansion across 2025)
-- ============================================================
INSERT INTO schedules (id, artist_id, performance_id, title, schedule_category, link, schedule_time, location, created_at, updated_at) VALUES
-- ========== JANUARY 2025 ==========
-- BTS Events (artist_id: 1)
(1, 1, NULL, 'BTS WORLD TOUR 2025 - 서울 Day 1', 'CONCERT', 'https://tickets.com/bts-tour', '2025-01-25 19:00:00', '잠실종합운동장 주경기장', NOW(), NOW()),
(2, 1, NULL, 'BTS WORLD TOUR 2025 - 서울 Day 2', 'CONCERT', 'https://tickets.com/bts-tour', '2025-01-26 18:00:00', '잠실종합운동장 주경기장', NOW(), NOW()),
(3, 1, NULL, 'BTS 팬사인회', 'FAN_SIGN', NULL, '2025-01-28 14:00:00', '삼성동 코엑스 D홀', NOW(), NOW()),
-- BLACKPINK Events (artist_id: 2)
(4, 2, NULL, 'BLACKPINK 컴백 쇼케이스', 'BROADCAST', 'https://youtube.com/blackpink', '2025-01-20 20:00:00', 'Mnet 스튜디오', NOW(), NOW()),
(5, 2, NULL, '제니 생일 기념 V라이브', 'BIRTHDAY', 'https://vlive.com/blackpink', '2025-01-16 21:00:00', '온라인', NOW(), NOW()),
(6, 2, NULL, 'BLACKPINK 인기가요 출연', 'BROADCAST', NULL, '2025-01-19 15:40:00', 'SBS 목동', NOW(), NOW()),
-- NewJeans Events (artist_id: 3)
(7, 3, NULL, 'NewJeans 2nd EP 발매', 'ONLINE_RELEASE', 'https://music.com/newjeans', '2025-01-15 18:00:00', '온라인', NOW(), NOW()),
(8, 3, NULL, 'NewJeans 뮤직뱅크 출연', 'BROADCAST', NULL, '2025-01-17 17:30:00', 'KBS 여의도', NOW(), NOW()),
(9, 3, NULL, 'NewJeans 라디오스타 출연', 'BROADCAST', NULL, '2025-01-22 22:00:00', 'MBC 상암', NOW(), NOW()),
-- aespa Events (artist_id: 4)
(10, 4, NULL, 'aespa 라이브 스트림', 'LIVE_STREAM', 'https://vlive.com/aespa', '2025-01-18 21:00:00', '온라인', NOW(), NOW()),
(11, 4, NULL, 'aespa 음악중심 출연', 'BROADCAST', NULL, '2025-01-25 15:10:00', 'MBC 상암', NOW(), NOW()),
-- IVE Events (artist_id: 5)
(12, 5, NULL, 'IVE 시상식 출연', 'AWARD_SHOW', NULL, '2025-01-27 18:00:00', 'MBC 상암 스튜디오', NOW(), NOW()),
(13, 5, NULL, 'IVE 팬사인회', 'FAN_SIGN', NULL, '2025-01-30 15:00:00', '여의도 IFC몰', NOW(), NOW()),
-- Stray Kids Events (artist_id: 8)
(14, 8, NULL, 'Stray Kids 팬사인회', 'FAN_SIGN', NULL, '2025-01-30 13:00:00', '영등포 타임스퀘어', NOW(), NOW()),
-- EXO Events (artist_id: 10)
(15, 10, NULL, 'EXO 라디오 방송 출연', 'BROADCAST', NULL, '2025-01-22 22:00:00', 'SBS 파워FM', NOW(), NOW()),

-- ========== FEBRUARY 2025 ==========
-- BTS Events
(16, 1, NULL, 'BTS 팬미팅 2025', 'FAN_MEETING', NULL, '2025-02-14 14:00:00', 'KSPO DOME', NOW(), NOW()),
(17, 1, NULL, 'BTS V라이브 스페셜', 'LIVE_STREAM', 'https://vlive.com/bts', '2025-02-20 20:00:00', '온라인', NOW(), NOW()),
-- BLACKPINK Events
(18, 2, NULL, 'BLACKPINK WORLD TOUR - 서울', 'CONCERT', NULL, '2025-02-22 19:00:00', '고척스카이돔', NOW(), NOW()),
(19, 2, NULL, 'BLACKPINK WORLD TOUR - 서울 Day 2', 'CONCERT', NULL, '2025-02-23 18:00:00', '고척스카이돔', NOW(), NOW()),
-- NewJeans Events
(20, 3, NULL, 'NewJeans 팬미팅', 'FAN_MEETING', NULL, '2025-02-15 15:00:00', '올림픽공원 체조경기장', NOW(), NOW()),
(21, 3, NULL, 'NewJeans 하입보이 기념일', 'ANNIVERSARY', NULL, '2025-02-01 00:00:00', '온라인', NOW(), NOW()),
-- aespa Events
(22, 4, NULL, 'aespa SYNK 콘서트', 'CONCERT', NULL, '2025-02-28 19:00:00', '잠실실내체육관', NOW(), NOW()),
(23, 4, NULL, 'aespa 팬사인회', 'FAN_SIGN', NULL, '2025-02-10 14:00:00', '강남 코엑스', NOW(), NOW()),
-- IVE Events
(24, 5, NULL, 'IVE 콘서트 THE FIRST FAN CONCERT', 'CONCERT', NULL, '2025-02-22 18:00:00', '고척스카이돔', NOW(), NOW()),
(25, 5, NULL, 'IVE 안유진 생일 파티', 'BIRTHDAY', NULL, '2025-02-12 00:00:00', '온라인', NOW(), NOW()),
-- SEVENTEEN Events (artist_id: 7)
(26, 7, NULL, 'SEVENTEEN 팬콘', 'FAN_MEETING', NULL, '2025-02-08 14:00:00', 'KSPO DOME', NOW(), NOW()),
(27, 7, NULL, 'SEVENTEEN 음악방송 출연', 'BROADCAST', NULL, '2025-02-14 17:30:00', 'KBS 여의도', NOW(), NOW()),
-- Stray Kids Events
(28, 8, NULL, 'Stray Kids MANIAC 월드투어 - 서울', 'CONCERT', NULL, '2025-02-28 19:00:00', '인스파이어 아레나', NOW(), NOW()),
-- TWICE Events (artist_id: 9)
(29, 9, NULL, 'TWICE 팬미팅', 'FAN_MEETING', NULL, '2025-02-16 15:00:00', '올림픽공원 올림픽홀', NOW(), NOW()),
-- NCT 127 Events (artist_id: 11)
(30, 11, NULL, 'NCT 127 콘서트', 'CONCERT', NULL, '2025-02-21 19:00:00', '고척스카이돔', NOW(), NOW()),
-- NCT DREAM Events (artist_id: 12)
(31, 12, NULL, 'NCT DREAM 팬미팅', 'FAN_MEETING', NULL, '2025-02-09 14:00:00', 'KSPO DOME', NOW(), NOW()),

-- ========== MARCH 2025 ==========
-- BTS Events
(32, 1, NULL, 'BTS WORLD TOUR - 부산', 'CONCERT', NULL, '2025-03-08 19:00:00', '부산 아시아드 주경기장', NOW(), NOW()),
(33, 1, NULL, 'BTS WORLD TOUR - 부산 Day 2', 'CONCERT', NULL, '2025-03-09 18:00:00', '부산 아시아드 주경기장', NOW(), NOW()),
-- BLACKPINK Events
(34, 2, NULL, 'BLACKPINK 팬사인회', 'FAN_SIGN', NULL, '2025-03-15 14:00:00', '홍대 롤링홀', NOW(), NOW()),
-- NewJeans Events
(35, 3, NULL, 'NewJeans 콘서트 Bunnies', 'CONCERT', NULL, '2025-03-22 18:00:00', '올림픽공원 KSPO DOME', NOW(), NOW()),
(36, 3, NULL, 'NewJeans 콘서트 Day 2', 'CONCERT', NULL, '2025-03-23 17:00:00', '올림픽공원 KSPO DOME', NOW(), NOW()),
-- aespa Events
(37, 4, NULL, 'aespa 페스티벌 출연', 'FESTIVAL', NULL, '2025-03-01 16:00:00', '난지한강공원', NOW(), NOW()),
(38, 4, NULL, 'aespa 뮤직뱅크 컴백 무대', 'BROADCAST', NULL, '2025-03-14 17:30:00', 'KBS 여의도', NOW(), NOW()),
-- IVE Events
(39, 5, NULL, 'IVE 뮤직뱅크 출연', 'BROADCAST', NULL, '2025-03-07 17:30:00', 'KBS 여의도', NOW(), NOW()),
-- LE SSERAFIM Events (artist_id: 6)
(40, 6, NULL, 'LE SSERAFIM 데뷔 3주년 기념', 'ANNIVERSARY', NULL, '2025-05-02 00:00:00', '온라인', NOW(), NOW()),
(41, 6, NULL, 'LE SSERAFIM 콘서트', 'CONCERT', NULL, '2025-03-29 19:00:00', '잠실실내체육관', NOW(), NOW()),
-- SEVENTEEN Events
(42, 7, NULL, 'SEVENTEEN 콘서트 FOLLOW', 'CONCERT', NULL, '2025-03-15 18:00:00', '잠실실내체육관', NOW(), NOW()),
(43, 7, NULL, 'SEVENTEEN 콘서트 Day 2', 'CONCERT', NULL, '2025-03-16 17:00:00', '잠실실내체육관', NOW(), NOW()),
-- Stray Kids Events
(44, 8, NULL, 'Stray Kids 팬미팅', 'FAN_MEETING', NULL, '2025-03-08 15:00:00', 'KSPO DOME', NOW(), NOW()),
-- TWICE Events
(45, 9, NULL, 'TWICE 미니앨범 발매', 'ONLINE_RELEASE', NULL, '2025-03-10 18:00:00', '온라인', NOW(), NOW()),
(46, 9, NULL, 'TWICE 뮤직뱅크 컴백', 'BROADCAST', NULL, '2025-03-14 17:30:00', 'KBS 여의도', NOW(), NOW()),
-- Red Velvet Events (artist_id: 13)
(47, 13, NULL, 'Red Velvet 콘서트', 'CONCERT', NULL, '2025-03-22 19:00:00', '올림픽공원 올림픽홀', NOW(), NOW()),
-- ITZY Events (artist_id: 14)
(48, 14, NULL, 'ITZY 팬미팅', 'FAN_MEETING', NULL, '2025-03-29 14:00:00', 'KSPO DOME', NOW(), NOW()),
-- TXT Events (artist_id: 15)
(49, 15, NULL, 'TXT 콘서트 ACT: PROMISE', 'CONCERT', NULL, '2025-03-01 18:00:00', '고척스카이돔', NOW(), NOW()),
(50, 15, NULL, 'TXT 콘서트 Day 2', 'CONCERT', NULL, '2025-03-02 17:00:00', '고척스카이돔', NOW(), NOW()),

-- ========== APRIL 2025 ==========
-- BTS Events
(51, 1, NULL, 'BTS 정국 생일 기념', 'BIRTHDAY', NULL, '2025-09-01 00:00:00', '온라인', NOW(), NOW()),
-- BLACKPINK Events
(52, 2, NULL, 'BLACKPINK 리사 생일', 'BIRTHDAY', NULL, '2025-03-27 00:00:00', '온라인', NOW(), NOW()),
-- EXO Events
(53, 10, NULL, 'EXO 완전체 콘서트', 'CONCERT', NULL, '2025-04-12 18:00:00', '잠실종합운동장', NOW(), NOW()),
(54, 10, NULL, 'EXO 완전체 콘서트 Day 2', 'CONCERT', NULL, '2025-04-13 17:00:00', '잠실종합운동장', NOW(), NOW()),
-- NCT 127 Events
(55, 11, NULL, 'NCT 127 팬미팅', 'FAN_MEETING', NULL, '2025-04-19 15:00:00', 'KSPO DOME', NOW(), NOW()),
-- ENHYPEN Events (artist_id: 16)
(56, 16, NULL, 'ENHYPEN 콘서트 FATE', 'CONCERT', NULL, '2025-04-05 19:00:00', '인스파이어 아레나', NOW(), NOW()),
(57, 16, NULL, 'ENHYPEN 팬사인회', 'FAN_SIGN', NULL, '2025-04-12 14:00:00', '신촌 연세로', NOW(), NOW()),
-- NMIXX Events (artist_id: 17)
(58, 17, NULL, 'NMIXX 콘서트', 'CONCERT', NULL, '2025-04-26 18:00:00', '올림픽공원 체조경기장', NOW(), NOW()),
-- ATEEZ Events (artist_id: 18)
(59, 18, NULL, 'ATEEZ WORLD TOUR 서울', 'CONCERT', NULL, '2025-04-19 19:00:00', '고척스카이돔', NOW(), NOW()),
(60, 18, NULL, 'ATEEZ WORLD TOUR Day 2', 'CONCERT', NULL, '2025-04-20 18:00:00', '고척스카이돔', NOW(), NOW()),
-- THE BOYZ Events (artist_id: 19)
(61, 19, NULL, 'THE BOYZ 팬콘', 'FAN_MEETING', NULL, '2025-04-26 14:00:00', 'KSPO DOME', NOW(), NOW()),
-- TREASURE Events (artist_id: 20)
(62, 20, NULL, 'TREASURE 콘서트', 'CONCERT', NULL, '2025-04-12 18:00:00', '올림픽공원 체조경기장', NOW(), NOW()),

-- ========== MAY 2025 ==========
-- RIIZE Events (artist_id: 21)
(63, 21, NULL, 'RIIZE 팬미팅', 'FAN_MEETING', NULL, '2025-05-03 15:00:00', '올림픽공원 올림픽홀', NOW(), NOW()),
(64, 21, NULL, 'RIIZE 컴백 쇼케이스', 'BROADCAST', NULL, '2025-05-10 20:00:00', 'Mnet 스튜디오', NOW(), NOW()),
-- ZEROBASEONE Events (artist_id: 22)
(65, 22, NULL, 'ZEROBASEONE 콘서트', 'CONCERT', NULL, '2025-05-17 18:00:00', 'KSPO DOME', NOW(), NOW()),
(66, 22, NULL, 'ZEROBASEONE 콘서트 Day 2', 'CONCERT', NULL, '2025-05-18 17:00:00', 'KSPO DOME', NOW(), NOW()),
-- BOYNEXTDOOR Events (artist_id: 23)
(67, 23, NULL, 'BOYNEXTDOOR 팬미팅', 'FAN_MEETING', NULL, '2025-05-24 14:00:00', '올림픽공원 체조경기장', NOW(), NOW()),
-- ILLIT Events (artist_id: 24)
(68, 24, NULL, 'ILLIT 데뷔 1주년', 'ANNIVERSARY', NULL, '2025-03-25 00:00:00', '온라인', NOW(), NOW()),
(69, 24, NULL, 'ILLIT 팬사인회', 'FAN_SIGN', NULL, '2025-05-10 15:00:00', '삼성동 코엑스', NOW(), NOW()),
-- BABYMONSTER Events (artist_id: 25)
(70, 25, NULL, 'BABYMONSTER 팬미팅', 'FAN_MEETING', NULL, '2025-05-31 15:00:00', 'YES24 라이브홀', NOW(), NOW()),

-- ========== JUNE-DECEMBER 2025 (Additional Events) ==========
-- Summer Festivals
(71, 1, NULL, 'BTS 여름 페스티벌 출연', 'FESTIVAL', NULL, '2025-07-19 17:00:00', '잠실종합운동장', NOW(), NOW()),
(72, 2, NULL, 'BLACKPINK 서머 콘서트', 'CONCERT', NULL, '2025-07-26 19:00:00', '인천 송도컨벤시아', NOW(), NOW()),
(73, 3, NULL, 'NewJeans 서머 페스티벌', 'FESTIVAL', NULL, '2025-08-02 16:00:00', '난지한강공원', NOW(), NOW()),
(74, 4, NULL, 'aespa MY WORLD 콘서트', 'CONCERT', NULL, '2025-08-16 18:00:00', 'KSPO DOME', NOW(), NOW()),
(75, 7, NULL, 'SEVENTEEN 캐럿랜드 2025', 'FAN_MEETING', NULL, '2025-08-09 14:00:00', '고척스카이돔', NOW(), NOW()),
-- Fall Events
(76, 9, NULL, 'TWICE 9주년 기념 팬미팅', 'ANNIVERSARY', NULL, '2025-10-20 14:00:00', '올림픽공원 올림픽홀', NOW(), NOW()),
(77, 8, NULL, 'Stray Kids 스키즈 데이', 'ANNIVERSARY', NULL, '2025-08-01 00:00:00', '온라인', NOW(), NOW()),
-- Year-end Events
(78, 1, NULL, 'BTS 연말 콘서트', 'CONCERT', NULL, '2025-12-31 20:00:00', '잠실종합운동장', NOW(), NOW()),
(79, 2, NULL, 'BLACKPINK 연말 시상식', 'AWARD_SHOW', NULL, '2025-12-25 18:00:00', 'MBC 상암', NOW(), NOW()),
(80, 10, NULL, 'EXO 크리스마스 콘서트', 'CONCERT', NULL, '2025-12-24 19:00:00', '잠실실내체육관', NOW(), NOW());

-- Update sequence
SELECT setval('schedules_id_seq', 80);

-- ============================================================
-- PARTIES (50 Parties - Massive expansion)
-- ============================================================
INSERT INTO parties (id, schedule_id, leader_id, chat_room_id, party_type, party_name, description, departure_location, arrival_location, transport_type, max_members, current_members, preferred_gender, preferred_age, status, created_at, updated_at) VALUES
-- ========== RECRUITING PARTIES (Active) ==========
-- BTS 콘서트 관련
(1, 1, 4, NULL, 'LEAVE', 'BTS 콘서트 같이 가요! 🎤', '잠실역에서 출발해요~', '강남역', '잠실종합운동장', 'TAXI', 4, 1, 'ANY', 'TWENTY', 'RECRUITING', NOW(), NOW()),
(2, 1, 2, NULL, 'ARRIVE', 'BTS 콘서트 끝나고 복귀팟', '콘서트 끝나고 같이 돌아가요', '잠실종합운동장', '신림역', 'SUBWAY', 6, 2, 'FEMALE', 'TWENTY', 'RECRUITING', NOW(), NOW()),
(3, 2, 6, NULL, 'LEAVE', 'BTS Day2 출발팟', '강남에서 모여서 가요', '강남역 3번 출구', '잠실종합운동장', 'BUS', 8, 3, 'ANY', 'NONE', 'RECRUITING', NOW(), NOW()),
(4, 2, 7, NULL, 'ARRIVE', 'BTS Day2 복귀팟', '콘서트 후 홍대까지', '잠실종합운동장', '홍대입구역', 'TAXI', 4, 1, 'ANY', 'TWENTY', 'RECRUITING', NOW(), NOW()),
-- BLACKPINK 콘서트
(5, 18, 4, NULL, 'LEAVE', '블핑 콘서트 택시팟 🖤💗', '명동에서 출발', '명동역', '고척스카이돔', 'TAXI', 4, 2, 'FEMALE', 'TWENTY', 'RECRUITING', NOW(), NOW()),
(6, 18, 8, NULL, 'LEAVE', '블핑 콘서트 버스팟', '강남에서 버스로', '강남역', '고척스카이돔', 'BUS', 6, 1, 'ANY', 'NONE', 'RECRUITING', NOW(), NOW()),
(7, 19, 2, NULL, 'ARRIVE', '블핑 Day2 귀가팟', '공연 후 신촌까지', '고척스카이돔', '신촌역', 'SUBWAY', 5, 1, 'ANY', 'THIRTY', 'RECRUITING', NOW(), NOW()),
-- NewJeans 팬미팅
(8, 20, 6, NULL, 'LEAVE', '뉴진스 팬미팅 출발팟 🐰', '성수에서 출발해요', '성수역', '올림픽공원', 'TAXI', 4, 2, 'FEMALE', 'TEEN', 'RECRUITING', NOW(), NOW()),
(9, 20, 10, NULL, 'LEAVE', '뉴진스 팬미팅 카풀', '경기도에서 출발합니다', '수원역', '올림픽공원', 'CARPOOL', 4, 1, 'ANY', 'NONE', 'RECRUITING', NOW(), NOW()),
-- NewJeans 콘서트
(10, 35, 4, NULL, 'LEAVE', '뉴진스 콘서트 출발팟', 'KSPO DOME 같이가요', '건대입구역', '올림픽공원 KSPO DOME', 'WALK', 6, 2, 'ANY', 'TWENTY', 'RECRUITING', NOW(), NOW()),
(11, 36, 8, NULL, 'ARRIVE', '뉴진스 Day2 복귀', '콘서트 끝나고 합정역', '올림픽공원', '합정역', 'SUBWAY', 4, 1, 'FEMALE', 'TEEN', 'RECRUITING', NOW(), NOW()),
-- aespa 콘서트
(12, 22, 3, NULL, 'LEAVE', '에스파 SYNK 콘서트팟', '잠실역에서 출발', '잠실역', '잠실실내체육관', 'WALK', 5, 2, 'ANY', 'TWENTY', 'RECRUITING', NOW(), NOW()),
(13, 22, 7, NULL, 'ARRIVE', '에스파 콘서트 복귀', '합정 방면', '잠실실내체육관', '합정역', 'TAXI', 4, 1, 'ANY', 'TWENTY', 'RECRUITING', NOW(), NOW()),
-- IVE 콘서트
(14, 24, 3, NULL, 'LEAVE', 'IVE 콘서트 가실 분 ✨', '버스로 같이 가요', '홍대입구역', '고척스카이돔', 'BUS', 5, 1, 'ANY', 'TEEN', 'RECRUITING', NOW(), NOW()),
(15, 24, 10, NULL, 'LEAVE', '아이브 콘서트 택시팟', '신촌에서 출발', '신촌역', '고척스카이돔', 'TAXI', 4, 2, 'FEMALE', 'TWENTY', 'RECRUITING', NOW(), NOW()),
-- SEVENTEEN 콘서트
(16, 42, 4, NULL, 'LEAVE', '세븐틴 FOLLOW 콘서트', '서울역에서 출발', '서울역', '잠실실내체육관', 'SUBWAY', 6, 2, 'ANY', 'TWENTY', 'RECRUITING', NOW(), NOW()),
(17, 43, 7, NULL, 'ARRIVE', '세븐틴 Day2 복귀팟', '공연 후 강남역까지', '잠실실내체육관', '강남역', 'TAXI', 4, 1, 'ANY', 'THIRTY', 'RECRUITING', NOW(), NOW()),
-- Stray Kids 콘서트
(18, 28, 7, NULL, 'LEAVE', '스키즈 MANIAC 출발팟 🖤', '인천공항철도로 이동', '서울역', '인스파이어 아레나', 'SUBWAY', 8, 3, 'ANY', 'TWENTY', 'RECRUITING', NOW(), NOW()),
(19, 28, 9, NULL, 'ARRIVE', '스키즈 콘서트 복귀', '공연 후 서울역', '인스파이어 아레나', '서울역', 'SUBWAY', 6, 2, 'ANY', 'NONE', 'RECRUITING', NOW(), NOW()),
-- TWICE 팬미팅
(20, 29, 5, NULL, 'LEAVE', '트와이스 팬미팅 같이가요', '건대에서 출발', '건대입구역', '올림픽공원', 'BUS', 5, 2, 'ANY', 'TWENTY', 'RECRUITING', NOW(), NOW()),
-- EXO 콘서트
(21, 53, 9, NULL, 'LEAVE', 'EXO 완전체 콘서트 출발팟', '강남역에서', '강남역', '잠실종합운동장', 'TAXI', 4, 1, 'ANY', 'THIRTY', 'RECRUITING', NOW(), NOW()),
(22, 54, 5, NULL, 'ARRIVE', 'EXO Day2 복귀팟', '콘서트 후 역삼역', '잠실종합운동장', '역삼역', 'SUBWAY', 5, 2, 'ANY', 'TWENTY', 'RECRUITING', NOW(), NOW()),
-- NCT 127 콘서트
(23, 30, 7, NULL, 'LEAVE', 'NCT127 콘서트 택시팟', '홍대에서 고척까지', '홍대입구역', '고척스카이돔', 'TAXI', 4, 2, 'ANY', 'TWENTY', 'RECRUITING', NOW(), NOW()),
-- TXT 콘서트
(24, 49, 6, NULL, 'LEAVE', 'TXT ACT:PROMISE 출발', '강남에서 출발해요', '강남역', '고척스카이돔', 'BUS', 6, 1, 'ANY', 'TEEN', 'RECRUITING', NOW(), NOW()),
(25, 50, 8, NULL, 'ARRIVE', 'TXT Day2 복귀팟', '건대입구역까지', '고척스카이돔', '건대입구역', 'TAXI', 4, 1, 'ANY', 'TEEN', 'RECRUITING', NOW(), NOW()),
-- ATEEZ 콘서트
(26, 59, 7, NULL, 'LEAVE', 'ATEEZ WORLD TOUR 출발', '잠실에서 고척까지', '잠실역', '고척스카이돔', 'TAXI', 4, 2, 'ANY', 'TWENTY', 'RECRUITING', NOW(), NOW()),
(27, 60, 9, NULL, 'ARRIVE', 'ATEEZ Day2 복귀', '신림역 방면', '고척스카이돔', '신림역', 'BUS', 5, 1, 'ANY', 'NONE', 'RECRUITING', NOW(), NOW()),
-- ENHYPEN 콘서트
(28, 56, 6, NULL, 'LEAVE', '엔하이픈 FATE 콘서트', '서울역에서 출발', '서울역', '인스파이어 아레나', 'SUBWAY', 6, 2, 'ANY', 'TEEN', 'RECRUITING', NOW(), NOW()),
-- ZEROBASEONE 콘서트
(29, 65, 10, NULL, 'LEAVE', '제베원 콘서트 출발팟', '건대에서 출발해요', '건대입구역', 'KSPO DOME', 'WALK', 5, 1, 'ANY', 'TEEN', 'RECRUITING', NOW(), NOW()),
(30, 66, 8, NULL, 'ARRIVE', '제베원 Day2 복귀', '강남역까지', 'KSPO DOME', '강남역', 'SUBWAY', 4, 1, 'ANY', 'TEEN', 'RECRUITING', NOW(), NOW()),

-- ========== CLOSED PARTIES (Full) ==========
(31, 26, 4, NULL, 'LEAVE', 'SEVENTEEN 팬콘 출발팟', '서울역에서 출발', '서울역', 'KSPO DOME', 'TAXI', 4, 4, 'FEMALE', 'TWENTY', 'CLOSED', NOW(), NOW()),
(32, 26, 2, NULL, 'ARRIVE', 'SEVENTEEN 팬콘 복귀', '합정역까지', 'KSPO DOME', '합정역', 'SUBWAY', 4, 4, 'ANY', 'THIRTY', 'CLOSED', NOW(), NOW()),
(33, 44, 7, NULL, 'LEAVE', '스키즈 팬미팅 출발', '강남에서', '강남역', 'KSPO DOME', 'TAXI', 4, 4, 'ANY', 'TWENTY', 'CLOSED', NOW(), NOW()),
(34, 31, 9, NULL, 'LEAVE', 'NCT DREAM 팬미팅', '홍대입구역에서', '홍대입구역', 'KSPO DOME', 'BUS', 6, 6, 'ANY', 'TEEN', 'CLOSED', NOW(), NOW()),
(35, 47, 5, NULL, 'LEAVE', '레드벨벳 콘서트팟', '건대에서 출발', '건대입구역', '올림픽공원', 'WALK', 5, 5, 'FEMALE', 'TWENTY', 'CLOSED', NOW(), NOW()),

-- ========== COMPLETED PARTIES ==========
(36, 4, 4, NULL, 'LEAVE', 'BLACKPINK 쇼케이스 출발팟', '완료된 파티입니다', '건대입구역', 'Mnet 스튜디오', 'WALK', 3, 3, 'ANY', 'TWENTY', 'COMPLETED', NOW(), NOW()),
(37, 10, 3, NULL, 'LEAVE', 'aespa 라이브 같이 봐요', '온라인 시청 모임이었어요', '온라인', '온라인', 'WALK', 10, 5, 'ANY', 'NONE', 'COMPLETED', NOW(), NOW()),
(38, 12, 2, NULL, 'LEAVE', 'IVE 시상식 출발팟', '완료된 파티', '잠실역', 'MBC 상암', 'SUBWAY', 4, 4, 'FEMALE', 'TWENTY', 'COMPLETED', NOW(), NOW()),
(39, 14, 7, NULL, 'LEAVE', '스키즈 팬사인회 팟', '완료됨', '영등포역', '타임스퀘어', 'WALK', 5, 3, 'ANY', 'TWENTY', 'COMPLETED', NOW(), NOW()),
(40, 15, 5, NULL, 'LEAVE', 'EXO 라디오 팟', '완료', '신촌역', 'SBS', 'TAXI', 4, 4, 'ANY', 'THIRTY', 'COMPLETED', NOW(), NOW()),
(41, 3, 9, NULL, 'LEAVE', 'BTS 팬사인회 출발', '완료된 팬사인회', '강남역', '코엑스', 'WALK', 4, 4, 'ANY', 'TWENTY', 'COMPLETED', NOW(), NOW()),
(42, 7, 6, NULL, 'LEAVE', '뉴진스 앨범 발매 팟', '온라인 청취 파티', '온라인', '온라인', 'WALK', 8, 6, 'ANY', 'TEEN', 'COMPLETED', NOW(), NOW()),
(43, 8, 10, NULL, 'LEAVE', '뉴진스 뮤뱅 팟', '완료', '여의도역', 'KBS', 'SUBWAY', 5, 5, 'FEMALE', 'TWENTY', 'COMPLETED', NOW(), NOW()),

-- ========== CANCELLED PARTIES ==========
(44, 37, 2, NULL, 'LEAVE', '취소된 aespa 페스티벌', '일정 변경으로 취소', '역삼역', '난지한강공원', 'TAXI', 4, 1, 'FEMALE', 'TWENTY', 'CANCELLED', NOW(), NOW()),
(45, 12, 4, NULL, 'ARRIVE', 'IVE 시상식 복귀팟 (취소)', '우천으로 취소', 'MBC 상암', '신촌역', 'BUS', 5, 2, 'ANY', 'TEEN', 'CANCELLED', NOW(), NOW()),
(46, 6, 3, NULL, 'LEAVE', '블핑 인기가요 취소', '방송 일정 변경', '목동역', 'SBS 목동', 'SUBWAY', 4, 1, 'ANY', 'TWENTY', 'CANCELLED', NOW(), NOW()),
(47, 9, 8, NULL, 'LEAVE', '뉴진스 라스 취소', '촬영 취소됨', '상암역', 'MBC', 'SUBWAY', 5, 2, 'ANY', 'TEEN', 'CANCELLED', NOW(), NOW()),
(48, 11, 6, NULL, 'LEAVE', '에스파 음중 취소', '출연 취소', '상암역', 'MBC', 'WALK', 4, 1, 'FEMALE', 'TWENTY', 'CANCELLED', NOW(), NOW()),
(49, 27, 9, NULL, 'LEAVE', '세븐틴 뮤뱅 취소', '스케줄 변경', '여의도역', 'KBS', 'SUBWAY', 6, 2, 'ANY', 'TWENTY', 'CANCELLED', NOW(), NOW()),
(50, 64, 10, NULL, 'LEAVE', 'RIIZE 쇼케이스 취소', '쇼케이스 연기', '상암역', 'Mnet', 'SUBWAY', 5, 1, 'ANY', 'TEEN', 'CANCELLED', NOW(), NOW());

-- Update sequence
SELECT setval('parties_id_seq', 50);

-- ============================================================
-- PARTY_MEMBERS (Party membership - Expanded)
-- ============================================================
INSERT INTO party_members (id, party_id, user_id, member_role, created_at) VALUES
-- RECRUITING parties (leaders only or partial)
(1, 1, 4, 'LEADER', NOW()),
(2, 2, 2, 'LEADER', NOW()), (3, 2, 5, 'MEMBER', NOW()),
(4, 3, 6, 'LEADER', NOW()), (5, 3, 8, 'MEMBER', NOW()), (6, 3, 10, 'MEMBER', NOW()),
(7, 4, 7, 'LEADER', NOW()),
(8, 5, 4, 'LEADER', NOW()), (9, 5, 6, 'MEMBER', NOW()),
(10, 6, 8, 'LEADER', NOW()),
(11, 7, 2, 'LEADER', NOW()),
(12, 8, 6, 'LEADER', NOW()), (13, 8, 10, 'MEMBER', NOW()),
(14, 9, 10, 'LEADER', NOW()),
(15, 10, 4, 'LEADER', NOW()), (16, 10, 8, 'MEMBER', NOW()),
(17, 11, 8, 'LEADER', NOW()),
(18, 12, 3, 'LEADER', NOW()), (19, 12, 9, 'MEMBER', NOW()),
(20, 13, 7, 'LEADER', NOW()),
(21, 14, 3, 'LEADER', NOW()),
(22, 15, 10, 'LEADER', NOW()), (23, 15, 6, 'MEMBER', NOW()),
(24, 16, 4, 'LEADER', NOW()), (25, 16, 9, 'MEMBER', NOW()),
(26, 17, 7, 'LEADER', NOW()),
(27, 18, 7, 'LEADER', NOW()), (28, 18, 9, 'MEMBER', NOW()), (29, 18, 5, 'MEMBER', NOW()),
(30, 19, 9, 'LEADER', NOW()), (31, 19, 7, 'MEMBER', NOW()),
(32, 20, 5, 'LEADER', NOW()), (33, 20, 3, 'MEMBER', NOW()),
(34, 21, 9, 'LEADER', NOW()),
(35, 22, 5, 'LEADER', NOW()), (36, 22, 10, 'MEMBER', NOW()),
(37, 23, 7, 'LEADER', NOW()), (38, 23, 8, 'MEMBER', NOW()),
(39, 24, 6, 'LEADER', NOW()),
(40, 25, 8, 'LEADER', NOW()),
(41, 26, 7, 'LEADER', NOW()), (42, 26, 9, 'MEMBER', NOW()),
(43, 27, 9, 'LEADER', NOW()),
(44, 28, 6, 'LEADER', NOW()), (45, 28, 10, 'MEMBER', NOW()),
(46, 29, 10, 'LEADER', NOW()),
(47, 30, 8, 'LEADER', NOW()),

-- CLOSED parties (full)
(48, 31, 4, 'LEADER', NOW()), (49, 31, 2, 'MEMBER', NOW()), (50, 31, 3, 'MEMBER', NOW()), (51, 31, 5, 'MEMBER', NOW()),
(52, 32, 2, 'LEADER', NOW()), (53, 32, 3, 'MEMBER', NOW()), (54, 32, 4, 'MEMBER', NOW()), (55, 32, 5, 'MEMBER', NOW()),
(56, 33, 7, 'LEADER', NOW()), (57, 33, 6, 'MEMBER', NOW()), (58, 33, 8, 'MEMBER', NOW()), (59, 33, 9, 'MEMBER', NOW()),
(60, 34, 9, 'LEADER', NOW()), (61, 34, 6, 'MEMBER', NOW()), (62, 34, 7, 'MEMBER', NOW()), (63, 34, 8, 'MEMBER', NOW()), (64, 34, 10, 'MEMBER', NOW()), (65, 34, 5, 'MEMBER', NOW()),
(66, 35, 5, 'LEADER', NOW()), (67, 35, 2, 'MEMBER', NOW()), (68, 35, 3, 'MEMBER', NOW()), (69, 35, 6, 'MEMBER', NOW()), (70, 35, 10, 'MEMBER', NOW()),

-- COMPLETED parties
(71, 36, 4, 'LEADER', NOW()), (72, 36, 2, 'MEMBER', NOW()), (73, 36, 3, 'MEMBER', NOW()),
(74, 37, 3, 'LEADER', NOW()), (75, 37, 2, 'MEMBER', NOW()), (76, 37, 4, 'MEMBER', NOW()), (77, 37, 5, 'MEMBER', NOW()), (78, 37, 6, 'MEMBER', NOW()),
(79, 38, 2, 'LEADER', NOW()), (80, 38, 4, 'MEMBER', NOW()), (81, 38, 6, 'MEMBER', NOW()), (82, 38, 8, 'MEMBER', NOW()),
(83, 39, 7, 'LEADER', NOW()), (84, 39, 5, 'MEMBER', NOW()), (85, 39, 9, 'MEMBER', NOW()),
(86, 40, 5, 'LEADER', NOW()), (87, 40, 3, 'MEMBER', NOW()), (88, 40, 7, 'MEMBER', NOW()), (89, 40, 9, 'MEMBER', NOW()),
(90, 41, 9, 'LEADER', NOW()), (91, 41, 2, 'MEMBER', NOW()), (92, 41, 4, 'MEMBER', NOW()), (93, 41, 6, 'MEMBER', NOW()),
(94, 42, 6, 'LEADER', NOW()), (95, 42, 2, 'MEMBER', NOW()), (96, 42, 3, 'MEMBER', NOW()), (97, 42, 8, 'MEMBER', NOW()), (98, 42, 10, 'MEMBER', NOW()), (99, 42, 5, 'MEMBER', NOW()),
(100, 43, 10, 'LEADER', NOW()), (101, 43, 2, 'MEMBER', NOW()), (102, 43, 6, 'MEMBER', NOW()), (103, 43, 8, 'MEMBER', NOW()), (104, 43, 4, 'MEMBER', NOW());

-- Update sequence
SELECT setval('party_members_id_seq', 104);

-- ============================================================
-- PARTY_APPLICATIONS (60 Applications - Expanded)
-- ============================================================
INSERT INTO party_applications (id, party_id, user_id, application_status, created_at) VALUES
-- PENDING applications for RECRUITING parties
(1, 1, 2, 'PENDING', NOW()),   -- user1 -> party1 (BTS concert)
(2, 1, 3, 'PENDING', NOW()),   -- user2 -> party1
(3, 1, 5, 'PENDING', NOW()),   -- member -> party1
(4, 3, 2, 'PENDING', NOW()),   -- user1 -> party3
(5, 4, 8, 'PENDING', NOW()),   -- newbie -> party4
(6, 5, 3, 'PENDING', NOW()),   -- user2 -> party5
(7, 6, 10, 'PENDING', NOW()),  -- kpoplover -> party6
(8, 8, 3, 'PENDING', NOW()),   -- user2 -> party8
(9, 10, 6, 'PENDING', NOW()),  -- fan1 -> party10
(10, 12, 5, 'PENDING', NOW()), -- member -> party12
(11, 14, 6, 'PENDING', NOW()), -- fan1 -> party14
(12, 16, 3, 'PENDING', NOW()), -- user2 -> party16
(13, 18, 2, 'PENDING', NOW()), -- user1 -> party18
(14, 20, 6, 'PENDING', NOW()), -- fan1 -> party20
(15, 21, 3, 'PENDING', NOW()), -- user2 -> party21
(16, 23, 10, 'PENDING', NOW()),-- kpoplover -> party23
(17, 24, 3, 'PENDING', NOW()), -- user2 -> party24
(18, 26, 5, 'PENDING', NOW()), -- member -> party26
(19, 28, 8, 'PENDING', NOW()), -- newbie -> party28
(20, 29, 6, 'PENDING', NOW()), -- fan1 -> party29

-- APPROVED applications (matched with party_members)
(21, 2, 5, 'APPROVED', NOW()),   -- member -> party2
(22, 3, 8, 'APPROVED', NOW()),   -- newbie -> party3
(23, 3, 10, 'APPROVED', NOW()),  -- kpoplover -> party3
(24, 5, 6, 'APPROVED', NOW()),   -- fan1 -> party5
(25, 8, 10, 'APPROVED', NOW()),  -- kpoplover -> party8
(26, 10, 8, 'APPROVED', NOW()),  -- newbie -> party10
(27, 12, 9, 'APPROVED', NOW()),  -- concert -> party12
(28, 15, 6, 'APPROVED', NOW()),  -- fan1 -> party15
(29, 16, 9, 'APPROVED', NOW()),  -- concert -> party16
(30, 18, 9, 'APPROVED', NOW()),  -- concert -> party18
(31, 18, 5, 'APPROVED', NOW()),  -- member -> party18
(32, 19, 7, 'APPROVED', NOW()),  -- fan2 -> party19
(33, 20, 3, 'APPROVED', NOW()),  -- user2 -> party20
(34, 22, 10, 'APPROVED', NOW()), -- kpoplover -> party22
(35, 23, 8, 'APPROVED', NOW()),  -- newbie -> party23
(36, 26, 9, 'APPROVED', NOW()),  -- concert -> party26
(37, 28, 10, 'APPROVED', NOW()), -- kpoplover -> party28

-- CLOSED party approvals
(38, 31, 2, 'APPROVED', NOW()), (39, 31, 3, 'APPROVED', NOW()), (40, 31, 5, 'APPROVED', NOW()),
(41, 32, 3, 'APPROVED', NOW()), (42, 32, 4, 'APPROVED', NOW()), (43, 32, 5, 'APPROVED', NOW()),
(44, 33, 6, 'APPROVED', NOW()), (45, 33, 8, 'APPROVED', NOW()), (46, 33, 9, 'APPROVED', NOW()),
(47, 34, 6, 'APPROVED', NOW()), (48, 34, 7, 'APPROVED', NOW()), (49, 34, 8, 'APPROVED', NOW()), (50, 34, 10, 'APPROVED', NOW()), (51, 34, 5, 'APPROVED', NOW()),
(52, 35, 2, 'APPROVED', NOW()), (53, 35, 3, 'APPROVED', NOW()), (54, 35, 6, 'APPROVED', NOW()), (55, 35, 10, 'APPROVED', NOW()),

-- REJECTED applications
(56, 1, 9, 'REJECTED', NOW()),  -- concert -> party1
(57, 5, 7, 'REJECTED', NOW()),  -- fan2 -> party5
(58, 10, 9, 'REJECTED', NOW()), -- concert -> party10
(59, 14, 8, 'REJECTED', NOW()), -- newbie -> party14
(60, 21, 6, 'REJECTED', NOW()); -- fan1 -> party21

-- Update sequence
SELECT setval('party_applications_id_seq', 60);

-- ============================================================
-- VERIFICATION
-- ============================================================
SELECT '=== DATA SUMMARY ===' as info;
SELECT 'Artists:' as table_name, COUNT(*) as count FROM artists
UNION ALL
SELECT 'Users:', COUNT(*) FROM users
UNION ALL
SELECT 'Artist Follows:', COUNT(*) FROM artist_follows
UNION ALL
SELECT 'Schedules:', COUNT(*) FROM schedules
UNION ALL
SELECT 'Parties:', COUNT(*) FROM parties
UNION ALL
SELECT 'Party Members:', COUNT(*) FROM party_members
UNION ALL
SELECT 'Party Applications:', COUNT(*) FROM party_applications;

SELECT '=== PARTY STATUS BREAKDOWN ===' as info;
SELECT status, COUNT(*) as count FROM parties GROUP BY status ORDER BY status;

SELECT '=== SCHEDULE CATEGORY BREAKDOWN ===' as info;
SELECT schedule_category, COUNT(*) as count FROM schedules GROUP BY schedule_category ORDER BY count DESC;

-- ============================================================
-- Test Accounts Summary:
-- ============================================================
-- | ID | Email              | Password   | Nickname      | Role         |
-- |----|-------------------|------------|---------------|--------------|
-- | 1  | admin@test.com    | Test1234!  | 관리자         | Admin        |
-- | 2  | user1@test.com    | Test1234!  | 테스트유저1    | User         |
-- | 3  | user2@test.com    | Test1234!  | 테스트유저2    | User         |
-- | 4  | leader@test.com   | Test1234!  | 파티장         | Party Leader |
-- | 5  | member@test.com   | Test1234!  | 파티원         | Party Member |
-- | 6  | fan1@test.com     | Test1234!  | 열정팬         | Fan          |
-- | 7  | fan2@test.com     | Test1234!  | 덕후왕         | Fan          |
-- | 8  | newbie@test.com   | Test1234!  | 뉴비팬         | Newbie       |
-- | 9  | concert@test.com  | Test1234!  | 콘서트마니아    | Concert Lover|
-- | 10 | kpoplover@test.com| Test1234!  | 케이팝러버     | K-pop Lover  |
-- ============================================================

-- Data Counts Summary:
-- - Artists: 25 (expanded from 10)
-- - Users: 10 (expanded from 5)
-- - Schedules: 80 (expanded from 20)
-- - Parties: 50 (expanded from 10)
-- - Party Members: 104 (expanded from 20)
-- - Party Applications: 60 (expanded from 15)
-- ============================================================
