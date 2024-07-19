# SSU-GANG-PYEONG-BACK-VER2

### BASE

- nestjs 프로젝트(mono repo multi module)
- board module(CQRS 아키텍처 적용: Simple CQRS architecture)
- Test Driven Development 적용
  - 최대한 사람의 언어를 사용하고 내부 구현을 검증하기 보다 최종 결과를 검증하는 테스트 코드를 작성하려고 노력함

### 인증 & 인가

- 슬라이딩 세션 및 리프레쉬 토큰 활용
- nestjs auth guard를 활용한 Authorization

### 데이터베이스

- 기존 데이터베이스에서 rdbms로 마이그레이션을 진행하며 데이터 정규화도 함께 진행함(유저 시간표 데이터)
- typeorm migration 활용한 db 관리
- tyeporm query runner를 활용한 db transaction
- nestjs throttler를 활용한 rate limiter

### 인프라

- Github Actions를 활용한 CI/CD
- sentry와 slack을 활용한 error notification
- nestjs terminus 헬스체크를 활용한 서버 관리
- nestjs schedule을 활용한 cron job 처리

### 문서화

- swagger를 활용한 문서화

### 리팩토링

- 투두 기능: Date 객체를 사용하던 코드에서 js-joda 패키지를 활용한 리팩토링을 진행함
- enum:

## 기능(domain)

- [ ] auth module:

  - [ ] 회원가입용 이메일 발송 - 이메일 모듈로 로직 분리 리팩토링
  - [ ] 회원가입
  - [ ] 로그인용 이메일 발송 - 이메일 모듈로 로직 분리 리팩토링
  - [ ] 로그인
  - [ ] 유저 정보 수정(현재는 유저 닉네임만)
  - [ ] 유저 삭제(이메일 발송) - 이메일 모듈로 로직 분리 리팩토링

- [x] course module:

  - [x] 수업 정보 모두 불러오기
  - [x] 수업 정보 검색 및 필터링해서 불러오기
  - [x] 시간표에 추가할 수 있는 수업들 불러오기(검색, 필터링 포함)
  - [x] 수업 정보 하나 불러오기
  - [x] 수강평 생성

  - [x] 시간표에 들어갈 형태로 코스 데이터 가공하기

  - [x] 수업 좋아요 생성
  - [x] 수업 좋아요 취소
  - [x] 수업 좋아요 수 및 좋아요 누른 유저 불러오기

  - [x] 수강평 좋아요 생성
  - [x] 수강평 좋아요 취소
  - [x] 수강평 좋아요 수 및 좋아요 누른 유저 불러오기

  - [ ] 수업 정보 오류 신고하기 - 관리자에게 이메일 - 이메일 모듈로

- [x] board module:

  - [x] board controller:

    - [x] 게시판 생성
    - [x] 게시판 수정
    - [x] 게시판 다수 불러오기
    - [x] 게시판 하나 불러오기
    - [x] 게시판 삭제하기

  - [x] post controller:

    - [x] 게시글 생성
    - [x] 게시글 수정
    - [x] 게시글 다수 불러오기(검색, 필터링 포함)
    - [x] 게시글 하나 불러오기
    - [x] 게시글 삭제하기

    - [x] 게시글 좋아요 생성
    - [x] 게시글 좋아요 취소
    - [x] 게시글 좋아요 수 및 좋아요 누른 유저 불러오기

  - [x] comment controller:

    - [x] 게시글 댓글 생성
    - [x] 게시글 댓글 삭제

    - [x] 게시글 댓글 좋아요 생성
    - [x] 게시글 댓글 좋아요 취소
    - [x] 게시글 댓글 좋아요 수 및 좋아요 누른 유저 불러오기

    - [ ] 게시글 신고하기(?) - 관리자에게 이메일 - 이메일 모듈로
    - [ ] 게시글 댓글 신고하기(?) - 관리자에게 이메일 - 이메일 모듈로
    - [ ] 게시글 작성자 차단하기

- [x] table module:

  - [x] table controller

    - [x] 시간표 생성하기
    - [x] 시간표 이름 수정하기
    - [x] 시간표 삭제하기

  - [x] personal schedule controller:

    - [x] 시간표에 개인 스케줄 추가하기
    - [x] 시간표에 개인 스케줄 수정하기
    - [x] 시간표에 개인 스케줄 삭제하기

  - [x] school schedule controller:
    - [x] 시간표에 수업 추가하기 - 시간표 모듈로
    - [x] 시간표에 수업 삭제하기 - 시간표 모듈로
    - [x] 시간표에 수업 모두 삭제하기 - 시간표 모듈로

- [x] todo module:

  - [x] todo category controller:
    - [x] 투두 카테고리 모두 불러오기
    - [x] 투두 카테고리 id로 가져오기
    - [x] 투두 카테고리 생성
    - [x] 투두 카테고리 삭제
    - [x] 투두 카테고리 수정
  - [x] todo task controller
    - [x] 투두 항목 모두 불러오기 getAllTasks
    - [x] 투두 항목 카테고리 별로 불러오기 getTasksByCategory
    - [x] 완료한 투두 항목들만 가져오기 getAllCompletedTasks
    - [x] 오늘 투두 불러오기 getTasksForToday
    - [x] 특정 날짜 투두 불러오기 getTasksSpecificDay
    - [x] 월별 투두 불러오기 getMonthlyTasks
    - [x] 투두 생성
    - [x] 투두 완료/미완료 토글
    - [x] 투두 삭제
    - [x] 투두 수정

- [ ] user module:

  - [x] 내 유저 정보 조회하기
  - [x] 유저 수강평 수 업데이트
  - [ ] 스크랩한 수강평 최신순으로 보기
  - [ ] 좋아요 한 수업 인기순으로 보기

  - [ ] 유저 차단하기 hateUser
  - [x] 다른 유저 팔로우 추가
  - [x] 다른 유저 팔로우 취소
  - [x] 팔로워 조회하기
