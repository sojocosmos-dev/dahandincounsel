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

    // PDF 생성을 위한 임시 컨테이너 생성
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '210mm'; // A4 너비
    tempContainer.style.backgroundColor = '#ffffff';
    tempContainer.style.padding = '10mm'; // 여백
    tempContainer.style.boxSizing = 'border-box';
    tempContainer.innerHTML = reportHtml;

    // PDF용 스타일 추가 - 극도로 최적화된 공간 활용
    const style = document.createElement('style');
    style.textContent = `
        /* ============================================
           PDF 전용 최적화 스타일 (2페이지 강제 수용)
           ============================================ */

        /* 전역 설정 - 최소 여백 */
        * {
            box-sizing: border-box !important;
        }

        body, html {
            margin: 0 !important;
            padding: 0 !important;
            line-height: 1.25 !important;
            font-size: 13px !important;
        }

        /* 헤더 영역 - 조회일시가 레이아웃에 영향 없도록 */
        .report-page {
            position: relative !important;
            padding: 0 !important;
            margin: 0 !important;
        }

        .report-date-header {
            position: absolute !important;
            top: 2px !important;
            right: 5px !important;
            font-size: 0.75em !important;
            color: #888 !important;
            padding: 2px 5px !important;
            margin: 0 !important;
            z-index: 10 !important;
        }

        /* 제목 - 컴팩트하게 */
        h1 {
            font-size: 1.6em !important;
            margin: 8px 0 6px 0 !important;
            padding: 6px !important;
            line-height: 1.2 !important;
        }

        /* 섹션 타이틀 */
        .activity-title {
            font-size: 1.15em !important;
            margin: 6px 0 4px 0 !important;
            padding: 0 0 3px 0 !important;
            line-height: 1.2 !important;
        }

        .summary-section h2 {
            font-size: 1.2em !important;
            margin: 6px 0 4px 0 !important;
            line-height: 1.2 !important;
        }

        .summary-section h3 {
            font-size: 1.0em !important;
            margin: 5px 0 3px 0 !important;
            line-height: 1.2 !important;
        }

        h2 {
            font-size: 1.1em !important;
            margin: 5px 0 !important;
            padding: 0 !important;
            line-height: 1.2 !important;
        }

        /* 활용방안 섹션 - 최소 공간 */
        .usage-section {
            padding: 5px 8px !important;
            margin-bottom: 5px !important;
        }

        .usage-text {
            line-height: 1.3 !important;
            font-size: 0.95em !important;
            margin: 3px 0 !important;
        }

        /* 자산 섹션 컨테이너 - 극도로 압축 */
        .asset-section-container {
            margin-bottom: 5px !important;
            padding: 6px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
        }

        /* 뱃지 섹션 - 명시적 페이지 브레이크 (1페이지 마지막) */
        .badge-section {
            page-break-after: always !important;
            break-after: page !important;
        }

        /* 총평 섹션 - 최소 공간 */
        .summary-section {
            padding: 6px !important;
            margin-top: 5px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
        }

        /* 동적 레이아웃 - 컬럼 간격 최소화 */
        .dynamic-column-layout {
            gap: 5px !important;
            margin-top: 4px !important;
        }

        .dynamic-column-layout > div {
            padding: 5px !important;
            min-height: auto !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
        }

        /* 컬럼 타이틀 */
        .column-title {
            margin-bottom: 4px !important;
            padding-bottom: 3px !important;
            font-size: 0.95em !important;
            font-weight: 600 !important;
        }

        /* CRITICAL: 학생 입력 텍스트 - 잘림 방지 */
        .student-review-area textarea,
        .summary-textarea {
            max-height: none !important;
            height: auto !important;
            min-height: 40px !important;
            overflow: visible !important;
            white-space: pre-wrap !important;
            word-wrap: break-word !important;
            word-break: break-word !important;
            resize: none !important;
            display: block !important;
            padding: 4px 6px !important;
            margin: 3px 0 !important;
            line-height: 1.3 !important;
            font-size: 0.9em !important;
            border-width: 1px !important;
        }

        .student-review-area {
            gap: 4px !important;
        }

        .student-review-area label {
            font-size: 0.9em !important;
            margin: 3px 0 2px 0 !important;
            display: block !important;
        }

        /* 자동 요약 영역 */
        .auto-summary-area {
            line-height: 1.3 !important;
            padding: 6px 8px !important;
            margin: 3px 0 !important;
            font-size: 0.95em !important;
        }

        /* 쿠키 자산 정보 */
        .cookie-asset-info {
            font-size: 0.9em !important;
        }

        .cookie-asset-item {
            padding: 3px 0 !important;
            margin: 2px 0 !important;
        }

        /* 그래프 - 더 작게 */
        .pie-chart {
            width: 80px !important;
            height: 80px !important;
        }

        .graph-container {
            margin: 4px 0 !important;
        }

        .center-asset-content {
            padding: 4px !important;
        }

        /* 뱃지 */
        .badge-item-display {
            margin: 3px !important;
        }

        .badge-item-display img {
            width: 40px !important;
            height: 40px !important;
        }

        .all-badges-container {
            gap: 5px !important;
            padding: 5px !important;
        }

        /* 초코칩 잔액 표시 */
        .center-asset-content > div[style*="gradient"] {
            padding: 15px 12px !important;
            margin: 8px 0 !important;
        }

        .center-asset-content h3 {
            font-size: 2.2em !important;
            margin: 0 !important;
        }

        /* 사용 내용 블록 */
        .usage-content-block {
            margin-bottom: 6px !important;
            padding-bottom: 6px !important;
        }

        .usage-content-block p {
            margin: 2px 0 !important;
            font-size: 0.9em !important;
            line-height: 1.3 !important;
        }

        /* 푸터 제거 또는 최소화 */
        .report-footer {
            display: none !important;
        }

        /* 전역 텍스트 압축 */
        p {
            margin: 3px 0 !important;
            line-height: 1.3 !important;
        }

        /* 불필요한 공백 제거 */
        br {
            line-height: 0.8 !important;
        }
    `;
    tempContainer.appendChild(style);
    document.body.appendChild(tempContainer);

    // CRITICAL: textarea를 div로 변환하여 전체 내용 표시
    const textareas = tempContainer.querySelectorAll('textarea');
    textareas.forEach(textarea => {
        const div = document.createElement('div');

        // textarea의 모든 클래스와 스타일 복사
        div.className = textarea.className;
        div.style.cssText = textarea.style.cssText;

        // 추가 스타일 적용 (textarea 스타일 상속)
        div.style.whiteSpace = 'pre-wrap';
        div.style.wordWrap = 'break-word';
        div.style.wordBreak = 'break-word';
        div.style.overflowWrap = 'break-word';
        div.style.minHeight = '40px';
        div.style.padding = '4px 6px';
        div.style.border = '1px solid #ddd';
        div.style.borderRadius = '4px';
        div.style.backgroundColor = '#f9fafb';
        div.style.fontSize = '0.9em';
        div.style.lineHeight = '1.3';

        // textarea 내용을 div에 복사
        div.textContent = textarea.value || textarea.textContent || '';

        // textarea를 div로 교체
        textarea.parentNode.replaceChild(div, textarea);
    });

    try {
        // PDF 생성 상수 정의
        const A4_WIDTH_MM = 210;
        const A4_HEIGHT_MM = 297;
        const MAX_PAGES = 2;
        const MAX_CONTENT_HEIGHT_MM = MAX_PAGES * A4_HEIGHT_MM; // 594mm
        const MIN_MARGIN_MM = 5;
        const MAX_MARGIN_MM = 10;
        const MIN_SCALE_FACTOR = 0.75; // 최소 75% 스케일

        // ========== 1단계: 측정 렌더링 ==========
        console.log('📏 1단계: 콘텐츠 크기 측정 중...');
        const measureCanvas = await html2canvas(tempContainer, {
            scale: 1, // 빠른 측정을 위해 낮은 스케일 사용
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: tempContainer.scrollWidth,
            windowHeight: tempContainer.scrollHeight,
            scrollY: 0,
            scrollX: 0
        });

        // 콘텐츠 높이를 mm 단위로 계산
        const mmPerPixel = A4_WIDTH_MM / measureCanvas.width;
        const contentHeightMm = measureCanvas.height * mmPerPixel;
        console.log(`📐 측정된 전체 콘텐츠 높이: ${contentHeightMm.toFixed(2)}mm (${measureCanvas.height}px)`);

        // 뱃지 섹션(강제 페이지 브레이크 위치) 찾기 - 측정 단계에서 비율로 저장
        const badgeSection = tempContainer.querySelector('[data-page-break-after="true"]');
        let page1HeightMm = contentHeightMm;
        let page2HeightMm = 0;
        let badgeBreakRatio = null; // 전체 높이 대비 뱃지 섹션 끝 위치 비율

        if (badgeSection) {
            const badgeRect = badgeSection.getBoundingClientRect();
            const tempRect = tempContainer.getBoundingClientRect();
            const badgeBottomPx = badgeRect.bottom - tempRect.top;
            const badgeBottomMm = badgeBottomPx * mmPerPixel;

            page1HeightMm = badgeBottomMm;
            page2HeightMm = contentHeightMm - badgeBottomMm;

            // 중요: 측정 단계에서 비율 계산 (나중에 최종 캔버스 크기에 적용)
            badgeBreakRatio = badgeBottomPx / tempContainer.scrollHeight;

            console.log(`📏 1페이지 높이 (뱃지까지): ${page1HeightMm.toFixed(2)}mm (비율: ${(badgeBreakRatio * 100).toFixed(1)}%)`);
            console.log(`📏 2페이지 높이 (총평): ${page2HeightMm.toFixed(2)}mm`);
        }

        // ========== 2단계: 여백과 스케일 계산 ==========
        let margin = MAX_MARGIN_MM;
        let scaleFactor = 1.0;

        // 각 페이지가 A4 높이(297mm)를 초과하는지 확인
        const maxPageContentHeight = A4_HEIGHT_MM - (MAX_MARGIN_MM * 2); // 277mm
        const minPageContentHeight = A4_HEIGHT_MM - (MIN_MARGIN_MM * 2); // 287mm

        const page1Overflow = page1HeightMm > maxPageContentHeight;
        const page2Overflow = page2HeightMm > maxPageContentHeight;

        if (page1Overflow || page2Overflow) {
            margin = MIN_MARGIN_MM;
            console.log(`📐 페이지 높이 초과로 여백을 ${MIN_MARGIN_MM}mm로 축소합니다.`);

            // 각 페이지에 필요한 스케일 계산
            const requiredScale1 = page1HeightMm > minPageContentHeight
                ? minPageContentHeight / page1HeightMm
                : 1.0;
            const requiredScale2 = page2HeightMm > minPageContentHeight
                ? minPageContentHeight / page2HeightMm
                : 1.0;

            // 더 작은 스케일 선택 (양쪽 페이지 모두 수용하기 위해)
            scaleFactor = Math.min(requiredScale1, requiredScale2);

            if (scaleFactor < MIN_SCALE_FACTOR) {
                console.warn(`⚠️ 콘텐츠가 매우 많습니다. 스케일 ${(scaleFactor * 100).toFixed(1)}% → ${(MIN_SCALE_FACTOR * 100)}%로 제한`);
                scaleFactor = MIN_SCALE_FACTOR;
            } else {
                console.log(`⚖️ 콘텐츠를 ${(scaleFactor * 100).toFixed(1)}%로 축소하여 각 페이지를 297mm 이내로 수용합니다.`);
                console.log(`   - 1페이지: ${page1HeightMm.toFixed(2)}mm → ${(page1HeightMm * scaleFactor).toFixed(2)}mm`);
                console.log(`   - 2페이지: ${page2HeightMm.toFixed(2)}mm → ${(page2HeightMm * scaleFactor).toFixed(2)}mm`);
            }

            // transform 적용
            tempContainer.style.transform = `scale(${scaleFactor})`;
            tempContainer.style.transformOrigin = 'top left';
            tempContainer.style.width = `${A4_WIDTH_MM / scaleFactor}mm`;
        } else {
            // 두 페이지 모두 여유 있음 - 최적 여백 계산
            const maxHeight = Math.max(page1HeightMm, page2HeightMm);
            const availableSpace = A4_HEIGHT_MM - maxHeight;
            margin = Math.min(MAX_MARGIN_MM, Math.max(MIN_MARGIN_MM, availableSpace / 2));
            console.log(`📐 여백: ${margin.toFixed(1)}mm (양쪽 페이지에 충분한 공간)`);
        }

        // ========== 3단계: 최종 고해상도 렌더링 ==========
        console.log('🎨 2단계: 최종 고해상도 렌더링 중...');
        const canvas = await html2canvas(tempContainer, {
            scale: 2.5, // 높은 해상도로 선명한 출력
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: tempContainer.scrollWidth,
            windowHeight: tempContainer.scrollHeight,
            scrollY: 0,
            scrollX: 0
        });

        // A4 사이즈 PDF 생성
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        });

        const pageWidth = A4_WIDTH_MM;
        const pageHeight = A4_HEIGHT_MM;
        const contentWidth = pageWidth - (margin * 2); // 동적으로 계산된 여백 사용
        const contentHeight = pageHeight - (margin * 2);

        console.log(`📄 PDF 설정: ${pageWidth}×${pageHeight}mm, 여백: ${margin.toFixed(1)}mm, 콘텐츠 영역: ${contentWidth.toFixed(1)}×${contentHeight.toFixed(1)}mm`);

        const imgWidth = contentWidth;

        // 강제 페이지 브레이크 위치를 최종 캔버스 크기에 맞게 계산
        let forcedPageBreakPosition = null;

        if (badgeBreakRatio !== null) {
            // 측정 단계에서 계산한 비율을 최종 캔버스 높이에 적용
            forcedPageBreakPosition = canvas.height * badgeBreakRatio;
            console.log(`📄 강제 페이지 브레이크: 뱃지 섹션 이후 (캔버스 ${forcedPageBreakPosition.toFixed(0)}px, 비율 ${(badgeBreakRatio * 100).toFixed(1)}%)에서 2페이지 시작`);
        }

        // 페이지 분할 로직 - 강제 브레이크 절대 우선
        let currentCanvasY = 0;
        let isFirstPage = true;
        let forcedBreakApplied = false;

        while (currentCanvasY < canvas.height) {
            if (!isFirstPage) {
                pdf.addPage();
            }
            isFirstPage = false;

            let nextCanvasY;

            // 1페이지는 무조건 뱃지 섹션까지 (강제 브레이크 절대 우선)
            if (!forcedBreakApplied && forcedPageBreakPosition !== null) {
                nextCanvasY = forcedPageBreakPosition;
                forcedBreakApplied = true;
                console.log(`📄 1페이지: 제목 + 활용방안 + 쿠키 + 초코칩 + 뱃지 (${nextCanvasY.toFixed(0)}px까지)`);
            } else {
                // 2페이지는 나머지 전부
                nextCanvasY = canvas.height;
                console.log(`📄 2페이지: 총평 (${currentCanvasY.toFixed(0)}px부터 끝까지)`);
            }

            // 마지막 페이지 처리
            const remainingHeight = canvas.height - currentCanvasY;
            const drawHeight = Math.min(nextCanvasY - currentCanvasY, remainingHeight);

            if (drawHeight > 0) {
                // 캔버스의 일부를 잘라서 PDF 페이지에 추가
                const sourceY = currentCanvasY;
                const sourceHeight = drawHeight;
                const destHeight = (sourceHeight / canvas.width) * contentWidth;

                // 임시 캔버스 생성하여 해당 영역만 추출
                const pageCanvas = document.createElement('canvas');
                pageCanvas.width = canvas.width;
                pageCanvas.height = sourceHeight;
                const pageCtx = pageCanvas.getContext('2d');

                pageCtx.drawImage(
                    canvas,
                    0, sourceY, // 소스 시작 위치
                    canvas.width, sourceHeight, // 소스 크기
                    0, 0, // 대상 시작 위치
                    canvas.width, sourceHeight // 대상 크기
                );

                const pageImgData = pageCanvas.toDataURL('image/png');
                pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth, destHeight);
            }

            currentCanvasY = nextCanvasY;
        }

        // ========== 4단계: 페이지 수 검증 및 PDF 저장 ==========
        const pageCount = pdf.internal.pages.length - 1; // -1은 jsPDF의 빈 첫 페이지 제외

        if (pageCount > MAX_PAGES) {
            console.warn(`⚠️ PDF가 ${pageCount}페이지 생성되었습니다 (목표: ${MAX_PAGES}페이지 이내)`);
            console.warn(`   콘텐츠가 많아 페이지 수가 증가했습니다. 학생 입력 내용이 매우 길 가능성이 있습니다.`);
        } else {
            console.log(`✅ PDF 생성 완료: ${pageCount}페이지 (목표 ${MAX_PAGES}페이지 이내 달성)`);
        }

        console.log(`📊 최종 PDF 정보:`);
        console.log(`   - 페이지 수: ${pageCount}`);
        console.log(`   - 여백: ${margin.toFixed(1)}mm`);
        console.log(`   - 스케일: ${(scaleFactor * 100).toFixed(1)}%`);
        console.log(`   - 콘텐츠 크기: ${contentHeightMm.toFixed(2)}mm → ${(contentHeightMm * scaleFactor).toFixed(2)}mm`);

        // PDF 다운로드
        const fileName = `${submission.studentName || submission.studentCode}_보고서_${new Date().toISOString().slice(0, 10)}.pdf`;
        pdf.save(fileName);
        console.log(`💾 PDF 저장 완료: ${fileName}`);

        // 임시 컨테이너 제거
        document.body.removeChild(tempContainer);

        // 이전 내용 복원
        reportContent.innerHTML = previousContent;

    } catch (error) {
        // 오류 시 임시 컨테이너 제거 및 이전 내용 복원
        if (tempContainer.parentNode) {
            document.body.removeChild(tempContainer);
        }
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
