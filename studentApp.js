/**
 * studentApp.js
 * 학생용 애플리케이션 초기화
 */

let studentApp;

class StudentApp {
    constructor() {
        this.apiKey = null;
        this.studentCode = null;
        this.counselId = null;
        this.setupEventListeners();
        this.checkUrlParams();
    }

    setupEventListeners() {
        const queryBtn = document.getElementById('query-report-btn');
        if (queryBtn) {
            queryBtn.addEventListener('click', () => {
                this.handleStudentQuery();
            });

            // Enter 키로도 조회 가능
            document.getElementById('student-code-input').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handleStudentQuery();
                }
            });
        }
    }

    /**
     * URL 파라미터 확인 및 자동 조회
     */
    checkUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const apiKey = params.get('apiKey');
        const studentCode = params.get('studentCode');
        const counselId = params.get('counselId');

        if (apiKey && studentCode) {
            // API Key와 학생 코드가 URL에 있으면 자동으로 조회
            this.apiKey = apiKey;
            this.counselId = counselId; // 상담 ID 저장

            const codeInput = document.getElementById('student-code-input');
            if (codeInput) {
                codeInput.value = studentCode;
            }
            const inputArea = document.getElementById('student-input-area');
            if (inputArea) {
                inputArea.style.display = 'none';
            }

            // 자동으로 보고서 생성
            this.handleStudentQuery(apiKey, counselId);
        }
    }

    /**
     * 학생 보고서 조회 처리
     */
    async handleStudentQuery(providedApiKey = null, providedCounselId = null) {
        const studentCodeInput = document.getElementById('student-code-input');
        if (!studentCodeInput) return;

        const studentCode = studentCodeInput.value.trim();
        const apiKey = providedApiKey || (this.apiKey ? this.apiKey : CONFIG.STUDENT_API_KEY);
        const counselId = providedCounselId || this.counselId || null;

        // 입력값 검증
        if (!studentCode) {
            this.showMessage("개인 코드를 입력해주세요.", 'error');
            return;
        }

        if (!StudentAuth.validateStudentCode(studentCode)) {
            this.showMessage("올바른 코드 형식이 아닙니다. (예: A1001)", 'error');
            return;
        }

        // 조회 시작
        this.setButtonEnabled(false);
        this.showMessage("성장 기록을 불러오는 중입니다...", 'info');

        try {
            const reportData = await StudentReportService.fetchStudentReport(
                studentCode,
                apiKey,
                counselId
            );

            if (reportData.error) {
                this.showMessage(reportData.error, 'error');
                this.setButtonEnabled(true);
            } else {
                // 학생 정보 저장
                this.studentCode = studentCode;
                this.apiKey = apiKey;
                this.counselId = counselId;

                const html = StudentReportService.generateStudentReportHTML(reportData);
                const reportArea = document.getElementById('student-report-area');
                if (reportArea) {
                    reportArea.innerHTML = html;
                    reportArea.classList.add('show');
                }
                this.setButtonEnabled(true);
                this.showMessage("성장 기록을 불러왔습니다.", 'success');
            }
        } catch (error) {
            this.showMessage("오류가 발생했습니다: " + error.message, 'error');
            this.setButtonEnabled(true);
        }
    }

    showMessage(message, type) {
        const messageEl = document.getElementById('message');
        if (messageEl) {
            messageEl.textContent = message;
            messageEl.className = `student-message show ${type}`;
            
            if (type === 'success') {
                setTimeout(() => {
                    messageEl.classList.remove('show');
                }, 3000);
            }
        }
    }

    setButtonEnabled(enabled) {
        const btn = document.getElementById('query-report-btn');
        if (btn) {
            btn.disabled = !enabled;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    studentApp = new StudentApp();
});
/**
 * 보고서 제출하기
 */
async function handleSubmitReport() {
    if (!studentApp.studentCode || !studentApp.counselId) {
        showMessage("오류: 학생 정보를 찾을 수 없습니다.", 'error');
        return;
    }

    const reportArea = document.getElementById('student-report-area');
    if (!reportArea) {
        showMessage("오류: 보고서를 찾을 수 없습니다.", 'error');
        return;
    }

    // 보고서 내의 모든 textarea 수집
    const textareas = reportArea.querySelectorAll('textarea');
    const submissionData = {
        studentCode: studentApp.studentCode,
        counselId: studentApp.counselId,
        data: {}
    };

    // 각 textarea의 값을 저장
    textareas.forEach((textarea, index) => {
        const value = textarea.value.trim();
        if (value) {
            // textarea 위의 label/title을 찾기
            let label = 'Item ' + (index + 1);
            const columnTitle = textarea.closest('div')?.querySelector('.column-title');
            const summaryLabel = textarea.closest('.summary-section')?.querySelector('h3');
            
            if (columnTitle) {
                label = columnTitle.textContent.trim();
            } else if (summaryLabel) {
                label = summaryLabel.textContent.trim();
            }

            // textarea placeholder로 구분
            const placeholder = textarea.placeholder;
            if (placeholder.includes('쿠키 획득')) {
                submissionData.data.cookieMethod = value;
            } else if (placeholder.includes('좋았던')) {
                submissionData.data.cookieGood = value;
            } else if (placeholder.includes('초코칩 획득')) {
                submissionData.data.chipMethod = value;
            } else if (placeholder.includes('초코칩') && placeholder.includes('좋았던')) {
                submissionData.data.chipGood = value;
            } else if (placeholder.includes('자랑스러운')) {
                submissionData.data.proudBadge = value;
            } else if (placeholder.includes('받고 싶은')) {
                submissionData.data.wantBadge = value;
            } else if (placeholder.includes('칭찬') || placeholder.includes('다짐')) {
                submissionData.data.praiseResolve = value;
            } else if (placeholder.includes('격려')) {
                submissionData.data.parentComment = value;
            } else {
                submissionData.data['textarea_' + index] = value;
            }
        }
    });

    if (Object.keys(submissionData.data).length === 0) {
        showMessage("입력된 내용이 없습니다.", 'error');
        return;
    }

    try {
        const result = await StudentSubmissionService.saveSubmission(
            submissionData,
            studentApp.apiKey
        );

        if (result.success) {
            showMessage("✅ 입력 내용이 제출되었습니다!", 'success');
        } else {
            showMessage("❌ 제출 실패: " + result.message, 'error');
        }
    } catch (error) {
        showMessage("❌ 오류 발생: " + error.message, 'error');
    }
}

function showMessage(message, type) {
    const messageEl = document.getElementById('submission-message');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.style.display = 'block';
        messageEl.className = type === 'success' ? 'message-success' : 'message-error';
        messageEl.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
        messageEl.style.color = type === 'success' ? '#155724' : '#721c24';
        messageEl.style.border = type === 'success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb';
        
        if (type === 'success') {
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 3000);
        }
    }
}