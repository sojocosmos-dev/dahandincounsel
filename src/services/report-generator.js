/**
 * ReportGenerator.js
 * 전체 보고서 HTML 생성 조율
 */

import { ReportSectionGenerator } from './report-section-generator.js';

class ReportGenerator {
    /**
     * 완전한 보고서 HTML을 생성합니다
     */
    static generateReportHtml(report, isBatchMode) {
        const { student, reportDate, config, allAcquiredBadges, totalCookieIncome, totalCookieUsed, currentChocoChips, cookieSavingRatio, cookieUsageRatio, userInputs = {} } = report;
        const { cookie, chip, badge, summary } = config;

        // 디버깅: userInputs 확인
        console.log('📝 ReportGenerator - userInputs:', userInputs);
        console.log('📝 ReportGenerator - report:', report);

        return (
            ReportSectionGenerator.generateReportHeader(student, config, reportDate, isBatchMode) +
            ReportSectionGenerator.generateCookieSection(cookie, student, totalCookieIncome, totalCookieUsed, cookieSavingRatio, cookieUsageRatio, userInputs) +
            ReportSectionGenerator.generateChipSection(chip, student, currentChocoChips, userInputs) +
            ReportSectionGenerator.generateBadgeSection(badge, student, allAcquiredBadges, userInputs) +
            ReportSectionGenerator.generateSummarySection(summary, report.analysis) +
            ReportSectionGenerator.generateFooter(reportDate)
        );
    }
}

// ES 모듈로 export
export { ReportGenerator };
