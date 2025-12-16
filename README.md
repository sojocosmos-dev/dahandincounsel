# 성장 기록 보고서 생성기

다했니 다했어요 플랫폼의 학생 데이터를 조회하여 성장 기록 보고서를 자동 생성하는 웹 애플리케이션입니다.

## 📁 프로젝트 구조

```
dahandincounsel/
├── index.html                          # 로그인 페이지
├── student-counsel-select.html         # 학생용 상담 선택 페이지
├── student-report.html                 # 학생용 보고서 페이지
├── teacher-report.html                 # 교사용 보고서 작성 페이지
├── teacher-submissions.html            # 교사용 학생 제출물 조회 페이지
├── styles.css                          # 전체 스타일시트
├── vite.config.js                      # Vite 설정 파일
├── package.json                        # NPM 패키지 설정
└── src/                                # 소스 코드 디렉토리
    ├── core/                           # 핵심 클래스
    │   ├── api-manager.js              # API 호출 및 데이터 조회
    │   ├── state-manager.js            # 애플리케이션 상태 관리
    │   └── config.js                   # 상수 및 설정값
    ├── services/                       # 비즈니스 로직 서비스
    │   ├── report-service.js           # 보고서 생성 비즈니스 로직
    │   ├── report-data-generator.js    # 보고서 데이터 생성
    │   ├── report-generator.js         # 전체 보고서 HTML 조율
    │   ├── report-section-generator.js # 보고서 섹션별 HTML 생성
    │   ├── student-report-service.js   # 학생용 보고서 서비스
    │   ├── counsel-storage-service.js  # 상담 데이터 저장/로드
    │   ├── config-storage-service.js   # 설정 데이터 저장/로드
    │   └── student-submission-service.js # 학생 제출 데이터 관리
    ├── ui/                             # UI 컨트롤러
    │   ├── ui-controller.js            # UI 상호작용 관리
    │   └── counsel-manager.js          # 상담 목록 UI 관리
    ├── auth/                           # 인증 관련
    │   └── auth.js                     # 교사/학생 로그인 처리
    ├── utils/                          # 유틸리티
    │   └── text-utility.js             # 텍스트 처리 유틸리티
    ├── firebase/                       # Firebase 설정
    │   └── firebase-config.js          # Firebase 초기화 및 설정
    └── apps/                           # 앱 초기화
        ├── main-app.js                 # 메인 애플리케이션 진입점
        ├── teacher-app.js              # 교사용 앱 초기화
        ├── student-app.js              # 학생용 앱 초기화
        └── student-counsel-select.js   # 학생 상담 선택 로직
```

## 🚀 주요 기능

### 👨‍🏫 교사용

1. **상담 관리**
   - 새 상담 만들기
   - 상담 선택 및 편집
   - 상담 저장/삭제

2. **보고서 항목 설정**
   - 쿠키, 초코칩, 뱃지 활동별 출력 항목 선택
   - 각 항목의 세부사항 커스터마이징
   - 총평 섹션 설정

3. **학생 제출물 조회**
   - 상담별 학생 제출 현황 확인
   - 학생이 입력한 내용 조회

### 👩‍🎓 학생용

1. **상담 선택**
   - 개인 코드로 로그인
   - 접근 가능한 상담 목록 확인
   - 상담 선택

2. **보고서 조회 및 작성**
   - 성장 기록 조회
   - 돌아보기 내용 입력
   - 칭찬과 다짐 작성

3. **보고서 제출**
   - 작성한 내용 제출
   - 교사가 조회 가능

## 🔧 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **API 통신**: Fetch API
- **모듈화**: ES6 Modules
- **번들러**: Vite
- **데이터베이스**: Firebase Firestore
- **패키지 관리**: NPM
- **스타일링**: CSS Variables, Flexbox

## 📦 설치 및 실행

### 1. 필수 요구사항
- Node.js (v14 이상)
- NPM (Node Package Manager)

### 2. 설치

```bash
# 저장소 클론
git clone https://github.com/sojocosmos-dev/dahandincounsel.git
cd dahandincounsel

# 의존성 패키지 설치
npm install
```

### 3. 개발 서버 실행

```bash
# Vite 개발 서버 시작 (포트 3000)
npm run dev
```

### 4. 프로덕션 빌드

```bash
# 프로덕션 빌드 생성
npm run build

# 빌드된 파일 미리보기
npm run preview
```

### 5. Firebase 설정

Firebase 설정은 `src/firebase/firebase-config.js`에서 관리됩니다.
- Firebase 프로젝트 생성 후 구성 정보를 입력하세요.
- Firestore Database를 활성화하세요.

## 📝 사용 방법

### 교사
1. API Key 입력 후 로그인
2. 새 상담 만들기 또는 기존 상담 선택
3. 보고서 항목 설정
4. 각 항목의 활용 방안 입력
5. 상담 저장

### 학생
1. 개인 코드로 로그인
2. 상담 선택
3. 성장 기록 조회
4. 돌아보기 내용 작성
5. 보고서 제출

## 💡 주요 개선 사항 (2024.12.17)

### 1. 폴더 구조 재구성
- 모든 JavaScript 파일을 역할별로 `src/` 하위 폴더에 체계적으로 분류
- 총 23개 파일 → 7개 카테고리로 정리

### 2. 네이밍 일관성 확보
- 모든 파일명을 **kebab-case**로 통일
- 예: `APIManager.js` → `api-manager.js`

### 3. 중복 파일 제거
- `studentAuth.js`를 `auth.js`에 통합

### 4. HTML 파일 경로 자동 업데이트
- 모든 HTML 파일의 스크립트 경로를 새 구조에 맞게 업데이트

## 📖 라이선스

이 프로젝트는 MIT 라이선스에 따라 라이선스가 부여됩니다.
