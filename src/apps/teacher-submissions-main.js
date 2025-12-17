/**
 * teacher-submissions-main.js
 * 교사용 제출 보고서 보기 페이지 메인 엔트리 포인트
 */

// Firebase 설정 import
import '../firebase/firebase-config.js';

// 필요한 모듈 import
import { CounselStorageService } from '../services/counsel-storage-service.js';
import { StudentSubmissionService } from '../services/student-submission-service.js';
import { ReportGenerator } from '../services/report-generator.js';

// PDF 생성 라이브러리 import
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
    const submissionCountElem = document.getElementById('submission-count');

    try {
        listContainer.innerHTML = '<p class="loading-message">제출 목록을 불러오는 중...</p>';

        // Firestore에서 이 상담에 제출된 모든 보고서 조회
        const submissions = await StudentSubmissionService.getSubmissionsByCounselId(currentCounselId);

        // 제출 카운트 업데이트
        if (submissionCountElem) {
            submissionCountElem.textContent = submissions.length;
        }

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
        // 오류 시에도 카운트를 0으로 표시
        if (submissionCountElem) {
            submissionCountElem.textContent = '0';
        }
    }
}

/**
 * 제출 카드 HTML 생성
 */
function createSubmissionCard(submission) {
    const date = new Date(submission.submittedAt).toLocaleString('ko-KR');
    const studentName = submission.studentName || submission.studentCode || '이름 없음';

    return `
        <div class="submission-item" data-submission-id="${submission.id}" onclick="viewSubmission(event, '${submission.id}')">
            <div class="submission-item-content">
                <div class="submission-item-name">${escapeHtml(studentName)}</div>
                <div class="submission-item-code">${date}</div>
            </div>
            <input type="checkbox" class="submission-item-checkbox" data-submission-id="${submission.id}" />
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
async function viewSubmission(event, submissionId) {
    const reportContent = document.getElementById('report-content');

    // 모든 submission-item에서 active 클래스 제거
    document.querySelectorAll('.submission-item').forEach(item => {
        item.classList.remove('active');
    });

    // 클릭된 항목에 active 클래스 추가
    event.target.closest('.submission-item')?.classList.add('active');

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

        reportContent.innerHTML = reportHtml;

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
 * 선택된 보고서들을 PDF로 생성합니다
 */
async function printSelectedReports(checkedItems) {
    const reportContent = document.getElementById('report-content');
    const originalContent = reportContent.innerHTML;

    try {
        // 선택된 항목들의 submission ID 추출
        const submissionIds = checkedItems.map(checkbox => checkbox.getAttribute('data-submission-id'));

        if (submissionIds.length === 0) {
            alert('출력할 보고서를 선택해주세요.');
            return;
        }

        // 모든 선택된 보고서 데이터 가져오기
        const submissions = await Promise.all(
            submissionIds.map(id => StudentSubmissionService.getSubmissionById(id))
        );

        // 각 제출 보고서를 개별 PDF로 생성
        for (let i = 0; i < submissions.length; i++) {
            const submission = submissions[i];
            if (!submission) continue;

            // 현재 처리 중인 보고서를 화면에 표시 (로딩 상태)
            reportContent.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <h2>📄 PDF 생성 중...</h2>
                    <p style="font-size: 1.2em; margin: 20px 0;">
                        <strong>${escapeHtml(submission.studentName || submission.studentCode)}</strong> 학생 보고서
                    </p>
                    <p style="color: #666;">
                        ${i + 1} / ${submissions.length}
                    </p>
                    <div style="width: 100%; max-width: 400px; height: 8px; background: #e0e0e0; border-radius: 4px; margin: 20px auto; overflow: hidden;">
                        <div style="width: ${((i + 1) / submissions.length) * 100}%; height: 100%; background: #4CAF50; transition: width 0.3s;"></div>
                    </div>
                </div>
            `;

            await generateSinglePDF(submission);
        }

        // 완료 메시지
        reportContent.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h2>✅ 완료!</h2>
                <p style="font-size: 1.2em; margin: 20px 0;">
                    ${submissions.length}개의 PDF가 다운로드되었습니다.
                </p>
            </div>
        `;

        // 2초 후 원래 내용으로 복원
        setTimeout(() => {
            reportContent.innerHTML = originalContent;
        }, 2000);

    } catch (error) {
        console.error('❌ PDF 생성 실패:', error);
        alert('PDF 생성에 실패했습니다: ' + error.message);
        // 오류 시 원래 내용으로 복원
        reportContent.innerHTML = originalContent;
    }
}

/**
 * 단일 보고서를 PDF로 생성합니다
 */
async function generateSinglePDF(submission) {
    const reportData = submission.reportData;
    const reportHtml = ReportGenerator.generateReportHtml(reportData, true);

    // 보고서 내용을 우측 패널에 임시로 표시
    const reportContent = document.getElementById('report-content');
    const previousContent = reportContent.innerHTML;
    reportContent.innerHTML = reportHtml;

    try {
        // html2canvas로 HTML을 이미지로 변환
        const canvas = await html2canvas(reportContent, {
            scale: 2, // 고해상도
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            width: reportContent.scrollWidth,
            height: reportContent.scrollHeight
        });

        // A4 사이즈 PDF 생성 (210mm x 297mm)
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        // 이미지 데이터 추가
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // 한 페이지를 넘어가는 경우 페이지 추가
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // PDF 다운로드
        const fileName = `${submission.studentName || submission.studentCode}_보고서_${new Date().toISOString().slice(0, 10)}.pdf`;
        pdf.save(fileName);

        // 이전 내용 복원
        reportContent.innerHTML = previousContent;

    } catch (error) {
        // 오류 시 이전 내용 복원
        reportContent.innerHTML = previousContent;
        throw error;
    }
}

/**
 * 출력 모드 토글
 */
async function togglePrintMode() {
    const printBtn = document.getElementById('print-toggle-btn');
    const selectAllBtn = document.getElementById('select-all-btn');
    const submissionItems = document.querySelectorAll('.submission-item');

    // 버튼이 활성화 상태였다면 (선택 모드 해제 시) 선택된 항목들 출력
    if (printBtn.classList.contains('active')) {
        // 체크된 항목들 찾기
        const checkedItems = Array.from(document.querySelectorAll('.submission-item-checkbox:checked'));

        if (checkedItems.length > 0) {
            // 선택된 항목들의 보고서 출력
            await printSelectedReports(checkedItems);
        }

        // selection-mode 해제
        submissionItems.forEach(item => {
            item.classList.remove('selection-mode');
        });

        // 버튼 상태 해제
        printBtn.classList.remove('active');
        selectAllBtn.style.display = 'none';

        // 체크박스 해제
        document.querySelectorAll('.submission-item-checkbox').forEach(cb => {
            cb.checked = false;
        });
    } else {
        // 선택 모드 활성화
        submissionItems.forEach(item => {
            item.classList.add('selection-mode');
        });

        printBtn.classList.add('active');
        selectAllBtn.style.display = 'inline-block';
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
