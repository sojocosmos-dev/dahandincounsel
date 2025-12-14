/**
 * ReportDataGenerator.js
 * 보고서 데이터 생성 및 분석
 */

import { APIManager } from './APIManager.js';

export class ReportDataGenerator {
    /**
     * 학생 보고서 데이터를 생성합니다
     * @param {string} studentCode - 학생 코드
     * @param {string} apiKey - API 키
     * @param {Object} config - 보고서 설정
     * @param {StateManager} stateManager - 상태 관리자
     * @returns {Promise<Object>} 보고서 데이터
     */
    static async generateStudentReport(studentCode, apiKey, config, stateManager) {
        const liveData = await APIManager.fetchStudentData(studentCode, apiKey);

        if (liveData.error) {
            return { error: liveData.error };
        }

        const totalCookieIncome = liveData.cookie || 0;
        const totalCookieUsed = liveData.usedCookie || 0;
        const currentChocoChips = liveData.chocoChips || 0;
        const allAcquiredBadges = stateManager.archiveAndRetrieveCumulativeBadges(studentCode, liveData.badges);
        const { usage: cookieUsageRatio, saving: cookieSavingRatio } = APIManager.calculateCookieRatio(totalCookieIncome, totalCookieUsed);

        const report = {
            student: liveData.name || "학생",
            reportDate: new Date().toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            config,
            allAcquiredBadges,
            studentCode,
            totalCookieIncome,
            totalCookieUsed,
            currentChocoChips,
            cookieUsageRatio,
            cookieSavingRatio,
        };

        report.analysis = this.generatePraiseSummary(report.student, report);
        return report;
    }

    /**
     * 학생 성장 요약을 생성합니다
     * @param {string} studentName - 학생명
     * @param {Object} report - 보고서 데이터
     * @returns {Object} 자동 요약 및 격려 메시지
     */
    static generatePraiseSummary(studentName, report) {
        const { totalCookieIncome, currentChocoChips, allAcquiredBadges } = report;
        const earnedBadgeTitles = allAcquiredBadges.map(badge => badge.title);
        const badgeTitlesString = earnedBadgeTitles.length > 0 
            ? `(${earnedBadgeTitles.join(', ')})` 
            : '(획득한 뱃지 없음)';

        return {
            autoSummary: `${studentName} 학생은 우리 학급 다했니 다했어요 활동을 통해\n*쿠키(${totalCookieIncome}개), *초코칩(${currentChocoChips}개), *뱃지${badgeTitlesString}를 획득하였습니다.`,
            praiseAndResolve: `[교사 참고] 이 자리에 선생님이 대신 칭찬과 격려의 메시지를 적거나, 학생이 직접 잘한 점과 다짐을 적을 수 있도록 안내해주세요.`,
        };
    }
}
