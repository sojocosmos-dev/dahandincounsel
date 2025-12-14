# 성장 기록 보고서 생성기

다했니 다했어요 플랫폼의 학생 데이터를 조회하여 성장 기록 보고서를 자동 생성하는 웹 애플리케이션입니다.

## 📁 프로젝트 구조

```
dahandincounsel/
├── index.html                      # 메인 HTML 파일
├── styles.css                      # 전체 스타일시트
├── main.js                         # 애플리케이션 진입점
├── config.js                       # 상수 및 설정값
├── StateManager.js                 # 상태 관리
├── APIManager.js                   # API 호출 및 데이터 조회
├── TextUtility.js                  # 텍스트 처리 유틸리티
├── ReportDataGenerator.js           # 보고서 데이터 생성
├── ReportSectionGenerator.js        # 보고서 섹션별 HTML 생성
├── ReportGenerator.js               # 전체 보고서 HTML 조율
├── UIController.js                 # UI 상호작용 관리
├── ReportService.js                # 보고서 생성 비즈니스 로직
└── README.md                       # 이 파일
```

## 📋 파일 설명

### HTML & CSS
- **index.html**: 페이지 구조와 입력 폼. CSS와 JavaScript는 외부 파일 참조
- **styles.css**: 모든 시각 스타일, 레이아웃, 반응형 디자인 및 인쇄 최적화

### JavaScript 모듈

#### 진입점 & 초기화
- **main.js**: 애플리케이션 진입점
  - App 클래스로 모든 기능을 통합
  - 이벤트 리스너 설정
  - 전역 함수 노출 (HTML inline handlers 호환성)

#### 설정 & 상수
- **config.js**: 애플리케이션 전체에서 사용하는 상수
  - API 기본 URL 및 엔드포인트
  - 뱃지 목록
  - 기본 텍스트 및 색상 팔레트
  - 요소 ID 매핑

#### 상태 관리
- **StateManager.js**: 애플리케이션 상태 관리
  - 현재 모드 관리 (single/batch)
  - 누적 뱃지 데이터 저장 및 조회
  - 상태 초기화

#### API & 데이터
- **APIManager.js**: API 호출 및 데이터 처리
  - 학생 데이터 조회 (GET 요청)
  - 쿠키 사용 비율 계산
  - 에러 처리

- **ReportDataGenerator.js**: 보고서용 데이터 생성
  - 학생 개별 보고서 데이터 생성
  - 자동 칭찬/요약 생성
  - API 응답 데이터 정제 및 변환

#### 유틸리티
- **TextUtility.js**: 텍스트 처리 유틸리티
  - 키워드 기반 텍스트 분할 (획득/사용, 소개/획득 등)

#### 보고서 생성
- **ReportSectionGenerator.js**: 보고서 섹션별 HTML 생성
  - 헤더, 쿠키, 초코칩, 뱃지, 요약, 푸터 섹션 생성
  - 파이 차트 스타일 생성

- **ReportGenerator.js**: 전체 보고서 HTML 조율
  - 모든 섹션을 조합하여 완전한 보고서 생성

#### UI & 비즈니스 로직
- **UIController.js**: UI 상호작용 관리
  - 모드 변경 (개별/일괄 조회)
  - 설정 그룹 토글
  - DOM 초기화
  - 설정값 조회
  - UI 업데이트

- **ReportService.js**: 보고서 생성 비즈니스 로직
  - 보고서 생성 요청 처리
  - 입력값 검증
  - 학생 코드 파싱
  - URL 공유 기능

## 🚀 주요 기능

### 1. 개별 학생 조회
- 학생 코드 입력으로 개별 학생의 성장 기록 조회

### 2. 일괄 학생 조회
- 쉼표로 구분된 여러 학생 코드를 한번에 조회

### 3. 맞춤형 보고서
- 쿠키, 초코칩, 뱃지 활동별 출력 항목 선택
- 각 항목의 세부사항 커스터마이징
- 총평 섹션 자동 생성

### 4. 출력 & 공유
- PDF로 저장 (브라우저 인쇄 기능)
- 현재 페이지 URL 복사 공유

## 🏗️ 아키텍처 패턴

### Single Responsibility Principle (SRP)
각 클래스와 모듈은 하나의 책임만 가집니다:
- 상태 관리 ↔ StateManager
- API 통신 ↔ APIManager
- UI 상호작용 ↔ UIController
- 비즈니스 로직 ↔ ReportService

### 의존성 주입
- 상위 계층은 하위 계층의 객체를 받아서 사용
- 느슨한 결합으로 테스트와 유지보수 용이

### 모듈 시스템
- ES6 모듈 사용 (import/export)
- 각 파일이 독립적인 모듈로 동작
- 필요한 의존성만 import

## 🔧 기술 스택

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **API 통신**: Fetch API
- **모듈화**: ES6 Modules
- **스타일링**: CSS Variables, Flexbox
- **접근성**: Semantic HTML

## 📝 사용 방법

1. API Key 입력
2. 학생 코드 입력 (개별 또는 일괄)
3. 보고서 항목 선택 (쿠키, 초코칩, 뱃지, 요약)
4. 각 항목의 활용 방안 입력
5. "성장 기록표 출력" 버튼 클릭
6. 생성된 보고서 확인 및 인쇄/PDF 저장

## 📖 개발 가이드

### 새로운 섹션 추가
1. `ReportSectionGenerator.js`에 새로운 `generateXxxSection()` 메서드 추가
2. `ReportGenerator.js`에서 호출
3. 필요시 `config.js`에 설정 추가

### API 엔드포인트 변경
1. `config.js`에서 `CONFIG` 객체 수정
2. `APIManager.js`에서 필요시 요청 형식 조정

### UI 이벤트 추가
1. `main.js`의 `setupEventListeners()` 메서드에 이벤트 리스너 추가
2. 필요시 `UIController.js`에 새로운 메서드 작성

## 🎨 스타일 커스터마이징

`styles.css`의 CSS Variables 수정:
```css
:root {
    --color-primary: #2ecc71;
    --color-secondary: #3498db;
    /* 다른 색상들... */
}
```

## 💡 주요 설계 결정

1. **모듈 분리**: 1,297줄의 모놀리식 코드를 책임별로 분리
2. **클래스 기반**: 상태와 기능을 캡슐화하여 관리
3. **설정 외부화**: 상수를 별도 파일로 관리하여 유지보수 용이
4. **UI와 로직 분리**: 상호작용 로직과 비즈니스 로직 분리
5. **재사용 가능한 유틸리티**: 텍스트 처리, 데이터 변환 등을 유틸리티로 제공
