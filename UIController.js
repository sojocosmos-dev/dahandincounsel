/**
 * UIController.js
 * UI 이벤트 및 사용자 상호작용 관리
 */

class UIController {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }

    /**
     * 모드를 변경하고 UI를 업데이트합니다
     */
    setMode(mode) {
        this.stateManager.setMode(mode);

        const { single: singleTabId, batch: batchTabId } = ELEMENT_IDS.modeTab;
        const { single: singleContentId, batch: batchContentId } = ELEMENT_IDS.modeContent;

        document.getElementById(singleTabId).classList.remove('active');
        document.getElementById(batchTabId).classList.remove('active');
        document.getElementById(singleContentId).style.display = 'none';
        document.getElementById(batchContentId).style.display = 'none';

        if (mode === 'single') {
            document.getElementById(singleTabId).classList.add('active');
            document.getElementById(singleContentId).style.display = 'block';
        } else {
            document.getElementById(batchTabId).classList.add('active');
            document.getElementById(batchContentId).style.display = 'block';
        }

        const buttonText = mode === 'single' ? '📋 성장 기록표 출력' : '📂 일괄 성장 기록표 출력';
        document.getElementById(ELEMENT_IDS.generateBtn).innerText = buttonText;
        document.getElementById(ELEMENT_IDS.reportArea).innerHTML = '<p class="alert alert-loading">출력 버튼을 누르면 선택한 방식에 따라 성장 기록 보고서가 생성됩니다.</p>';
    }

    /**
     * 설정 그룹을 토글합니다
     */
    toggleConfigGroup(groupName, isAssetGroup = true) {
        const masterCheckId = `check-output-${groupName}`;
        const detailContainerId = `${groupName}-config-details`;
        const masterCheck = document.getElementById(masterCheckId);
        const detailContainer = document.getElementById(detailContainerId);

        detailContainer.style.display = masterCheck.checked ? 'block' : 'none';

        if (isAssetGroup) {
            const subCheckboxes = detailContainer.querySelectorAll('input[type="checkbox"]');
            subCheckboxes.forEach(subCheck => {
                subCheck.checked = masterCheck.checked;
            });
        }
    }

    /**
     * DOM을 초기화합니다
     */
    initializeDOM() {
        this.setMode('single');

        document.getElementById('input-usage-general').value = DEFAULT_USAGE_TEXTS.general;
        document.getElementById('input-cookie-usage').value = DEFAULT_USAGE_TEXTS.cookieUsage;
        document.getElementById('input-chip-usage').value = DEFAULT_USAGE_TEXTS.chipUsage;
        document.getElementById('input-badge-usage').value = DEFAULT_USAGE_TEXTS.badgeUsage;

        this.toggleConfigGroup('cookie');
        this.toggleConfigGroup('chip');
        this.toggleConfigGroup('badge');
        document.getElementById('check-output-badge-strength').checked = false;
        this.toggleConfigGroup('summary', false);
    }

    /**
     * 보고서 설정을 조회합니다
     */
    getReportConfig() {
        const cookieUsageElem = document.getElementById('input-cookie-usage');
        const chipUsageElem = document.getElementById('input-chip-usage');
        const badgeUsageElem = document.getElementById('input-badge-usage');

        return {
            generalUsage: document.getElementById('input-usage-general').value.trim(),
            cookie: document.getElementById('check-output-cookie').checked ? {
                usage: document.getElementById('check-output-cookie-usage').checked ? (cookieUsageElem?.value.trim() || DEFAULT_USAGE_TEXTS.cookieUsage) : null,
                asset: document.getElementById('check-output-cookie-asset').checked,
                review: document.getElementById('check-output-cookie-review').checked,
            } : null,
            chip: document.getElementById('check-output-chip').checked ? {
                usage: document.getElementById('check-output-chip-usage').checked ? (chipUsageElem?.value.trim() || DEFAULT_USAGE_TEXTS.chipUsage) : null,
                asset: document.getElementById('check-output-chip-asset').checked,
                review: document.getElementById('check-output-chip-review').checked,
            } : null,
            badge: document.getElementById('check-output-badge').checked ? {
                usage: document.getElementById('check-output-badge-usage').checked ? (badgeUsageElem?.value.trim() || DEFAULT_USAGE_TEXTS.badgeUsage) : null,
                status: document.getElementById('check-output-badge-status').checked,
                strength: false,
            } : null,
            summary: document.getElementById('check-output-summary').checked ? {
                output: document.getElementById('check-output-summary').checked,
                summary: true,
                praiseAndResolve: document.getElementById('check-output-summary-strength').checked,
                parentComment: document.getElementById('check-output-summary-parent').checked,
            } : null,
        };
    }

    /**
     * 학생 코드 목록을 파싱합니다
     */
    parseStudentCodes(mode, singleCodeInput, batchCodeInput) {
        const codes = [];

        if (mode === 'single') {
            const code = document.getElementById(singleCodeInput).value.trim();
            if (code) codes.push(code);
        } else if (mode === 'batch') {
            const codeListText = document.getElementById(batchCodeInput).value.trim();
            if (codeListText) {
                codes.push(...codeListText
                    .split(',')
                    .map(code => code.trim())
                    .filter(code => code.length > 0));
            }
        }

        return codes;
    }

    /**
     * 에러 메시지를 표시합니다
     */
    showErrorMessage(message) {
        document.getElementById(ELEMENT_IDS.reportArea).innerHTML = `<p class="alert alert-error">${message}</p>`;
    }

    /**
     * 로딩 메시지를 표시합니다
     */
    showLoadingMessage(message) {
        document.getElementById(ELEMENT_IDS.reportArea).innerHTML = `<p class="alert alert-loading">${message}</p>`;
    }

    /**
     * 보고서 내용을 표시합니다
     */
    displayReport(html) {
        document.getElementById(ELEMENT_IDS.reportArea).innerHTML = html;
    }

    /**
     * 생성 버튼을 활성화/비활성화합니다
     */
    setGenerateButtonEnabled(enabled) {
        document.getElementById(ELEMENT_IDS.generateBtn).disabled = !enabled;
    }
}
