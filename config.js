/**
 * config.js
 * 상수 및 설정값 정의
 */

const CONFIG = {
    API_BASE_URL: "https://api.dahandin.com/openapi/v1",
    DEFAULT_MODE: 'single',
    RESPONSE_STATUS: {
        SUCCESS: true,
        ERROR: false,
    },
    ROUTE_ENDPOINT: '/get/student/total',
};

const BADGE_LIST = [
    { title: "성실", imgUrl: "https://i.imgur.com/badge_sungsil.png" },
    { title: "용기", imgUrl: "https://i.imgur.com/badge_yonggi.png" },
    { title: "책임", imgUrl: "https://i.imgur.com/badge_chaegim.png" },
    { title: "칭찬왕", imgUrl: "https://i.imgur.com/badge_chingchan.png" },
    { title: "배려", imgUrl: "https://i.imgur.com/badge_baeryeo.png" },
    { title: "정직", imgUrl: "https://i.imgur.com/badge_jungjik.png" },
    { title: "협동", imgUrl: "https://i.imgur.com/badge_hyeopdong.png" },
    { title: "창의", imgUrl: "https://i.imgur.com/badge_changui.png" },
    { title: "봉사", imgUrl: "https://i.imgur.com/badge_bongsa.png" },
];

const DEFAULT_USAGE_TEXTS = {
    general: "우리 학급은 다했니 다했어요를 태블릿 활용 수업의 메인 플랫폼으로 사용했습니다. 학생들은 학급 생활, 수업 참여, 과제 수행 등에 따라 쿠키, 초코칩, 뱃지를 획득했습니다.",
    cookieUsage: "획득: 주제글쓰기 제출 2쿠키, 받아쓰기 1쿠키~3쿠키, 놀이마당 1쿠키~2쿠키, 1인 1역 월급 7쿠키~15쿠키 \n사용: 자리 선택권 20쿠키, 간식교환 5쿠키~10쿠키, 음악재생권 10쿠키",
    chipUsage: "획득: 발표 내용이 좋은 학생에게 1초코칩, 경청 태도가 좋은 학생에게 1초코칩. \n사용: 10초코칩을 1쿠키로 교환할 수 있음.",
    badgeUsage: "소개: 아침 독서, 바르게 글씨 쓰기, 인사 잘하기, 환경보호 실천하기, 마음 다스리기, 효도미션 \n획득: 아침 한 줄 독서록 쓰기 완성, 바른 글씨 칭찬 10회 이상, 매달 학급회의 시간 인사왕 뽑기, 제로웨이스트 미션 통과, 현명하게 갈등 해결하기 5회, 효도 미션통과"
};

const COLOR_PALETTE = {
    SAVE: '#7dd3fc',
    USE: '#fda4af',
};

const ELEMENT_IDS = {
    apiKeyInput: 'api-key-input',
    studentCodeInput: 'student-code-input',
    codeListInput: 'code-list-input',
    generateBtn: 'generate-report-btn',
    reportArea: 'report-area',
    modeTab: {
        single: 'tab-single',
        batch: 'tab-batch',
    },
    modeContent: {
        single: 'mode-single-content',
        batch: 'mode-batch-content',
    },
};
