/**
 * studentApp.js
 * 학생용 애플리케이션 초기화
 */

let studentApp;

class StudentApp {
    constructor() {
        this.apiKey = null;
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
