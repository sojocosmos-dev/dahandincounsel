/**
 * StateManager.js
 * 애플리케이션 상태 관리
 */

class StateManager {
    constructor(defaultMode = 'single') {
        this.currentMode = defaultMode;
        this.cumulativeBadges = {};
    }

    /**
     * 현재 모드를 설정합니다
     * @param {string} mode - 'single' 또는 'batch'
     */
    setMode(mode) {
        this.currentMode = mode;
    }

    /**
     * 현재 모드를 반환합니다
     * @returns {string} 현재 모드
     */
    getMode() {
        return this.currentMode;
    }

    /**
     * 학생의 누적 뱃지를 저장하고 반환합니다
     * @param {string} studentCode - 학생 코드
     * @param {Object} liveBadges - 현재 뱃지 정보
     * @returns {Array} 누적 뱃지 배열
     */
    archiveAndRetrieveCumulativeBadges(studentCode, liveBadges) {
        if (!this.cumulativeBadges[studentCode]) {
            this.cumulativeBadges[studentCode] = {};
        }

        if (liveBadges && typeof liveBadges === 'object') {
            Object.values(liveBadges).forEach(badge => {
                if (badge?.hasBadge) {
                    this.cumulativeBadges[studentCode][badge.title] = {
                        title: badge.title,
                        imgUrl: badge.imgUrl || 'placeholder_badge.png',
                        hasBadge: true
                    };
                }
            });
        }

        return Object.values(this.cumulativeBadges[studentCode]);
    }

    /**
     * 상태를 초기화합니다
     */
    reset() {
        this.currentMode = 'single';
        this.cumulativeBadges = {};
    }
}

// ES 모듈로 export
export { StateManager };
