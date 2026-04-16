# 우리의 일기장

초대 링크 기반 그룹 공유 일기장 서비스. 친구끼리 일기장을 만들고 일기 작성/댓글/좋아요를 할 수 있는 모바일 반응형 웹앱.

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 18 + Vite + TailwindCSS + Zustand |
| Backend | FastAPI (Python 3.11+) |
| DB | MySQL 8.0 |
| 인증 | JWT (Access Token) |
| 컨테이너 | Docker / docker-compose |

---

## 로컬 실행 방법

### 사전 요구사항

- Docker & Docker Compose
- Python 3.11+
- Node.js 18+

---

### 1. MySQL 실행 (Docker)

```bash
cd diary-app
docker-compose up -d
```

MySQL이 `localhost:3306`에서 실행됩니다.

- DB: `diary_app`
- User: `diary_user` / Password: `diary_password`

---

### 2. Backend 세팅

```bash
cd backend

# 가상환경 생성 및 활성화
python -m venv .venv
source .venv/bin/activate        # macOS/Linux
# .venv\Scripts\activate         # Windows

# 패키지 설치
pip install -r requirements.txt

# 환경변수 설정
cp .env.example .env
# .env 파일에서 SECRET_KEY 등 필요한 값 수정

# DB 마이그레이션
alembic revision --autogenerate -m "init"
alembic upgrade head

# 서버 실행
uvicorn app.main:app --reload --port 8000
```

API 서버: `http://localhost:8000`
API 문서: `http://localhost:8000/docs`

---

### 3. Frontend 세팅

```bash
cd frontend

# 패키지 설치
npm install

# 환경변수 설정 (선택 — Vite proxy로 /api 자동 포워딩)
cp .env.example .env

# 개발 서버 실행
npm run dev
```

개발 서버: `http://localhost:5173`

---

### 전체 한 번에 실행 (터미널 3개)

```bash
# 터미널 1 — DB
docker-compose up -d

# 터미널 2 — Backend
cd backend && source .venv/bin/activate && uvicorn app.main:app --reload

# 터미널 3 — Frontend
cd frontend && npm run dev
```

---

## 프로젝트 구조

```
diary-app/
├── frontend/                  # React + Vite + TailwindCSS
│   └── src/
│       ├── api/               # Axios API 클라이언트
│       ├── components/        # 공통 컴포넌트 (레이아웃, BottomNav 등)
│       ├── pages/             # 라우트별 페이지 컴포넌트
│       └── store/             # Zustand 전역 상태 (auth)
├── backend/                   # FastAPI
│   ├── app/
│   │   ├── core/              # 설정, 보안, 의존성
│   │   ├── models/            # SQLAlchemy ORM 모델
│   │   ├── routers/           # API 라우터 (auth, groups, posts, comments, likes)
│   │   └── schemas/           # Pydantic 요청/응답 스키마
│   └── alembic/               # DB 마이그레이션
├── .github/workflows/         # CI/CD (추후 추가 예정)
└── docker-compose.yml         # MySQL 8.0
```

## API 엔드포인트 요약

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/register` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| POST | `/api/auth/find-account` | 이메일 찾기 |
| POST | `/api/auth/reset-password` | 비밀번호 재설정 |
| GET | `/api/auth/me` | 내 정보 |
| GET | `/api/groups` | 내 일기장 목록 |
| POST | `/api/groups` | 일기장 생성 |
| GET | `/api/groups/:id` | 일기장 상세 |
| POST | `/api/groups/invite/:token` | 초대링크로 참여 |
| DELETE | `/api/groups/:id/leave` | 일기장 나가기 |
| DELETE | `/api/groups/:id` | 일기장 삭제 (오너) |
| GET | `/api/posts/feed` | 전체 피드 |
| POST | `/api/posts` | 일기 작성 |
| GET | `/api/posts/:id` | 일기 상세 |
| PUT | `/api/posts/:id` | 일기 수정 |
| DELETE | `/api/posts/:id` | 일기 삭제 |
| GET | `/api/comments/post/:post_id` | 댓글 목록 |
| POST | `/api/comments` | 댓글 작성 |
| DELETE | `/api/comments/:id` | 댓글 삭제 |
| POST | `/api/likes/:post_id` | 좋아요 토글 |

## 이미지 업로드

현재는 로컬 `backend/uploads/` 디렉토리에 저장됩니다.
추후 NHN Cloud Object Storage 연동 시 `app/routers/posts.py`의 이미지 저장 로직만 교체하면 됩니다.
