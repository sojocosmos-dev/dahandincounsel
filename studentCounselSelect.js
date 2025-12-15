/**
 * studentCounselSelect.js
 * 학생용 상담 선택 페이지 로직
 */

let studentCode = null;
let studentName = null;

/**
 * 페이지 로드 시 초기화
 */
document.addEventListener('DOMContentLoaded', async () => {
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
 */
async function loadCounselList() {
    try {
        // API Key 없이 로컬 스토리지에서 상담 목록 로드
        const counselList = await CounselStorageService.loadCounselList();
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
        // 상담 목록에서 첫 번째 상담의 API Key를 가져옴
        const counselList = await CounselStorageService.loadCounselList();
        console.log('📚 상담 목록 개수:', counselList.length);

        if (counselList.length === 0) {
            console.warn('⚠️ 상담 목록이 없어 학생 이름을 가져올 수 없습니다.');
            return null;
        }

        // 첫 번째 상담의 API Key 사용
        const firstCounsel = counselList[0];
        console.log('📋 첫 번째 상담:', {
            id: firstCounsel.id,
            title: firstCounsel.title,
            hasApiKey: !!firstCounsel.apiKey
        });

        const apiKey = firstCounsel.apiKey;

        if (!apiKey) {
            console.error('❌ API Key가 없습니다!');
            console.log('상담 전체 객체:', firstCounsel);
            return null;
        }

        console.log('🔑 API Key 발견:', apiKey.substring(0, 10) + '...');

        // API 호출하여 학생 정보 가져오기
        console.log('📡 API 호출 중...');
        const studentData = await APIManager.fetchStudentData(studentCode, apiKey);

        console.log('📥 API 응답:', studentData);

        if (studentData && !studentData.error) {
            // 이름 필드 찾기 시도
            studentName = studentData.student || studentData.studentName || studentData.name || null;

            if (studentName) {
                console.log('✅ 학생 이름 발견:', studentName);
                return studentName;
            } else {
                console.warn('⚠️ 학생 이름 필드를 찾을 수 없습니다.');
                console.log('사용 가능한 필드:', Object.keys(studentData));
                return null;
            }
        } else {
            console.error('❌ API 오류:', studentData?.error || '데이터 없음');
            return null;
        }
    } catch (error) {
        console.error('❌ 학생 이름 조회 중 예외 발생:', error);
        return null;
    }
}
