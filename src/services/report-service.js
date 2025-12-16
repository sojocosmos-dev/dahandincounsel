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
     * 교사가 설정한 보고서 config를 저장합니다
     * (향후 데이터베이스 연동 예정)
     */
    async saveTeacherConfig(config, apiKey = null) {
        return await ConfigStorageService.saveConfig(config, apiKey);
    }

    /**
     * 저장된 교사 설정을 불러옵니다
     * (향후 데이터베이스 연동 예정)
     */
    static async loadTeacherConfig(apiKey = null) {
        return await ConfigStorageService.loadConfig(apiKey);
    }

    /**
     * 설정만 저장하는 메서드 (보고서 생성 없이)
     */
    async handleSaveConfigOnly() {
        const apiKeyInput = document.getElementById(ELEMENT_IDS.apiKeyInput);
        const apiKey = apiKeyInput ? apiKeyInput.value.trim() : '';
        const config = this.uiController.getReportConfig();

        console.log('🔍 보고서 저장 시작:', { apiKey: apiKey ? '***' + apiKey.slice(-4) : 'empty', config });

        // 입력값 검증
        if (!apiKey) {
            this.showMessage("API Key를 입력해주세요.", 'error');
            this.showSnackbar('저장 실패', ['API Key가 필요합니다'], 'error');
            return;
        }

        if (!config.generalUsage) {
            this.showMessage("필수 입력 항목인 \"활용 방안\"을 입력해주세요.", 'error');
            this.showSnackbar('저장 실패', ['활용 방안을 입력해주세요'], 'error');
            return;
        }

        // 변경 내용 분석
        const changes = this.analyzeConfigChanges(config);
        console.log('📋 분석된 변경 내용:', changes);

        // 설정 저장
        this.showMessage("보고서 항목을 저장하는 중입니다...", 'info');
        const result = await this.saveTeacherConfig(config, apiKey);

        console.log('💾 저장 결과:', result);

        if (result.success) {
            this.showMessage(result.message + ' 학생들이 이제 개인 코드로 로그인하여 성장 기록표를 조회할 수 있습니다.', 'success');
            // 스낵바로 변경 내용 표시
            console.log('🎉 스낵바 표시 시도:', changes);
            this.showSnackbar('보고서 설정이 저장되었습니다', changes, 'success');
        } else {
            this.showMessage(result.message, 'error');
            this.showSnackbar('저장 실패', [result.message], 'error');
        }
    }

    /**
     * 설정 변경 내용을 분석합니다
     */
    analyzeConfigChanges(config) {
        const changes = [];

        // 일반 활용 방안
        if (config.generalUsage) {
            changes.push('✓ 활용 방안 설정됨');
        }

        // 쿠키 설정
        if (config.cookie) {
            const cookieItems = [];
            if (config.cookie.usage) cookieItems.push('획득/사용');
            if (config.cookie.asset) cookieItems.push('자산 현황');
            if (config.cookie.review) cookieItems.push('돌아보기');
            if (cookieItems.length > 0) {
                changes.push(`🍪 쿠키: ${cookieItems.join(', ')}`);
            }
        }

        // 초코칩 설정
        if (config.chip) {
            const chipItems = [];
            if (config.chip.usage) chipItems.push('획득/사용');
            if (config.chip.asset) chipItems.push('자산 현황');
            if (config.chip.review) chipItems.push('돌아보기');
            if (chipItems.length > 0) {
                changes.push(`🍫 초코칩: ${chipItems.join(', ')}`);
            }
        }

        // 뱃지 설정
        if (config.badge) {
            const badgeItems = [];
            if (config.badge.usage) badgeItems.push('소개/획득');
            if (config.badge.status) badgeItems.push('획득 현황');
            if (badgeItems.length > 0) {
                changes.push(`🏅 뱃지: ${badgeItems.join(', ')}`);
            }
        }

        // 총평 설정
        if (config.summary) {
            const summaryItems = [];
            if (config.summary.summary) summaryItems.push('활동 요약');
            if (config.summary.praiseAndResolve) summaryItems.push('칭찬과 다짐');
            if (config.summary.parentComment) summaryItems.push('격려의 한 마디');
            if (summaryItems.length > 0) {
                changes.push(`📊 총평: ${summaryItems.join(', ')}`);
            }
        }

        return changes.length > 0 ? changes : ['설정이 저장되었습니다'];
    }

    /**
     * 스낵바를 표시합니다
     */
    showSnackbar(title, items, type = 'info') {
        const snackbar = document.getElementById('snackbar');
        if (!snackbar) return;

        const itemsList = items.map(item => `<li>${item}</li>`).join('');
        snackbar.innerHTML = `
            <div class="snackbar-title">${title}</div>
            <div class="snackbar-content">
                <ul class="snackbar-list">
                    ${itemsList}
                </ul>
            </div>
        `;

        snackbar.className = `snackbar ${type} show`;

        // 5초 후 자동으로 숨김
        setTimeout(() => {
            snackbar.className = snackbar.className.replace('show', '');
        }, 5000);
    }

    /**
     * 메시지를 표시합니다
     */
    showMessage(message, type = 'info') {
        const messageArea = document.getElementById('message-area');
        if (messageArea) {
            const alertClass = type === 'success' ? 'alert-success' :
                             type === 'error' ? 'alert-error' : 'alert-info';
            messageArea.innerHTML = `<p class="alert ${alertClass}">${message}</p>`;

            if (type === 'success') {
                setTimeout(() => {
                    messageArea.innerHTML = '<p class="alert alert-info">보고서 항목을 입력하고 저장하면, 학생들이 개인 코드로 로그인하여 성장 기록표를 조회할 수 있습니다.</p>';
                }, 5000);
            }
        }
    }
}

// ES 모듈로 export
export { ReportService };
