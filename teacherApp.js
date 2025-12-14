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
    }

    setupEventListeners() {
        // 모드 탭 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('mode-tab')) {
                const mode = e.target.id === 'tab-single' ? 'single' : 'batch';
                this.uiController.setMode(mode);
            }
        });

        // 보고서 생성 버튼
        document.getElementById('generate-report-btn').addEventListener('click', () => {
            this.reportService.handleReport();
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
    window.toggleConfigGroup = (groupName, isAssetGroup = true) => 
        app.uiController.toggleConfigGroup(groupName, isAssetGroup);
    window.shareUrl = () => app.reportService.shareUrl();
});
