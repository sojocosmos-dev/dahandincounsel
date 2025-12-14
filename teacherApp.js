/**
 * teacherApp.js
 * 교사용 애플리케이션 초기화
 */

let app;

class TeacherApp {
    constructor() {
        this.stateManager = new StateManager(CONFIG.DEFAULT_MODE);
        this.uiController = new UIController(this.stateManager);
        this.reportService = new ReportService(this.stateManager, this.uiController);
        this.setupEventListeners();
        this.loadApiKeyFromUrl();
    }

    /**
     * URL 파라미터에서 API Key를 불러와 자동 입력
     */
    loadApiKeyFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const apiKey = params.get('apiKey');

        if (apiKey) {
            const apiKeyInput = document.getElementById('api-key-input');
            if (apiKeyInput) {
                apiKeyInput.value = apiKey;
            }
        }
    }

    setupEventListeners() {
        // 모드 탭 이벤트 (교사용 페이지에서는 사용하지 않음)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('mode-tab')) {
                const mode = e.target.id === 'tab-single' ? 'single' : 'batch';
                this.uiController.setMode(mode);
            }
        });

        // 설정 그룹 토글
        const toggleGroups = ['cookie', 'chip', 'badge', 'summary'];
        toggleGroups.forEach(group => {
            const checkboxId = `check-output-${group}`;
            const checkbox = document.getElementById(checkboxId);
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    const isAssetGroup = group !== 'summary';
                    this.uiController.toggleConfigGroup(group, isAssetGroup);
                });
            }
        });

        // 인쇄/PDF 저장
        document.querySelector('.print-download-group button:nth-child(1)')?.addEventListener('click', () => {
            window.print();
        });

        // URL 공유
        document.querySelector('.print-download-group button:nth-child(2)')?.addEventListener('click', () => {
            this.reportService.shareUrl();
        });
    }

    initialize() {
        this.uiController.initializeDOM();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    app = new TeacherApp();
    app.initialize();

    // 전역 함수 노출
    window.setMode = (mode) => app.uiController.setMode(mode);
    window.handleReport = () => app.reportService.handleReport();
    window.handleSaveConfig = () => app.reportService.handleSaveConfigOnly();
    window.toggleConfigGroup = (groupName, isAssetGroup = true) =>
        app.uiController.toggleConfigGroup(groupName, isAssetGroup);
    window.shareUrl = () => app.reportService.shareUrl();
});
