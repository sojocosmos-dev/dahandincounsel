/**
 * ReportService.js
 * 보고서 생성 비즈니스 로직
 */

class ReportService {
    constructor(stateManager, uiController) {
        this.stateManager = stateManager;
        this.uiController = uiController;
    }

    /**
     * 보고서 생성을 처리합니다
     */
    async handleReport() {
        const apiKey = document.getElementById(ELEMENT_IDS.apiKeyInput).value.trim();
        const config = this.uiController.getReportConfig();
        const currentMode = this.stateManager.getMode();

        // 입력값 검증
        if (!apiKey) {
            this.uiController.showErrorMessage("API Key를 입력해주세요.");
            return;
        }

        if (!config.generalUsage) {
            this.uiController.showErrorMessage("필수 입력 항목인 \"활용 방안\"을 입력해주세요.");
            return;
        }

        // 교사가 설정한 config를 로컬 스토리지에 저장 (학생용에서 사용)
        this.saveTeacherConfig(config);

        const studentCodes = this.uiController.parseStudentCodes(
            currentMode,
            ELEMENT_IDS.studentCodeInput,
            ELEMENT_IDS.codeListInput
        );

        if (studentCodes.length === 0) {
            const errorMsg = currentMode === 'single' 
                ? "학생 코드를 입력해주세요." 
                : "학생 코드 목록을 입력해주세요.";
            this.uiController.showErrorMessage(errorMsg);
            return;
        }

        // 보고서 생성 시작
        this.uiController.setGenerateButtonEnabled(false);
        this.uiController.showLoadingMessage("데이터를 불러오는 중입니다... 잠시만 기다려주세요.");

        let allReportsHtml = '';

        for (const code of studentCodes) {
            const reportData = await ReportDataGenerator.generateStudentReport(
                code,
                apiKey,
                config,
                this.stateManager
            );

            if (reportData.error) {
                allReportsHtml += `<div class="report-error-block"><h2>⚠️ 오류: 학생 코드 ${code}</h2><p>${reportData.error}</p></div>`;
            } else {
                allReportsHtml += ReportGenerator.generateReportHtml(reportData, studentCodes.length > 1);
            }
        }

        this.uiController.displayReport(allReportsHtml);
        this.uiController.setGenerateButtonEnabled(true);
    }

    /**
     * URL을 공유합니다
     */
    async shareUrl() {
        const url = window.location.href;

        if (!navigator.clipboard) {
            alert(`클립보드 API를 지원하지 않는 환경입니다. 수동으로 복사해주세요: ${url}`);
            return;
        }

        try {
            await navigator.clipboard.writeText(url);
            alert("현재 보고서의 URL이 클립보드에 복사되었습니다! (주의: 로컬 파일 실행 시 URL 공유가 불가할 수 있습니다)");
        } catch (err) {
            alert(`URL 복사 실패. 수동으로 복사해주세요: ${url}`);
        }
    }

    /**
     * 교사가 설정한 보고서 config를 로컬 스토리지에 저장합니다
     */
    saveTeacherConfig(config) {
        try {
            localStorage.setItem('teacherReportConfig', JSON.stringify(config));
        } catch (error) {
            console.warn('로컬 스토리지에 설정을 저장하는데 실패했습니다:', error);
        }
    }

    /**
     * 저장된 교사 설정을 불러옵니다
     */
    static loadTeacherConfig() {
        try {
            const savedConfig = localStorage.getItem('teacherReportConfig');
            return savedConfig ? JSON.parse(savedConfig) : null;
        } catch (error) {
            console.warn('로컬 스토리지에서 설정을 불러오는데 실패했습니다:', error);
            return null;
        }
    }
}
