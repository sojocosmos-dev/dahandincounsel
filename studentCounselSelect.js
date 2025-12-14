/**
 * studentCounselSelect.js
 * 학생용 상담 선택 페이지 로직
 */

let studentApiKey = null;
let studentCode = null;

/**
 * 페이지 로드 시 초기화
 */
document.addEventListener('DOMContentLoaded', async () => {
    // URL 파라미터에서 API Key와 학생 코드 추출
    const params = new URLSearchParams(window.location.search);
    studentApiKey = params.get('apiKey');
    studentCode = params.get('studentCode');

    // 검증
    if (!studentApiKey || !studentCode) {
        alert('잘못된 접근입니다. 로그인 화면으로 이동합니다.');
        window.location.href = 'index.html';
        return;
    }

    // 히든 필드에 저장
    document.getElementById('hidden-api-key').value = studentApiKey;
    document.getElementById('hidden-student-code').value = studentCode;

    // 학생 코드 표시
    document.getElementById('display-student-code').textContent = studentCode;

    // 상담 목록 로드
    await loadCounselList();
});

/**
 * 상담 목록을 불러와 표시합니다
 */
async function loadCounselList() {
    try {
        const counselList = await CounselStorageService.loadCounselList(studentApiKey);
        const container = document.getElementById('counsel-select-list');

        if (counselList.length === 0) {
            container.innerHTML = '<p class="empty-message">아직 생성된 상담이 없습니다.<br>교사에게 문의해주세요.</p>';
            return;
        }

        // 최신순으로 정렬
        counselList.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

        // 상담 카드 렌더링
        container.innerHTML = counselList.map(counsel => createCounselSelectCard(counsel)).join('');
    } catch (error) {
        console.error('상담 목록 로드 실패:', error);
        const container = document.getElementById('counsel-select-list');
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
        <div class="counsel-select-card" onclick="selectCounsel('${counsel.id}', '${escapeHtml(counsel.title)}')">
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
    const params = new URLSearchParams({
        apiKey: studentApiKey,
        studentCode: studentCode,
        counselId: counselId
    });

    window.location.href = `student-report.html?${params.toString()}`;
}
