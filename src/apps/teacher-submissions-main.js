/**
 * teacher-submissions-main.js
 * 교사용 제출 보고서 보기 페이지 메인 엔트리 포인트
 */

// Firebase 설정 import
import '../firebase/firebase-config.js';

// 필요한 모듈 import
import { CONFIG } from '../core/config.js';
import { ConfigStorageService } from '../services/config-storage-service.js';
import { CounselStorageService } from '../services/counsel-storage-service.js';
import { StudentSubmissionService } from '../services/student-submission-service.js';
import { StateManager } from '../core/state-manager.js';
import { TextUtility } from '../utils/text-utility.js';
import { APIManager } from '../core/api-manager.js';
import { ReportDataGenerator } from '../services/report-data-generator.js';
import { ReportSectionGenerator } from '../services/report-section-generator.js';
import { ReportGenerator } from '../services/report-generator.js';
import { UIController } from '../ui/ui-controller.js';
import { ReportService } from '../services/report-service.js';
import { StudentReportService } from '../services/student-report-service.js';

// 전역으로 노출
window.CONFIG = CONFIG;
window.ConfigStorageService = ConfigStorageService;
window.CounselStorageService = CounselStorageService;
window.StudentSubmissionService = StudentSubmissionService;
window.StateManager = StateManager;
window.TextUtility = TextUtility;
window.APIManager = APIManager;
window.ReportDataGenerator = ReportDataGenerator;
window.ReportSectionGenerator = ReportSectionGenerator;
window.ReportGenerator = ReportGenerator;
window.UIController = UIController;
window.ReportService = ReportService;
window.StudentReportService = StudentReportService;

// teacher-submissions.html의 인라인 스크립트 코드를 여기로 이동
let currentCounselId = null;
let currentCounselData = null;

/**
 * 페이지 초기화
 */
async function initPage() {
    const params = new URLSearchParams(window.location.search);
    currentCounselId = params.get('counselId');

    if (!currentCounselId) {
        alert('상담 ID가 없습니다.');
        window.location.href = 'teacher-report.html';
        return;
    }

    // 상담 데이터 로드
    currentCounselData = await CounselStorageService.getCounselById(currentCounselId);

    if (!currentCounselData) {
        alert('상담을 찾을 수 없습니다.');
        window.location.href = 'teacher-report.html';
        return;
    }

    // 상담 제목 표시
    const counselTitleElem = document.getElementById('counsel-title');
    if (counselTitleElem) {
        counselTitleElem.textContent = currentCounselData.title;
    }

    // 제출된 보고서 목록 로드
    await loadSubmissions();
}

/**
 * 제출된 보고서 목록을 로드합니다
 */
async function loadSubmissions() {
    const listContainer = document.getElementById('submissions-list');

    try {
        listContainer.innerHTML = '<p class="loading-message">제출 목록을 불러오는 중...</p>';

        // Firestore에서 이 상담에 제출된 모든 보고서 조회
        const submissions = await StudentSubmissionService.getSubmissionsByCounselId(currentCounselId);

        if (submissions.length === 0) {
            listContainer.innerHTML = '<p class="empty-message">아직 제출된 보고서가 없습니다.</p>';
            return;
        }

        // 최신순 정렬
        submissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

        // 제출 카드 렌더링
        listContainer.innerHTML = submissions.map(sub => createSubmissionCard(sub)).join('');
    } catch (error) {
        console.error('❌ 제출 목록 로드 실패:', error);
        listContainer.innerHTML = '<p class="error-message">제출 목록을 불러오는 데 실패했습니다.</p>';
    }
}

/**
 * 제출 카드 HTML 생성
 */
function createSubmissionCard(submission) {
    const date = new Date(submission.submittedAt).toLocaleString('ko-KR');
    const studentName = submission.studentName || submission.studentCode || '이름 없음';

    return `
        <div class="submission-card" onclick="viewSubmission('${submission.id}')">
            <div class="submission-card-student">${escapeHtml(studentName)}</div>
            <div class="submission-card-date">${date}</div>
            <div class="submission-card-arrow">→</div>
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
 * 특정 제출 보고서를 조회합니다
 */
async function viewSubmission(submissionId) {
    const reportContent = document.getElementById('report-content');

    try {
        reportContent.innerHTML = '<p class="loading-message">보고서를 불러오는 중...</p>';

        const submission = await StudentSubmissionService.getSubmissionById(submissionId);

        if (!submission) {
            reportContent.innerHTML = '<p class="error-message">제출 보고서를 찾을 수 없습니다.</p>';
            return;
        }

        // 학생이 제출한 데이터를 사용하여 보고서 생성
        const reportData = submission.reportData;

        // ReportGenerator를 사용하여 HTML 생성
        const reportHtml = ReportGenerator.generateReportHtml(reportData, false);

        reportContent.innerHTML = `
            <div style="padding: 20px; background-color: #f9f9f9; border-radius: 12px; margin-bottom: 20px;">
                <h2>📊 ${escapeHtml(submission.studentName || submission.studentCode)} 학생 보고서</h2>
                <p><strong>제출 일시:</strong> ${new Date(submission.submittedAt).toLocaleString('ko-KR')}</p>
                <p><strong>상담:</strong> ${escapeHtml(currentCounselData.title)}</p>
            </div>
            ${reportHtml}
        `;

        // PDF 다운로드 버튼 추가
        reportContent.innerHTML += `
            <div style="text-align: center; margin-top: 30px;">
                <button onclick="window.print()" class="btn-primary">🖨️ 인쇄/PDF 저장</button>
            </div>
        `;

    } catch (error) {
        console.error('PDF 생성 오류:', error);
        reportContent.innerHTML = `
            <div style="padding: 30px; text-align: center; background-color: #ffebee; border-radius: 12px;">
                <h2>⚠️ 오류</h2>
                <p>PDF 생성에 실패했습니다: ${error.message}</p>
            </div>
        `;
    }
}

/**
 * 상담 목록으로 돌아갑니다
 */
function goBackToList() {
    // 목록 뷰를 보여주도록 플래그 설정
    sessionStorage.setItem('showListView', 'true');
    // 선택된 상담 ID 제거
    sessionStorage.removeItem('selectedCounselId');
    window.location.href = 'teacher-report.html';
}

/**
 * 출력 모드 토글
 */
function togglePrintMode() {
    const printBtn = document.getElementById('print-toggle-btn');
    const selectAllBtn = document.getElementById('select-all-btn');
    const submissionItems = document.querySelectorAll('.submission-item');

    // selection-mode 토글
    submissionItems.forEach(item => {
        item.classList.toggle('selection-mode');
    });

    // 버튼 상태 토글
    printBtn.classList.toggle('active');

    // 선택 모드일 때만 전체 선택 버튼 표시
    if (printBtn.classList.contains('active')) {
        selectAllBtn.style.display = 'inline-block';
    } else {
        selectAllBtn.style.display = 'none';
        // 선택 모드 해제 시 모든 체크박스 해제
        document.querySelectorAll('.submission-item-checkbox').forEach(cb => {
            cb.checked = false;
        });
    }
}

/**
 * 전체 선택/해제 토글
 */
function toggleSelectAll() {
    const checkboxes = document.querySelectorAll('.submission-item-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);

    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });
}

// viewSubmission은 동적 HTML에서 사용하므로 전역으로 유지
window.viewSubmission = viewSubmission;

// 페이지 로드 시 초기화 및 이벤트 리스너 설정
document.addEventListener('DOMContentLoaded', () => {
    initPage();

    // 뒤로가기 버튼 이벤트 리스너
    const backBtn = document.querySelector('.back-button');
    if (backBtn) {
        backBtn.addEventListener('click', goBackToList);
    }

    // 출력 버튼 이벤트 리스너
    const printBtn = document.getElementById('print-toggle-btn');
    if (printBtn) {
        printBtn.addEventListener('click', togglePrintMode);
    }

    // 전체 선택 버튼 이벤트 리스너
    const selectAllBtn = document.getElementById('select-all-btn');
    if (selectAllBtn) {
        selectAllBtn.addEventListener('click', toggleSelectAll);
    }
});
