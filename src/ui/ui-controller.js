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

        // 요소가 존재할 때만 처리 (교사용 페이지에서는 모드 탭이 없음)
        const singleTab = document.getElementById(singleTabId);
        const batchTab = document.getElementById(batchTabId);
        const singleContent = document.getElementById(singleContentId);
        const batchContent = document.getElementById(batchContentId);
        const generateBtn = document.getElementById(ELEMENT_IDS.generateBtn);
        const reportArea = document.getElementById(ELEMENT_IDS.reportArea);

        if (singleTab) singleTab.classList.remove('active');
        if (batchTab) batchTab.classList.remove('active');
        if (singleContent) singleContent.style.display = 'none';
        if (batchContent) batchContent.style.display = 'none';

        if (mode === 'single') {
            if (singleTab) singleTab.classList.add('active');
            if (singleContent) singleContent.style.display = 'block';
        } else {
            if (batchTab) batchTab.classList.add('active');
            if (batchContent) batchContent.style.display = 'block';
        }

        const buttonText = mode === 'single' ? '📋 성장 기록표 출력' : '📂 일괄 성장 기록표 출력';
        if (generateBtn) generateBtn.innerText = buttonText;
        if (reportArea) reportArea.innerHTML = '<p class="alert alert-loading">출력 버튼을 누르면 선택한 방식에 따라 성장 기록 보고서가 생성됩니다.</p>';
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
        // 기본값 설정
        const generalInput = document.getElementById('input-usage-general');
        const cookieInput = document.getElementById('input-cookie-usage');
        const chipInput = document.getElementById('input-chip-usage');
        const badgeInput = document.getElementById('input-badge-usage');

        if (generalInput) generalInput.value = DEFAULT_USAGE_TEXTS.general;
        if (cookieInput) cookieInput.value = DEFAULT_USAGE_TEXTS.cookieUsage;
        if (chipInput) chipInput.value = DEFAULT_USAGE_TEXTS.chipUsage;
        if (badgeInput) badgeInput.value = DEFAULT_USAGE_TEXTS.badgeUsage;

        // 설정 그룹 토글
        this.toggleConfigGroup('cookie');
        this.toggleConfigGroup('chip');
        this.toggleConfigGroup('badge');

        const badgeStrengthCheck = document.getElementById('check-output-badge-strength');
        if (badgeStrengthCheck) badgeStrengthCheck.checked = false;

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

// ES 모듈로 export
export { UIController };
