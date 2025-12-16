/**
 * student-counsel-select-main.js
 * 학생용 상담 선택 페이지의 메인 엔트리 포인트
 */

// Firebase 설정 import
import '../firebase/firebase-config.js';

// 필요한 서비스 import
import { CounselStorageService } from '../services/counsel-storage-service.js';
import { APIManager } from '../core/api-manager.js';
import { redirectToAuth } from '../auth/auth.js';

let studentCode = null;
let studentName = null;

/**
 * 페이지 로드 시 초기화
 */
document.addEventListener('DOMContentLoaded', async () => {
    // 뒤로가기 버튼 이벤트 리스너
    const backBtn = document.querySelector('.btn-back');
    if (backBtn) {
        backBtn.addEventListener('click', redirectToAuth);
    }
    // URL 파라미터에서 학생 코드 추출
    const params = new URLSearchParams(window.location.search);
    studentCode = params.get('studentCode');

    // 검증
    if (!studentCode) {
        alert('학생 코드가 없습니다. 로그인 화면으로 이동합니다.');
        window.location.href = 'index.html';
        return;
    }

    // 먼저 학생 코드 표시
    const displayElement = document.getElementById('display-student-code');
    if (displayElement) {
        displayElement.textContent = studentCode;
    }

    // 학생 이름 가져오기 (비동기)
    fetchStudentName().then(name => {
        if (displayElement && name) {
            displayElement.textContent = name;
            console.log('✅ 학생 이름 표시:', name);
        }
    });

    // 상담 목록 로드 (API Key 불필요)
    await loadCounselList();
});

/**
 * 상담 목록을 불러와 표시합니다
 * 학생 코드로 API 검증을 수행하여 해당 학생이 접근 가능한 상담만 표시
 */
async function loadCounselList() {
    const container = document.getElementById('counsel-select-list');

    try {
        container.innerHTML = '<p class="loading-message">상담 목록을 불러오는 중...</p>';

        // 1단계: 모든 고유한 API Key 목록 가져오기
        console.log('🔍 1단계: 모든 API Key 목록 조회 중...');
        const apiKeys = await CounselStorageService.getAllUniqueApiKeys();

        if (apiKeys.length === 0) {
            container.innerHTML = '<p class="empty-message">아직 생성된 상담이 없습니다.<br>교사에게 문의해주세요.</p>';
            return;
        }

        console.log(`✅ ${apiKeys.length}개의 고유 API Key 발견`);

        // 2단계: 각 API Key로 학생 코드 검증
        console.log('🔍 2단계: 학생 코드로 API 검증 중...');
        let validApiKey = null;

        for (const apiKey of apiKeys) {
            try {
                console.log(`📡 API Key 검증 중: ${apiKey.substring(0, 10)}...`);
                const studentData = await APIManager.fetchStudentData(studentCode, apiKey);

                if (studentData && !studentData.error) {
                    console.log(`✅ 유효한 API Key 발견: ${apiKey.substring(0, 10)}...`);
                    validApiKey = apiKey;
                    break;
                } else {
                    console.log(`❌ 접근 불가: ${apiKey.substring(0, 10)}... (${studentData?.error || '데이터 없음'})`);
                }
            } catch (error) {
                console.log(`❌ API 호출 실패: ${apiKey.substring(0, 10)}...`, error);
            }
        }

        if (!validApiKey) {
            container.innerHTML = '<p class="empty-message">접근 가능한 상담이 없습니다.<br>개인 코드를 확인하거나 교사에게 문의해주세요.</p>';
            return;
        }

        console.log(`✅ 유효한 API Key로 상담 목록 조회`);

        // 3단계: 유효한 API Key에 해당하는 상담만 로드
        const allCounsels = await CounselStorageService.loadCounselList(validApiKey);

        if (allCounsels.length === 0) {
            container.innerHTML = '<p class="empty-message">접근 가능한 상담이 없습니다.<br>교사에게 문의해주세요.</p>';
            return;
        }

        // 최신순으로 정렬
        allCounsels.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        console.log(`✅ 총 ${allCounsels.length}개의 상담 표시`);

        // 상담 카드 렌더링
        container.innerHTML = allCounsels.map(counsel => createCounselSelectCard(counsel)).join('');

        // 상담 카드 클릭 이벤트 리스너 추가
        container.querySelectorAll('.counsel-select-card').forEach(card => {
            card.addEventListener('click', () => {
                const counselId = card.dataset.counselId;
                const counselTitle = card.dataset.counselTitle;
                selectCounsel(counselId, counselTitle);
            });
        });
    } catch (error) {
        console.error('❌ 상담 목록 로드 실패:', error);
        container.innerHTML = '<p class="error-message">상담 목록을 불러오는 데 실패했습니다.</p>';
    }
}

/**
 * 상담 선택 카드 HTML 생성
 */
function createCounselSelectCard(counsel) {
    const createdDate = new Date(counsel.createdAt).toLocaleDateString('ko-KR');
    const updatedDate = new Date(counsel.updatedAt).toLocaleDateString('ko-KR');

    return `
        <div class="counsel-select-card" data-counsel-id="${counsel.id}" data-counsel-title="${escapeHtml(counsel.title)}">
            <div class="counsel-select-card-title">${escapeHtml(counsel.title)}</div>
            <div class="counsel-select-card-meta">
                <div class="counsel-select-card-date">생성: ${createdDate}</div>
                <div class="counsel-select-card-updated">수정: ${updatedDate}</div>
            </div>
            <div class="counsel-select-card-arrow">→</div>
        </div>
    `;
}

/**
 * HTML 특수문자 이스케이프
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 상담을 선택하여 리포트 페이지로 이동
 */
function selectCounsel(counselId, counselTitle) {
    // counselId와 studentCode 전달 (API Key는 상담 데이터에서 자동으로 가져옴)
    const params = new URLSearchParams({
        counselId: counselId,
        studentCode: studentCode
    });

    window.location.href = `student-report.html?${params.toString()}`;
}

/**
 * API를 통해 학생 이름을 가져옵니다
 * @returns {Promise<string|null>} 학생 이름 또는 null
 */
async function fetchStudentName() {
    console.log('🔍 학생 이름 조회 시작 - 학생 코드:', studentCode);

    try {
        // 모든 API Key 가져오기
        const apiKeys = await CounselStorageService.getAllUniqueApiKeys();

        if (apiKeys.length === 0) {
            console.warn('⚠️ API Key가 없어 학생 이름을 가져올 수 없습니다.');
            return null;
        }

        // 첫 번째 유효한 API Key로 학생 정보 가져오기
        for (const apiKey of apiKeys) {
            try {
                console.log('📡 API 호출 중...', apiKey.substring(0, 10) + '...');
                const studentData = await APIManager.fetchStudentData(studentCode, apiKey);

                if (studentData && !studentData.error) {
                    // 이름 필드 찾기 시도
                    studentName = studentData.student || studentData.studentName || studentData.name || null;

                    if (studentName) {
                        console.log('✅ 학생 이름 발견:', studentName);
                        return studentName;
                    }
                }
            } catch (error) {
                console.log('❌ API 호출 실패, 다음 API Key 시도');
            }
        }

        console.warn('⚠️ 학생 이름을 가져올 수 없습니다.');
        return null;
    } catch (error) {
        console.error('❌ 학생 이름 조회 중 예외 발생:', error);
        return null;
    }
}
