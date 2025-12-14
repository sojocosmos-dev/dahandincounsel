/**
 * CounselManager.js
 * 상담 목록 UI 및 비즈니스 로직 관리
 */

class CounselManager {
    constructor(uiController) {
        this.uiController = uiController;
        this.currentCounselId = null;
        this.counselList = [];
        this.apiKey = null;
    }

    /**
     * API Key를 설정합니다
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * 상담 목록을 불러와 표시합니다
     */
    async loadAndDisplayCounselList() {
        this.counselList = await CounselStorageService.loadCounselList(this.apiKey);
        this.renderCounselList();
    }

    /**
     * 상담 목록을 화면에 렌더링합니다
     */
    renderCounselList() {
        const container = document.getElementById('counsel-list-container');

        if (this.counselList.length === 0) {
            container.innerHTML = '<p class="empty-counsel-message">아직 생성된 상담이 없습니다.<br>"➕ 새 상담 만들기" 버튼을 눌러 상담을 만들어보세요.</p>';
            return;
        }

        container.innerHTML = this.counselList
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .map(counsel => this.createCounselCardHtml(counsel))
            .join('');
    }

    /**
     * 상담 카드 HTML을 생성합니다
     */
    createCounselCardHtml(counsel) {
        const isActive = counsel.id === this.currentCounselId;
        const createdDate = new Date(counsel.createdAt).toLocaleDateString('ko-KR');
        const updatedDate = new Date(counsel.updatedAt).toLocaleDateString('ko-KR');

        return `
            <div class="counsel-card ${isActive ? 'active' : ''}" onclick="handleSelectCounsel('${counsel.id}')">
                <div class="counsel-card-title">${counsel.title}</div>
                <div class="counsel-card-meta">
                    <div class="counsel-card-date">생성일: ${createdDate}</div>
                    <div class="counsel-card-updated">최종 수정: ${updatedDate}</div>
                </div>
            </div>
        `;
    }

    /**
     * 목록 뷰와 폼 뷰를 전환합니다
     */
    showListView() {
        document.getElementById('counsel-list-view').style.display = 'block';
        document.getElementById('counsel-form-view').style.display = 'none';
    }

    showFormView() {
        document.getElementById('counsel-list-view').style.display = 'none';
        document.getElementById('counsel-form-view').style.display = 'block';
    }

    /**
     * 새 상담을 생성합니다
     */
    async createNewCounsel() {
        const defaultConfig = {
            generalUsage: DEFAULT_USAGE_TEXTS.general,
            cookie: {
                usage: DEFAULT_USAGE_TEXTS.cookieUsage,
                asset: true,
                review: true,
            },
            chip: {
                usage: DEFAULT_USAGE_TEXTS.chipUsage,
                asset: true,
                review: true,
            },
            badge: {
                usage: DEFAULT_USAGE_TEXTS.badgeUsage,
                status: true,
                strength: false,
            },
            summary: {
                output: true,
                summary: true,
                praiseAndResolve: true,
                parentComment: true,
            },
        };

        const counselData = {
            title: `상담 ${this.counselList.length + 1}`,
            config: defaultConfig
        };

        const result = await CounselStorageService.createCounsel(counselData, this.apiKey);

        if (result.success) {
            this.counselList.push(result.counsel);
            this.renderCounselList();
            this.selectCounsel(result.counsel.id);
            this.showFormView(); // 폼 뷰로 전환
            this.showMessage('새 상담이 생성되었습니다.', 'success');
        } else {
            this.showMessage(result.message, 'error');
        }
    }

    /**
     * 상담을 선택하여 폼에 로드합니다
     */
    async selectCounsel(counselId) {
        const counsel = this.counselList.find(c => c.id === counselId);

        if (!counsel) {
            this.showMessage('상담을 찾을 수 없습니다.', 'error');
            return;
        }

        this.currentCounselId = counselId;
        this.loadCounselToForm(counsel);
        this.renderCounselList();
        this.updateCurrentCounselInfo(counsel.title);
        this.showFormView(); // 폼 뷰로 전환
    }

    /**
     * 상담 데이터를 폼에 로드합니다
     */
    loadCounselToForm(counsel) {
        const config = counsel.config;

        // 상담 제목
        document.getElementById('counsel-title-input').value = counsel.title;

        // 일반 활용 방안
        document.getElementById('input-usage-general').value = config.generalUsage || '';

        // 쿠키 설정
        if (config.cookie) {
            document.getElementById('check-output-cookie').checked = true;
            document.getElementById('check-output-cookie-usage').checked = !!config.cookie.usage;
            document.getElementById('check-output-cookie-asset').checked = config.cookie.asset || false;
            document.getElementById('check-output-cookie-review').checked = config.cookie.review || false;
            if (config.cookie.usage) {
                document.getElementById('input-cookie-usage').value = config.cookie.usage;
            }
        } else {
            document.getElementById('check-output-cookie').checked = false;
        }

        // 초코칩 설정
        if (config.chip) {
            document.getElementById('check-output-chip').checked = true;
            document.getElementById('check-output-chip-usage').checked = !!config.chip.usage;
            document.getElementById('check-output-chip-asset').checked = config.chip.asset || false;
            document.getElementById('check-output-chip-review').checked = config.chip.review || false;
            if (config.chip.usage) {
                document.getElementById('input-chip-usage').value = config.chip.usage;
            }
        } else {
            document.getElementById('check-output-chip').checked = false;
        }

        // 뱃지 설정
        if (config.badge) {
            document.getElementById('check-output-badge').checked = true;
            document.getElementById('check-output-badge-usage').checked = !!config.badge.usage;
            document.getElementById('check-output-badge-status').checked = config.badge.status || false;
            if (config.badge.usage) {
                document.getElementById('input-badge-usage').value = config.badge.usage;
            }
        } else {
            document.getElementById('check-output-badge').checked = false;
        }

        // 총평 설정
        if (config.summary) {
            document.getElementById('check-output-summary').checked = true;
            document.getElementById('check-output-summary-strength').checked = config.summary.praiseAndResolve || false;
            document.getElementById('check-output-summary-parent').checked = config.summary.parentComment || false;
        } else {
            document.getElementById('check-output-summary').checked = false;
        }

        // 설정 그룹 토글
        this.uiController.toggleConfigGroup('cookie');
        this.uiController.toggleConfigGroup('chip');
        this.uiController.toggleConfigGroup('badge');
        this.uiController.toggleConfigGroup('summary', false);
    }

    /**
     * 현재 선택된 상담 정보를 업데이트합니다
     */
    updateCurrentCounselInfo(title) {
        const infoDiv = document.getElementById('current-counsel-info');
        const titleSpan = document.getElementById('current-counsel-title');

        if (this.currentCounselId) {
            infoDiv.style.display = 'flex';
            titleSpan.textContent = `편집 중: ${title}`;
        } else {
            infoDiv.style.display = 'none';
        }
    }

    /**
     * 현재 상담을 저장합니다
     */
    async saveCurrentCounsel() {
        if (!this.currentCounselId) {
            this.showMessage('저장할 상담을 선택해주세요.', 'error');
            return;
        }

        const title = document.getElementById('counsel-title-input').value.trim();
        const config = this.uiController.getReportConfig();

        if (!title) {
            this.showMessage('상담 제목을 입력해주세요.', 'error');
            return;
        }

        if (!config.generalUsage) {
            this.showMessage('필수 입력 항목인 "활용 방안"을 입력해주세요.', 'error');
            return;
        }

        const result = await CounselStorageService.updateCounsel(
            this.currentCounselId,
            { title, config },
            this.apiKey
        );

        if (result.success) {
            // 로컬 목록 업데이트
            const index = this.counselList.findIndex(c => c.id === this.currentCounselId);
            if (index !== -1) {
                this.counselList[index] = result.counsel;
            }

            this.renderCounselList();
            this.updateCurrentCounselInfo(title);
            this.showMessage('상담이 저장되었습니다.', 'success');
            this.showSnackbar('상담 저장 완료', [`"${title}" 상담이 저장되었습니다.`], 'success');
        } else {
            this.showMessage(result.message, 'error');
        }
    }

    /**
     * 현재 선택된 상담을 삭제합니다
     */
    async deleteCurrentCounsel() {
        if (!this.currentCounselId) {
            this.showMessage('삭제할 상담을 선택해주세요.', 'error');
            return;
        }

        const counsel = this.counselList.find(c => c.id === this.currentCounselId);
        if (!counsel) {
            this.showMessage('상담을 찾을 수 없습니다.', 'error');
            return;
        }

        if (!confirm(`"${counsel.title}" 상담을 삭제하시겠습니까?`)) {
            return;
        }

        const result = await CounselStorageService.deleteCounsel(this.currentCounselId, this.apiKey);

        if (result.success) {
            this.counselList = this.counselList.filter(c => c.id !== this.currentCounselId);
            this.currentCounselId = null;
            this.renderCounselList();
            this.updateCurrentCounselInfo('');
            this.clearForm();
            this.showListView(); // 목록 뷰로 전환
            this.showMessage('상담이 삭제되었습니다.', 'success');
        } else {
            this.showMessage(result.message, 'error');
        }
    }

    /**
     * 목록으로 돌아갑니다
     */
    backToList() {
        this.showListView();
    }

    /**
     * 폼을 초기화합니다
     */
    clearForm() {
        document.getElementById('counsel-title-input').value = '';
        this.uiController.initializeDOM();
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
                    messageArea.innerHTML = '<p class="alert alert-info">상담 제목과 보고서 항목을 입력하고 저장하면, 학생들이 해당 상담을 선택하여 성장 기록표를 조회할 수 있습니다.</p>';
                }, 3000);
            }
        }
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

        setTimeout(() => {
            snackbar.className = snackbar.className.replace('show', '');
        }, 5000);
    }
}
