# SSU-GANG-PYEONG-BACK-VER2

### BASE

- nestjs (mono repo multi module)
- board module(CQRS 아키텍처 적용: Simple CQRS architecture)

### Authentication & Authorization

- 슬라이딩 세션 및 리프레쉬 토큰 활용
- nestjs auth guard를 활용한 Authorization

### Database

- typeorm migration 활용한 db 관리
- tyeporm query runner를 활용한 db transaction
- nestjs throttler를 활용한 rate limiter

### Infrastructure

- sentry와 slack을 활용한 error notification
- nestjs terminus 헬스체크를 활용한 서버 관리
- nestjs schedule을 활용한 cron job 처리

### 문서화

- swagger를 활용한 문서화:
