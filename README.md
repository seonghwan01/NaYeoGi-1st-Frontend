# 📍 나여기 (NaYeoGi)

> **SSAFY 1학기 관통 프로젝트: 맞춤형 여행지 추천 및 AI 여행 기록(스토리) 공유 플랫폼**
> 
> "나여기"는 사용자에게 맞춤형 여행지를 추천하고, 소중한 여행의 순간을 AI의 도움을 받아 '스토리'로 기록하여 공유할 수 있는 웹 서비스입니다.

---

<br>

> 💡 **Repository 분리 안내**
> 
> 본 프로젝트는 프론트엔드와 백엔드 코드가 분리되어 관리되고 있습니다.
> - **Frontend (Vue.js):** [보러가기](https://github.com/seonghwan01/NaYeoGi-1st-Frontend)
> - **Backend (Spring Boot):** [보러가기](https://github.com/seonghwan01/NaYeoGi-1st-Backend)

<br>

## 🛠 기술 스택

### Frontend
- **Framework**: `Vue.js 3` (Composition API)
- **Build Tool**: `Vite`
- **State Management**: `Pinia`
- **Styling**: `Tailwind CSS`, `Bootstrap 5`
- **Editor**: `Toast UI Editor`, `Vue Quill`
- **HTTP Client**: `Axios`

### Backend
- **Framework**: `Spring Boot 3.5.8`
- **Language**: `Java 17`
- **Database**: `MySQL`
- **ORM**: `MyBatis`
- **Security**: `Spring Security`
- **API Documentation**: `SpringDoc OpenAPI (Swagger)`
- **AI Integration**: `Spring AI (Google GenAI)`
- **Cloud Storage**: `AWS S3` (이미지 업로드)


---

## 📂 프로젝트 구조

### Backend (EnjoyTrip_Framework)
```text
src/main/java/com/ssafy/nayeogi
├── attraction       # 관광지 정보 조회 및 검색 로직
├── common           # 공통 유틸리티, 예외 처리, 보안 설정
├── image            # S3 연동 이미지 업로드 및 관리
├── member           # 회원 가입, 로그인, 마이페이지
├── recommendation   # AI(GenAI) 기반 여행지 추천 서비스
└── story            # 여행 기록(스토리) CRUD 및 공유 기능

src/main/resources
├── mappers          # MyBatis SQL Mapper XML 파일
├── prompts          # AI 모델용 프롬프트 템플릿
└── application.properties # 환경 설정
```

### Frontend (nayeogi_Vue.js/NaYeoGi)
```text
src
├── components       # 재사용 가능한 공통 컴포넌트
│   ├── common       # 버튼, 입력창 등 기본 UI 요소
│   └── storybook    # 스토리 관련 특화 컴포넌트
├── composables      # 공통 로직 (Composition API)
├── restapi          # Axios 기반 API 통신 모듈
├── router           # Vue Router 경로 설정
├── stores           # Pinia 상태 관리
└── views            # 페이지 단위 컴포넌트
    ├── attraction   # 관광지 검색 및 상세 페이지
    ├── member       # 로그인, 회원가입 페이지
    └── storybook    # 여행 스토리 목록 및 작성 페이지
```

---

## 📌 핵심 요구사항 명세 (Usecase)

### 1. 회원관리 기능
- 회원은 서비스를 이용하기 위해 회원가입 및 로그인을 할 수 있다.
- 회원은 로그인 성공 시 메인 화면으로 이동하며, 상세 정보 페이지에서 기본 정보를 확인/수정할 수 있다.
- 서비스 이용을 종료하려면 회원 탈퇴를 요청할 수 있다.

### 2. 여행지 추천 기능
- 회원은 설문조사 기능을 통해 본인의 여행 성향을 입력할 수 있다.
- 설문 결과에 따라 추천 여행지 목록을 확인하고, 이를 선택해 여행 코스를 설정 및 저장할 수 있다.
- 저장해 둔 여행 코스를 불러오기, 수정하기, 삭제하기가 가능하다.

### 3. AI 스토리북 생성 기능
- 회원은 여행 후 저장된 여행 코스를 불러와 '나만의 스토리북'을 만들 수 있다.
- 코스의 각 장소별로 사진을 업로드하고 메모(짧은 경험)를 입력할 수 있다.
- 스토리북의 분위기/어조(예: 감성적, 유머러스)를 선택하면 AI가 자동으로 스토리북을 생성한다.
- 완성된 스토리북을 저장하고, 공개 여부(공개/비공개)를 설정할 수 있다.

### 4. 마이페이지 기능
- 저장된 여행 코스 및 내가 만든 스토리북 목록을 조회, 수정, 삭제할 수 있다.

---

## 🎥 시연 영상 및 화면

### 전체 시연 영상
`[전체 시연 영상 업로드 자리]`

### 도메인별 기능 화면
**1. 회원 관리** (가입/로그인, 마이페이지 조회/수정/탈퇴)
`[회원 관리 GIF 업로드 자리]`

**2. 여행지 추천** (성향 설문, 추천 및 코스 생성/저장)
`[여행지 추천 GIF 업로드 자리]`

**3. AI 스토리북 생성** (장소별 사진/메모 업로드, AI 스토리 생성)
`[스토리북 생성 GIF 업로드 자리]`

---

## 🚀 시작하기 (로컬 실행 가이드)

### 1. 데이터베이스 설정
`nayeogi_Vue.js/DB` 디렉토리의 SQL 파일을 순서대로 실행하여 데이터베이스를 구축합니다.
1. `TRIP_DUMMY_SCHEME_V4.sql` (스키마 생성)
2. `TRIP_DUMMY_DUMP_V5.sql` (데이터 삽입)

### 2. Backend 설정 및 실행 (Spring Boot)
1. `EnjoyTrip_Framework/src/main/resources/application.properties` 파일에서 DB 연결 정보 및 AWS/AI API 키를 본인의 환경에 맞게 설정합니다.
2. Spring Boot 애플리케이션을 실행합니다.

### 3. Frontend 설정 및 실행 (Vue.js)
`pnpm`을 사용하여 패키지를 설치하고 개발 서버를 실행합니다.

```bash
cd nayeogi_Vue.js/NaYeoGi

# 패키지 설치
pnpm install

# 개발 서버 실행
pnpm dev
```

---

## ✨ 주요 특징
- **AI 스토리텔링**: 사용자의 단편적인 메모와 사진을 엮어 문맥에 맞는 매끄러운 여행기로 자동 변환.
- **맞춤형 여행지 추천**: 단순 나열이 아닌 사용자 성향 설문을 통한 개인화된 장소 추천.
- **안정적인 클라우드 스토리지**: AWS S3를 연동하여 대용량 이미지 파일의 안전한 업로드 및 관리.

---

## 👥 팀원 정보 및 역할
- **박성환**: 팀장 / [로그인 / 포런트 / 일정관리]
- **강산천**: 팀원 / [AI 블로그 생성]
- **이주형**: 팀원 / [여행지 추천 / 여행 계획]
